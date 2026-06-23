"use client";

import { useState } from "react";
import { MessageCircle, Sparkles, Copy, Check, Loader2, Plus, Trash2, Send, Bot } from "lucide-react";

interface ReplyItem {
  original_comment: string;
  reply: string;
  strategy: string;
  tone: string;
}

export default function CommentReplyTab() {
  const [comments, setComments] = useState<string[]>([""]);
  const [productInfo, setProductInfo] = useState("");
  const [tone, setTone] = useState("亲切自然");
  const [generating, setGenerating] = useState(false);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  const addComment = () => setComments([...comments, ""]);
  const removeComment = (i: number) => {
    if (comments.length <= 1) return;
    setComments(comments.filter((_, idx) => idx !== i));
  };

  const updateComment = (i: number, val: string) => {
    const updated = [...comments];
    updated[i] = val;
    setComments(updated);
  };

  const handleGenerate = async () => {
    const validComments = comments.filter(c => c.trim());
    if (validComments.length === 0) {
      setError("请至少输入一条评论");
      return;
    }
    setGenerating(true);
    setError("");
    setReplies([]);

    try {
      const res = await fetch("/api/comment-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comments: validComments,
          productInfo: productInfo || undefined,
          tone: tone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "生成失败");
        return;
      }
      setReplies(data.replies || []);
    } catch (e: any) {
      setError("网络错误: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyAllReplies = () => {
    const text = replies
      .map((r, i) => `评论: ${r.original_comment}\n回复: ${r.reply}\n`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copySingle = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const tones = ["亲切自然", "专业严谨", "幽默风趣", "热情洋溢", "温柔体贴"];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="text-blue-500" size={24} />
          AI 评论回复助手
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          输入粉丝评论，AI 一键生成自然真实的回复，提升互动率和账号活跃度
        </p>
      </div>

      {/* 输入区 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            👥 输入粉丝评论 <span className="text-gray-400 font-normal">(每条一行)</span>
          </label>
          <div className="space-y-2">
            {comments.map((comment, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <input
                  value={comment}
                  onChange={(e) => updateComment(i, e.target.value)}
                  placeholder="例如：这个真的有用吗？"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <button
                  onClick={() => removeComment(i)}
                  disabled={comments.length <= 1}
                  className="p-2.5 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addComment}
            className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 transition-colors"
          >
            <Plus size={16} /> 添加评论
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">回复语气</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none"
            >
              {tones.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              产品信息 <span className="text-gray-400 font-normal">(选填，帮助AI了解上下文)</span>
            </label>
            <input
              value={productInfo}
              onChange={(e) => setProductInfo(e.target.value)}
              placeholder="例如：氨基酸洗面奶，温和不刺激"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || comments.every(c => !c.trim())}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {generating ? <Loader2 className="animate-spin" size={18} /> : <Bot size={18} />}
          {generating ? "生成回复中..." : "AI 生成回复"}
        </button>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* 结果 */}
      {replies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              生成回复 ({replies.length}条)
            </h3>
            <button
              onClick={copyAllReplies}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {copiedIndex === -1 ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copiedIndex === -1 ? "已复制全部" : "复制全部"}
            </button>
          </div>

          {replies.map((item, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* 评论原文 */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0">
                    <MessageCircle size={16} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-0.5">粉丝评论</p>
                    <p className="text-gray-900 dark:text-white">{item.original_comment}</p>
                  </div>
                </div>
              </div>

              {/* AI 回复 */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">AI 回复</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full">
                          {item.strategy}
                        </span>
                        <button
                          onClick={() => copySingle(item.reply, i)}
                          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                          title="复制回复"
                        >
                          {copiedIndex === i ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">{item.reply}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
