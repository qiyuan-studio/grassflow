"use client";

import { useState, useRef } from "react";
import { 
  Sparkles, Loader2, ChevronDown, ChevronUp, Copy, Check, 
  CalendarDays, BarChart3, Image as ImageIcon, TrendingUp, 
  Download, Clock, Lightbulb, Target, Users, Hash, ExternalLink 
} from "lucide-react";

interface ContentItem {
  title: string;
  body: string;
  hashtags: string[];
  image_prompt?: string;
  best_post_time?: string;
  angle?: string;
}

interface WorkflowResult {
  product_analysis?: string;
  competitor_strategy?: string;
  content_plan?: ContentItem[];
  weekly_strategy?: string;
  recommended_keywords?: string[];
}

export default function SmartWorkflowTab() {
  const [product, setProduct] = useState("");
  const [features, setFeatures] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("xiaohongshu");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!product.trim()) return;
    setGenerating(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/smart-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          features: features || undefined,
          audience: audience || undefined,
          platform,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "生成失败");
        return;
      }
      setResult(data);
      setExpandedIndex(0);
    } catch (e: any) {
      setError("网络错误: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyContent = (item: ContentItem, i: number) => {
    const text = `【${item.title}】\n\n${item.body}\n\n${item.hashtags.join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAll = () => {
    if (!result?.content_plan) return;
    const text = result.content_plan
      .map((item, i) => `【第${i + 1}篇】${item.title}\n${item.body}\n\n发布时间：${item.best_post_time || "建议晚间"}\n标签：${item.hashtags.join(" ")}\n配图：${item.image_prompt || "无"}\n\n---\n`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const platformNames: Record<string, string> = {
    xiaohongshu: "小红书", douyin: "抖音", weibo: "微博", zhihu: "知乎",
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-amber-500" size={24} />
          智能内容工厂
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          输入一个产品，AI 自动完成竞品分析 → 内容生成 → 排版建议 → 发布策略的全流程
        </p>
      </div>

      {/* 输入区 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl border border-amber-200 dark:border-amber-800 p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              📦 产品名称 <span className="text-red-500">*</span>
            </label>
            <input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="例如：氨基酸洗面奶"
              className="w-full px-4 py-2.5 rounded-lg border border-amber-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">目标平台</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-amber-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 outline-none"
            >
              <option value="xiaohongshu">小红书</option>
              <option value="douyin">抖音</option>
              <option value="weibo">微博</option>
              <option value="zhihu">知乎</option>
            </select>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              🎯 核心卖点 <span className="text-gray-400 font-normal">(选填)</span>
            </label>
            <input
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="例如：温和不刺激、深层清洁、敏感肌可用"
              className="w-full px-4 py-2.5 rounded-lg border border-amber-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              👥 目标人群 <span className="text-gray-400 font-normal">(选填)</span>
            </label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="例如：25-35岁女性、敏感肌、学生党"
              className="w-full px-4 py-2.5 rounded-lg border border-amber-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !product.trim()}
          className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-lg"
        >
          {generating ? (
            <><Loader2 className="animate-spin" size={20} /> AI 正在分析并生成完整方案...</>
          ) : (
            <><Sparkles size={20} /> 一键生成完整内容方案</>
          )}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* 结果展示 */}
      {result && (
        <div className="space-y-6">
          {/* 策略总览 */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900/30 p-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                <Target size={18} />
                <span className="font-medium text-sm">产品分析</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{result.product_analysis}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900/30 p-4">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                <BarChart3 size={18} />
                <span className="font-medium text-sm">竞品策略</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{result.competitor_strategy}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900/30 p-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <CalendarDays size={18} />
                <span className="font-medium text-sm">排期策略</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{result.weekly_strategy}</p>
            </div>
          </div>

          {/* 推荐关键词 */}
          {result.recommended_keywords && result.recommended_keywords.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash size={16} className="text-blue-500" />
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">推荐关键词</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.recommended_keywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 内容计划 */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              生成内容 ({result.content_plan?.length || 0}篇)
            </h3>
            <button
              onClick={copyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {copiedIndex === -1 ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copiedIndex === -1 ? "已复制全部" : "复制全部"}
            </button>
          </div>

          {/* 内容卡片 */}
          <div className="space-y-4">
            {result.content_plan?.map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* 折叠头部 */}
                <button
                  onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      i === 0 ? "bg-red-500" : i === 1 ? "bg-blue-500" : i === 2 ? "bg-purple-500" : i === 3 ? "bg-green-500" : "bg-amber-500"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.angle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.best_post_time && (
                      <span className="hidden md:flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        {item.best_post_time}
                      </span>
                    )}
                    {expandedIndex === i ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </div>
                </button>

                {/* 展开内容 */}
                {expandedIndex === i && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                    {/* 正文 */}
                    <div className="py-4">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {item.body}
                      </p>
                    </div>

                    {/* 标签 */}
                    {item.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.hashtags.map((tag, j) => (
                          <span key={j} className="px-2.5 py-1 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-full text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 配图建议 */}
                    {item.image_prompt && (
                      <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 mb-3 border border-amber-100 dark:border-amber-900/20">
                        <div className="flex items-start gap-2">
                          <ImageIcon size={16} className="text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-0.5">📸 配图建议</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.image_prompt}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => copyContent(item, i)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {copiedIndex === i ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        {copiedIndex === i ? "已复制" : "复制文案"}
                      </button>
                      {item.best_post_time && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 bg-gray-50 dark:bg-gray-750 rounded-lg">
                          <Clock size={14} />
                          建议发布时间: {item.best_post_time}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
