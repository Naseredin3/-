import { GeneratedItem, CloudVaultConfig, SecuritySettings } from '../types';
import { encryptData, decryptData } from './security';

const STORAGE_KEY = 'omni_ai_items_v2';
const VAULT_CONFIG_KEY = 'omni_ai_vault_config';
const SECURITY_KEY = 'omni_ai_security_settings';

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  e2eeEnabled: false,
  passphrase: '',
  privateMode: false,
  redactSensitiveData: true,
  autoLockMinutes: 30,
};

// Initial starter demo items
export const SAMPLE_ITEMS: GeneratedItem[] = [
  {
    id: 'sample-1',
    type: 'text',
    title: 'برنامه استراتژیک توسعه محصول با هوش مصنوعی',
    prompt: 'یک برنامه جامع و عملی برای ادغام هوش مصنوعی در پلتفرم سازمانی بنویس.',
    model: 'gemini-3.8-flash',
    content: `# راهنمای جامع معماری و توسعه محصول مبتنی بر هوش مصنوعی

## ۱. اهداف کلیدی
* افزایش بهره‌وری تیم‌های توسعه تا ۴۵٪ با بهره‌گیری از مدل‌های چندمنظوره
* ایجاد زیرساخت امن پردازش ابری با معماری رمزنگاری انتها‌به‌انتها (E2EE)
* پشتیبانی پایدار از دسترسی آفلاین برای حفظ تداوم عملیات سازمانی

## ۲. ارکان فنی پلتفرم
1. **لایه استنتاج هوش مصنوعی (Inference Layer):** استفاده از مدل‌های اختصاصی مانند Gemini 3.8 Flash برای کارهای عمومی و Gemini 4 Argon برای حل محاسبات عمیق.
2. **پایگاه داده همگام‌ساز (Multi-device Sync):** ساختار همگام‌سازی ابری سبک با پشتیبانی از کش محلی.
3. **حفظ حریم خصوصی و امنیت داده:** فیلتراسیون خودکار اطلاعات هویتی و ذخیره‌سازی محلی کلیدها.

## ۳. شاخص‌های موفقیت (KPI)
- کاهش زمان تولید دارایی‌های چندرسانه‌ای به زیر ۵ ثانیه
- ضریب دسترسی ۹۹.۹٪ حتی در شرایط قطع اینترنت به کمک قابلیت‌های آفلاین`,
    createdAt: Date.now() - 1000 * 60 * 120,
    tags: ['استراتژی', 'معماری', 'هوش مصنوعی'],
    isFavorite: true,
    metadata: {
      wordCount: 154,
    },
  },
  {
    id: 'sample-2',
    type: 'image',
    title: 'کاوشگر آینده‌نگر در شهر نئونی تهران',
    prompt: 'تصویر هایپررئال 4K از یک شهر پیشرفته با المان‌های معماری نئونی و کاوشگر مدرن.',
    model: 'gemini-nano-banana-2.1',
    // High-resolution SVG / Canvas generative data illustration as instant sample
    content: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="50%" stop-color="%23311042"/><stop offset="100%" stop-color="%23090d16"/></linearGradient><linearGradient id="neon" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23ec4899"/><stop offset="50%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%2306b6d4"/></linearGradient><radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%238b5cf6" stop-opacity="0.8"/><stop offset="100%" stop-color="%238b5cf6" stop-opacity="0"/></radialGradient></defs><rect width="800" height="800" fill="url(%23bg)"/><circle cx="400" cy="350" r="280" fill="url(%23glow)" opacity="0.3"/><polygon points="200,650 300,280 380,650" fill="%231e1b4b" opacity="0.9"/><polygon points="350,650 450,220 540,650" fill="%232e1065" opacity="0.9"/><polygon points="500,650 600,320 680,650" fill="%231e1b4b" opacity="0.9"/><line x1="100" y1="650" x2="700" y2="650" stroke="url(%23neon)" stroke-width="4"/><circle cx="400" cy="320" r="60" fill="none" stroke="url(%23neon)" stroke-width="6"/><circle cx="400" cy="320" r="40" fill="%23ec4899" opacity="0.8"/><text x="400" y="720" fill="%23f8fafc" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle">OMNI AI ULTRA HD GRAPHICS</text><text x="400" y="750" fill="%2394a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">Generated with Gemini Nano Banana 2.1 (4K Render)</text></svg>`,
    createdAt: Date.now() - 1000 * 60 * 75,
    tags: ['هنر دیجیتال', 'سایبرپانک', 'رندر 4K'],
    isFavorite: true,
    metadata: {
      aspectRatio: '1:1',
      imageSize: '4K',
      resolution: '4096x4096',
    },
  },
  {
    id: 'sample-3',
    type: 'video',
    title: 'انیمیشن کهکشان هولوگرافیک و جریان نور',
    prompt: 'جریان ذرات نورانی شناور در فضا با حرکت سینمایی پیوسته دوربین ۳۶۰ درجه.',
    model: 'gemini-omni-1.1-flash',
    // Generative WebM animated demonstration data
    content: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    createdAt: Date.now() - 1000 * 60 * 30,
    tags: ['ویدیو سینمایی', 'فضایی', 'Veo'],
    isFavorite: false,
    metadata: {
      aspectRatio: '16:9',
      duration: '5s',
      resolution: '1080p',
    },
  },
  {
    id: 'sample-4',
    type: 'audio',
    title: 'توضیحات صوتی استودیویی: خوش‌آمدید به آینده هوش مصنوعی',
    prompt: 'پیام خوش‌آمدگویی رادیویی با صدای گرم استودیویی',
    model: 'gemini-3.8-flash-lite-tts',
    content: 'https://actions.google.com/sounds/v1/ambiences/daytime_forest_bonfire.ogg',
    createdAt: Date.now() - 1000 * 60 * 15,
    tags: ['پادکست', 'صداگذاری', 'استودیو'],
    isFavorite: true,
    metadata: {
      voice: 'Kore',
    },
  },
];

export function loadItems(): GeneratedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveItems(SAMPLE_ITEMS);
      return SAMPLE_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SAMPLE_ITEMS;
  } catch (err) {
    console.error('Failed to load items from storage:', err);
    return SAMPLE_ITEMS;
  }
}

export function saveItems(items: GeneratedItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('LocalStorage limit reached or disabled. Pruning oldest items if necessary.');
    if (items.length > 5) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 10)));
      } catch (e) {
        console.error('Cannot save items to localStorage', e);
      }
    }
  }
}

export function loadVaultConfig(): CloudVaultConfig {
  try {
    const raw = localStorage.getItem(VAULT_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  // Generate random default vault code
  const randomCode = 'OMNI-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const def: CloudVaultConfig = {
    vaultId: randomCode,
    autoSync: true,
    e2eeEnabled: false,
    lastSyncTime: null,
    deviceCount: 1,
  };
  saveVaultConfig(def);
  return def;
}

export function saveVaultConfig(config: CloudVaultConfig): void {
  try {
    localStorage.setItem(VAULT_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error(e);
  }
}

export function loadSecuritySettings(): SecuritySettings {
  try {
    const raw = localStorage.getItem(SECURITY_KEY);
    if (raw) return { ...DEFAULT_SECURITY_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_SECURITY_SETTINGS;
}

export function saveSecuritySettings(settings: SecuritySettings): void {
  try {
    localStorage.setItem(SECURITY_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error(e);
  }
}

// Cloud Synchronization RPC
export async function pushVaultToCloud(
  items: GeneratedItem[],
  vaultId: string,
  passphrase?: string
): Promise<{ success: boolean; updatedAt: number; deviceCount: number }> {
  const serialized = JSON.stringify(items);
  let payload = serialized;
  if (passphrase) {
    payload = await encryptData(serialized, passphrase);
  }

  const res = await fetch('/api/cloud-sync/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vaultId,
      data: payload,
      isEncrypted: Boolean(passphrase),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'خطا در ارتباط با سرور همگام‌سازی ابری.');
  }

  return await res.json();
}

export async function pullVaultFromCloud(
  vaultId: string,
  passphrase?: string
): Promise<{ items: GeneratedItem[]; updatedAt: number; deviceCount: number }> {
  const res = await fetch(`/api/cloud-sync/pull/${encodeURIComponent(vaultId)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'اطلاعاتی با این کد والت در سرور یافت نشد.');
  }

  const result = await res.json();
  let rawData = result.data;

  if (rawData.startsWith('OMNI_ENC:')) {
    if (!passphrase) {
      throw new Error('این والت با رمزنگاری محافظت شده است. لطفاً رمز عبور والت را وارد فرمایید.');
    }
    rawData = await decryptData(rawData, passphrase);
  }

  const items = JSON.parse(rawData);
  return {
    items,
    updatedAt: result.updatedAt,
    deviceCount: result.deviceCount,
  };
}
