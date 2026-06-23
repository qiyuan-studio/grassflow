"use client";

import { useState } from "react";
import { Edit3, Loader2, Copy, Check, Hash, Sparkles } from "lucide-react";

type Platform = "xiaohongshu" | "douyin" | "weibo" | "zhihu";
interface ContentResult { title: string; content: string; hashtags: string[]; platform: string; }

const PLATFORM_NAMES: Record<Platform, string> = {
  xiaohongshu: "小红书", douyin: "抖音", weibo: "微博", zhihu: "知乎",
};

export default function RewriteTab({ token }: { token: string }) {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("xiaohongshu");
  const [count, setCount] = useState(5);
  const [tone, setTone] = useState("种草");
  const [keywords, setKeywords] = useState("");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<ContentResult[]>([]);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleRewrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setGenerating(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic, platform, count, tone, keywords: keywords.split(",").map(k => k.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "改写失败"); return; }
      setResults(data.data || []);
    } catch { setError("网络错误，请重试"); }
    finally { setGenerating(false); }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleRewrite} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Edit3 className="text-purple-500" size={20} /> 批量改写 — 同一主题多角度变体
        </h2>
        <p className="text-sm text-gray-500">为同一个产品/主题生成 5-10 篇完全不同角度和话术的种草笔记，避免内容重复被平台识别</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">产品/主题</label>
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="例如：某品牌面膜、某款耳机..." className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" required />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">平台</label>
            <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none">
              <option value="xiaohongshu">小红书</option>
              <option value="douyin">抖音</option>
              <option value="weibo">微博</option>
              <option value="zhihu">知乎</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">篇数</label>
            <input type="number" min={3} max={10} value={count} onChange={e => setCount(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">语气</label>
            <select value={tone} onChange={e => setTone(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none">
              <option value="种草">种草</option>
              <option value="专业">专业</option>
              <option value="亲切">亲切</option>
              <option value="幽默">幽默</option>
              <option value="干货">干货</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">关键词（逗号分隔，可选）</label>
          <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="平价、学生党、好用" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" />
        </div>

        <button type="submit" disabled={generating || !topic.trim()} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
          {generating ? <><Loader2 className="animate-spin" size={18} /> AI 生成多角度变体...</> : <><Edit3 size={18} /> 生成 {count} 篇不同角度内容</>}
        </button>
      </form>

      {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">{error}</div>}

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">批量改写结果 ({results.length}篇不同角度)</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {results.map((_, i) => (
              <span key={i} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">角度 {i + 1}</span>
            ))}
          </div>
          {results.map((result, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">#{i + 1} {result.title}</h4>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">角度 {i + 1}</span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">{result.content}</div>
              <div className="flex flex-wrap gap-2 mb-4">
                {result.hashtags.map((tag, j) => (
                  <span key={j} className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 text-xs rounded-full"><Hash size={10} />{tag.replace("#","")}</span>
                ))}
              </div>
              <button onClick={() => copyToClipboard(`${result.title}\n\n${result.content}\n\n${result.hashtags.join(" ")}`, i)} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-purple-500 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-500 transition-colors">
                {copiedIndex === i ? <><Check size={16} className="text-purple-500" /> 已复制</> : <><Copy size={16} /> 复制本文</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
