"use client";

import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, Hash, Image } from "lucide-react";

type Platform = "xiaohongshu" | "douyin" | "weibo" | "zhihu";
interface ContentResult { title: string; content: string; hashtags: string[]; platform: string; }

const PLATFORM_NAMES: Record<Platform, string> = {
  xiaohongshu: "小红书", douyin: "抖音", weibo: "微博", zhihu: "知乎",
};
const TONES = ["种草", "专业", "亲切", "幽默", "干货"];

interface ScoreData {
  overall: number;
  dimensions: { headline: number; engagement: number; platformFit: number; authenticity: number; readability: number };
  strengths: string[];
  suggestions: string[];
  predicted_performance: string;
}

interface ImagePrompt {
  id: number;
  style: string;
  english_prompt: string;
  chinese_description: string;
  recommended_tool: string;
  composition: string;
  color_tone: string;
  usage_tip: string;
}

interface ImagePromptData {
  image_prompts: ImagePrompt[];
  cover_prompt: string;
}

export default function GenerateTab({ token, onGenerated }: { token: string; onGenerated: () => void }) {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("xiaohongshu");
  const [count, setCount] = useState(1);
  const [tone, setTone] = useState("种草");
  const [keywords, setKeywords] = useState("");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<ContentResult[]>([]);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [scoring, setScoring] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<number, ScoreData>>({});
  const [generatingImagePrompt, setGeneratingImagePrompt] = useState<number | null>(null);
  const [imagePrompts, setImagePrompts] = useState<Record<number, ImagePromptData>>({});

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setGenerating(true);
    setError("");
    setResults([]);
    setScores({});

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic, platform, count, tone, keywords: keywords.split(",").map(k => k.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "生成失败"); return; }
      setResults(data.data || []);
      onGenerated();
    } catch { setError("网络错误，请重试"); }
    finally { setGenerating(false); }
  };

  const handleScore = async (result: ContentResult, index: number) => {
    setScoring(index);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: result.content, platform: result.platform, title: result.title }),
      });
      const data = await res.json();
      setScores(prev => ({ ...prev, [index]: data }));
    } catch { /* ignore */ }
    finally { setScoring(null); }
  };

  const handleImagePrompt = async (result: ContentResult, index: number) => {
    setGeneratingImagePrompt(index);
    try {
      const res = await fetch("/api/image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: result.content, title: result.title, platform: result.platform }),
      });
      const data = await res.json();
      setImagePrompts(prev => ({ ...prev, [index]: data }));
    } catch { /* ignore */ }
    finally { setGeneratingImagePrompt(null); }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const dimLabels: Record<string, string> = {
    headline: "标题吸引力", engagement: "互动潜力", platformFit: "平台适配", authenticity: "真实感", readability: "可读性",
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleGenerate} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-emerald-500" size={20} /> 生成种草内容
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">主题/产品名称</label>
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="例如：某品牌防晒霜、某款耳机..." className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">目标平台</label>
            <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="xiaohongshu">小红书</option>
              <option value="douyin">抖音</option>
              <option value="weibo">微博</option>
              <option value="zhihu">知乎</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">语气风格</label>
            <select value={tone} onChange={e => setTone(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
              {TONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">生成篇数</label>
            <input type="number" min={1} max={10} value={count} onChange={e => setCount(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">关键词（逗号分隔）</label>
            <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="平价、学生党、好用" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>
        <button type="submit" disabled={generating || !topic.trim()} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
          {generating ? <><Loader2 className="animate-spin" size={18} /> AI 生成中...</> : <><Sparkles size={18} /> AI 批量生成</>}
        </button>
      </form>

      {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">{error}</div>}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">生成结果 ({results.length}篇)</h3>
          {results.map((result, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{result.title}</h4>
                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">{PLATFORM_NAMES[platform]}</span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">{result.content}</div>
              <div className="flex flex-wrap gap-2 mb-4">
                {result.hashtags.map((tag, j) => (
                  <span key={j} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full"><Hash size={10} />{tag.replace("#","")}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => copyToClipboard(`${result.title}\n\n${result.content}\n\n${result.hashtags.join(" ")}`, i)} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-emerald-500 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-emerald-500 transition-colors">
                  {copiedIndex === i ? <><Check size={16} className="text-emerald-500" /> 已复制</> : <><Copy size={16} /> 复制全文</>}
                </button>
                <button onClick={() => handleScore(result, i)} disabled={scoring === i} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-purple-500 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-500 transition-colors disabled:opacity-50">
                  {scoring === i ? <Loader2 className="animate-spin" size={16} /> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
                  AI 评分
                </button>
                <button onClick={() => handleImagePrompt(result, i)} disabled={generatingImagePrompt === i} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-amber-500 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-amber-500 transition-colors disabled:opacity-50">
                  {generatingImagePrompt === i ? <Loader2 className="animate-spin" size={16} /> : <Image size={16} />}
                  配图Prompt
                </button>
              </div>

              {/* Score Card */}
              {scores[i] && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">内容质量评分</span>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-300">{scores[i].overall}<span className="text-sm font-normal">/100</span></span>
                  </div>
                  {/* Dimension bars */}
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {Object.entries(scores[i].dimensions).map(([key, val]) => (
                      <div key={key} className="text-center">
                        <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg relative overflow-hidden mb-1">
                          <div className="absolute bottom-0 w-full bg-gradient-to-t from-purple-400 to-purple-500 rounded-b-lg transition-all" style={{ height: `${val}%` }}></div>
                        </div>
                        <span className="text-[10px] text-gray-500">{dimLabels[key]}</span>
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{val}</div>
                      </div>
                    ))}
                  </div>
                  {/* Strengths */}
                  <div className="mb-2">
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">✅ 优势：</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {scores[i].strengths.map((s, si) => <span key={si} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">{s}</span>)}
                    </div>
                  </div>
                  {/* Suggestions */}
                  <div className="mb-2">
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">💡 改进建议：</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {scores[i].suggestions.map((s, si) => <span key={si} className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full">{s}</span>)}
                    </div>
                  </div>
                  {/* Predicted performance */}
                  <div className="text-center text-sm font-medium text-purple-600 dark:text-purple-400">{scores[i].predicted_performance}</div>
                </div>
              )}

              {/* Image Prompt Card */}
              {imagePrompts[i] && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Image size={18} className="text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">配图Prompt方案</span>
                  </div>
                  {/* Cover Prompt */}
                  <div className="mb-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-amber-200 dark:border-amber-700">
                    <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">📌 封面图Prompt</div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-mono whitespace-pre-wrap break-all">{imagePrompts[i].cover_prompt}</p>
                    <button onClick={() => { navigator.clipboard.writeText(imagePrompts[i].cover_prompt); }} className="mt-1 text-xs text-amber-500 hover:text-amber-600 flex items-center gap-1">
                      <Copy size={12} /> 复制
                    </button>
                  </div>
                  {/* Individual Prompts */}
                  <div className="grid gap-3">
                    {imagePrompts[i].image_prompts.map((prompt, pi) => (
                      <div key={pi} className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-amber-200 dark:border-amber-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-800 dark:text-white">方案{pi + 1}：{prompt.style}</span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">{prompt.recommended_tool}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">🎨 {prompt.chinese_description}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-600 p-2 rounded mb-1 break-all">{prompt.english_prompt}</p>
                        <div className="flex flex-wrap gap-1 text-xs text-gray-400">
                          <span>构图：{prompt.composition}</span>
                          <span className="mx-1">|</span>
                          <span>色调：{prompt.color_tone}</span>
                          <span className="mx-1">|</span>
                          <span>💡 {prompt.usage_tip}</span>
                        </div>
                        <button onClick={() => { navigator.clipboard.writeText(prompt.english_prompt); }} className="mt-1 text-xs text-amber-500 hover:text-amber-600 flex items-center gap-1">
                          <Copy size={12} /> 复制Prompt
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
