"use client";

import { useState, useEffect } from "react";
import { BookTemplate, Loader2, Search, ChevronDown, Star, Copy, Check } from "lucide-react";

interface Template {
  title: string;
  tone: string;
  structure: string;
  tips: string;
}

interface CategoryData {
  category: string;
  templates: Template[];
}

export default function TemplatesTab({ token, onUseTemplate }: { token?: string; onUseTemplate?: (template: Template) => void }) {
  const [data, setData] = useState<CategoryData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async (s?: string) => {
    setLoading(true);
    try {
      const params = s ? `?search=${encodeURIComponent(s)}` : "";
      const res = await fetch(`/api/templates${params}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setCategories(json.categories);
        if (!expandedCat && json.data.length > 0) {
          setExpandedCat(json.data[0].category);
        }
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTemplates(search);
  };

  const copyTitle = (title: string) => {
    navigator.clipboard.writeText(title);
    setCopiedTitle(title);
    setTimeout(() => setCopiedTitle(null), 2000);
  };

  const toneColors: Record<string, string> = {
    "种草": "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
    "干货": "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    "亲切": "text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400",
    "幽默": "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
    "专业": "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <BookTemplate className="text-amber-500" size={20} /> 内容模板库
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          预制 100+ 小红书种草模板，覆盖 10 大热门品类。点击标题一键复制。
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索模板（美妆、数码、美食...）" className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" />
          <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <Search size={16} /> 搜索
          </button>
        </form>
      </div>

      {/* Category Tabs */}
      {!search && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => {
              setExpandedCat(expandedCat === cat ? null : cat);
              setSearch("");
              fetchTemplates();
            }} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              expandedCat === cat ? "bg-amber-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-gray-700"
            }`}>
              {cat} <span className="text-xs opacity-60">({data.find(d => d.category === cat)?.templates.length || 0})</span>
            </button>
          ))}
        </div>
      )}

      {/* Template Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-amber-500" size={24} /></div>
      ) : (
        <div className="space-y-4">
          {data.map(catData => (
            <div key={catData.category} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Star className="text-amber-500" size={16} />
                {catData.category} <span className="text-sm font-normal text-gray-400">({catData.templates.length}个模板)</span>
              </h3>
              <div className="grid gap-3">
                {catData.templates.map((tmpl, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-800 transition-colors cursor-pointer" onClick={() => copyTitle(tmpl.title)}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm flex-1">{tmpl.title}</h4>
                      <div className="flex gap-1 ml-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${toneColors[tmpl.tone] || "text-gray-600 bg-gray-100"}`}>{tmpl.tone}</span>
                        <button onClick={(e) => { e.stopPropagation(); copyTitle(tmpl.title); }} className="p-1 text-gray-400 hover:text-amber-500">
                          {copiedTitle === tmpl.title ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      <span className="font-medium">结构：</span>{tmpl.structure}
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400">
                      💡 {tmpl.tips}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <BookTemplate size={48} className="mx-auto mb-3 opacity-50" />
              <p>未找到匹配的模板</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
