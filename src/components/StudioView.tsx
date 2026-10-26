import React, { useState, useRef } from 'react';
import {
  Sparkles,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  Sliders,
  Upload,
  CheckCircle,
  Copy,
  Download,
  AlertCircle,
  Maximize2,
  RefreshCw,
  Wand2,
  Shield,
  Layers,
  Play,
  Film,
  Zap,
} from 'lucide-react';
import { GeneratedItem, ContentType, SecuritySettings } from '../types';
import { redactSensitiveInfo } from '../utils/security';
import { exportText, exportImage, exportMediaFile } from '../utils/exportUtils';

interface StudioViewProps {
  onItemGenerated: (item: GeneratedItem) => void;
  securitySettings: SecuritySettings;
  lang: 'fa' | 'en';
  onOpenPreview: (item: GeneratedItem) => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  onItemGenerated,
  securitySettings,
  lang,
  onOpenPreview,
}) => {
  const isFa = lang === 'fa';
  const [activeMode, setActiveMode] = useState<ContentType>('text');

  // Input states
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentItem, setRecentItem] = useState<GeneratedItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Text options
  const [textModel, setTextModel] = useState('gemini-3.8-flash');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Image options
  const [imageModel, setImageModel] = useState('gemini-nano-banana-2.1');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('2K');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // Video options
  const [videoAspect, setVideoAspect] = useState('16:9');
  const [videoDuration, setVideoDuration] = useState('5s');
  const [videoResolution, setVideoResolution] = useState('720p');

  // Audio options
  const [voice, setVoice] = useState('Kore');
  const [audioStyle, setAudioStyle] = useState('Natural, warm and articulate');

  // File input ref for images
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Redaction status for current prompt
  const redactionCheck = securitySettings.redactSensitiveData
    ? redactSensitiveInfo(prompt)
    : { cleaned: prompt, redactedCount: 0 };

  // Sample prompt ideas
  const PROMPT_IDEAS: Record<ContentType, string[]> = {
    text: [
      'یک راهنمای گام‌به‌گام برای استقرار سیستم‌های ابری با امنیت بالا و رمزنگاری انتها‌به‌انتها بنویس.',
      'سناریوی یک اپلیکیشن مدیریت زمان و هوش مصنوعی با معماری داده‌های آفلاین طراحی کن.',
      'یک قطعه کد TypeScript بهینه برای همگام‌سازی داده‌های IndexedDB با سرور ابری بنویس.',
      'تحلیل جامع نقاط قوت مدل‌های زبان چندرسانه‌ای در سال ۲۰۲۶ و مقایسه سرعت پاسخ‌دهی.',
    ],
    image: [
      'تصویر فوق‌العاده واقع‌گرایانه 4K از یک باغ معلق ایرانی در آینده با معماری شیشه‌ای و نورپردازی طلایی.',
      'یک ربات دانشمند آینده‌نگر با جزئیات هایپررئال در یک آزمایشگاه فوتوریسیتی پر از صفحات هولوگرافیک.',
      'طراحی مینیمال و لوکس پوستر استودیو طراحی با ترکیب رنگ‌های بنفش کهکشانی و نئون سایان.',
      'عکاسی پرتره استودیویی با عمق میدان کم، بوکه سینمایی و وضوح فوق‌العاده بالای جزئیات چهره.',
    ],
    video: [
      'نمای سینمایی 4K از پرواز یک پرنده شاهین بر فراز کوهستان‌های برفی با حرکت روان و باشکوه دوربین.',
      'جریان ذرات نورانی هولوگرافیک که به آرامی دور یک هسته کوانتومی در حال چرخش هستند.',
      'نمای تایم‌لپس از طلوع آفتاب بر فراز یک کلان‌شهر فوق‌مدرن با بازتاب نور در برج‌های شیشه‌ای.',
      'حرکت سینمایی اسلوموشن قطرات باران روی شیشه نئونی با انعکاس نورهای شهری در شب.',
    ],
    audio: [
      'به استودیو پیشرفته هوش مصنوعی خوش آمدید! با این پلتفرم می‌توانید بدون محدودیت محتوای شگفت‌انگیز بسازید.',
      'در دنیای تکنولوژی امروز، دسترسی همزمان به مدل‌های چندمنظوره و حفظ امنیت داده‌ها، بالاترین اولویت را دارد.',
      'سیستم همگام‌سازی ابری با موفقیت فعال شد. تمامی خروجی‌ها در سراسر دستگاه‌های شما همگام هستند.',
    ],
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(isFa ? 'لطفاً یک فایل تصویری معتبر انتخاب کنید.' : 'Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImage(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMessage(isFa ? 'لطفاً متن درخواست (پرامپت) را وارد فرمایید.' : 'Please enter a prompt.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setRecentItem(null);

    // Apply sensitive data redaction if enabled
    const finalPrompt = securitySettings.redactSensitiveData
      ? redactionCheck.cleaned
      : prompt;

    try {
      let generatedContent = '';
      let chosenModel = '';
      let metadata: any = {};

      if (activeMode === 'text') {
        chosenModel = textModel;
        const res = await fetch('/api/generate/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: finalPrompt,
            model: textModel,
            systemInstruction,
            temperature,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'خطا در تولید متن');
        generatedContent = data.text;
        metadata.wordCount = generatedContent.split(/\s+/).length;
      } else if (activeMode === 'image') {
        chosenModel = imageModel;
        const res = await fetch('/api/generate/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: finalPrompt,
            model: imageModel,
            aspectRatio,
            imageSize,
            referenceImage,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'خطا در تولید تصویر');
        generatedContent = data.imageUrl;
        metadata = { aspectRatio, imageSize };
      } else if (activeMode === 'video') {
        chosenModel = 'gemini-omni-1.1-flash';
        const res = await fetch('/api/generate/video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: finalPrompt,
            aspectRatio: videoAspect,
            duration: videoDuration,
            resolution: videoResolution,
            referenceImage,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'خطا در تولید ویدیو');
        generatedContent = data.videoUrl;
        metadata = {
          aspectRatio: videoAspect,
          duration: videoDuration,
          resolution: videoResolution,
        };
      } else if (activeMode === 'audio') {
        chosenModel = 'gemini-3.8-flash-lite-tts';
        const res = await fetch('/api/generate/audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: finalPrompt,
            voice,
            style: audioStyle,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'خطا در تولید صدا');
        generatedContent = data.audioUrl;
        metadata = { voice };
      }

      // Generate a title if not provided
      const autoTitle =
        title.trim() ||
        prompt.trim().slice(0, 45) + (prompt.length > 45 ? '...' : '');

      const newItem: GeneratedItem = {
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: activeMode,
        title: autoTitle,
        prompt: finalPrompt,
        model: chosenModel,
        content: generatedContent,
        createdAt: Date.now(),
        tags: [
          activeMode === 'text' ? 'متن' : activeMode === 'image' ? 'تصویر' : activeMode === 'video' ? 'ویدیو' : 'صدا',
          chosenModel,
        ],
        isFavorite: false,
        metadata,
      };

      setRecentItem(newItem);
      onItemGenerated(newItem);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'خطا در برقراری ارتباط با مدل هوش مصنوعی.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!recentItem) return;
    if (recentItem.type === 'text') {
      navigator.clipboard.writeText(recentItem.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mode Selector Hero Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
        {[
          {
            id: 'text' as ContentType,
            title: isFa ? 'متن و استدلال عمیق' : 'Text & Reasoning',
            subtitle: isFa ? 'Gemini 3.8 & 4 Argon' : 'Deep Thinking & Coding',
            icon: FileText,
            color: 'from-blue-600 to-indigo-600',
            border: 'hover:border-blue-500/50',
          },
          {
            id: 'image' as ContentType,
            title: isFa ? 'تصویر 4K هایپررئال' : 'Ultra HD Image',
            subtitle: isFa ? 'Nano Banana 2.1 (4K)' : '1K / 2K / 4K Resolution',
            icon: ImageIcon,
            color: 'from-purple-600 to-pink-600',
            border: 'hover:border-purple-500/50',
          },
          {
            id: 'video' as ContentType,
            title: isFa ? 'ویدیو سینمایی هوش مصنوعی' : 'Cinematic Video',
            subtitle: isFa ? 'Gemini Omni Flash (Veo)' : 'Text/Image to Motion',
            icon: Video,
            color: 'from-rose-600 to-amber-600',
            border: 'hover:border-rose-500/50',
          },
          {
            id: 'audio' as ContentType,
            title: isFa ? 'صدا و گفتار استودیویی' : 'Studio Speech (TTS)',
            subtitle: isFa ? 'Gemini Voice Synth 24kHz' : 'Natural Human Tone',
            icon: Mic,
            color: 'from-emerald-600 to-teal-600',
            border: 'hover:border-emerald-500/50',
          },
        ].map((mode) => {
          const Icon = mode.icon;
          const isSelected = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id);
                setErrorMessage(null);
              }}
              className={`relative text-right sm:text-start p-4 rounded-2xl border transition-all duration-200 text-left cursor-pointer ${
                isSelected
                  ? `bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/15 ring-2 ring-indigo-500/30`
                  : `bg-slate-900/60 border-slate-800 hover:bg-slate-850 ${mode.border}`
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-white mb-3 shadow-md`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-100">{mode.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{mode.subtitle}</p>
              {isSelected && (
                <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Main Creation Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header info bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400">
                  {activeMode === 'text' && <FileText className="w-4 h-4" />}
                  {activeMode === 'image' && <ImageIcon className="w-4 h-4" />}
                  {activeMode === 'video' && <Video className="w-4 h-4" />}
                  {activeMode === 'audio' && <Mic className="w-4 h-4" />}
                </span>
                <span className="font-bold text-sm text-slate-200">
                  {activeMode === 'text' && (isFa ? 'استودیو تولید و تحلیل متن' : 'Text & Reasoning Studio')}
                  {activeMode === 'image' && (isFa ? 'استودیو تولید تصویر با کیفیت بالا' : 'High-Quality Image Studio')}
                  {activeMode === 'video' && (isFa ? 'استودیو تولید ویدیو سینمایی' : 'AI Video Studio')}
                  {activeMode === 'audio' && (isFa ? 'استودیو تبدیل متن به گفتار طبیعی' : 'Voice Synthesis Studio')}
                </span>
              </div>

              {/* Model Selector Pills */}
              {activeMode === 'text' && (
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  {[
                    { id: 'gemini-3.8-flash', label: '3.8 Flash (پیشنهادی)' },
                    { id: 'gemini-4-argon', label: '4 Argon (استدلال عمیق)' },
                    { id: 'gemini-3.1-flash-lite', label: 'Lite (سریع)' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setTextModel(m.id)}
                      className={`px-2.5 py-1 rounded-lg transition font-medium ${
                        textModel === m.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}

              {activeMode === 'image' && (
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  {[
                    { id: 'gemini-nano-banana-2.1', label: 'Nano Banana 2.1 (کیفیت 4K)' },
                    { id: 'gemini-3.1-flash-lite-image', label: 'Flash Studio' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setImageModel(m.id)}
                      className={`px-2.5 py-1 rounded-lg transition font-medium ${
                        imageModel === m.id
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Optional Title input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {isFa ? 'عنوان خروجی (اختیاری):' : 'Output Title (Optional):'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isFa ? 'مثال: معماری داده‌های سازمانی، پرتره فوتوریسیتی...' : 'e.g. Modern Architecture concept...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Main Prompt Input Area */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  {isFa ? 'توضیحات درخواست (پرامپت):' : 'Prompt / Instructions:'}
                </label>
                {securitySettings.redactSensitiveData && redactionCheck.redactedCount > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <Shield className="w-3 h-3" />
                    <span>{redactionCheck.redactedCount} {isFa ? 'مورد اطلاعات هویتی محافظت شد' : 'PII items masked'}</span>
                  </span>
                )}
              </div>
              <textarea
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  activeMode === 'text'
                    ? isFa
                      ? 'موضوع، سوال، یا مسئله‌ای که نیاز به نوشتن، کدنویسی، تحلیل یا استدلال دارد را بنویسید...'
                      : 'Ask a question, request code, analysis, or creative writing...'
                    : activeMode === 'image'
                    ? isFa
                      ? 'تصویر مورد نظر خود را با تمام جزئیات، سبک هنری، نورپردازی و زاویه دوربین شرح دهید...'
                      : 'Describe the image in detail: subject, style, lighting, composition...'
                    : activeMode === 'video'
                    ? isFa
                      ? 'توصیف حرکت، سوژه و صحنه ویدیو سینمایی (حرکت دوربین، زاویه دید، نور و جریان ذرات)...'
                      : 'Describe the scene, motion, camera angle, and action for the video...'
                    : isFa
                    ? 'متنی که می‌خواهید با صدای طبیعی استودیویی خوانده شود را تایپ فرمایید...'
                    : 'Enter the text you want to synthesize into natural human speech...'
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-y leading-relaxed"
              />

              {/* Quick Prompt Ideas tags */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Wand2 className="w-3 h-3" /> {isFa ? 'ایده‌های سریع:' : 'Ideas:'}
                </span>
                {PROMPT_IDEAS[activeMode].slice(0, 2).map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(idea)}
                    className="text-[11px] text-slate-400 hover:text-indigo-300 bg-slate-950/80 hover:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-800 transition truncate max-w-[280px]"
                    title={idea}
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode-specific Controls */}
            {/* 1. Image Mode options */}
            {activeMode === 'image' && (
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl mb-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Aspect Ratio */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">
                      {isFa ? 'نسبت ابعاد تصویر (Aspect Ratio):' : 'Aspect Ratio:'}
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { ratio: '1:1', label: '1:1 مربع' },
                        { ratio: '16:9', label: '16:9 عریض' },
                        { ratio: '9:16', label: '9:16 استوری' },
                        { ratio: '4:3', label: '4:3 کلاسیک' },
                        { ratio: '3:4', label: '3:4 عمودی' },
                      ].map((item) => (
                        <button
                          key={item.ratio}
                          type="button"
                          onClick={() => setAspectRatio(item.ratio)}
                          className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition text-center ${
                            aspectRatio === item.ratio
                              ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {item.ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resolution Quality */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">
                      {isFa ? 'وضوح و کیفیت تصویر (Resolution):' : 'Resolution:'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['1K', '2K', '4K'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setImageSize(size)}
                          className={`py-2 rounded-xl text-xs font-bold border transition ${
                            imageSize === size
                              ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {size} {size === '4K' ? 'Ultra HD' : 'HD'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reference Image Upload for Editing/Inpainting */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-300">
                        {isFa ? 'تصویر مرجع جهت ویرایش یا متحرک‌سازی (اختیاری):' : 'Reference Image (Optional):'}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {isFa ? 'برای تغییر سبک یا اضافه کردن المان به عکس' : 'Upload an image to edit or animate'}
                      </p>
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{referenceImage ? (isFa ? 'تغییر عکس' : 'Change Image') : (isFa ? 'آپلود تصویر' : 'Upload Image')}</span>
                      </button>
                    </div>
                  </div>

                  {referenceImage && (
                    <div className="mt-3 flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <img
                        src={referenceImage}
                        alt="Reference preview"
                        className="w-14 h-14 object-cover rounded-lg border border-slate-700"
                      />
                      <div className="flex-1 text-xs">
                        <span className="text-emerald-400 font-medium">
                          {isFa ? 'تصویر با موفقیت بارگذاری شد' : 'Image loaded successfully'}
                        </span>
                        <p className="text-slate-400 text-[10px]">
                          {isFa ? 'پرامپت شما به عنوان ویرایشگر روی این تصویر اعمال خواهد شد.' : 'Your prompt will modify this base image.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReferenceImage(null)}
                        className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1"
                      >
                        {isFa ? 'حذف' : 'Remove'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Video Mode options */}
            {activeMode === 'video' && (
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl mb-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      {isFa ? 'نسبت ویدیو:' : 'Aspect Ratio:'}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['16:9', '9:16'].map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setVideoAspect(ratio)}
                          className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                            videoAspect === ratio
                              ? 'bg-rose-600 text-white border-rose-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {ratio === '16:9' ? '16:9 عریض' : '9:16 استوری'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      {isFa ? 'مدت زمان:' : 'Duration:'}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['5s', '10s'].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setVideoDuration(d)}
                          className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                            videoDuration === d
                              ? 'bg-rose-600 text-white border-rose-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {d === '5s' ? '۵ ثانیه' : '۱۰ ثانیه'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      {isFa ? 'کیفیت ویدیو:' : 'Resolution:'}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['720p', '1080p'].map((res) => (
                        <button
                          key={res}
                          type="button"
                          onClick={() => setVideoResolution(res)}
                          className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                            videoResolution === res
                              ? 'bg-rose-600 text-white border-rose-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Optional starting image to animate */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-300">
                      {isFa ? 'تبدیل تصویر به ویدیو (Image-to-Video):' : 'Animate Static Image:'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {isFa ? 'می‌توانید یک فریم عکس را بارگذاری کنید تا هوش مصنوعی به آن حرکت ببخشد' : 'Upload an image as the first video frame'}
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700 transition"
                    >
                      <Film className="w-3.5 h-3.5 text-rose-400" />
                      <span>{referenceImage ? (isFa ? 'تغییر عکس شروع' : 'Change') : (isFa ? 'انتخاب فریم آغازین' : 'Select Start Frame')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Audio Mode options */}
            {activeMode === 'audio' && (
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl mb-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">
                      {isFa ? 'گوینده و لحن صدا (Voice):' : 'Voice Persona:'}
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'Kore', label: 'Kore (زن آرام)' },
                        { id: 'Puck', label: 'Puck (مرد پرانرژی)' },
                        { id: 'Zephyr', label: 'Zephyr (مرد گوینده)' },
                        { id: 'Fenrir', label: 'Fenrir (بم و عمیق)' },
                      ].map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setVoice(v.id)}
                          className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition text-center ${
                            voice === v.id
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">
                      {isFa ? 'استایل بیان گفتار:' : 'Speaking Style:'}
                    </label>
                    <select
                      value={audioStyle}
                      onChange={(e) => setAudioStyle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Natural, warm and articulate">طبیعی، گرم و صمیمی (Warm & Articulate)</option>
                      <option value="Professional, clear news anchor style">رسمی و گوینده خبر (News Anchor)</option>
                      <option value="Enthusiastic and energetic host">پرانرژی و پادکستی (Energetic)</option>
                      <option value="Calm, serene bedtime storyteller">آرام و داستان‌سرا (Storyteller)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced toggle for text */}
            {activeMode === 'text' && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showAdvanced ? (isFa ? 'بستن تنظیمات پیشرفته' : 'Hide Advanced Settings') : (isFa ? 'تنظیمات پیشرفته (دستورالعمل سیستمی، دما)' : 'Advanced Settings')}</span>
                </button>

                {showAdvanced && (
                  <div className="mt-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        {isFa ? 'دستورالعمل سیستمی (System Instruction):' : 'System Instruction:'}
                      </label>
                      <input
                        type="text"
                        value={systemInstruction}
                        onChange={(e) => setSystemInstruction(e.target.value)}
                        placeholder={isFa ? 'نقش هوش مصنوعی (مثال: شما یک متخصص ارشد برنامه‌نویسی هستید...)' : 'e.g. Act as a senior software architect...'}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{isFa ? 'میزان خلاقیت (Temperature):' : 'Temperature:'} {temperature}</span>
                        <span>{temperature < 0.4 ? (isFa ? 'دقیق و منطقی' : 'Strict') : temperature > 0.8 ? (isFa ? 'بسیار خلاق' : 'Creative') : (isFa ? 'متعادل' : 'Balanced')}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message banner */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 cursor-pointer ${
                isGenerating
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : activeMode === 'text'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-indigo-600/25'
                  : activeMode === 'image'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/25'
                  : activeMode === 'video'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-600/25'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>
                    {activeMode === 'text' && (isFa ? 'در حال تفکر و تولید متن...' : 'Generating text...')}
                    {activeMode === 'image' && (isFa ? 'در حال رندر و پردازش تصویر 4K...' : 'Rendering 4K image...')}
                    {activeMode === 'video' && (isFa ? 'در حال تولید فریم‌های ویدیوی سینمایی...' : 'Synthesizing cinematic video...')}
                    {activeMode === 'audio' && (isFa ? 'در حال تبدیل متن به گفتار استودیویی...' : 'Synthesizing voice...')}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {activeMode === 'text' && (isFa ? 'شروع تولید متن و استدلال' : 'Generate Text')}
                    {activeMode === 'image' && (isFa ? 'رندر تصویر با کیفیت بالا' : 'Generate High-Res Image')}
                    {activeMode === 'video' && (isFa ? 'تولید ویدیو سینمایی هوش مصنوعی' : 'Synthesize Video')}
                    {activeMode === 'audio' && (isFa ? 'تولید صدای استودیویی' : 'Synthesize Speech')}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right / Live Output Result Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl min-h-[460px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-sm text-slate-200">
                    {isFa ? 'پیش‌نمایش خروجی اخیر' : 'Latest Generated Output'}
                  </span>
                </div>
                {recentItem && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {recentItem.model}
                  </span>
                )}
              </div>

              {/* Empty state or Active result */}
              {!recentItem && !isGenerating && (
                <div className="py-20 text-center text-slate-500 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800">
                    <Zap className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-sm">
                    {isFa ? 'هنوز خروجی در این جلسه تولید نشده است.' : 'No output generated in this session yet.'}
                  </p>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    {isFa ? 'یکی از گزینه‌های متن، تصویر، ویدیو یا صدا را انتخاب و پرامپت خود را وارد فرمایید.' : 'Pick a modality on the left and submit your prompt.'}
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className="py-20 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">
                      {isFa ? 'پردازش مدل در جریان است' : 'AI Model Processing'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {isFa ? 'استودیو بدون محدودیت هوش مصنوعی در حال ساخت خروجی شماست...' : 'Generating high quality output without restrictions...'}
                    </p>
                  </div>
                </div>
              )}

              {recentItem && !isGenerating && (
                <div className="space-y-4">
                  {/* Title and metadata */}
                  <div>
                    <h3 className="font-bold text-base text-slate-100">{recentItem.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {isFa ? 'پرامپت:' : 'Prompt:'} {recentItem.prompt}
                    </p>
                  </div>

                  {/* Modality Content Preview */}
                  {recentItem.type === 'text' && (
                    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 max-h-[320px] overflow-y-auto text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {recentItem.content}
                    </div>
                  )}

                  {recentItem.type === 'image' && (
                    <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square max-h-[320px] flex items-center justify-center">
                      <img
                        src={recentItem.content}
                        alt={recentItem.title}
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() => onOpenPreview(recentItem)}
                        className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white text-xs font-semibold"
                      >
                        <Maximize2 className="w-4 h-4" />
                        <span>{isFa ? 'مشاهده تمام صفحه' : 'View Fullscreen'}</span>
                      </button>
                    </div>
                  )}

                  {recentItem.type === 'video' && (
                    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video max-h-[300px]">
                      <video
                        src={recentItem.content}
                        controls
                        autoPlay
                        loop
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {recentItem.type === 'audio' && (
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                      <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Play className="w-6 h-6" />
                      </div>
                      <audio src={recentItem.content} controls className="w-full" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions for recent item */}
            {recentItem && !isGenerating && (
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {recentItem.type === 'text' && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
                    >
                      {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'کپی متن' : 'Copy')}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenPreview(recentItem)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{isFa ? 'مشاهده و خروجی‌ها' : 'Export & View'}</span>
                  </button>
                </div>

                <span className="text-[11px] text-emerald-400 font-medium">
                  ✓ {isFa ? 'در گالری ذخیره شد' : 'Saved to library'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
