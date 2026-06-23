"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPwd) {
      setError("两次密码不一致");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ email: data.email, userId: data.userId }));
      router.push("/dashboard");
    } catch (err) {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold">
            <span className="text-emerald-500">🌿</span>
            <span className="bg-gradient-to-r from-emerald-500 to-purple-500 bg-clip-text text-transparent">
              GrassFlow
            </span>
          </Link>
          <p className="text-gray-500 dark:text-gray-400 mt-2">创建你的账号，开始批量种草</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少6位"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              确认密码
            </label>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="再次输入密码"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "注册中..." : "免费注册"}
          </button>

          <p className="text-center text-sm text-gray-500">
            已有账号？{" "}
            <Link href="/login" className="text-emerald-500 hover:underline">
              登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
