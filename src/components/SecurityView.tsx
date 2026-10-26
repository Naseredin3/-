import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Key,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Cpu,
  Infinity as InfinityIcon,
  HardDrive,
  Info,
} from 'lucide-react';
import { SecuritySettings, GeneratedItem } from '../types';
import { exportEncryptedVaultFile } from '../utils/exportUtils';
import { decryptData } from '../utils/security';

interface SecurityViewProps {
  settings: SecuritySettings;
  onUpdateSettings: (settings: SecuritySettings) => void;
  items: GeneratedItem[];
  onRestoreItems: (items: GeneratedItem[]) => void;
  onClearAllItems: () => void;
  lang: 'fa' | 'en';
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  settings,
  onUpdateSettings,
  items,
  onRestoreItems,
  onClearAllItems,
  lang,
}) => {
  const isFa = lang === 'fa';

  const [backupPassphrase, setBackupPassphrase] = useState('');
  const [restorePassphrase, setRestorePassphrase] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportBackup = async () => {
    if (!backupPassphrase) {
      setStatusMsg({
        type: 'error',
        text: isFa ? 'لطفاً برای رمزنگاری فایل پشتیبان یک رمز عبور تعیین فرمایید.' : 'Please enter a backup passphrase.',
      });
      return;
    }

    setIsExporting(true);
    setStatusMsg(null);
    try {
      await exportEncryptedVaultFile(items, backupPassphrase);
      setStatusMsg({
        type: 'success',
        text: isFa ? 'فایل پشتیبان رمزنگاری‌شده (.omnivault) با موفقیت دانلود شد.' : 'Encrypted backup file downloaded.',
      });
      setBackupPassphrase('');
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || (isFa ? 'خطا در ایجاد فایل پشتیبان.' : 'Backup failed.'),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!restorePassphrase) {
      setStatusMsg({
        type: 'error',
        text: isFa ? 'ابتدا رمز عبور فایل والت را در فیلد مربوطه وارد کنید.' : 'Please enter passphrase before choosing file.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const cipherText = reader.result as string;
        const decryptedJson = await decryptData(cipherText, restorePassphrase);
        const parsed = JSON.parse(decryptedJson);
        if (parsed.items && Array.isArray(parsed.items)) {
          onRestoreItems(parsed.items);
          setStatusMsg({
            type: 'success',
            text: isFa ? `${parsed.items.length} خروجی با موفقیت از فایل رمزنگاری شده بازیابی شد.` : 'Vault restored successfully!',
          });
          setRestorePassphrase('');
        } else {
          throw new Error('ساختار فایل والت معتبر نمی‌باشد.');
        }
      } catch (err: any) {
        setStatusMsg({
          type: 'error',
          text: err.message || (isFa ? 'رمز عبور اشتباه است یا فایل معتبر نیست.' : 'Decryption failed.'),
        });
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    const msg = isFa
      ? 'آیا مطمئن هستید که می‌خواهید تمامی خروجی‌ها و داده‌های محلی پاکسازی شوند؟ این عملیات غیرقابل بازگشت است.'
      : 'Are you sure you want to completely wipe all local data? This action is irreversible.';
    if (window.confirm(msg)) {
      onClearAllItems();
      setStatusMsg({
        type: 'success',
        text: isFa ? 'تمامی خروجی‌ها و ردپاهای محلی با موفقیت پاک شدند.' : 'All local storage wiped clean.',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Security Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isFa ? 'مرکز امنیت، حریم خصوصی و آزادی استفاده' : 'Privacy & Security Center'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {isFa
                ? 'معماری دانش-صفر (Zero-Knowledge) همراه با پردازش امن پراکسی بدون افشای کلیدها یا فروش اطلاعات کاربران'
                : 'Zero-knowledge client architecture with encrypted storage and zero third-party telemetry.'}
            </p>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center gap-3 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Security Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PII Redactor Toggle */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <EyeOff className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100">
                {isFa ? 'پنهان‌سازی هوشمند اطلاعات هویتی (PII Masking)' : 'Smart PII Redaction'}
              </h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.redactSensitiveData}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, redactSensitiveData: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] rtl:after:right-auto rtl:after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isFa
              ? 'هنگام تایپ پرامپت، آدرس‌های ایمیل، شماره‌های تماس و کلیدهای محرمانه به‌صورت خودکار قبل از ارسال به مدل سانسور و ماسک می‌شوند تا هویت شما کاملاً محافظت گردد.'
              : 'Automatically masks emails, phone numbers, and token patterns before sending prompts to protect personal privacy.'}
          </p>
        </div>

        {/* Private Mode Toggle */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-slate-100">
                {isFa ? 'حالت محرمانه بدون ردپا (Private Mode)' : 'Private Session Mode'}
              </h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privateMode}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, privateMode: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] rtl:after:right-auto rtl:after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isFa
              ? 'در این حالت هیچ‌یک از پرامپت‌ها یا خروجی‌های شما در حافظه دائمی ذخیره نشده و با بستن مرورگر یا برگه، به طور کامل محو می‌گردند.'
              : 'Does not write session outputs to persistent storage, vanishing completely upon browser close.'}
          </p>
        </div>
      </div>

      {/* No Restrictions Policy Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <InfinityIcon className="w-6 h-6 text-indigo-400" />
          <h3 className="text-base font-bold text-slate-100">
            {isFa ? 'خط‌مشی آزادی استفاده و بدون محدودیت (No Arbitrary Limits)' : 'No Artificial Limits Policy'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-indigo-400 font-extrabold text-lg mb-1">نامحدود (Unlimited)</div>
            <div className="text-xs text-slate-300 font-semibold">{isFa ? 'خروجی و دانلود' : 'Exports & Downloads'}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isFa ? 'امکان خروجی گرفتن نامحدود به صورت تکی یا فشرده ZIP' : 'Download all formats freely.'}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-purple-400 font-extrabold text-lg mb-1">مالکیت ۱۰۰٪</div>
            <div className="text-xs text-slate-300 font-semibold">{isFa ? 'حقوق کامل اثر' : 'Full Ownership'}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isFa ? 'تمامی متون، تصاویر و ویدیوها متعلق به کاربر هستند و هیچ واترمارک اجباری وجود ندارد.' : 'No watermarks. You own all output.'}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-emerald-400 font-extrabold text-lg mb-1">حریم خصوصی کامل</div>
            <div className="text-xs text-slate-300 font-semibold">{isFa ? 'بدون ردیابی یا تبلیغات' : 'Zero Telemetry'}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isFa ? 'هیچ اسکریپت ردیاب شخص ثالثی اجرا نمی‌شود.' : 'No ads or third party tracking.'}
            </p>
          </div>
        </div>
      </div>

      {/* Encrypted File Backup (.omnivault) Station */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-400" />
            <span>{isFa ? 'پشتیبان‌گیری و بازیابی فایل رمزنگاری شده (.omnivault)' : 'Encrypted Vault Backup'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isFa
              ? 'یک نسخه پشتیبان رمزگذاری شده با رمز شخصی خود تهیه کرده و هر زمان نیاز داشتید، روی هر دستگاهی آن را بازیابی کنید.'
              : 'Export an encrypted offline vault archive protected by your personal passphrase.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Create Backup */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300">
              {isFa ? '۱. دانلود فایل پشتیبان رمزنگاری‌شده:' : '1. Export Encrypted Vault:'}
            </h4>
            <input
              type="password"
              value={backupPassphrase}
              onChange={(e) => setBackupPassphrase(e.target.value)}
              placeholder={isFa ? 'رمز عبور دلخواه برای فایل پشتیبان...' : 'Set a passphrase for the vault...'}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleExportBackup}
              disabled={isExporting}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? (isFa ? 'در حال رمزنگاری...' : 'Encrypting...') : (isFa ? 'دانلود فایل .omnivault' : 'Download .omnivault')}</span>
            </button>
          </div>

          {/* Restore Backup */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300">
              {isFa ? '۲. بازیابی فایل پشتیبان:' : '2. Restore Encrypted Vault:'}
            </h4>
            <input
              type="password"
              value={restorePassphrase}
              onChange={(e) => setRestorePassphrase(e.target.value)}
              placeholder={isFa ? 'رمز عبور فایل پشتیبان...' : 'Enter the vault passphrase...'}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileRestore}
              accept=".omnivault,.json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{isFa ? 'انتخاب فایل و بازیابی' : 'Select Vault File'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Clear local data */}
      <div className="bg-rose-950/20 border border-rose-500/30 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-rose-300">
            {isFa ? 'منطقه حساس: پاکسازی کامل داده‌های این مرورگر' : 'Danger Zone: Wipe Local Storage'}
          </h4>
          <p className="text-xs text-rose-400/80 mt-0.5">
            {isFa ? 'تمامی خروجی‌های ذخیره شده در حافظه دستگاه جاری برای همیشه حذف می‌گردند.' : 'Permanently remove all cached outputs and settings from this browser.'}
          </p>
        </div>

        <button
          onClick={handleClearData}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer shrink-0"
        >
          <Trash2 className="w-4 h-4" />
          <span>{isFa ? 'پاکسازی کامل داده‌ها' : 'Wipe All Data'}</span>
        </button>
      </div>
    </div>
  );
};
