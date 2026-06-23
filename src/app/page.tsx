"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles, Zap, BarChart3, Globe, Shield, Crown,
  ArrowRight, Check, Loader2, Copy, Hash, Edit3, TrendingUp, Star, Image as ImageIcon
} from "lucide-react";

type Platform = "xiaohongshu" | "douyin" | "weibo" | "zhihu";
interface ContentResult { title: string; content: string; hashtags: string[]; platform: string; }

export default function HomePage() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("xiaohongshu");
  const [count, setCount] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<ContentResult[]>([]);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const handleDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setGenerating(true);
    setError("");
    setResults([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, count }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "生成失败，请登录后继续使用"); return; }
      setResults(data.data || []);
    } catch { setError("网络错误，请重试"); }
    finally { setGenerating(false); }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const platformNames: Record<Platform, string> = {
    xiaohongshu: "小红书", douyin: "抖音", weibo: "微博", zhihu: "知乎",
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-purple-500 bg-clip-text text-transparent">GrassFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-500 transition-colors">登录</Link>
            <Link href="/register" className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">免费注册</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm mb-6">
            <Sparkles size={16} /> AI 批量种草工具 · 新增评分/改写/趋势/配图功能
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            AI 批量生成<br />
            <span className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-purple-500 bg-clip-text text-transparent">爆款种草内容</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            输入产品主题，AI 自动生成小红书、抖音、微博、知乎多平台种草笔记。
            一次生成多篇，还能评分优化、批量改写、追踪热点，一站式搞定内容矩阵。
          </p>

          {/* Demo Form */}
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
            <form onSubmit={handleDemo} className="space-y-4">
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="输入产品/主题名称，例如：某品牌防晒霜..." className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
              <div className="flex gap-3">
                <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="xiaohongshu">小红书</option><option value="douyin">抖音</option><option value="weibo">微博</option><option value="zhihu">知乎</option>
                </select>
                <div className="flex items-center gap-2 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl">
                  <span className="text-sm text-gray-400">篇</span>
                  <input type="range" min={1} max={5} value={count} onChange={e => setCount(Number(e.target.value))} className="w-20 accent-emerald-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-4">{count}</span>
                </div>
              </div>
              <button type="submit" disabled={generating || !topic.trim()} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {generating ? <><Loader2 className="animate-spin" size={18} /> AI 生成中...</> : <><Sparkles size={18} /> 免费体验 AI 生成</>}
              </button>
            </form>
            <p className="text-xs text-gray-400 text-center mt-3">免费体验每日限 3 次，注册后解锁更多功能</p>
          </div>

          {error && <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6">{error}</div>}

          {results.length > 0 && (
            <div className="max-w-2xl mx-auto space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-left">✨ 生成结果</h3>
              {results.map((result, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 text-left">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{result.title}</h4>
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">{platformNames[platform]}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap mb-3">{result.content}</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {result.hashtags.map((tag, j) => (
                      <span key={j} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full"><Hash size={10} />{tag.replace("#","")}</span>
                    ))}
                  </div>
                  <button onClick={() => copyToClipboard(`${result.title}\n\n${result.content}\n\n${result.hashtags.join(" ")}`, i)} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-emerald-500 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-emerald-500 transition-colors">
                    {copiedIndex === i ? <><Check size={16} className="text-emerald-500" /> 已复制</> : <><Copy size={16} /> 复制全文</>}
                  </button>
                </div>
              ))}
              <div className="text-center">
                <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                  注册免费使用 <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid — 所有功能 */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">一站式 AI 内容工厂</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto">从生成到优化，从改写趋势到分析，搞定一切内容需求</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: "AI 批量生成", desc: "一次生成多篇种草笔记，5分钟搞定一周内容量。支持4大平台自动适配。", color: "emerald", badge: "核心" },
              { icon: Star, title: "内容质量评分", desc: "AI 多维度评分标题吸引力、互动潜力、平台适配度，给出改进建议。", color: "purple", badge: "新功能" },
              { icon: Edit3, title: "批量改写变体", desc: "同一产品生成10+不同角度的话术，避免内容重复被平台识别。", color: "pink", badge: "新功能" },
              { icon: TrendingUp, title: "趋势热点推荐", desc: "获取各平台热门话题和标签，让内容获得更多曝光流量。", color: "blue", badge: "新功能" },
              { icon: BarChart3, title: "竞品内容分析", desc: "AI 分析竞品笔记策略，找到你的差异化优势。", color: "orange", badge: "进阶" },
              { icon: Globe, title: "多平台一键适配", desc: "小红书、抖音、微博、知乎，一次输入全平台输出。", color: "emerald", badge: "" },
              { icon: Zap, title: "智能语气风格", desc: "种草、专业、亲切、幽默、干货5种风格，贴合品牌调性。", color: "yellow", badge: "" },
              { icon: Shield, title: "一键复制发布", desc: "生成内容一键复制，无缝粘贴到目标平台发布。", color: "cyan", badge: "" },
              { icon: ImageIcon, title: "AI配图Prompt", desc: "为每篇内容智能生成配图方案，支持 Midjourney/DALL-E/Stable Diffusion。", color: "purple", badge: "新功能" },
              { icon: Crown, title: "永久使用", desc: "一次性购买永久版，终身免费更新，无限生成。", color: "yellow", badge: "推荐" },
            ].map((f, i) => {
              const Icon = f.icon;
              const colors: Record<string, string> = {
                emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500",
                purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-500",
                blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-500",
                orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-500",
                pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-500",
                yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500",
                cyan: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-500",
              };
              return (
                <div key={i} className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:shadow-lg transition-shadow relative">
                  {f.badge && (
                    <span className={`absolute top-3 right-3 px-2 py-0.5 text-xs rounded-full font-medium ${
                      f.badge === "新功能" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" :
                      f.badge === "推荐" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" :
                      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    }`}>{f.badge}</span>
                  )}
                  <div className={`w-12 h-12 rounded-xl ${colors[f.color]} flex items-center justify-center mb-4`}><Icon size={24} /></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison — 竞品对比 */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">为什么选 GrassFlow？</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">对比海外天价工具和国内限制SaaS，我们更懂你的需求</p>
          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">对比项</th>
                  <th className="text-center py-4 px-4 font-semibold text-emerald-600 dark:text-emerald-400">🌿 GrassFlow</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-400">Postiz ($39/月)</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-400">妙笔 (¥99/月)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["国内平台支持", "✅ 小红书/抖音/微博/知乎", "❌ 不支持", "⚠️ 仅小红书"],
                  ["AI 批量生成", "✅ 10篇/次", "❌ 无AI", "✅ 有"],
                  ["内容质量评分", "✅ 多维度AI评分", "❌ 无", "❌ 无"],
                  ["批量改写变体", "✅ 10+不同角度", "❌ 无", "❌ 无"],
                  ["趋势热点推荐", "✅ 实时热门话题", "❌ 无", "❌ 无"],
                  ["竞品分析", "✅ AI分析", "❌ 无", "❌ 无"],
                  ["价格", "免费起步 · ¥69/月 · ¥499永久", "$39/月 ≈ ¥280", "¥99/月"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">{row[0]}</td>
                    <td className="py-3 px-4 text-center text-emerald-600 dark:text-emerald-400">{row[1]}</td>
                    <td className="py-3 px-4 text-center text-gray-400">{row[2]}</td>
                    <td className="py-3 px-4 text-center text-gray-400">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">简单透明的定价</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">从免费开始，按需升级</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { name: "免费", price: "¥0", period: "", features: ["每日 3 次生成", "4 大平台支持", "基础模板", "体验评分/改写", "体验配图Prompt"], button: "免费开始", href: "/register", popular: false },
              { name: "专业版", price: "¥69", period: "/月", features: ["每日 999 次生成", "竞品分析 + 评分", "批量改写变体", "趋势热点推荐", "AI配图Prompt", "批量导出", "优先支持"], button: "立即订阅", href: "/buy", popular: true },
              { name: "永久版", price: "¥499", period: "永久", features: ["无限生成", "所有功能", "永久更新", "专属 License Key", "VIP 支持", "API 接口", "配图Prompt无限"], button: "立即购买", href: "/buy", popular: false },
            ].map((plan, i) => (
              <div key={i} className={`relative p-8 rounded-2xl border-2 ${plan.popular ? "bg-white dark:bg-gray-800 border-emerald-500 shadow-xl scale-105" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-lg"}`}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-purple-500 text-white text-xs font-medium px-4 py-1 rounded-full">最受欢迎</div>}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"><Check size={16} className="text-emerald-500 mt-0.5 shrink-0" /> {feat}</li>
                  ))}
                </ul>
                <Link href={plan.href} className={`block w-full py-3 text-center rounded-lg font-medium transition-all ${plan.popular ? "bg-gradient-to-r from-emerald-500 to-purple-500 text-white hover:opacity-90" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"}`}>{plan.button}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">立即开始生成你的第一篇爆款笔记</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">免费注册，即刻体验 AI 批量种草内容生成</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-purple-500 text-white text-lg rounded-xl font-medium hover:opacity-90 transition-opacity shadow-xl">
            免费注册 <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2"><span className="text-lg">🌿</span><span className="font-semibold bg-gradient-to-r from-emerald-500 to-purple-500 bg-clip-text text-transparent">GrassFlow</span></div>
          <p className="text-sm text-gray-400">AI 批量种草工具 · {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
