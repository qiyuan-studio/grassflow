"use client";

import { useState } from "react";
import { BarChart3, Loader2, TrendingUp, Target, Lightbulb, AlertTriangle } from "lucide-react";

export default function AnalyzeTab({ token }: { token: string }) {
  const [product, setProduct] = useState("");
  const [platform, setPlatform] = useState("xiaohongshu");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim()) return;
    setAnalyzing(true);
    setAnalysis("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product, platform }),
      });
      const data = await res.json();
      if (res.ok) setAnalysis(data.data);
    } catch { /* ignore */ }
    finally { setAnalyzing(false); }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAnalyze} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="text-purple-500" size={20} /> 竞品内容分析
        </h2>
        <p className="text-sm text-gray-500">分析你的产品在目标平台上的竞品笔记策略，获得可执行的建议</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">产品名称</label>
          <input type="text" value={product} onChange={e => setProduct(e.target.value)} placeholder="例如：XX品牌面膜" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">目标平台</label>
          <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none">
            <option value="xiaohongshu">小红书</option>
            <option value="douyin">抖音</option>
          </select>
        </div>
        <button type="submit" disabled={analyzing || !product.trim()} className="w-full py-3 bg-gradient-to-r from-purple-500 to-emerald-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
          {analyzing ? <><Loader2 className="animate-spin" size={18} /> AI 分析中...</> : <><BarChart3 size={18} /> 开始分析</>}
        </button>
      </form>

      {analysis && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <TrendingUp className="text-purple-500" size={18} /> 分析结果
          </h3>
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{analysis}</div>
        </div>
      )}
    </div>
  );
}
