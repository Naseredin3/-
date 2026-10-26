// Web Crypto API based AES-GCM-256 client-side encryption

async function getKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(plainText: string, passphrase: string): Promise<string> {
  if (!passphrase) return plainText;
  try {
    const enc = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await getKey(passphrase, salt);

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plainText)
    );

    const buffer = new Uint8Array(encrypted);
    const combined = new Uint8Array(salt.length + iv.length + buffer.length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(buffer, salt.length + iv.length);

    // Convert to base64
    let binary = '';
    const len = combined.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return `OMNI_ENC:${btoa(binary)}`;
  } catch (err) {
    console.error('Encryption failed:', err);
    throw new Error('رمزنگاری داده‌ها ناموفق بود.');
  }
}

export async function decryptData(cipherText: string, passphrase: string): Promise<string> {
  if (!cipherText.startsWith('OMNI_ENC:')) {
    return cipherText; // Not encrypted
  }
  if (!passphrase) {
    throw new Error('برای رمزگشایی اطلاعات، رمز عبور والت الزامی است.');
  }

  try {
    const base64 = cipherText.replace('OMNI_ENC:', '');
    const binary = atob(base64);
    const combined = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      combined[i] = binary.charCodeAt(i);
    }

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);

    const key = await getKey(passphrase, salt);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.error('Decryption failed:', err);
    throw new Error('رمز عبور وارد شده اشتباه است یا داده‌ها مخدوش شده‌اند.');
  }
}

// Redact PII and sensitive credentials from prompts if enabled
export function redactSensitiveInfo(text: string): { cleaned: string; redactedCount: number } {
  let cleaned = text;
  let count = 0;

  // Mask email addresses
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  cleaned = cleaned.replace(emailRegex, () => {
    count++;
    return '[EMAIL_PROTECTED]';
  });

  // Mask phone numbers (IR and international format)
  const phoneRegex = /(\+?[0-9]{1,4}?[-.\s]?\(?[0-9]{1,3}?\)?[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4})/g;
  cleaned = cleaned.replace(phoneRegex, (match) => {
    if (match.replace(/\D/g, '').length >= 8) {
      count++;
      return '[PHONE_PROTECTED]';
    }
    return match;
  });

  // Mask potential API keys & secret tokens (high entropy tokens)
  const keyRegex = /(AIza[0-9A-Za-z-_]{35}|sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,})/g;
  cleaned = cleaned.replace(keyRegex, () => {
    count++;
    return '[SECRET_TOKEN_PROTECTED]';
  });

  return { cleaned, redactedCount: count };
}
