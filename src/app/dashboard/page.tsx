"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, FileText, BarChart3, Settings, LogOut, Loader2, User, RefreshCw, Star, TrendingUp, Edit3, Layout, CopyCheck, CalendarDays, ImageIcon, MessageCircle } from "lucide-react";

// Import tab components
import GenerateTab from "./tabs/generate";
import HistoryTab from "./tabs/history";
import AnalyzeTab from "./tabs/analyze";
import RewriteTab from "./tabs/rewrite";
import TrendingTab from "./tabs/trending";
import TemplatesTab from "./tabs/templates";
import RemixTab from "./tabs/remix";
import ContentPlanTab from "./tabs/content_plan";
import PostCardTab from "./tabs/postcard";
import CommentReplyTab from "./tabs/comment_reply";

type TabId = "generate" | "history" | "analyze" | "rewrite" | "trending" | "templates" | "remix" | "contentPlan" | "postcard" | "commentReply";

const TABS: { id: TabId; label: string; icon: any; color: string }[] = [
  { id: "generate", label: "生成内容", icon: Sparkles, color: "emerald" },
  { id: "rewrite", label: "批量改写", icon: Edit3, color: "purple" },
  { id: "trending", label: "趋势热点", icon: TrendingUp, color: "blue" },
  { id: "history", label: "历史记录", icon: FileText, color: "orange" },
  { id: "analyze", label: "竞品分析", icon: BarChart3, color: "pink" },
  { id: "templates", label: "模板库", icon: Layout, color: "indigo" },
  { id: "contentPlan", label: "内容排期", icon: CalendarDays, color: "teal" },
  { id: "remix", label: "爆文克隆", icon: CopyCheck, color: "rose" },
  { id: "postcard", label: "图文排版", icon: ImageIcon, color: "pink" },
  { id: "commentReply", label: "评论回复", icon: MessageCircle, color: "blue" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<TabId>("generate");
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  const refreshHistory = () => {
    const t = localStorage.getItem("token");
    if (t) fetchHistory(t);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!token) return null;

  const renderTab = () => {
    switch (tab) {
      case "generate":
        return <GenerateTab token={token} onGenerated={refreshHistory} />;
      case "history":
        return <HistoryTab history={history} loading={loadingHistory} onSelect={(item) => { setTab("generate"); }} />;
      case "analyze":
        return <AnalyzeTab token={token} />;
      case "rewrite":
        return <RewriteTab token={token} />;
      case "trending":
        return <TrendingTab />;
      case "templates":
        return <TemplatesTab token={token} />;
      case "remix":
        return <RemixTab token={token} />;
      case "contentPlan":
        return <ContentPlanTab token={token} />;
      case "postcard":
        return <PostCardTab />;
      case "commentReply":
        return <CommentReplyTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            <span className="text-emerald-500">🌿</span>
            <span className="bg-gradient-to-r from-emerald-500 to-purple-500 bg-clip-text text-transparent">
              GrassFlow
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</span>
            {user?.subscription?.plan === "free" && (
              <Link href="/buy" className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-purple-500 text-white text-sm rounded-lg hover:opacity-90">
                升级
              </Link>
            )}
            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="退出登录">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Subscription Info */}
        {user?.subscription && (
          <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="text-emerald-500" size={24} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.subscription.plan === "free" ? "免费用户" : user.subscription.plan === "monthly" ? "月度会员" : "永久会员"}
                  </p>
                  <p className="text-sm text-gray-500">
                    每日可生成 {user.subscription.maxGenerations} 篇内容
                    {user.subscription.licenseKey && (
                      <span className="ml-4 font-mono text-xs text-purple-500">License: {user.subscription.licenseKey}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            const colors: Record<string, string> = {
              emerald: isActive ? "bg-emerald-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700",
              teal: isActive ? "bg-teal-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700",
              indigo: isActive ? "bg-indigo-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700",
              purple: isActive ? "bg-purple-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700",
              blue: isActive ? "bg-blue-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700",
              orange: isActive ? "bg-orange-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700",
              pink: isActive ? "bg-pink-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700",
              rose: isActive ? "bg-rose-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700",
            };
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${colors[t.color]}`}
              >
                <Icon size={18} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {renderTab()}
      </div>
    </div>
  );
}
