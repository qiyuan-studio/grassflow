"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, FileText, BarChart3, Settings, LogOut,
  Copy, Check, Loader2, RefreshCw, ChevronDown,
  Hash, Globe, User
} from "lucide-react";

type Platform = "xiaohongshu" | "douyin" | "weibo" | "zhihu";

interface ContentResult {
  title: string;
  content: string;
  hashtags: string[];
  platform: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"generate" | "history" | "analyze">("generate");

  // Generate form
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("xiaohongshu");
  const [count, setCount] = useState(1);
  const [tone, setTone] = useState("种草");
  const [keywords, setKeywords] = useState("");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<ContentResult[]>([]);
  const [error, setError] = useState("");

  // History
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Analyze
  const [product, setProduct] = useState("");
  const [analyzePlatform, setAnalyzePlatform] = useState("xiaohongshu");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState("");

  // Copy
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
    setUser(u ? JSON.parse(u) : null);
    fetchHistory(t);
  }, []);

  const fetchHistory = async (t: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/user", {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.data.history || []);
        setUser((prev: any) => ({ ...prev, ...data.data.user }));
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setGenerating(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          platform,
          count,
          tone,
          keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "生成失败");
        return;
      }

      setResults(data.data || []);
      fetchHistory(token!);
    } catch (err) {
      setError("网络错误，请重试");
    } finally {
      setGenerating(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim()) return;

    setAnalyzing(true);
    setAnalysis("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product, platform: analyzePlatform }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "分析失败");
        return;
      }

      setAnalysis(data.data);
    } catch (err) {
      setError("网络错误，请重试");
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const platformNames: Record<Platform, string> = {
    xiaohongshu: "小红书",
    douyin: "抖音",
    weibo: "微博",
    zhihu: "知乎",
  };

  const tones = ["种草", "专业", "亲切", "幽默", "干货"];

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            <span className="text-emerald-500">🌿</span>
            <span className="bg-gradient-to-r from-emerald-500 to-purple-500 bg-clip-text text-transparent">
              GrassFlow
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email}
            </span>
            {user?.subscription?.plan === "free" && (
              <Link
                href="/buy"
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-purple-500 text-white text-sm rounded-lg hover:opacity-90"
              >
                升级
              </Link>
            )}
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="退出登录"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Subscription Info */}
        {user?.subscription && (
          <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="text-emerald-500" size={24} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.subscription.plan === "free"
                      ? "免费用户"
                      : user.subscription.plan === "monthly"
                      ? "月度会员"
                      : "永久会员"}
                  </p>
                  <p className="text-sm text-gray-500">
                    每日可生成 {user.subscription.maxGenerations} 篇内容
                    {user.subscription.licenseKey && (
                      <span className="ml-4 font-mono text-xs text-purple-500">
                        License: {user.subscription.licenseKey}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "generate" as const, label: "生成内容", icon: Sparkles },
            { id: "history" as const, label: "历史记录", icon: FileText },
            { id: "analyze" as const, label: "竞品分析", icon: BarChart3 },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t.id
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon size={18} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main panel */}
          <div>
            {tab === "generate" && (
              <div className="space-y-6">
                {/* Form */}
                <form onSubmit={handleGenerate} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="text-emerald-500" size={20} />
                    生成种草内容
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      主题/产品名称
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="例如：某品牌防晒霜、某款耳机..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        目标平台
                      </label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as Platform)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      >
                        <option value="xiaohongshu">小红书</option>
                        <option value="douyin">抖音</option>
                        <option value="weibo">微博</option>
                        <option value="zhihu">知乎</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        语气风格
                      </label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      >
                        {tones.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        生成篇数
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        关键词（逗号分隔）
                      </label>
                      <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="平价、学生党、好用"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={generating || !topic.trim()}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        AI 生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        AI 批量生成
                      </>
                    )}
                  </button>
                </form>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      生成结果 ({results.length}篇)
                    </h3>
                    {results.map((result, i) => (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {result.title}
                          </h4>
                          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">
                            {platformNames[platform]}
                          </span>
                        </div>

                        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
                          {result.content}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {result.hashtags.map((tag, j) => (
                            <span key={j} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                              <Hash size={10} />
                              {tag}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${result.title}\n\n${result.content}\n\n${result.hashtags.join(" ")}`,
                              i
                            )
                          }
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-emerald-500 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-emerald-500 transition-colors"
                        >
                          {copiedIndex === i ? (
                            <>
                              <Check size={16} className="text-emerald-500" /> 已复制
                            </>
                          ) : (
                            <>
                              <Copy size={16} /> 复制全文
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "history" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="text-emerald-500" size={20} />
                  历史记录
                </h2>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FileText size={48} className="mx-auto mb-3 opacity-50" />
                    <p>还没有生成记录</p>
                    <p className="text-sm">去"生成内容"开始你的第一篇种草笔记吧</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setTab("generate");
                          setResults([{
                            title: item.title,
                            content: item.content,
                            hashtags: JSON.parse(item.hashtags || "[]"),
                            platform: item.platform,
                          }]);
                        }}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {item.title || item.topic}
                          </h4>
                          <span className="text-xs text-gray-400">
                            {new Date(item.created_at).toLocaleDateString("zh-CN")}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          平台: {item.platform} | 主题: {item.topic}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "analyze" && (
              <div className="space-y-6">
                <form onSubmit={handleAnalyze} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="text-purple-500" size={20} />
                    竞品内容分析
                  </h2>
                  <p className="text-sm text-gray-500">
                    分析你的产品在目标平台上的竞品笔记策略，获得可执行的建议
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      产品名称
                    </label>
                    <input
                      type="text"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      placeholder="例如：XX品牌面膜"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      目标平台
                    </label>
                    <select
                      value={analyzePlatform}
                      onChange={(e) => setAnalyzePlatform(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    >
                      <option value="xiaohongshu">小红书</option>
                      <option value="douyin">抖音</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={analyzing || !product.trim()}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-emerald-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        AI 分析中...
                      </>
                    ) : (
                      <>
                        <BarChart3 size={18} />
                        开始分析
                      </>
                    )}
                  </button>
                </form>

                {analysis && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      分析结果
                    </h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {analysis}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Globe className="text-emerald-500" size={18} />
                使用提示
              </h3>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>✨ 主题越具体，生成的内容越精准</li>
                <li>📝 添加关键词可以控制内容方向</li>
                <li>🎯 不同平台的语气风格会自动适配</li>
                <li>📊 竞品分析帮你找到差异化优势</li>
                <li>🚀 批量生成最高10篇，一次搞定一周内容</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-purple-500 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">🚀 升级会员</h3>
              <p className="text-sm opacity-90 mb-4">
                每日生成更多内容，解锁竞品分析、批量导出等高级功能
              </p>
              <Link
                href="/buy"
                className="block text-center py-2 bg-white text-emerald-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                查看方案
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
