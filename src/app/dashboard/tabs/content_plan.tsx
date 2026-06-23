"use client";

import { useState, useRef } from "react";
import {
  CalendarDays, Loader2, Sparkles, ChevronDown, ChevronUp,
  Copy, Check, Hash, Clock, Target, Users, MessageCircle,
  Image, Lightbulb, Download, Globe, TrendingUp, ListChecks
} from "lucide-react";

type Platform = "xiaohongshu" | "douyin" | "weibo" | "zhihu";

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
  cross_platform_tips?: string;
  hashtag_strategy?: string;
  key_metrics_targets?: string;
  platform?: string;
  platformName?: string;
  startDate?: string;
  daily_plan: DailyPlan[];
}

const PLATFORMS: { key: Platform; label: string; desc: string; icon: string }[] = [
  { key: "xiaohongshu", label: "小红书", desc: "种草笔记 · 图文为主", icon: "📕" },
  { key: "douyin", label: "抖音", desc: "短视频 · 前3秒钩子", icon: "🎵" },
  { key: "weibo", label: "微博", desc: "热点话题 · 140字+长文", icon: "📱" },
  { key: "zhihu", label: "知乎", desc: "深度问答 · 专业测评", icon: "💡" },
];

export default function ContentPlanTab({ token }: { token?: string }) {
  const [product, setProduct] = useState("");
  const [features, setFeatures] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [competitorContent, setCompetitorContent] = useState("");
  const [platform, setPlatform] = useState<Platform>("xiaohongshu");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return monday.toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<ContentPlan | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [copiedDay, setCopiedDay] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [progressOpen, setProgressOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const resultRef = useRef<HTMLDivElement>(null);

  // ── Helpers ──
  const dayLabel = (index: number, start?: string): string => {
    if (!start) return ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][index % 7];
    const d = new Date(start);
    d.setDate(d.getDate() + index);
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return `${d.getMonth() + 1}/${d.getDate()} ${weekdays[d.getDay()]}`;
  };

  const dayStatus = (index: number, start?: string): "past" | "today" | "future" => {
    if (!start) return "future";
    const d = new Date(start);
    d.setDate(d.getDate() + index);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    if (d < today) return "past";
    if (d.getTime() === today.getTime()) return "today";
    return "future";
  };

  const toggleDaySelection = (i: number) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const selectAllDays = () => {
    if (!plan) return;
    if (selectedDays.size === plan.daily_plan.length) {
      setSelectedDays(new Set());
    } else {
      setSelectedDays(new Set(plan.daily_plan.map((_, i) => i)));
    }
  };

  // ── CSVs ──
  const exportCSV = () => {
    if (!plan) return;
    const header = "日期,内容类型,发布时间,标题,正文,配图建议,标签,互动话术,角度解析\n";
    const rows = plan.daily_plan
      .map((day, i) => {
        const date = dayLabel(i, plan.startDate);
        const body = day.body.replace(/"/g, '""');
        const title = day.title.replace(/"/g, '""');
        const image = day.image_suggestions.replace(/"/g, '""');
        const hook = day.engagement_hook.replace(/"/g, '""');
        const angle = day.angle_reason.replace(/"/g, '""');
        return `"${date}","${day.content_type}","${day.best_post_time}","${title}","${body}","${image}","${day.hashtags.join(" ")}","${hook}","${angle}"`;
      })
      .join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${product}-内容排期.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Copy helpers ──
  const copyDayContent = (day: DailyPlan, index: number) => {
    const text = `【${day.day}｜${day.content_type}】\n${day.title}\n\n${day.body}\n\n配图建议：${day.image_suggestions}\n\n标签：${day.hashtags.join(" ")}\n\n⏰ 发布时间：${day.best_post_time}\n💬 互动话术：${day.engagement_hook}`;
    navigator.clipboard.writeText(text);
    setCopiedDay(index);
    setTimeout(() => setCopiedDay(null), 2000);
  };

  const copyFieldToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAll = () => {
    if (!plan) return;
    const header =
      `📋 一周内容排期计划：${product}\n平台：${plan.platformName || ""}\n策略：${plan.strategy_overview}\n目标人群：${plan.target_audience}\n核心信息：${plan.core_message}\n\n` +
      "=".repeat(50) +
      "\n\n";
    const days = plan.daily_plan
      .map(
        (day, i) =>
          `【Day ${i + 1}｜${day.day}】${day.content_type}\n${day.title}\n\n${day.body}\n\n📷 配图：${day.image_suggestions}\n🏷️ 标签：${day.hashtags.join(" ")}\n⏰ ${day.best_post_time}\n💬 ${day.engagement_hook}`
      )
      .join("\n\n" + "-".repeat(40) + "\n\n");
    navigator.clipboard.writeText(header + days);
    setCopiedDay(999);
    setTimeout(() => setCopiedDay(null), 2000);
  };

  // ── Generate ──
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
          platform: platform,
          startDate: startDate,
          competitorContent: competitorContent.trim(),
        }),
      });
      const data = await res.json();

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);

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

  // ── Colors ──
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

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <CalendarDays size={28} />
          <h2 className="text-xl font-bold">📅 一周内容排期</h2>
        </div>
        <p className="text-white/80 text-sm max-w-lg">
          AI 自动生成 7 天完整多平台内容排期计划
          <br />
          支持小红书 / 抖音 / 微博 / 知乎，每天不同角度策略
        </p>
        <div className="flex gap-2 mt-4 flex-wrap">
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">7天完整排期</span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">可执行内容</span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">角度策略</span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">多平台</span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">导出CSV</span>
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
            onChange={(e) => setProduct(e.target.value)}
            placeholder="例如：XX品牌防晒霜、XX蓝牙耳机、XX课程..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
            required
          />
        </div>

        {/* Platform Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📌 目标平台
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPlatform(p.key)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  platform === p.key
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-sm"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <div className="text-xl mb-1">{p.icon}</div>
                <div className="font-medium text-sm text-gray-900 dark:text-white">{p.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <CalendarDays size={14} className="inline mr-1" />
              起始日期
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <ListChecks size={14} className="inline mr-1" />
              核心卖点（选填）
            </label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="清爽不油腻、防晒SPF50+、美白淡斑…"
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Users size={14} className="inline mr-1" />
              目标人群（选填）
            </label>
            <textarea
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="20-30岁女性、学生党、油皮敏感肌…"
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Competitor Content Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            🔍 竞品参考素材（选填）
          </label>
          <textarea
            value={competitorContent}
            onChange={(e) => setCompetitorContent(e.target.value)}
            placeholder="粘贴竞品的爆款文案、标题、角度等，AI会参考生成更有竞争力的内容..."
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !product.trim()}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> AI生成排期计划中...
            </>
          ) : (
            <>
              <Sparkles size={18} /> 生成一周内容排期
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">{error}</div>
      )}

      {/* Results */}
      {plan && (
        <div ref={resultRef} className="space-y-6">
          {/* Progress Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <button
              onClick={() => setProgressOpen(!progressOpen)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-teal-500" />
                <span className="font-medium text-gray-900 dark:text-white">本周内容进度</span>
                <span className="text-xs text-gray-400">{plan.startDate ? `起始：${plan.startDate}` : ""}</span>
              </div>
              {progressOpen ? (
                <ChevronUp size={18} className="text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              )}
            </button>

            {progressOpen && (
              <div className="mt-4 space-y-3">
                <div className="flex gap-1.5">
                  {plan.daily_plan.map((day, i) => {
                    const status = dayStatus(i, plan.startDate);
                    const isSelected = selectedDays.has(i);
                    return (
                      <button
                        key={i}
                        onClick={() => toggleDaySelection(i)}
                        className={`flex-1 p-2 rounded-lg text-center text-xs transition-all ${
                          status === "today"
                            ? "bg-teal-500 text-white ring-2 ring-teal-300"
                            : status === "past"
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                            : isSelected
                            ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 ring-1 ring-teal-400"
                            : "bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                        }`}
                      >
                        <div className="font-medium">{i + 1}</div>
                        <div className="text-[10px] mt-0.5">{dayLabel(i, plan.startDate)}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex gap-3">
                    <span>
                      ✅ 已完成：{plan.daily_plan.filter((_, i) => dayStatus(i, plan.startDate) === "past").length}天
                    </span>
                    <span>
                      📌 今日：{plan.daily_plan.filter((_, i) => dayStatus(i, plan.startDate) === "today").length > 0 ? "有" : "无"}
                    </span>
                    <span>
                      ⏳ 待完成：{plan.daily_plan.filter((_, i) => dayStatus(i, plan.startDate) === "future").length}天
                    </span>
                  </div>
                  <button onClick={selectAllDays} className="text-teal-600 hover:text-teal-700 font-medium">
                    {selectedDays.size === plan.daily_plan.length ? "取消全选" : "全选"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Strategy Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="text-teal-500" size={20} /> 策略总览
                {plan.platformName && (
                  <span className="text-sm font-normal text-gray-400 ml-2">· {plan.platformName}</span>
                )}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Download size={16} /> CSV
                </button>
                <button
                  onClick={copyAll}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  {copiedDay === 999 ? (
                    <>
                      <Check size={16} /> 已复制
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> 复制全部
                    </>
                  )}
                </button>
              </div>
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

            {/* New Strategy Detail Fields */}
            {(plan.cross_platform_tips || plan.hashtag_strategy || plan.key_metrics_targets) && (
              <div className="mt-4 grid md:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                {plan.cross_platform_tips && (
                  <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-green-600" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-400">跨平台建议</span>
                      </div>
                      <button
                        onClick={() => copyFieldToClipboard(plan.cross_platform_tips!, "cross")}
                        className="text-green-500 hover:text-green-700"
                      >
                        {copiedField === "cross" ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{plan.cross_platform_tips}</p>
                  </div>
                )}
                {plan.hashtag_strategy && (
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Hash size={14} className="text-purple-600" />
                        <span className="text-xs font-medium text-purple-700 dark:text-purple-400">标签策略</span>
                      </div>
                      <button
                        onClick={() => copyFieldToClipboard(plan.hashtag_strategy!, "hashtag")}
                        className="text-purple-500 hover:text-purple-700"
                      >
                        {copiedField === "hashtag" ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{plan.hashtag_strategy}</p>
                  </div>
                )}
                {plan.key_metrics_targets && (
                  <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-amber-600" />
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-400">数据目标</span>
                      </div>
                      <button
                        onClick={() => copyFieldToClipboard(plan.key_metrics_targets!, "metrics")}
                        className="text-amber-500 hover:text-amber-700"
                      >
                        {copiedField === "metrics" ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{plan.key_metrics_targets}</p>
                  </div>
                )}
              </div>
            )}
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
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {dayLabel(i, plan.startDate)}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${colors.badge}`}>
                            {day.content_type}
                          </span>
                          {dayStatus(i, plan.startDate) === "today" && (
                            <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] rounded-full font-bold">
                              今日
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{day.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
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
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{day.title}</h4>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                        {day.body}
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <Image size={18} className="text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">📷 配图建议</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{day.image_suggestions}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {day.hashtags.map((tag, j) => (
                          <span
                            key={j}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full"
                          >
                            <Hash size={10} />
                            {tag.replace("#", "")}
                          </span>
                        ))}
                      </div>
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
                      <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
                        <span className="text-xs font-medium text-rose-700 dark:text-rose-400">💬 互动话术</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{day.engagement_hook}</p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-400">🎯 角度解析</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{day.angle_reason}</p>
                      </div>
                      <button
                        onClick={() => copyDayContent(day, i)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-500 hover:text-teal-600 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-teal-500 transition-colors"
                      >
                        {copiedDay === i ? (
                          <>
                            <Check size={16} className="text-emerald-500" /> 已复制到剪贴板
                          </>
                        ) : (
                          <>
                            <Copy size={16} /> 复制本篇内容
                          </>
                        )}
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
