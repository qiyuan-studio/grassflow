import OpenAI from "openai";

const apiKey = process.env.DEEPSEEK_API_KEY || "";
const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

const client = new OpenAI({
  apiKey,
  baseURL,
});

export interface GenerateOptions {
  topic: string;
  platform: "xiaohongshu" | "douyin" | "weibo" | "zhihu";
  count?: number;
  tone?: "专业" | "亲切" | "幽默" | "种草" | "干货";
  keywords?: string[];
}

export interface ContentResult {
  title: string;
  content: string;
  hashtags: string[];
  platform: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  xiaohongshu: `你是一个小红书爆款笔记写手。请根据用户提供的主题生成高质量的种草笔记。

要求：
1. 标题要吸引眼球，使用数字、emoji、悬念等技巧
2. 正文要有真实感，像真人分享
3. 段落短小精悍，善用emoji分隔
4. 结尾要引导互动（点赞/收藏/关注）
5. 配上5-10个相关话题标签
6. 语气亲切自然，像朋友推荐

格式：
---
标题: [吸引眼球的标题]

正文内容...

话题标签：#标签1 #标签2 ...`,

  douyin: `你是一个抖音短视频文案写手。请根据用户提供的主题生成短视频口播文案。

要求：
1. 前3秒要有钩子，抓住观众注意力
2. 语言口语化，节奏快
3. 每段15-30秒的节奏
4. 结尾引导点赞关注
5. 配上热门话题标签

格式：
---
标题: [视频标题]

【口播文案】

话题标签：#标签1 #标签2 ...`,

  weibo: `你是一个微博爆款内容写手。请根据用户提供的主题生成微博内容。

要求：
1. 140字内抓住眼球
2. 善用热点话题
3. 搭配图片建议
4. 引导转发互动
5. 配上话题标签

格式：
---
标题: [内容标题]

正文内容...

话题标签：#标签1 #标签2 ...`,

  zhihu: `你是一个知乎高赞回答写手。请根据用户提供的主题生成知乎回答。

要求：
1. 开头要有"谢邀"感
2. 结构清晰，分点论述
3. 有真实经历/数据支撑
4. 结尾总结升华
5. 配上相关话题标签

格式：
---
标题: [回答标题]

正文内容...

话题标签：#标签1 #标签2 ...`,
};

export async function generateContent(options: GenerateOptions): Promise<ContentResult[]> {
  const { topic, platform, count = 1, tone = "种草", keywords = [] } = options;
  const systemPrompt = SYSTEM_PROMPTS[platform] || SYSTEM_PROMPTS.xiaohongshu;
  const keywordStr = keywords.length > 0 ? `\n关键词：${keywords.join("、")}` : "";

  const userPrompt = `请生成${count}篇${platform === "xiaohongshu" ? "小红书" : platform === "douyin" ? "抖音" : platform === "weibo" ? "微博" : "知乎"}内容。
主题：${topic}
语气风格：${tone}${keywordStr}

请严格按照格式输出每篇内容，用 "---" 分隔不同的文章。`;

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 4096,
  });

  const text = response.choices[0]?.message?.content || "";
  return parseContent(text, platform, count);
}

function parseContent(text: string, platform: string, expectedCount: number): ContentResult[] {
  const sections = text.split("---").filter(s => s.trim().length > 0);
  const results: ContentResult[] = [];

  for (const section of sections) {
    const titleMatch = section.match(/标题[：:]\s*(.+)/);
    const title = titleMatch?.[1]?.trim() || `${platform}笔记`;

    // Extract hashtags
    const hashtagMatches = section.matchAll(/#([^\s#]+)/g);
    const hashtags = Array.from(hashtagMatches, m => m[0]).slice(0, 10);

    // Content is everything except title line and hashtags
    let content = section
      .replace(/标题[：:].+\n?/, "")
      .replace(/#[^\s#]+/g, "")
      .trim();

    results.push({ title, content, hashtags, platform });
  }

  return results.slice(0, expectedCount);
}

export async function analyzeCompetitor(product: string, platform: string): Promise<string> {
  const platformName = 
    platform === "xiaohongshu" ? "小红书" :
    platform === "douyin" ? "抖音" : "全平台";

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "你是一个电商竞品分析专家。分析用户提供的产品在目标平台上的竞品笔记策略，给出可执行的建议。",
      },
      {
        role: "user",
        content: `产品：${product}\n平台：${platformName}\n\n请分析：\n1. 这类产品在平台上的热门笔记特点\n2. 竞品常用的标题模式和关键词\n3. 建议的差异化内容策略\n4. 预估的流量和互动规律`,
      },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });

  return response.choices[0]?.message?.content || "";
}
