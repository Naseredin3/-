import JSZip from 'jszip';
import { GeneratedItem } from '../types';
import { encryptData, decryptData } from './security';

// Trigger browser file download
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Convert base64 / data URL to Blob
export function dataURLToBlob(dataurl: string): Blob {
  if (dataurl.startsWith('data:image/svg+xml')) {
    const svgStr = decodeURIComponent(dataurl.split(',')[1]);
    return new Blob([svgStr], { type: 'image/svg+xml' });
  }
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Export single text item in various formats
export function exportText(item: GeneratedItem, format: 'txt' | 'md' | 'json' | 'html') {
  const cleanTitle = (item.title || 'generated-text').replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_');

  if (format === 'txt') {
    const content = `${item.title}\nمدل: ${item.model}\nتاریخ: ${new Date(item.createdAt).toLocaleString('fa-IR')}\n\n${item.content}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `${cleanTitle}.txt`);
  } else if (format === 'md') {
    const content = `# ${item.title}\n\n> **مدل هوش مصنوعی:** ${item.model} | **تاریخ ثبت:** ${new Date(item.createdAt).toLocaleString('fa-IR')}\n\n${item.content}\n\n---\n*ایجاد شده توسط OmniAI Studio*`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `${cleanTitle}.md`);
  } else if (format === 'json') {
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${cleanTitle}.json`);
  } else if (format === 'html') {
    const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<title>${item.title}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.8; color: #1e293b; background: #f8fafc; }
h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
.meta { color: #64748b; font-size: 0.9em; margin-bottom: 24px; padding: 12px; background: #e2e8f0; border-radius: 8px; }
.content { white-space: pre-wrap; font-size: 1.05em; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
</style>
</head>
<body>
<h1>${item.title}</h1>
<div class="meta">مدل هوش مصنوعی: ${item.model} | تاریخ: ${new Date(item.createdAt).toLocaleString('fa-IR')}</div>
<div class="content">${item.content}</div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    downloadBlob(blob, `${cleanTitle}.html`);
  }
}

// Convert image format on client side (Offline!) using HTML5 Canvas
export async function exportImage(
  item: GeneratedItem,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.95
) {
  const cleanTitle = (item.title || 'generated-image').replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_');
  const img = new Image();
  img.crossOrigin = 'anonymous';

  return new Promise<void>((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 1024;
      canvas.height = img.naturalHeight || 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));

      // If jpeg, fill white background to avoid black transparency
      if (format === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const mimeType = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Image conversion failed'));
          downloadBlob(blob, `${cleanTitle}.${format}`);
          resolve();
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      // Fallback direct download
      try {
        const blob = dataURLToBlob(item.content);
        downloadBlob(blob, `${cleanTitle}.${format}`);
        resolve();
      } catch (e) {
        reject(e);
      }
    };

    img.src = item.content;
  });
}

// Export Video or Audio
export function exportMediaFile(item: GeneratedItem, extension: string) {
  const cleanTitle = (item.title || 'media').replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_');
  if (item.content.startsWith('data:')) {
    const blob = dataURLToBlob(item.content);
    downloadBlob(blob, `${cleanTitle}.${extension}`);
  } else {
    // If it is a direct URL
    const a = document.createElement('a');
    a.href = item.content;
    a.download = `${cleanTitle}.${extension}`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

// Print / PDF formatted preview for text
export function printFormattedText(item: GeneratedItem) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
      <title>${item.title}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.8; padding: 40px; color: #111; }
        h1 { border-bottom: 2px solid #ccc; padding-bottom: 10px; font-size: 24px; }
        .meta { color: #555; margin-bottom: 20px; font-size: 13px; }
        pre, .content { white-space: pre-wrap; font-size: 15px; }
      </style>
    </head>
    <body>
      <h1>${item.title}</h1>
      <div class="meta">تولید شده توسط ${item.model} در OmniAI Studio | ${new Date(item.createdAt).toLocaleString('fa-IR')}</div>
      <div class="content">${item.content}</div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// Export batch items as a structured ZIP file
export async function exportBatchAsZip(items: GeneratedItem[], zipName = 'OmniAI_Studio_Export.zip') {
  const zip = new JSZip();

  // Create subfolders
  const textFolder = zip.folder('texts');
  const imageFolder = zip.folder('images');
  const videoFolder = zip.folder('videos');
  const audioFolder = zip.folder('audio');

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const safeTitle = `${i + 1}_${(item.title || 'item').replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_')}`;

    if (item.type === 'text' && textFolder) {
      textFolder.file(`${safeTitle}.md`, `# ${item.title}\n\n${item.content}`);
    } else if (item.type === 'image' && imageFolder) {
      if (item.content.startsWith('data:image/svg+xml')) {
        const svgStr = decodeURIComponent(item.content.split(',')[1]);
        imageFolder.file(`${safeTitle}.svg`, svgStr);
      } else if (item.content.startsWith('data:')) {
        const parts = item.content.split(',');
        const base64Data = parts[1];
        const ext = parts[0].includes('jpeg') ? 'jpg' : parts[0].includes('webp') ? 'webp' : 'png';
        imageFolder.file(`${safeTitle}.${ext}`, base64Data, { base64: true });
      }
    } else if (item.type === 'video' && videoFolder) {
      if (item.content.startsWith('data:')) {
        const base64Data = item.content.split(',')[1];
        videoFolder.file(`${safeTitle}.mp4`, base64Data, { base64: true });
      } else {
        videoFolder.file(`${safeTitle}_link.txt`, `Direct URL: ${item.content}`);
      }
    } else if (item.type === 'audio' && audioFolder) {
      if (item.content.startsWith('data:')) {
        const base64Data = item.content.split(',')[1];
        audioFolder.file(`${safeTitle}.wav`, base64Data, { base64: true });
      }
    }
  }

  // Add manifest
  zip.file(
    'manifest.json',
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        itemCount: items.length,
        items: items.map((it) => ({
          id: it.id,
          title: it.title,
          type: it.type,
          model: it.model,
          createdAt: it.createdAt,
        })),
      },
      null,
      2
    )
  );

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, zipName);
}

// Export encrypted backup file (.omnivault)
export async function exportEncryptedVaultFile(items: GeneratedItem[], passphrase: string) {
  const jsonStr = JSON.stringify({
    version: '2.0',
    exportedAt: Date.now(),
    items,
  });

  const payload = await encryptData(jsonStr, passphrase);
  const blob = new Blob([payload], { type: 'application/octet-stream' });
  downloadBlob(blob, `OmniAI_Vault_${new Date().toISOString().slice(0, 10)}.omnivault`);
}
