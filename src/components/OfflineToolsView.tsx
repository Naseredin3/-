import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Wifi,
  WifiOff,
  Image as ImageIcon,
  FileText,
  Sliders,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  BarChart2,
  CheckCircle,
  Copy,
  Layers,
  Wand2,
} from 'lucide-react';
import { GeneratedItem } from '../types';
import { analyzeTextOffline, processImageOffline, ImageFilters } from '../utils/offlineTools';
import { exportText, exportImage } from '../utils/exportUtils';

interface OfflineToolsViewProps {
  items: GeneratedItem[];
  isOnline: boolean;
  onToggleSimulatedOffline: () => void;
  isSimulatedOffline: boolean;
  lang: 'fa' | 'en';
}

export const OfflineToolsView: React.FC<OfflineToolsViewProps> = ({
  items,
  isOnline,
  onToggleSimulatedOffline,
  isSimulatedOffline,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');

  // Offline Image Studio state
  const imageItems = items.filter((i) => i.type === 'image');
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>(
    imageItems[0]?.content || ''
  );
  const [grayscale, setGrayscale] = useState(false);
  const [sepia, setSepia] = useState(false);
  const [invert, setInvert] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [watermark, setWatermark] = useState('');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Offline Text Studio state
  const [textContent, setTextContent] = useState(
    `# پیش‌نویس آفلاین در استودیو هوش مصنوعی\n\nشما می‌توانید این متن را بدون نیاز به هیچ اتصال اینترنتی ویرایش، فرمت‌بندی و تحلیل کنید.\n\n### امکانات این ابزار:\n- شمارش دقیق کلمات و کاراکترهای زبان فارسی\n- تخمین مدت زمان مطالعه برای مخاطبان\n- استخراج هوشمند پرتکرارترین کلمات کلیدی\n- خروجی گرفتن فوری در فرمت‌های Markdown، HTML و PDF`
  );

  const textStats = analyzeTextOffline(textContent);

  // Apply filters on canvas
  const handleApplyImageFilters = async () => {
    if (!selectedImageSrc) return;
    setIsProcessing(true);
    try {
      const filters: ImageFilters = {
        grayscale,
        sepia,
        invert,
        brightness,
        contrast,
        watermarkText: watermark.trim() || undefined,
      };
      const result = await processImageOffline(selectedImageSrc, filters);
      setProcessedImage(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setProcessedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadProcessed = (format: 'png' | 'jpeg' | 'webp') => {
    const src = processedImage || selectedImageSrc;
    if (!src) return;
    const dummyItem: GeneratedItem = {
      id: 'offline_proc_' + Date.now(),
      type: 'image',
      title: 'offline_processed_image',
      prompt: '',
      model: 'Offline Canvas Studio',
      content: src,
      createdAt: Date.now(),
      tags: [],
      isFavorite: false,
    };
    exportImage(dummyItem, format);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Offline Status & Simulator Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl border ${
              isOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}
          >
            {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isOnline
                  ? isFa ? 'وضعیت اتصال: متصل به شبکه آنلاین' : 'Online Connection Active'
                  : isFa ? 'وضعیت اتصال: حالت آفلاین فعال است' : 'Offline Mode Active'}
              </h2>
              {isSimulatedOffline && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  {isFa ? 'شبیه‌سازی آفلاین' : 'Offline Simulation'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isFa
                ? 'تمامی ابزارهای این صفحه ۱۰۰٪ درون مرورگر و بدون نیاز به هیچ‌گونه اتصال اینترنتی کار می‌کنند.'
                : 'All tools in this lab operate 100% locally in the browser with zero network calls.'}
            </p>
          </div>
        </div>

        <button
          onClick={onToggleSimulatedOffline}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
            isSimulatedOffline
              ? 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {isSimulatedOffline
            ? isFa ? 'غیرفعال‌سازی شبیه‌ساز آفلاین' : 'Disable Offline Sim'
            : isFa ? 'تست و شبیه‌سازی قطع اینترنت' : 'Simulate Offline Mode'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === 'image'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>{isFa ? 'آزمایشگاه تصویر و فیلترهای آفلاین' : 'Offline Image Lab'}</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === 'text'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isFa ? 'ویرایشگر و تحلیل‌گر متون آفلاین' : 'Offline Text & Markdown Lab'}</span>
        </button>
      </div>

      {/* 1. Offline Image Lab Content */}
      {activeTab === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300">
                  {isFa ? 'انتخاب تصویر جهت پردازش محلی:' : 'Source Image:'}
                </label>
                <label className="cursor-pointer text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isFa ? 'آپلود تصویر جدید' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Gallery thumbnails to pick from */}
              {imageItems.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {imageItems.slice(0, 6).map((img) => (
                    <button
                      key={img.id}
                      onClick={() => {
                        setSelectedImageSrc(img.content);
                        setProcessedImage(null);
                      }}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden border shrink-0 transition ${
                        selectedImageSrc === img.content
                          ? 'border-purple-500 ring-2 ring-purple-500/40'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img src={img.content} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter controls */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 block">
                {isFa ? 'فیلترهای گرافیکی درون مرورگر:' : 'Local Canvas Filters:'}
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGrayscale(!grayscale)}
                  className={`py-2 px-1 rounded-xl text-xs font-medium border transition ${
                    grayscale
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {isFa ? 'سیاه و سفید' : 'Grayscale'}
                </button>
                <button
                  type="button"
                  onClick={() => setSepia(!sepia)}
                  className={`py-2 px-1 rounded-xl text-xs font-medium border transition ${
                    sepia
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {isFa ? 'سپیا (نوستالژی)' : 'Sepia'}
                </button>
                <button
                  type="button"
                  onClick={() => setInvert(!invert)}
                  className={`py-2 px-1 rounded-xl text-xs font-medium border transition ${
                    invert
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {isFa ? 'نگاتیو' : 'Invert'}
                </button>
              </div>

              {/* Sliders */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{isFa ? 'روشنایی (Brightness):' : 'Brightness:'}</span>
                    <span>{Math.round(brightness * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={brightness}
                    onChange={(e) => setBrightness(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{isFa ? 'کنتراست (Contrast):' : 'Contrast:'}</span>
                    <span>{Math.round(contrast * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={contrast}
                    onChange={(e) => setContrast(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Watermark */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {isFa ? 'واترمارک یا برچسب متنی (اختیاری):' : 'Watermark Text:'}
                </label>
                <input
                  type="text"
                  value={watermark}
                  onChange={(e) => setWatermark(e.target.value)}
                  placeholder={isFa ? 'مثال: OmniAI Studio | اثر اختصاصی' : 'e.g. My Private Artwork'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="button"
                onClick={handleApplyImageFilters}
                disabled={isProcessing || !selectedImageSrc}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Wand2 className="w-4 h-4" />
                <span>{isProcessing ? (isFa ? 'در حال اعمال روی بوم...' : 'Processing...') : (isFa ? 'اعمال فیلترها روی تصویر' : 'Apply Filters')}</span>
              </button>
            </div>
          </div>

          {/* Canvas Display Column (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-200">
                  {isFa ? 'پیش‌نمایش زنده تصویر پردازش‌شده' : 'Live Canvas Output'}
                </h3>
                {processedImage && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                    ✓ {isFa ? 'فیلترها اعمال شدند' : 'Filters applied'}
                  </span>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square max-h-[460px] flex items-center justify-center p-2">
                {selectedImageSrc ? (
                  <img
                    src={processedImage || selectedImageSrc}
                    alt="Canvas preview"
                    className="max-h-full max-w-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center text-slate-500 text-xs">
                    {isFa ? 'تصویری انتخاب نشده است.' : 'No image selected.'}
                  </div>
                )}
              </div>
            </div>

            {/* Offline Export Formats */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-medium">
                {isFa ? 'خروجی گرفتن آفلاین:' : 'Offline Export:'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadProcessed('png')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
                >
                  PNG
                </button>
                <button
                  onClick={() => handleDownloadProcessed('jpeg')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
                >
                  JPEG
                </button>
                <button
                  onClick={() => handleDownloadProcessed('webp')}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-md"
                >
                  WebP (فوق فشرده)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Offline Text & Markdown Lab Content */}
      {activeTab === 'text' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Editor Column (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">
                {isFa ? 'ویرایشگر متنی و Markdown آفلاین' : 'Offline Markdown Workspace'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const dummyItem: GeneratedItem = {
                      id: 'offline_txt_' + Date.now(),
                      type: 'text',
                      title: 'offline_document',
                      prompt: '',
                      model: 'Offline Editor',
                      content: textContent,
                      createdAt: Date.now(),
                      tags: [],
                      isFavorite: false,
                    };
                    exportText(dummyItem, 'md');
                  }}
                  className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isFa ? 'دانلود .md' : 'Download .md'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={16}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Analysis & Preview Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Stats widget */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <span>{isFa ? 'آمار زنده متن' : 'Real-time Analytics'}</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-base font-extrabold text-indigo-400">{textStats.words}</div>
                  <div className="text-[10px] text-slate-400">{isFa ? 'کلمات' : 'Words'}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-base font-extrabold text-purple-400">{textStats.characters}</div>
                  <div className="text-[10px] text-slate-400">{isFa ? 'کاراکترها' : 'Characters'}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-base font-extrabold text-emerald-400">{textStats.readingTimeMinutes} دقیقه</div>
                  <div className="text-[10px] text-slate-400">{isFa ? 'زمان مطالعه' : 'Read Time'}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="text-base font-extrabold text-amber-400">{textStats.lines}</div>
                  <div className="text-[10px] text-slate-400">{isFa ? 'تعداد خطوط' : 'Lines'}</div>
                </div>
              </div>

              {/* Keywords */}
              {textStats.topWords.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">
                    {isFa ? 'کلمات کلیدی پرتکرار:' : 'Top Keywords:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {textStats.topWords.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-950 text-indigo-300 border border-slate-800 font-medium"
                      >
                        {item.word} ({item.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Export formats for text */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <span className="text-xs font-bold text-slate-300 block">
                {isFa ? 'خروجی گرفتن در فرمت‌های گوناگون:' : 'Export Formats:'}
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['txt', 'md', 'html', 'json'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => {
                      const dummyItem: GeneratedItem = {
                        id: 'offline_txt_' + Date.now(),
                        type: 'text',
                        title: 'offline_document',
                        prompt: '',
                        model: 'Offline Editor',
                        content: textContent,
                        createdAt: Date.now(),
                        tags: [],
                        isFavorite: false,
                      };
                      exportText(dummyItem, fmt as any);
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition text-center uppercase font-bold"
                  >
                    .{fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
