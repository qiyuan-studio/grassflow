"use client";

import { useState, useRef, useCallback } from "react";
import { ImageIcon, Sparkles, Download, Copy, Check, Loader2, RefreshCw } from "lucide-react";

interface CardContent {
  title: string;
  body: string;
  hashtags: string[];
  imagePrompt?: string;
}

type CardStyle = "xiaohongshu" | "minimal" | "elegant";

const STYLE_LABELS: Record<CardStyle, string> = {
  xiaohongshu: "小红书风格",
  minimal: "简约清新",
  elegant: "优雅商务",
};

const STYLE_COLORS: Record<CardStyle, { bg: string; title: string; text: string; accent: string; tag: string }> = {
  xiaohongshu: { bg: "#FFF5F5", title: "#FF6B6B", text: "#2D3436", accent: "#FF8E8E", tag: "#FFE0E0" },
  minimal: { bg: "#F8F9FA", title: "#2D3436", text: "#636E72", accent: "#00B894", tag: "#E0F7F4" },
  elegant: { bg: "#FAF8F5", title: "#8B4513", text: "#5D4037", accent: "#C4A882", tag: "#F0E8DC" },
};

export default function PostCardTab() {
  const [product, setProduct] = useState("");
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState<"xiaohongshu" | "douyin" | "weibo" | "zhihu">("xiaohongshu");
  const [cardStyle, setCardStyle] = useState<CardStyle>("xiaohongshu");
  const [generating, setGenerating] = useState(false);
  const [cardData, setCardData] = useState<CardContent | null>(null);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!product.trim() && !content.trim()) return;
    setGenerating(true);
    setError("");
    setCardData(null);

    try {
      // 如果有已生成的内容，直接用它构建卡片
      if (content.trim() && !product.trim()) {
        setCardData({
          title: "",
          body: content,
          hashtags: [],
        });
        setGenerating(false);
        return;
      }

      // 调用 AI 生成带配图建议的内容
      const res = await fetch("/api/image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product,
          platform: platform,
          count: 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "生成失败");
        return;
      }

      const item = data.data?.[0] || data;
      setCardData({
        title: item.title || product,
        body: item.content || item.body || content,
        hashtags: item.hashtags || [],
        imagePrompt: item.imagePrompt || item.image_suggestions || "",
      });
    } catch (e: any) {
      setError("网络错误: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = useCallback(async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: STYLE_COLORS[cardStyle].bg,
        useCORS: true,
        logging: false,
        width: 480,
      });
      const link = document.createElement("a");
      link.download = `grassflow-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e: any) {
      setError("导出失败: " + e.message);
    } finally {
      setExporting(false);
    }
  }, [cardStyle]);

  const handleCopyText = () => {
    if (!cardData) return;
    const text = `【${cardData.title}】\n\n${cardData.body}\n\n${cardData.hashtags.join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const colors = STYLE_COLORS[cardStyle];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="text-pink-500" size={24} />
          小红书图文排版
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          将AI生成的内容渲染成精美的小红书风格长图，一键导出分享
        </p>
      </div>

      {/* 输入区 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">产品名称</label>
            <input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="例如：氨基酸洗面奶"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">目标平台</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-400 outline-none"
            >
              <option value="xiaohongshu">小红书</option>
              <option value="douyin">抖音</option>
              <option value="weibo">微博</option>
              <option value="zhihu">知乎</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">卡片风格</label>
          <div className="flex gap-2">
            {(Object.keys(STYLE_LABELS) as CardStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setCardStyle(style)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  cardStyle === style
                    ? "bg-pink-500 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {STYLE_LABELS[style]}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            或直接粘贴已生成的内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="粘贴已生成的小红书文案..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-400 outline-none resize-none"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || (!product.trim() && !content.trim())}
          className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {generating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {generating ? "生成中..." : cardData ? "重新生成" : "生成排版内容"}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* 卡片预览 */}
      {cardData && (
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* 卡片 */}
          <div className="shrink-0" style={{ width: 480, maxWidth: "100%" }}>
            <div
              ref={cardRef}
              style={{
                width: 480,
                padding: "32px 28px",
                backgroundColor: colors.bg,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Noto Sans SC', sans-serif",
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              {/* 头部装饰线 */}
              <div style={{ height: 4, width: 60, background: colors.accent, borderRadius: 2, marginBottom: 20 }} />

              {/* 标题 */}
              {cardData.title && (
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: colors.title,
                    lineHeight: 1.4,
                    marginBottom: 8,
                  }}
                >
                  {cardData.title}
                </h1>
              )}

              {/* 配图提示 */}
              {cardData.imagePrompt && (
                <div
                  style={{
                    backgroundColor: colors.accent + "18",
                    borderRadius: 12,
                    padding: "12px 16px",
                    marginBottom: 16,
                    border: `1px solid ${colors.accent}30`,
                  }}
                >
                  <p style={{ fontSize: 12, color: colors.accent, fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
                    📸 配图建议
                  </p>
                  <p style={{ fontSize: 13, color: colors.text, opacity: 0.8, lineHeight: 1.5 }}>
                    {cardData.imagePrompt}
                  </p>
                </div>
              )}

              {/* 正文 */}
              <div
                style={{
                  fontSize: 15,
                  color: colors.text,
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  marginTop: 12,
                }}
              >
                {cardData.body}
              </div>

              {/* 分隔线 */}
              <div style={{ height: 1, background: colors.accent + "40", margin: "20px 0" }} />

              {/* 标签 */}
              {cardData.hashtags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {cardData.hashtags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        backgroundColor: colors.tag,
                        color: colors.accent,
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 底部水印 */}
              <div style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: colors.accent + "80" }}>
                Made with 🌿 GrassFlow
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-row md:flex-col gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-5 py-2.5 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {exporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
              导出图片
            </button>
            <button
              onClick={handleCopyText}
              className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              {copied ? "已复制" : "复制文案"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
