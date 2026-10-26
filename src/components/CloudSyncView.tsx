import React, { useState } from 'react';
import {
  Cloud,
  RefreshCw,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle,
  Copy,
  Lock,
  Unlock,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  ArrowDownCircle,
  ArrowUpCircle,
  Key,
} from 'lucide-react';
import { CloudVaultConfig, GeneratedItem } from '../types';

interface CloudSyncViewProps {
  vaultConfig: CloudVaultConfig;
  onUpdateVaultConfig: (config: CloudVaultConfig) => void;
  onPushSync: () => Promise<void>;
  onPullSync: (targetVaultId: string, passphrase?: string) => Promise<void>;
  itemCount: number;
  isSyncing: boolean;
  lang: 'fa' | 'en';
}

export const CloudSyncView: React.FC<CloudSyncViewProps> = ({
  vaultConfig,
  onUpdateVaultConfig,
  onPushSync,
  onPullSync,
  itemCount,
  isSyncing,
  lang,
}) => {
  const isFa = lang === 'fa';

  const [copied, setCopied] = useState(false);
  const [targetVaultInput, setTargetVaultInput] = useState('');
  const [pullPassphrase, setPullPassphrase] = useState('');
  const [isPulling, setIsPulling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // E2EE settings local state
  const [e2eePassphrase, setE2eePassphrase] = useState(vaultConfig.passphrase || '');
  const [e2eeEnabled, setE2eeEnabled] = useState(vaultConfig.e2eeEnabled);

  const handleCopyVaultCode = () => {
    navigator.clipboard.writeText(vaultConfig.vaultId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePush = async () => {
    setStatusMessage(null);
    try {
      await onPushSync();
      setStatusMessage({
        type: 'success',
        text: isFa ? 'اطلاعات با موفقیت در فضای ابری همگام‌سازی شد.' : 'Data synced successfully to the cloud vault.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || (isFa ? 'خطا در ارسال اطلاعات به سرور ابری.' : 'Failed to sync to cloud.'),
      });
    }
  };

  const handlePull = async () => {
    if (!targetVaultInput.trim()) {
      setStatusMessage({
        type: 'error',
        text: isFa ? 'لطفاً شناسه والت مورد نظر را وارد نمایید.' : 'Please enter target vault code.',
      });
      return;
    }

    setIsPulling(true);
    setStatusMessage(null);
    try {
      await onPullSync(targetVaultInput.trim().toUpperCase(), pullPassphrase);
      setStatusMessage({
        type: 'success',
        text: isFa ? 'اطلاعات با موفقیت از والت ابری دریافت و همگام شد.' : 'Vault pulled successfully!',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || (isFa ? 'والت یافت نشد یا رمز عبور اشتباه است.' : 'Pull failed.'),
      });
    } finally {
      setIsPulling(false);
    }
  };

  const handleSaveE2EE = () => {
    const updated: CloudVaultConfig = {
      ...vaultConfig,
      e2eeEnabled,
      passphrase: e2eeEnabled ? e2eePassphrase : '',
    };
    onUpdateVaultConfig(updated);
    setStatusMessage({
      type: 'success',
      text: isFa ? 'تنظیمات امنیت و رمزنگاری ابری ذخیره شد.' : 'Encryption settings saved.',
    });
  };

  const handleGenerateNewVaultId = () => {
    const newCode = 'OMNI-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    onUpdateVaultConfig({
      ...vaultConfig,
      vaultId: newCode,
      lastSyncTime: null,
    });
    setStatusMessage({
      type: 'success',
      text: isFa ? `شناسه والت جدید ایجاد شد: ${newCode}` : `New vault created: ${newCode}`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header card */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-purple-900/60 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Cloud className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {isFa ? 'همگام‌سازی ابری چند دستگاهه' : 'Multi-Device Cloud Sync'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {isFa
                ? 'با استفاده از شناسه اختصاصی والت، به تمامی خروجی‌ها، پرامپت‌ها و رسانه‌های تولید شده در تلفن همراه، تبلت و کامپیوترهای دیگر خود دسترسی فوری داشته باشید.'
                : 'Access your generated outputs across all smartphones, tablets, and laptops using your private cloud vault code.'}
            </p>
          </div>

          <button
            onClick={handlePush}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {isSyncing
                ? isFa ? 'در حال همگام‌سازی ابری...' : 'Syncing to Cloud...'
                : isFa ? 'همگام‌سازی ابری اکنون' : 'Sync Now'}
            </span>
          </button>
        </div>
      </div>

      {/* Status banner if any */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Vault Info & Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vault ID & Code Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {isFa ? 'شناسه والت ابری شما:' : 'Your Private Vault ID:'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="font-mono text-lg font-extrabold text-indigo-300 tracking-wider">
              {vaultConfig.vaultId}
            </span>
            <button
              onClick={handleCopyVaultCode}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title={isFa ? 'کپی کد والت' : 'Copy code'}
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 space-y-1">
            <p>
              {isFa ? 'آخرین همگام‌سازی:' : 'Last Synced:'}{' '}
              <span className="text-slate-300 font-medium">
                {vaultConfig.lastSyncTime
                  ? new Date(vaultConfig.lastSyncTime).toLocaleTimeString('fa-IR')
                  : isFa ? 'هنوز همگام نشده' : 'Never'}
              </span>
            </p>
            <p>
              {isFa ? 'تعداد خروجی‌های این دستگاه:' : 'Items stored:'}{' '}
              <span className="text-indigo-400 font-bold">{itemCount}</span>
            </p>
          </div>

          <button
            onClick={handleGenerateNewVaultId}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-200 py-2 border-t border-slate-800"
          >
            {isFa ? 'ایجاد شناسه والت جدید' : 'Generate New Vault ID'}
          </button>
        </div>

        {/* Connected Ecosystem Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span>{isFa ? 'سازگار با تمامی دستگاه‌ها' : 'Supported Devices'}</span>
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <Laptop className="w-5 h-5 mx-auto text-indigo-400 mb-1" />
              <span className="text-[11px] text-slate-300 font-medium">{isFa ? 'کامپیوتر' : 'Desktop'}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <Smartphone className="w-5 h-5 mx-auto text-purple-400 mb-1" />
              <span className="text-[11px] text-slate-300 font-medium">{isFa ? 'موبایل' : 'Mobile'}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <Tablet className="w-5 h-5 mx-auto text-pink-400 mb-1" />
              <span className="text-[11px] text-slate-300 font-medium">{isFa ? 'تبلت' : 'Tablet'}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            {isFa
              ? 'کافیست همین آدرس را در مرورگر دستگاه دوم باز کرده و در بخش "اتصال به والت موجود"، کد بالا را وارد نمایید.'
              : 'Open this URL on your second device and enter this Vault ID to sync all outputs.'}
          </div>
        </div>

        {/* Auto Sync Switch Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">
                {isFa ? 'همگام‌سازی خودکار' : 'Auto Sync'}
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={vaultConfig.autoSync}
                  onChange={(e) =>
                    onUpdateVaultConfig({ ...vaultConfig, autoSync: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] rtl:after:right-auto rtl:after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isFa
                ? 'با فعال‌سازی این گزینه، هر بار که متن، تصویر یا ویدیوی جدیدی تولید می‌کنید، به‌طور خودکار در والت ابری ذخیره خواهد شد.'
                : 'Automatically pushes newly generated items to your cloud vault in real-time.'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>{isFa ? 'بدون محدودیت تعداد همگام‌سازی' : 'Unlimited cloud syncs'}</span>
          </div>
        </div>
      </div>

      {/* Connect to Existing Vault from Another Device (Pull) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <ArrowDownCircle className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-slate-100">
            {isFa ? 'اتصال و دریافت اطلاعات از دستگاه دیگر (Pull Vault)' : 'Pull from another device'}
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {isFa
            ? 'اگر قبلاً روی گوشی یا لپ‌تاپ دیگر خود محتوا تولید کرده‌اید، شناسه والت آن دستگاه را اینجا وارد کنید تا کل آرشیو شما روی این دستگاه دانلود و ادغام گردد.'
            : 'Enter another device’s Vault ID to pull and merge all generated outputs onto this machine.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-5">
            <input
              type="text"
              value={targetVaultInput}
              onChange={(e) => setTargetVaultInput(e.target.value)}
              placeholder={isFa ? 'شناسه والت (مثال: OMNI-7K2M9X)' : 'Vault ID (e.g. OMNI-7K2M9X)'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 uppercase font-mono tracking-wider focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-4">
            <input
              type="password"
              value={pullPassphrase}
              onChange={(e) => setPullPassphrase(e.target.value)}
              placeholder={isFa ? 'رمز عبور والت (در صورت وجود رمزنگاری)' : 'Passphrase (if encrypted)'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              onClick={handlePull}
              disabled={isPulling}
              className="w-full h-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>{isPulling ? (isFa ? 'در حال دریافت...' : 'Pulling...') : (isFa ? 'دریافت و ادغام آرشیو' : 'Pull & Merge')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Vault End-to-End Encryption Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {isFa ? 'رمزنگاری انتها‌به‌انتها در فضای ابری (E2EE)' : 'End-to-End Cloud Encryption'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFa
                  ? 'داده‌ها با الگوریتم استاندارد AES-GCM-256 قبل از خروج از مرورگر رمزنگاری می‌شوند.'
                  : 'Zero-knowledge encryption using client-side AES-GCM-256 before leaving your browser.'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={e2eeEnabled}
              onChange={(e) => setE2eeEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] rtl:after:right-auto rtl:after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {e2eeEnabled && (
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              {isFa ? 'رمز عبور شخصی برای والت ابری:' : 'Vault Passphrase:'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="password"
                value={e2eePassphrase}
                onChange={(e) => setE2eePassphrase(e.target.value)}
                placeholder={isFa ? 'یک عبارت امن و قوی وارد نمایید...' : 'Enter a strong secret passphrase...'}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSaveE2EE}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                {isFa ? 'ذخیره کلید' : 'Save Key'}
              </button>
            </div>
            <p className="text-[11px] text-amber-400/90">
              ⚠️ {isFa ? 'نکته مهم: این رمز عبور در سرور ذخیره نمی‌شود. در صورت فراموشی، هیچ‌کس نمی‌تواند داده‌ها را رمزگشایی کند.' : 'Note: This key never leaves your browser. Keep it safe.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
