"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, Shield, Zap, Infinity, Crown } from "lucide-react";

export default function BuyPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
  }, []);

  const handleBuy = async (plan: "monthly" | "permanent") => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "购买失败");
        return;
      }

      setResult(data.data);
    } catch (err) {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: "free" as const,
      name: "免费",
      price: "¥0",
      period: "",
      description: "适合个人体验",
      features: [
        "每日3次生成",
        "支持4大平台",
        "基础种草模板",
        "Web端使用",
      ],
      popular: false,
    },
    {
      id: "monthly" as const,
      name: "专业版",
      price: "¥69",
      period: "/月",
      description: "适合内容创作者",
      features: [
        "每日999次生成",
        "支持4大平台",
        "所有语气风格",
        "竞品分析功能",
        "批量导出",
        "优先支持",
      ],
      popular: true,
    },
    {
      id: "permanent" as const,
      name: "永久版",
      price: "¥499",
      period: "一次性",
      description: "适合团队/长期使用",
      features: [
        "每日9999次生成",
        "所有专业版功能",
        "永久更新",
        "专属 License Key",
        "VIP 支持",
        "API 接口",
      ],
      popular: false,
    },
  ];

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            <span className="text-emerald-500">🌿</span>
            <span className="bg-gradient-to-r from-emerald-500 to-purple-500 bg-clip-text text-transparent">
              GrassFlow
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-500"
          >
            返回控制台
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            选择你的方案
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            从免费体验开始，按需升级。所有方案均包含 AI 种草内容批量生成功能。
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 p-8 ${
                plan.popular
                  ? "border-emerald-500 scale-105"
                  : "border-gray-100 dark:border-gray-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-purple-500 text-white text-xs font-medium px-4 py-1 rounded-full">
                  最受欢迎
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.id !== "free" && (
                <button
                  onClick={() => handleBuy(plan.id === "monthly" ? "monthly" : "permanent")}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-emerald-500 to-purple-500 text-white hover:opacity-90"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                  } disabled:opacity-50`}
                >
                  {loading ? "处理中..." : `立即购买 ${plan.price}`}
                </button>
              )}

              {plan.id === "free" && (
                <Link
                  href="/dashboard"
                  className="block w-full py-3 text-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  免费开始
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Success */}
        {result && (
          <div className="max-w-md mx-auto mt-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="text-emerald-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
              🎉 购买成功！
            </h3>
            <p className="text-emerald-600 dark:text-emerald-500 mb-4">
              你的 License Key 已生成
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 font-mono text-sm text-gray-700 dark:text-gray-300 mb-4 border border-emerald-200 dark:border-emerald-800">
              {result.licenseKey}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              有效期至: {new Date(result.expiresAt).toLocaleDateString("zh-CN")}
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90"
            >
              前往控制台
            </Link>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto mt-8 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
