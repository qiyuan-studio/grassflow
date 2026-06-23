"use client";

import { useState } from "react";
import { Sparkles, Loader2, Image as ImageIcon, Download, Copy, Check, RefreshCw } from "lucide-react";

interface ImageResult {
  imagePrompt: string;
  placeholderUrl: string;
  tips: string;
}

interface ArticleResult {
  title: string;
  body: string;
  hashtags: string[];
}

export default function ImageFactoryTab() {
  const [product, setProduct] = useState("");
  const [style, setStyle] = useState("ins");
  const [generating, setGenerating] = useState(false);
  const [imageResult, setImageResult] = useState<ImageResult | null>(null);
  const [article, setArticle] = useState<ArticleResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  const styles = [
    { id: "ins", label: "简约INS", desc: "干净高级感" },
    { id: "插画", label: "精美插画", desc: "扁平可爱" },
    { id: "摄影", label: "写实摄影", desc: "真实质感" },
    { id: "手绘", label: "手绘水彩", desc: "温暖治愈" },
  ];

  const handleGenerate = async () => {
    if (!product.trim()) return;
    setGenerating(true);
    setError("");
    setImageResult(null);
    setArticle(null);
    setPreviewUrl("");

    try {
      // 1. 生成配图提示词
      const imgRes = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: product, style }),
      });
      const imgData = await imgRes.json();
      if (!imgData.success) { setError("图片生成失败"); return; }
      setImageResult(imgData);

      // 2. 同时生成文案（调用现有的generate接口）
      const artRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: `${product} 种草`, 
          platform: "xiaohongshu", 
          count: 1,
          tone: "种草"
        }),
      });
      const artData = await artRes.json();
      if (artData.data && artData.data.length > 0) {
        setArticle(artData.data[0]);
      }

      // 3. 尝试用 Unsplash 获取占位图
      const searchTerm = encodeURIComponent(product.split(" ").slice(0, 3).join(" "));
      setPreviewUrl(imgData.placeholderUrl);
    } catch (err) {
      setError("生成出错，请稍后重试");
    } finally {
      setGenerating(false);
    }
  };

  const copyPrompt = () => {
    if (imageResult) {
      navigator.clipboard.writeText(imageResult.imagePrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadImage = async () => {
    if (!previewUrl) return;
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${product}-配图.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(previewUrl, "_blank");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 头部 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="text-pink-500" size={28} />
          AI 图文工厂
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          输入产品名称，AI 自动生成配图 + 种草文案，一站式完成图文内容
        </p>
      </div>

      {/* 输入区 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">产品/主题名称</label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="例如：氨基酸洗面奶、懒人早餐机、办公护腰靠垫..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
          />
        </div>

        {/* 风格选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">配图风格</label>
          <div className="grid grid-cols-4 gap-3">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  style === s.id 
                    ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20" 
                    : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
                }`}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">{s.label}</div>
                <div className="text-xs text-gray-500">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !product.trim()}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {generating ? (
            <><Loader2 className="animate-spin" size={18} /> 生成图文内容...</>
          ) : (
            <><Sparkles size={18} /> 一键生成图文内容</>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">{error}</div>
      )}

      {/* 结果展示 */}
      {article && imageResult && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* 配图预览 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon size={20} className="text-pink-500" />
              配图预览
            </h3>
            
            {previewUrl && (
              <div className="mb-4 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={previewUrl} 
                  alt={product}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x600?text=AI+Image+Prompt+Ready";
                  }}
                />
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI 图片提示词</span>
                <button onClick={copyPrompt} className="text-pink-500 hover:text-pink-600 text-sm flex items-center gap-1">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "已复制" : "复制"}
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{imageResult.imagePrompt}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={downloadImage} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1">
                <Download size={14} /> 下载图片
              </button>
              <button onClick={copyPrompt} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1">
                <Copy size={14} /> 复制提示词
              </button>
            </div>
          </div>

          {/* 文案预览 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">种草文案</h3>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">{article.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">{article.body}</p>
            </div>

            {article.hashtags && article.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.hashtags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const text = `${article.title}\n\n${article.body}\n\n${article.hashtags?.join(" ") || ""}`;
                  navigator.clipboard.writeText(text);
                }}
                className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center justify-center gap-1"
              >
                <Copy size={14} /> 复制全文
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 使用场景提示 */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 rounded-2xl p-6 border border-pink-100 dark:border-pink-800/30">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">💡 使用建议</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>• 生成的配图提示词可直接用于 <strong>Midjourney / Stable Diffusion / DALL-E</strong></li>
          <li>• 文案和配图搭配使用，发布到小红书/抖音效果更佳</li>
          <li>• 建议同一产品生成多组图文，形成内容矩阵</li>
          <li>• 配图风格要与产品调性一致，推荐优先使用"简约INS"风格</li>
        </ul>
      </div>
    </div>
  );
}
