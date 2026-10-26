import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Printer,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  Star,
  CheckCircle,
  Share2,
  Edit3,
  Save,
  BarChart2,
  Wand2,
  Layers,
} from 'lucide-react';
import { GeneratedItem } from '../types';
import { exportText, exportImage, exportMediaFile, printFormattedText } from '../utils/exportUtils';
import { analyzeTextOffline } from '../utils/offlineTools';

interface PreviewModalProps {
  item: GeneratedItem | null;
  onClose: () => void;
  onUpdateItem: (updated: GeneratedItem) => void;
  onToggleFavorite: (id: string) => void;
  onOpenInOfflineLab?: (item: GeneratedItem) => void;
  lang: 'fa' | 'en';
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  item,
  onClose,
  onUpdateItem,
  onToggleFavorite,
  onOpenInOfflineLab,
  lang,
}) => {
  if (!item) return null;
  const isFa = lang === 'fa';

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(item.title);
  const [editedContent, setEditedContent] = useState(item.content);
  const [copied, setCopied] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const textStats = item.type === 'text' ? analyzeTextOffline(item.content) : null;

  const handleCopy = () => {
    if (item.type === 'text') {
      navigator.clipboard.writeText(item.content);
    } else {
      navigator.clipboard.writeText(item.content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    const updated: GeneratedItem = {
      ...item,
      title: editedTitle,
      content: editedContent,
    };
    onUpdateItem(updated);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              {item.type === 'text' && <FileText className="w-5 h-5 text-blue-400" />}
              {item.type === 'image' && <ImageIcon className="w-5 h-5 text-purple-400" />}
              {item.type === 'video' && <Video className="w-5 h-5 text-rose-400" />}
              {item.type === 'audio' && <Mic className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <h3 className="font-bold text-base text-slate-100">{item.title}</h3>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>{item.model}</span>
                <span>•</span>
                <span>{new Date(item.createdAt).toLocaleString('fa-IR')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(item.id)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <Star
                className={`w-4 h-4 ${item.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`}
              />
            </button>

            {item.type === 'text' && (
              <button
                onClick={() => {
                  if (isEditing) handleSaveEdit();
                  else setIsEditing(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                {isEditing ? (
                  <>
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isFa ? 'ذخیره' : 'Save'}</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isFa ? 'ویرایش' : 'Edit'}</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Prompt banner */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-xs text-slate-400">
            <span className="font-semibold text-slate-300 ml-1 rtl:ml-1 ltr:mr-1">
              {isFa ? 'پرامپت درخواستی:' : 'Prompt:'}
            </span>
            <span>{item.prompt}</span>
          </div>

          {/* Media Render */}
          {item.type === 'text' && (
            <div className="space-y-4">
              {isEditing ? (
                <textarea
                  rows={14}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
                  {item.content}
                </div>
              )}

              {/* Offline Text Stats Drawer */}
              {textStats && (
                <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4 text-indigo-400" />
                      {isFa ? 'تحلیل آفلاین متن' : 'Offline Text Analysis'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {isFa ? 'سرعت خواندن تقریبی:' : 'Est. Read Time:'} {textStats.readingTimeMinutes} {isFa ? 'دقیقه' : 'min'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-sm font-bold text-indigo-300">{textStats.words}</div>
                      <div className="text-[10px] text-slate-400">{isFa ? 'تعداد کلمات' : 'Words'}</div>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-sm font-bold text-purple-300">{textStats.characters}</div>
                      <div className="text-[10px] text-slate-400">{isFa ? 'کاراکترها' : 'Characters'}</div>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-sm font-bold text-emerald-300">{textStats.lines}</div>
                      <div className="text-[10px] text-slate-400">{isFa ? 'سطرها' : 'Lines'}</div>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-sm font-bold text-amber-300">
                        {textStats.detectedLanguage === 'fa' ? 'فارسی' : 'English'}
                      </div>
                      <div className="text-[10px] text-slate-400">{isFa ? 'زبان اصلی' : 'Language'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {item.type === 'image' && (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                <img
                  src={item.content}
                  alt={item.title}
                  className="max-h-[500px] w-auto object-contain rounded-xl"
                />
              </div>

              {onOpenInOfflineLab && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      onOpenInOfflineLab(item);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{isFa ? 'ویرایش آفلاین و اعمال فیلتر در آزمایشگاه تصویر' : 'Edit in Offline Image Lab'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {item.type === 'video' && (
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video max-h-[460px]">
              <video src={item.content} controls autoPlay loop className="w-full h-full object-contain" />
            </div>
          )}

          {item.type === 'audio' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Mic className="w-8 h-8" />
              </div>
              <audio src={item.content} controls className="w-full max-w-md mx-auto" />
            </div>
          )}
        </div>

        {/* Modal Footer / Multi-Format Export Station */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'کپی در حافظه' : 'Copy')}</span>
          </button>

          {/* Export Formats Group */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              {isFa ? 'خروجی با فرمت:' : 'Export Format:'}
            </span>

            {/* Text options */}
            {item.type === 'text' && (
              <>
                <button
                  onClick={() => exportText(item, 'md')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition"
                >
                  Markdown (.md)
                </button>
                <button
                  onClick={() => exportText(item, 'txt')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  متن ساده (.txt)
                </button>
                <button
                  onClick={() => exportText(item, 'json')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  JSON (.json)
                </button>
                <button
                  onClick={() => exportText(item, 'html')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  HTML (.html)
                </button>
                <button
                  onClick={() => printFormattedText(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PDF / چاپ</span>
                </button>
              </>
            )}

            {/* Image options */}
            {item.type === 'image' && (
              <>
                <button
                  onClick={() => exportImage(item, 'png')}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition"
                >
                  دانلود PNG
                </button>
                <button
                  onClick={() => exportImage(item, 'jpeg')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  دانلود JPEG
                </button>
                <button
                  onClick={() => exportImage(item, 'webp')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  دانلود WebP (فوق فشرده)
                </button>
              </>
            )}

            {/* Video options */}
            {item.type === 'video' && (
              <button
                onClick={() => exportMediaFile(item, 'mp4')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition"
              >
                <Download className="w-4 h-4" />
                <span>دانلود ویدیوی MP4</span>
              </button>
            )}

            {/* Audio options */}
            {item.type === 'audio' && (
              <button
                onClick={() => exportMediaFile(item, 'wav')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
              >
                <Download className="w-4 h-4" />
                <span>دانلود فایل صوتی WAV</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
