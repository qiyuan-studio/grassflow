"use client";

import { useState } from "react";
import { CalendarDays, Loader2, Sparkles, ChevronDown, ChevronUp, Copy, Check, Hash, Clock, Target, Users, MessageCircle, Image, Lightbulb } from "lucide-react";

interface DailyPlan {
  day: string;
  content_type: string;
  best_post_time: string;
  title: string;
  body: string;
  image_suggestions: string;
  hashtags: string[];
  engagement_hook: string;
  angle_reason: string;
}

interface ContentPlan {
  strategy_overview: string;
  target_audience: string;
  core_message: string;
  daily_plan: DailyPlan[];
}

export default function ContentPlanTab({ token }: { token?: string }) {
  const [product, setProduct] = useState("");
  const [features, setFeatures] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<ContentPlan | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [copiedDay, setCopiedDay] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim()) {
      setError("请输入产品名称");
      return;
    }

    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const res = await fetch("/api/content-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          product: product.trim(),
          features: features.trim(),
          targetAudience: targetAudience.trim(),
          platform: "小红书",
        }),
      });
      const data = await res.json();
      if (data.success && data.daily_plan && data.daily_plan.length > 0) {
        setPlan(data);
        setExpandedDay(0);
      } else {
        setError(data.error || "生成失败，请重试");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const copyDayContent = (day: DailyPlan, index: number) => {
    const text = `【${day.day}｜${day.content_type}】\n${day.title}\n\n${day.body}\n\n配图建议：${day.image_suggestions}\n\n标签：${day.hashtags.join(" ")}\n\n⏰ 发布时间：${day.best_post_time}\n💬 互动话术：${day.engagement_hook}`;
    navigator.clipboard.writeText(text);
    setCopiedDay(index);
    setTimeout(() => setCopiedDay(null), 2000);
  };

  const copyAll = () => {
    if (!plan) return;
    const header = `📋 一周内容排期计划：${product}\n策略：${plan.strategy_overview}\n目标人群：${plan.target_audience}\n核心信息：${plan.core_message}\n\n` + "=".repeat(50) + `\n\n`;
    const days = plan.daily_plan.map((day, i) => 
      `【Day ${i+1}｜${day.day}】${day.content_type}\n${day.title}\n\n${day.body}\n\n📷 配图：${day.image_suggestions}\n🏷️ 标签：${day.hashtags.join(" ")}\n⏰ ${day.best_post_time}\n💬 ${day.engagement_hook}`
    ).join("\n\n" + "-".repeat(40) + "\n\n");
    navigator.clipboard.writeText(header + days);
    setCopiedDay(999);
    setTimeout(() => setCopiedDay(null), 2000);
  };

  const dayColors = [
    { bg: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20", border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" },
    { bg: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20", border: "border-blue-200 dark:border-blue-800", badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
    { bg: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20", border: "border-purple-200 dark:border-purple-800", badge: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" },
    { bg: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20", border: "border-amber-200 dark:border-amber-800", badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
    { bg: "from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20", border: "border-rose-200 dark:border-rose-800", badge: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400" },
    { bg: "from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20", border: "border-indigo-200 dark:border-indigo-800", badge: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400" },
    { bg: "from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20", border: "border-teal-200 dark:border-teal-800", badge: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" },
  ];

  const dayIcons = ["🌅", "📚", "🔬", "📸", "🎯", "🧘", "🎤"];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <CalendarDays size={28} />
          <h2 className="text-xl font-bold">📅 一周内容排期</h2>
        </div>
        <p className="text-white/80 text-sm max-w-lg">
          输入产品信息，AI自动生成7天完整的小红书内容排期计划
          <br />每天不同角度策略，从种草到转化一气呵成
        </p>
        <div className="flex gap-2 mt-4">
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">7天完整排期</span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">可执行内容</span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">角度策略</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleGenerate} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            产品名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={product}
            onChange={e => setProduct(e.target.value)}
            placeholder="例如：XX品牌防晒霜、XX蓝牙耳机..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
            required
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">核心卖点（选填）</label>
            <textarea
              value={features}
              onChange={e => setFeatures(e.target.value)}
              placeholder="清爽不油腻、防晒SPF50+、美白淡斑..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">目标人群（选填）</label>
            <textarea
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value)}
              placeholder="20-30岁女性、学生党、油皮敏感肌..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !product.trim()}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={18} /> AI生成排期计划中...</>
          ) : (
            <><Sparkles size={18} /> 生成一周内容排期</>
          )}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {plan && (
        <div className="space-y-6">
          {/* Strategy Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="text-teal-500" size={20} /> 策略总览
              </h3>
              <button
                onClick={copyAll}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                {copiedDay === 999 ? <><Check size={16} /> 已复制</> : <><Copy size={16} /> 复制全部</>}
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-teal-600" />
                  <span className="text-xs font-medium text-teal-700 dark:text-teal-400">本周策略</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{plan.strategy_overview}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-blue-600" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-400">目标人群</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{plan.target_audience}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle size={16} className="text-purple-600" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-400">核心信息</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{plan.core_message}</p>
              </div>
            </div>
          </div>

          {/* Daily Plan */}
          <div className="space-y-3">
            {plan.daily_plan.map((day, i) => {
              const colors = dayColors[i % dayColors.length];
              const isExpanded = expandedDay === i;
              return (
                <div
                  key={i}
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border ${colors.border} overflow-hidden transition-all`}
                >
                  {/* Day Header (click to expand) */}
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : i)}
                    className={`w-full p-5 bg-gradient-to-r ${colors.bg} flex items-center justify-between text-left`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{dayIcons[i]}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{day.day}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${colors.badge}`}>
                            {day.content_type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{day.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        {day.best_post_time}
                      </span>
                      {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-6 pt-2 space-y-4">
                      {/* Title */}
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{day.title}</h4>

                      {/* Body */}
                      <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                        {day.body}
                      </div>

                      {/* Image Suggestions */}
                      <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <Image size={18} className="text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">📷 配图建议</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{day.image_suggestions}</p>
                        </div>
                      </div>

                      {/* Hashtags */}
                      <div className="flex flex-wrap gap-1.5">
                        {day.hashtags.map((tag, j) => (
                          <span key={j} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                            <Hash size={10} />
                            {tag.replace("#", "")}
                          </span>
                        ))}
                      </div>

                      {/* Meta Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock size={14} className="text-teal-500" />
                          <span>最佳时间：{day.best_post_time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <MessageCircle size={14} className="text-rose-500" />
                          <span>互动引导</span>
                        </div>
                      </div>

                      {/* Engagement Hook */}
                      <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
                        <span className="text-xs font-medium text-rose-700 dark:text-rose-400">💬 互动话术</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{day.engagement_hook}</p>
                      </div>

                      {/* Angle Reason */}
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-400">🎯 角度解析</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{day.angle_reason}</p>
                      </div>

                      {/* Copy Button */}
                      <button
                        onClick={() => copyDayContent(day, i)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-500 hover:text-teal-600 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-teal-500 transition-colors"
                      >
                        {copiedDay === i ? <><Check size={16} className="text-emerald-500" /> 已复制到剪贴板</> : <><Copy size={16} /> 复制本篇内容</>}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
