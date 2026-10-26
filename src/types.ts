export type ContentType = 'text' | 'image' | 'video' | 'audio';

export interface GeneratedItem {
  id: string;
  type: ContentType;
  title: string;
  prompt: string;
  model: string;
  content: string; // text string, or data URL for image/video/audio
  createdAt: number;
  tags: string[];
  isFavorite: boolean;
  notes?: string;
  metadata?: {
    aspectRatio?: string;
    imageSize?: string;
    duration?: string;
    resolution?: string;
    voice?: string;
    fileSize?: number;
    wordCount?: number;
  };
}

export interface AIModelInfo {
  id: string;
  name: string;
  category: ContentType;
  provider: string;
  description: string;
  badge: string;
  contextWindow: string;
  speed: string;
  quality: string;
  capabilities: string[];
}

export interface CloudVaultConfig {
  vaultId: string;
  autoSync: boolean;
  e2eeEnabled: boolean;
  passphrase?: string;
  lastSyncTime?: number | null;
  deviceCount?: number;
}

export interface SecuritySettings {
  e2eeEnabled: boolean;
  passphrase?: string;
  privateMode: boolean; // do not store outputs in persistent storage
  redactSensitiveData: boolean; // mask emails, phone numbers, API keys
  autoLockMinutes: number;
}
