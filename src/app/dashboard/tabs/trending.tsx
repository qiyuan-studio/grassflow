"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Loader2, Hash, Lightbulb, RefreshCw, Copy, Check } from "lucide-react";

interface TrendingTopic {
  topic: string;
  heat: string;
  description: string;
  suggested_hashtags: string[];
}

interface TrendingData {
  platform: string;
  trending_topics: TrendingTopic[];
  popular_hashtags: string[];
  content_advice: string;
}

const CATEGORIES = ["热门", "美妆", "数码", "美食", "穿搭", "家居", "母婴", "宠物"];
const PLATFORMS = [
  { value: "xiaohongshu", label: "小红书" },
  { value: "douyin", label: "抖音" },
  { value: "weibo", label: "微博" },
];

export default function TrendingTab() {
  const [platform, setPlatform] = useState("xiaohongshu");
  const [category, setCategory] = useState("热门");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrendingData | null>(null);
  const [error, setError] = useState("");
  const [copiedTags, setCopiedTags] = useState(false);

  const fetchTrending = async (p?: string, c?: string) => {
    setLoading(true);
    setError("");
    try {
      const plat = p || platform;
      const cat = c || category;
      const res = await fetch(`/api/trending?platform=${plat}&category=${cat}`);
      const json = await res.json();
      if (json.success) setData(json);
      else setError("获取失败");
    } catch {
      setError("网络错误");
      const fp = p || "xiaohongshu";
      const fc = c || "beauty";
      // Fallback data
      setData({
        platform: fp === "xiaohongshu" ? "小红书" : fp === "douyin" ? "抖音" : "微博",
        trending_topics: [
          { topic: "夏日护肤好物", heat: "🔥🔥🔥🔥🔥", description: "防晒、美白、补水保持热度", suggested_hashtags: ["#夏日护肤", "#防晒推荐"] },
          { topic: "平价学生党", heat: "🔥🔥🔥🔥", description: "高性价比推荐持续受欢迎", suggested_hashtags: ["#平价好物", "#学生党"] },
          { topic: "618购物开箱", heat: "🔥🔥🔥🔥🔥", description: "购物节后开箱测评流量大", suggested_hashtags: ["#开箱测评", "#618必买"] },
        ],
        popular_hashtags: ["#好物推荐", "#平价好物", "#我的护肤日常", "#开箱测评", "#618必买"],
        content_advice: "建议结合当下季节/节日热点，用真实用户体验打动用户",
      });
    }
    finally { setLoading(false); }
  };

  // Use a ref to avoid stale closure
  const [platForm, setPlatForm] = useState(platform);
  useEffect(() => { setPlatForm(platform); }, [platform]);

  const copyAllTags = () => {
    if (!data) return;
    const text = data.popular_hashtags.join(" ");
    navigator.clipboard.writeText(text);
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <TrendingUp className="text-blue-500" size={20} /> 热门趋势 & 话题推荐
        </h2>
        <p className="text-sm text-gray-500 mb-4">获取当前各平台热门话题、标签和内容建议，让你的内容获得更多曝光</p>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">平台</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
              {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">类别</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => fetchTrending()} disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
              获取趋势
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">{error}</div>}

      {data && (
        <>
          {/* Trending Topics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-500" size={18} /> {data.platform} · 热门话题
            </h3>
            <div className="grid gap-3">
              {data.trending_topics.map((topic, i) => (
                <div key={i} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{topic.topic}</h4>
                    <span className="text-sm">{topic.heat}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{topic.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {topic.suggested_hashtags.map((tag, j) => (
                      <span key={j} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                        <Hash size={10} />{tag.replace("#","")}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Hashtags */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Hash className="text-cyan-500" size={18} /> 热门标签推荐
              </h3>
              <button onClick={copyAllTags} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-cyan-500 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-cyan-500 transition-colors">
                {copiedTags ? <><Check size={16} className="text-cyan-500" /> 已复制</> : <><Copy size={16} /> 复制全部标签</>}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.popular_hashtags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-sm rounded-full cursor-pointer hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
                  onClick={() => navigator.clipboard.writeText(tag)}>
                  <Hash size={12} />{tag.replace("#","")}
                </span>
              ))}
            </div>
          </div>

          {/* Content Advice */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
            <div className="flex items-start gap-3">
              <Lightbulb size={24} className="shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">💡 内容创作建议</h3>
                <p className="text-sm opacity-90">{data.content_advice}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
