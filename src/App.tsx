import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StudioView } from './components/StudioView';
import { LibraryView } from './components/LibraryView';
import { CloudSyncView } from './components/CloudSyncView';
import { SecurityView } from './components/SecurityView';
import { OfflineToolsView } from './components/OfflineToolsView';
import { PreviewModal } from './components/PreviewModal';
import {
  GeneratedItem,
  CloudVaultConfig,
  SecuritySettings,
} from './types';
import {
  loadItems,
  saveItems,
  loadVaultConfig,
  saveVaultConfig,
  loadSecuritySettings,
  saveSecuritySettings,
  pushVaultToCloud,
  pullVaultFromCloud,
} from './utils/storage';

export default function App() {
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [activeTab, setActiveTab] = useState<'studio' | 'library' | 'sync' | 'security' | 'offline'>('studio');

  // Core Data
  const [items, setItems] = useState<GeneratedItem[]>([]);
  const [vaultConfig, setVaultConfig] = useState<CloudVaultConfig>(loadVaultConfig());
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(loadSecuritySettings());
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<GeneratedItem | null>(null);

  // Network & Sync State
  const [isSystemOnline, setIsSystemOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Effective online status
  const effectiveOnline = isSystemOnline && !isSimulatedOffline;

  // Initial load
  useEffect(() => {
    const loaded = loadItems();
    setItems(loaded);

    const handleOnline = () => setIsSystemOnline(true);
    const handleOffline = () => setIsSystemOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update HTML dir when lang changes
  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Persist items
  const updateAndSaveItems = (newItems: GeneratedItem[]) => {
    setItems(newItems);
    if (!securitySettings.privateMode) {
      saveItems(newItems);
    }
  };

  // Add newly generated item
  const handleItemGenerated = async (newItem: GeneratedItem) => {
    const updated = [newItem, ...items];
    updateAndSaveItems(updated);

    // Auto-sync to cloud if enabled and online
    if (vaultConfig.autoSync && effectiveOnline) {
      try {
        setIsSyncing(true);
        const res = await pushVaultToCloud(
          updated,
          vaultConfig.vaultId,
          vaultConfig.e2eeEnabled ? vaultConfig.passphrase : undefined
        );
        const newCfg = { ...vaultConfig, lastSyncTime: res.updatedAt, deviceCount: res.deviceCount };
        setVaultConfig(newCfg);
        saveVaultConfig(newCfg);
      } catch (err) {
        console.warn('Auto cloud sync failed:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    updateAndSaveItems(updated);
  };

  // Batch delete items
  const handleBatchDelete = (ids: string[]) => {
    const updated = items.filter((i) => !ids.includes(i.id));
    updateAndSaveItems(updated);
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i));
    updateAndSaveItems(updated);
  };

  // Update item content
  const handleUpdateItem = (updatedItem: GeneratedItem) => {
    const updated = items.map((i) => (i.id === updatedItem.id ? updatedItem : i));
    updateAndSaveItems(updated);
    setSelectedPreviewItem(updatedItem);
  };

  // Push sync
  const handlePushSync = async () => {
    setIsSyncing(true);
    try {
      const res = await pushVaultToCloud(
        items,
        vaultConfig.vaultId,
        vaultConfig.e2eeEnabled ? vaultConfig.passphrase : undefined
      );
      const newCfg = { ...vaultConfig, lastSyncTime: res.updatedAt, deviceCount: res.deviceCount };
      setVaultConfig(newCfg);
      saveVaultConfig(newCfg);
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull sync
  const handlePullSync = async (targetVaultId: string, passphrase?: string) => {
    setIsSyncing(true);
    try {
      const res = await pullVaultFromCloud(targetVaultId, passphrase);
      // Merge items by id
      const existingIds = new Set(items.map((i) => i.id));
      const merged = [...items];
      for (const it of res.items) {
        if (!existingIds.has(it.id)) {
          merged.push(it);
        }
      }
      updateAndSaveItems(merged);

      const newCfg = {
        ...vaultConfig,
        vaultId: targetVaultId,
        lastSyncTime: res.updatedAt,
        deviceCount: res.deviceCount,
      };
      setVaultConfig(newCfg);
      saveVaultConfig(newCfg);
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear all data
  const handleClearAllItems = () => {
    setItems([]);
    localStorage.removeItem('omni_ai_items_v2');
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-[var(--font-vazir)] selection:bg-indigo-500 selection:text-white`}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={effectiveOnline}
        isSyncing={isSyncing}
        lastSyncTime={vaultConfig.lastSyncTime || null}
        e2eeEnabled={vaultConfig.e2eeEnabled || securitySettings.e2eeEnabled}
        libraryCount={items.length}
        lang={lang}
        setLang={setLang}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'studio' && (
          <StudioView
            onItemGenerated={handleItemGenerated}
            securitySettings={securitySettings}
            lang={lang}
            onOpenPreview={(item) => setSelectedPreviewItem(item)}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            items={items}
            onDeleteItem={handleDeleteItem}
            onToggleFavorite={handleToggleFavorite}
            onOpenPreview={(item) => setSelectedPreviewItem(item)}
            onBatchDelete={handleBatchDelete}
            lang={lang}
          />
        )}

        {activeTab === 'sync' && (
          <CloudSyncView
            vaultConfig={vaultConfig}
            onUpdateVaultConfig={(cfg) => {
              setVaultConfig(cfg);
              saveVaultConfig(cfg);
            }}
            onPushSync={handlePushSync}
            onPullSync={handlePullSync}
            itemCount={items.length}
            isSyncing={isSyncing}
            lang={lang}
          />
        )}

        {activeTab === 'security' && (
          <SecurityView
            settings={securitySettings}
            onUpdateSettings={(s) => {
              setSecuritySettings(s);
              saveSecuritySettings(s);
            }}
            items={items}
            onRestoreItems={(restored) => updateAndSaveItems(restored)}
            onClearAllItems={handleClearAllItems}
            lang={lang}
          />
        )}

        {activeTab === 'offline' && (
          <OfflineToolsView
            items={items}
            isOnline={effectiveOnline}
            onToggleSimulatedOffline={() => setIsSimulatedOffline(!isSimulatedOffline)}
            isSimulatedOffline={isSimulatedOffline}
            lang={lang}
          />
        )}
      </main>

      {/* Preview & Multi-Format Export Modal */}
      <PreviewModal
        item={selectedPreviewItem}
        onClose={() => setSelectedPreviewItem(null)}
        onUpdateItem={handleUpdateItem}
        onToggleFavorite={handleToggleFavorite}
        onOpenInOfflineLab={(item) => {
          setSelectedPreviewItem(null);
          setActiveTab('offline');
        }}
        lang={lang}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-300">OmniAI Studio</span>
            <span>•</span>
            <span>{lang === 'fa' ? 'تمامی مدل‌های هوش مصنوعی در یک پلتفرم' : 'All AI models in one unified platform'}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>{lang === 'fa' ? 'رمزنگاری E2EE انتها‌به‌انتها' : 'E2EE AES-GCM Encrypted'}</span>
            <span>•</span>
            <span>{lang === 'fa' ? 'قابلیت کارکرد آفلاین' : 'Offline Mode Ready'}</span>
            <span>•</span>
            <span>{lang === 'fa' ? 'بدون محدودیت تعداد خروجی' : 'Unlimited Outputs'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
