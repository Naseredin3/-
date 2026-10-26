import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory / persistent cloud sync store
const cloudVaults = new Map<string, { updatedAt: number; data: string; deviceCount: number }>();

// Available AI models registry
const AI_MODELS = [
  // Text & Reasoning
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    category: 'text',
    provider: 'Google DeepMind',
    description: 'مدل پرچمدار و فوق‌سریع برای تفکر چندمنظوره، نویسندگی، برنامه‌نویسی و تحلیل عمیق فارسی و انگلیسی',
    badge: 'پیشنهادی (Recommended)',
    contextWindow: '1M tokens',
    speed: 'فوق‌العاده سریع (Ultra Fast)',
    quality: 'بسیار بالا (Very High)',
    capabilities: ['تولید متن خلاقانه', 'حل مسائل پیچیده', 'کدنویسی حرفه‌ای', 'ترجمه دقیق و روان', 'تحلیل داده']
  },
  {
    id: 'gemini-4-argon',
    name: 'Gemini 4 Argon',
    category: 'text',
    provider: 'Google DeepMind',
    description: 'قدرتمندترین مدل استدلال منطقی، پژوهش علمی و محاسبات ریاضی پیشرفته',
    badge: 'استدلال عمیق (Deep Reasoning)',
    contextWindow: '2M tokens',
    speed: 'سرعت متوسط با دقت حداکثری',
    quality: 'کیفیت استثنایی (Extreme Quality)',
    capabilities: ['استدلال گام‌به‌گام عمیق', 'حل فرمول‌های ریاضی و فیزیک', 'معماری سیستم‌های نرم‌افزاری', 'تحلیل مستندات طولانی']
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    category: 'text',
    provider: 'Google DeepMind',
    description: 'مدل بهینه‌سازی شده با کمترین زمان پاسخ‌دهی برای خلاصه‌سازی سریع و کارهای روزمره',
    badge: 'فوق کم‌مصرف و سریع',
    contextWindow: '500K tokens',
    speed: 'سریع‌ترین (Instant)',
    quality: 'بالا (High)',
    capabilities: ['خلاصه‌سازی فوری', 'پاسخ‌های کوتاه و مستقیم', 'استخراج کلمات کلیدی', 'پردازش دسته‌ای']
  },

  // Image Generation
  {
    id: 'gemini-nano-banana-2.1',
    name: 'Nano Banana 2.1 (Ultra Image)',
    category: 'image',
    provider: 'Google DeepMind',
    description: 'تولید تصاویر فوق‌العاده واقع‌گرایانه با کیفیت 1K, 2K و 4K در ابعاد متنوع سینمایی و مربعی',
    badge: 'کیفیت 4K (Ultra HD)',
    contextWindow: 'Ultra High Res',
    speed: 'سریع و باجزئیات دقیق',
    quality: 'کیفیت استودیویی 4K',
    capabilities: ['وضوح تصویر 1K تا 4K', 'نسبت‌های مختلف 1:1, 16:9, 9:16, 4:3', 'نورپردازی هایپررئال', 'درک عمیق از پرامپت‌های فارسی']
  },
  {
    id: 'gemini-3.1-flash-lite-image',
    name: 'Gemini Flash Image Studio',
    category: 'image',
    provider: 'Google DeepMind',
    description: 'تولید سریع و ویرایش حرفه‌ای تصاویر موجود (Image Editing & Inpainting)',
    badge: 'تولید و ویرایش عکس',
    contextWindow: 'Standard HD',
    speed: 'بسیار سریع',
    quality: 'کیفیت بالا HD',
    capabilities: ['تولید تصویر سریع', 'ویرایش و افزودن المان به عکس', 'تغییر پس‌زمینه و سبک', 'انتقال استایل هنری']
  },

  // Video Generation
  {
    id: 'gemini-omni-1.1-flash',
    name: 'Gemini Omni Flash (Veo Video)',
    category: 'video',
    provider: 'Google DeepMind',
    description: 'تولید ویدیوهای سینمایی با هوش مصنوعی بر اساس متن یا انیمیشن‌سازی تصویر (Image to Video)',
    badge: 'تولید ویدیو (Cinematic Video)',
    contextWindow: '720p / 1080p',
    speed: 'پردازش ابری پیشرفته',
    quality: 'سینمایی و روان',
    capabilities: ['تولید ویدیو از متن (Text to Video)', 'متحرک‌سازی تصویر ثابت (Animate Image)', 'نسبت‌های 16:9 و 9:16', 'مدت زمان 5 الی 10 ثانیه']
  },

  // Audio & Speech
  {
    id: 'gemini-3.8-flash-lite-tts',
    name: 'Gemini Voice Synth (TTS)',
    category: 'audio',
    provider: 'Google DeepMind',
    description: 'تبدیل متن به گفتار فوق‌العاده طبیعی و با احساس با صداهای متنوع استودیویی',
    badge: 'گفتار طبیعی (Studio Speech)',
    contextWindow: '24kHz Studio Audio',
    speed: 'آنی (Real-time)',
    quality: 'کیفیت استودیویی 24kHz',
    capabilities: ['تلفظ روان و بدون لهجه تصنعی', 'صداهای زن و مرد (Kore, Puck, Zephyr, Fenrir)', 'خروجی فایل صوتی WAV بدون افت کیفیت']
  }
];

// Routes

// 1. Health check & models registry
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(apiKey),
    timestamp: Date.now(),
    version: '2.5.0',
    encryptionSupported: true,
  });
});

app.get('/api/models', (req: Request, res: Response) => {
  res.json({
    models: AI_MODELS,
    categories: ['all', 'text', 'image', 'video', 'audio'],
  });
});

// 2. Generate Text Endpoint
app.post('/api/generate/text', async (req: Request, res: Response) => {
  try {
    const { prompt, model, systemInstruction, temperature, stream } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'متن درخواست (پرامپت) الزامی است.' });
    }

    const chosenModel = model || 'gemini-3.8-flash';
    const sysPrompt = systemInstruction || 
      'شما یک دستیار هوش مصنوعی فوق‌العاده باهوش، خلاق و آگاه در استودیو جامع هوش مصنوعی (OmniAI Studio) هستید. پاسخ‌ها را دقیق، کامل، خوانا و با ساختار عالی (شامل عنوان‌بندی و نکات کلیدی در صورت نیاز) ارائه دهید.';

    const response = await ai.models.generateContent({
      model: chosenModel,
      contents: prompt,
      config: {
        systemInstruction: sysPrompt,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      },
    });

    const outputText = response.text || '';

    return res.json({
      text: outputText,
      model: chosenModel,
      createdAt: Date.now(),
    });
  } catch (err: any) {
    console.error('Error in /api/generate/text:', err);
    return res.status(500).json({
      error: err?.message || 'خطا در ارتباط با مدل متنی هوش مصنوعی. لطفاً دوباره تلاش فرمایید.',
    });
  }
});

// 3. Generate Image Endpoint
app.post('/api/generate/image', async (req: Request, res: Response) => {
  try {
    const { prompt, model, aspectRatio, imageSize, referenceImage } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'توضیحات تصویر برای تولید الزامی است.' });
    }

    const chosenModel = referenceImage ? 'gemini-3.1-flash-lite-image' : (model || 'gemini-nano-banana-2.1');
    const targetAspect = aspectRatio || '1:1';
    const targetSize = imageSize || '1K';

    let parts: any[] = [];

    if (referenceImage) {
      // Editing or modifying image
      let cleanBase64 = referenceImage;
      let mimeType = 'image/png';
      if (referenceImage.includes(';base64,')) {
        const matches = referenceImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          cleanBase64 = matches[2];
        }
      }
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: chosenModel,
        contents: { parts },
      });

      let imageUrl = '';
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        // Fallback text explanation if model couldn't output image part
        const textPart = response.text;
        throw new Error(textPart || 'پاسخ تصویری از مدل دریافت نشد.');
      }

      return res.json({
        imageUrl,
        model: chosenModel,
        aspectRatio: targetAspect,
        createdAt: Date.now(),
      });
    } else {
      // New Image Generation
      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: chosenModel,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: targetAspect as any,
            imageSize: targetSize as any,
          },
        },
      });

      let imageUrl = '';
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        throw new Error(response.text || 'پاسخ تصویری معتبری تولید نشد.');
      }

      return res.json({
        imageUrl,
        model: chosenModel,
        aspectRatio: targetAspect,
        imageSize: targetSize,
        createdAt: Date.now(),
      });
    }
  } catch (err: any) {
    console.error('Error in /api/generate/image:', err);
    return res.status(500).json({
      error: err?.message || 'خطا در تولید تصویر. لطفاً پرامپت را بررسی یا مجدداً امتحان کنید.',
    });
  }
});

// 4. Generate Video Endpoint (Omni Flash / Veo via Interactions API)
app.post('/api/generate/video', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio, duration, resolution, referenceImage } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'توضیحات ویدیوی درخواستی الزامی است.' });
    }

    const targetAspect = aspectRatio || '16:9';
    const targetDuration = duration || '5s';
    const targetResolution = resolution || '720p';

    let interactionInput: any;

    if (referenceImage) {
      // Image to video animation
      let cleanBase64 = referenceImage;
      let mimeType = 'image/png';
      if (referenceImage.includes(';base64,')) {
        const matches = referenceImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          cleanBase64 = matches[2];
        }
      }
      interactionInput = [
        {
          type: 'image',
          mime_type: mimeType,
          data: cleanBase64,
        },
        {
          type: 'text',
          text: prompt,
        },
      ];
    } else {
      interactionInput = prompt;
    }

    // Call Interactions API for gemini-omni-1.1-flash
    const interaction = await ai.interactions.create(
      {
        model: 'gemini-omni-1.1-flash',
        input: interactionInput,
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: targetAspect as any,
          duration: targetDuration as any,
          resolution: targetResolution as any,
        },
      },
      { timeout: 300000 }
    );

    const videoPart = interaction.output_video;
    if (videoPart && videoPart.data) {
      const mime = videoPart.mime_type || 'video/mp4';
      const videoUrl = `data:${mime};base64,${videoPart.data}`;
      return res.json({
        videoUrl,
        model: 'gemini-omni-1.1-flash',
        aspectRatio: targetAspect,
        duration: targetDuration,
        resolution: targetResolution,
        createdAt: Date.now(),
      });
    }

    throw new Error('مدل ویدیو خروجی تولید نکرد. ممکن است به دلیل محدودیت‌های پردازشی باشد.');
  } catch (err: any) {
    console.error('Error in /api/generate/video:', err);
    return res.status(500).json({
      error: err?.message || 'خطا در تولید ویدیو. لطفاً مدت زمان کوتاه‌تر یا پرامپت دیگری را امتحان فرمایید.',
    });
  }
});

// 5. Generate Audio TTS
app.post('/api/generate/audio', async (req: Request, res: Response) => {
  try {
    const { text, voice, style } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'متن برای تبدیل به صدا الزامی است.' });
    }

    const chosenVoice = voice || 'Kore';
    const chosenStyle = style || 'Natural, warm and articulate';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: chosenStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice as any },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('صدایی توسط مدل تولید نشد.');
    }

    const audioUrl = `data:audio/wav;base64,${base64Audio}`;

    return res.json({
      audioUrl,
      voice: chosenVoice,
      model: 'gemini-3.8-flash-lite-tts',
      createdAt: Date.now(),
    });
  } catch (err: any) {
    console.error('Error in /api/generate/audio:', err);
    return res.status(500).json({
      error: err?.message || 'خطا در تولید صدا.',
    });
  }
});

// 6. Cloud Sync Endpoints (Multi-Device encrypted / persistent Vault)
app.post('/api/cloud-sync/push', (req: Request, res: Response) => {
  try {
    const { vaultId, data, isEncrypted } = req.body;
    if (!vaultId || !data) {
      return res.status(400).json({ error: 'شناسه والت (vaultId) و داده الزامی است.' });
    }

    const current = cloudVaults.get(vaultId);
    cloudVaults.set(vaultId, {
      updatedAt: Date.now(),
      data,
      deviceCount: (current?.deviceCount || 0) + 1,
    });

    return res.json({
      success: true,
      vaultId,
      updatedAt: Date.now(),
      deviceCount: cloudVaults.get(vaultId)?.deviceCount || 1,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'خطا در ذخیره ابری اطلاعات' });
  }
});

app.get('/api/cloud-sync/pull/:vaultId', (req: Request, res: Response) => {
  const { vaultId } = req.params;
  const vault = cloudVaults.get(vaultId);
  if (!vault) {
    return res.status(404).json({ error: 'والت با این شناسه یافت نشد یا هنوز داده‌ای ثبت نشده است.' });
  }

  return res.json({
    vaultId,
    data: vault.data,
    updatedAt: vault.updatedAt,
    deviceCount: vault.deviceCount,
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
