import React from 'react';
import {
  X,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  Layers,
  Cloud,
  ShieldCheck,
  Cpu,
  Download,
  Smartphone,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en';
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;
  const isFa = lang === 'fa';

  const steps = [
    {
      title: isFa ? '۱. انتخاب نوع تولید محتوا' : '1. Choose Creation Mode',
      desc: isFa
        ? 'در تب «استودیو هوش مصنوعی»، یکی از ۴ حالت متن، تصویر 4K، ویدیو سینمایی یا صدا را انتخاب کنید.'
        : 'In AI Studio, choose Text, 4K Image, Cinematic Video, or Studio Audio.',
      icon: Sparkles,
      color: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
    },
    {
      title: isFa ? '۲. وارد کردن پرامپت و تنظیمات' : '2. Enter Prompt & Settings',
      desc: isFa
        ? 'ایده خود را بنویسید. برای تصاویر می‌توانید نسبت ابعاد (1:1، 16:9، 9:16) و کیفیت 4K، و برای ویدیو مدت زمان و فریم آغازین را مشخص کنید.'
        : 'Type your prompt. Choose aspect ratios, resolution (up to 4K), and video duration.',
      icon: ImageIcon,
      color: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    },
    {
      title: isFa ? '۳. مدیریت و خروجی با فرمت‌های مختلف' : '3. Manage & Multi-format Export',
      desc: isFa
        ? 'در تب «گالری و خروجی‌ها»، می‌توانید فایل‌ها را باز کنید، عنوان آن‌ها را ویرایش کنید و با فرمت‌های مختلف (Markdown, TXT, HTML, PDF, PNG, JPEG, WebP, MP4, WAV) یا دانلود دسته‌ای ZIP دریافت نمایید.'
        : 'In Library, export in any format (TXT, MD, PDF, PNG, WebP, MP4, WAV) or batch download as ZIP.',
      icon: Download,
      color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    },
    {
      title: isFa ? '۴. همگام‌سازی با گوشی و تبلت' : '4. Sync Across All Devices',
      desc: isFa
        ? 'در تب «همگام‌سازی ابری»، کد اختصاصی والت خود (مثل OMNI-XXXX) را کپی کنید و در مرورگر گوشی یا تبلت خود وارد بخش Pull کنید تا تمامی خروجی‌ها بلافاصله همگام شوند.'
        : 'Copy your Vault ID in Cloud Sync and enter it on your phone or laptop to access all outputs.',
      icon: Cloud,
      color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    },
    {
      title: isFa ? '۵. کارکرد آفلاین بدون اینترنت' : '5. Offline Mode Operations',
      desc: isFa
        ? 'در تب «ابزارهای آفلاین»، می‌توانید بدون نیاز به اینترنت، تصاویر را فیلترگذاری و فشرده کنید، و متن‌ها را ویرایش و تحلیل آماری نمایید.'
        : 'In Offline Lab, process images with Canvas filters and analyze text without internet.',
      icon: Cpu,
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                {isFa ? 'راهنمای جامع استفاده از استودیو' : 'Quick User Guide'}
              </h3>
              <p className="text-xs text-slate-400">
                {isFa ? 'چگونه در ۵ مرحله ساده از تمام امکانات برنامه استفاده کنیم؟' : 'How to use OmniAI Studio in 5 simple steps'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {steps.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className={`p-2.5 rounded-xl border shrink-0 ${st.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-100">{st.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isFa ? '💡 نکته: اطلاعات شما با رمزنگاری پیشرفته E2EE محافظت می‌شود.' : '💡 Note: Your data is protected by E2EE encryption.'}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
          >
            {isFa ? 'متوجه شدم، شروع استفاده' : 'Got it, let’s start'}
          </button>
        </div>
      </div>
    </div>
  );
};
