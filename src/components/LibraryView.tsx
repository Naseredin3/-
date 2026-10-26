import React, { useState } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  Download,
  Trash2,
  Star,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  Maximize2,
  CheckSquare,
  Square,
  Archive,
  Calendar,
  Sparkles,
  ExternalLink,
  Tag,
  Share2,
} from 'lucide-react';
import { GeneratedItem, ContentType } from '../types';
import { exportText, exportImage, exportMediaFile, exportBatchAsZip } from '../utils/exportUtils';

interface LibraryViewProps {
  items: GeneratedItem[];
  onDeleteItem: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenPreview: (item: GeneratedItem) => void;
  onBatchDelete: (ids: string[]) => void;
  lang: 'fa' | 'en';
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  items,
  onDeleteItem,
  onToggleFavorite,
  onOpenPreview,
  onBatchDelete,
  lang,
}) => {
  const isFa = lang === 'fa';

  const [activeFilter, setActiveFilter] = useState<'all' | ContentType | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExportingBatch, setIsExportingBatch] = useState(false);

  // Filter items
  const filteredItems = items
    .filter((item) => {
      if (activeFilter === 'favorites') return item.isFavorite;
      if (activeFilter !== 'all') return item.type === activeFilter;
      return true;
    })
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.prompt.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'oldest') return a.createdAt - b.createdAt;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const handleBatchZip = async () => {
    const targetItems =
      selectedIds.length > 0
        ? items.filter((i) => selectedIds.includes(i.id))
        : filteredItems;

    if (targetItems.length === 0) return;

    setIsExportingBatch(true);
    try {
      await exportBatchAsZip(targetItems, `OmniAI_Archive_${Date.now()}.zip`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingBatch(false);
    }
  };

  const handleBatchDeleteClick = () => {
    if (selectedIds.length === 0) return;
    const confirmMsg = isFa
      ? `آیا از حذف ${selectedIds.length} مورد انتخابی اطمینان دارید؟`
      : `Are you sure you want to delete ${selectedIds.length} items?`;
    if (window.confirm(confirmMsg)) {
      onBatchDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  const getModalityIcon = (type: ContentType) => {
    switch (type) {
      case 'text':
        return <FileText className="w-3.5 h-3.5 text-blue-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-purple-400" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-400" />;
      case 'audio':
        return <Mic className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Controls & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl mb-8 space-y-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFa ? 'جستجو در عنوان، پرامپت، تگ‌ها و مدل‌ها...' : 'Search title, prompt, tags, or model...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Sort & View toggles */}
          <div className="flex items-center gap-2.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="newest">{isFa ? 'جدیدترین خروجی‌ها' : 'Newest first'}</option>
              <option value="oldest">{isFa ? 'قدیمی‌ترین' : 'Oldest first'}</option>
              <option value="title">{isFa ? 'بر اساس عنوان (الفبا)' : 'By Title'}</option>
            </select>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={isFa ? 'نمایش شبکه‌ای' : 'Grid View'}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-xl transition ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={isFa ? 'نمایش فهرستی' : 'List View'}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'all', label: isFa ? 'همه خروجی‌ها' : 'All', count: items.length },
              { id: 'text', label: isFa ? 'متن‌ها' : 'Texts', count: items.filter((i) => i.type === 'text').length },
              { id: 'image', label: isFa ? 'تصاویر' : 'Images', count: items.filter((i) => i.type === 'image').length },
              { id: 'video', label: isFa ? 'ویدیوها' : 'Videos', count: items.filter((i) => i.type === 'video').length },
              { id: 'audio', label: isFa ? 'فایل‌های صوتی' : 'Audio', count: items.filter((i) => i.type === 'audio').length },
              { id: 'favorites', label: isFa ? 'برگزیده‌ها ⭐' : 'Favorites', count: items.filter((i) => i.isFavorite).length },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === f.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{f.label}</span>
                <span className="text-[10px] px-1.5 rounded-md bg-black/20 text-slate-200 font-bold">
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Batch operations */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 transition"
            >
              {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{isFa ? 'انتخاب همه' : 'Select All'}</span>
            </button>

            <button
              onClick={handleBatchZip}
              disabled={isExportingBatch || filteredItems.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition disabled:opacity-50 cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>
                {isExportingBatch
                  ? isFa ? 'در حال ساخت فایل ZIP...' : 'Compressing...'
                  : selectedIds.length > 0
                  ? isFa ? `دانلود دسته‌ای (${selectedIds.length}) ZIP` : `Export (${selectedIds.length}) ZIP`
                  : isFa ? 'دانلود تمام خروجی‌ها (ZIP)' : 'Export All as ZIP'}
              </span>
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={handleBatchDeleteClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isFa ? `حذف (${selectedIds.length})` : `Delete (${selectedIds.length})`}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-950 flex items-center justify-center border border-slate-800">
            <Archive className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-base font-bold text-slate-200">
            {isFa ? 'خروجی‌ای مطابق با فیلتر یافت نشد' : 'No items match your filter'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isFa ? 'می‌توانید به بخش استودیو بروید و محتوای متنی، تصویری یا ویدیویی جدیدی ایجاد فرمایید.' : 'Switch to Studio to generate new content or clear search filters.'}
          </p>
        </div>
      )}

      {/* Grid Mode */}
      {viewMode === 'grid' && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`group relative bg-slate-900/90 border rounded-3xl overflow-hidden transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                {/* Media Preview Container */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
                  {item.type === 'image' && (
                    <img
                      src={item.content}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {item.type === 'video' && (
                    <div className="relative w-full h-full bg-slate-950">
                      <video
                        src={item.content}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                        onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                      />
                      <div className="absolute top-2 left-2 p-1 rounded-lg bg-black/60 text-rose-400">
                        <Video className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}

                  {item.type === 'text' && (
                    <div className="p-4 w-full h-full text-[11px] text-slate-300 overflow-hidden relative select-none">
                      <div className="line-clamp-5 leading-relaxed font-mono opacity-85">
                        {item.content}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950 to-transparent" />
                    </div>
                  )}

                  {item.type === 'audio' && (
                    <div className="flex flex-col items-center justify-center gap-2 text-emerald-400">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Mic className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Audio Clip</span>
                    </div>
                  )}

                  {/* Checkbox overlay */}
                  <button
                    onClick={() => toggleSelect(item.id)}
                    className="absolute top-2.5 right-2.5 rtl:right-2.5 ltr:left-2.5 z-10 p-1 rounded-lg bg-slate-900/80 backdrop-blur text-white border border-slate-700 hover:bg-indigo-600 transition"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {/* Favorite button */}
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="absolute top-2.5 left-2.5 rtl:left-2.5 ltr:right-2.5 z-10 p-1 rounded-lg bg-slate-900/80 backdrop-blur text-white border border-slate-700 hover:text-amber-400 transition"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        item.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {getModalityIcon(item.type)}
                        <span>{item.type.toUpperCase()}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 truncate" title={item.model}>
                        {item.model}
                      </span>
                    </div>

                    <h4
                      onClick={() => onOpenPreview(item)}
                      className="font-bold text-sm text-slate-100 hover:text-indigo-400 transition cursor-pointer line-clamp-1"
                      title={item.title}
                    >
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {item.prompt}
                    </p>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Quick Download */}
                      {item.type === 'text' && (
                        <button
                          onClick={() => exportText(item, 'md')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title={isFa ? 'دانلود به عنوان Markdown (.md)' : 'Download Markdown'}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {item.type === 'image' && (
                        <button
                          onClick={() => exportImage(item, 'png')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title={isFa ? 'دانلود تصویر PNG' : 'Download PNG'}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {(item.type === 'video' || item.type === 'audio') && (
                        <button
                          onClick={() => exportMediaFile(item, item.type === 'video' ? 'mp4' : 'wav')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title={isFa ? 'دانلود فایل چندرسانه‌ای' : 'Download Media'}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Open Full Preview */}
                      <button
                        onClick={() => onOpenPreview(item)}
                        className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/20"
                        title={isFa ? 'مشاهده و خروجی با فرمت‌های مختلف' : 'View and Export'}
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                        title={isFa ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List Mode */}
      {viewMode === 'list' && filteredItems.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-800/80">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`p-4 flex items-center justify-between gap-4 transition ${
                  isSelected ? 'bg-indigo-950/20' : 'hover:bg-slate-850/50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button onClick={() => toggleSelect(item.id)}>
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                    {getModalityIcon(item.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4
                        onClick={() => onOpenPreview(item)}
                        className="font-bold text-sm text-slate-200 hover:text-indigo-400 cursor-pointer truncate"
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.2 rounded-md bg-slate-800 text-slate-400">
                        {item.model}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{item.prompt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 hidden sm:inline">
                    {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                  </span>

                  <button onClick={() => onToggleFavorite(item.id)}>
                    <Star
                      className={`w-4 h-4 ${
                        item.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-500'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => onOpenPreview(item)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
