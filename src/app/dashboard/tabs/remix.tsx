"use client";

import { useState } from "react";
import { Copy, Check, Loader2, Sparkles, Hash, Lightbulb, Target, TrendingUp, Palette } from "lucide-react";

interface Analysis {
  title_pattern: string;
  structure: string;
  tone: string;
  emotion_curve: string;
  hashtag_strategy: string;
  key_elements: string[];
}

interface Variation {
  angle: string;
  title: string;
  content: string;
  hashtags: string[];
}

export default function RemixTab({ token }: { token?: string }) {
  const [mode, setMode] = useState<"paste" | "product">("paste");
  const [competitorContent, setCompetitorContent] = useState("");
  const [competitorTitle, setCompetitorTitle] = useState("");
  const [competitorHashtags, setCompetitorHashtags] = useState("");
  const [product, setProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "paste" && !competitorContent.trim()) {
      setError("请粘贴竞品笔记内容");
      return;
    }
    if (mode === "product" && !product.trim()) {
      setError("请输入产品名称");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);
    setVariations([]);

    try {
      const body: any = {};
      if (mode === "paste") {
        body.competitorContent = competitorContent;
        body.competitorTitle = competitorTitle;
        body.competitorHashtags = competitorHashtags.split(/[,，\s]+/).filter(Boolean);
        body.platform = "xiaohongshu";
      } else {
        body.product = product;
        body.platform = "xiaohongshu";
      }

      const res = await fetch("/api/competitor-remix", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setVariations(data.variations || []);
      } else {
        setError(data.error || "分析失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const copyVariation = (v: Variation, index: number) => {
    const text = `${v.title}\n\n${v.content}\n\n${v.hashtags.join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAll = () => {
    const all = variations.map((v, i) => 
      `【角度${i+1}: ${v.angle}】\n${v.title}\n\n${v.content}\n\n${v.hashtags.join(" ")}`
    ).join("\n\n" + "=".repeat(40) + "\n\n");
    navigator.clipboard.writeText(all);
    setCopiedIndex(999);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-500 via-purple-500 to-amber-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={28} />
          <h2 className="text-xl font-bold">🔥 爆文克隆</h2>
        </div>
        <p className="text-white/80 text-sm max-w-lg">
          粘贴竞品爆款笔记 → AI分析爆文公式 → 生成3篇不同角度的变体内容
        </p>
        <div className="flex gap-2 mt-4">
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">独家功能</span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">精准克隆</span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">原创变体</span>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button 
          onClick={() => setMode("paste")}
          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
            mode === "paste" 
              ? "bg-rose-500 text-white shadow-md" 
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
          }`}
        >
          📋 粘贴竞品笔记
        </button>
        <button 
          onClick={() => setMode("product")}
          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
            mode === "product" 
              ? "bg-rose-500 text-white shadow-md" 
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
          }`}
        >
          🏷️ 直接写产品
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleAnalyze} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        {mode === "paste" ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">竞品笔记标题（选填）</label>
              <input 
                type="text" 
                value={competitorTitle} 
                onChange={e => setCompetitorTitle(e.target.value)}
                placeholder="把竞品的标题粘贴到这里..." 
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">竞品笔记正文（必填）</label>
              <textarea
                value={competitorContent}
                onChange={e => setCompetitorContent(e.target.value)}
                placeholder={`粘贴竞品的笔记正文到这里...
例如：
"谁还没用这个XX我都会伤心OK？
烂脸期姐妹看过来👀
我之前脸烂到不想出门
直到入了这个XX
第一天：哇好舒服
第三天：痘印淡了！
坚持两周：皮肤像剥了壳的鸡蛋！"`}
                rows={8}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none resize-none font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标签（选填，空格/逗号分隔）</label>
              <input 
                type="text" 
                value={competitorHashtags} 
                onChange={e => setCompetitorHashtags(e.target.value)}
                placeholder="#护肤好物 #平价护肤 #好物推荐" 
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">产品名称/描述</label>
            <textarea
              value={product}
              onChange={e => setProduct(e.target.value)}
              placeholder={`输入你要推广的产品...
例如：
"某品牌防晒霜 SPF50+ PA+++，清爽不油腻"
"蓝牙耳机，降噪好，续航20小时，平价"`}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none resize-none"
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-rose-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="animate-spin" size={18} /> AI分析中...</> : <><Sparkles size={18} /> 开始分析并克隆</>}
        </button>
      </form>

      {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">{error}</div>}

      {/* Analysis Result */}
      {analysis && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Lightbulb className="text-amber-500" size={20} /> 爆文分析报告
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} className="text-rose-500" />
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400">标题公式</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.title_pattern}</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-purple-500" />
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">内容结构</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.structure}</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Palette size={14} className="text-amber-500" />
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">语气风格</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.tone}</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Hash size={14} className="text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">标签策略</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.hashtag_strategy}</p>
            </div>
          </div>
          {analysis.key_elements.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {analysis.key_elements.map((el, i) => (
                <span key={i} className="px-2 py-1 bg-gradient-to-r from-rose-100 to-purple-100 dark:from-rose-900/30 dark:to-purple-900/30 text-rose-700 dark:text-rose-400 text-xs rounded-full">{el}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Variations */}
      {variations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">克隆结果（{variations.length}篇）</h3>
            <button 
              onClick={copyAll}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-rose-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              {copiedIndex === 999 ? <><Check size={16} /> 已全部复制</> : <><Copy size={16} /> 复制全部</>}
            </button>
          </div>

          {variations.map((v, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Angle Header */}
              <div className="px-6 py-3 bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-900/20 dark:to-purple-900/20 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold">{i+1}</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">{v.angle}</span>
                  </div>
                  <button 
                    onClick={() => copyVariation(v, i)}
                    className="flex items-center gap-1 px-3 py-1 text-xs text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    {copiedIndex === i ? <><Check size={14} className="text-emerald-500" /> 已复制</> : <><Copy size={14} /> 复制</>}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-4">{v.title}</h4>
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">{v.content}</div>
                <div className="flex flex-wrap gap-2">
                  {v.hashtags.map((tag, j) => (
                    <span key={j} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
