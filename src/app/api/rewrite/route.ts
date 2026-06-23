import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { verifyToken } from "@/lib/auth";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  let userId: number | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    const payload = verifyToken(authHeader.slice(7));
    if (payload) userId = payload.userId;
  }

  try {
    const { topic, platform, count = 5, tone, keywords } = await request.json();
    if (!topic) {
      return NextResponse.json({ error: "请提供主题" }, { status: 400 });
    }

    const platformName = 
      platform === "xiaohongshu" ? "小红书" :
      platform === "douyin" ? "抖音" :
      platform === "weibo" ? "微博" : "知乎";

    const toneDesc = tone || "种草";

    const response = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages: [
        {
          role: "system",
          content: `你是顶级小红书/抖音种草内容写手。你的任务是用不同的角度和话术，为同一个产品生成${count}篇完全不同的种草笔记。

要求：
✅ 每篇角度不同（如：成分党角度、学生党角度、测评角度、生活场景角度、对比角度）
✅ 标题风格不同（悬念式、数字式、对比式、痛点式、场景式）
✅ 话术和表达方式不同
✅ 真实感强，像不同真实用户分享
✅ 每篇至少300字
❌ 不要内容雷同
❌ 不要AI味太重

每篇格式：
-----
标题：[标题]

正文内容...

话题标签：#标签1 #标签2 ...`,
        },
        {
          role: "user",
          content: `产品/主题：${topic}
目标平台：${platformName}
语气风格：${toneDesc}
${keywords ? `关键词：${keywords}` : ""}
篇数：${count}`,
        },
      ],
      temperature: 0.9,  // 高温度保证多样性
      max_tokens: 4096,
    });

    const text = response.choices[0]?.message?.content || "";
    
    // Parse sections
    const sections = text.split("-----").filter(s => s.trim());
    const results = sections.slice(0, count).map((section) => {
      const titleMatch = section.match(/标题[：:]\s*(.+)/);
      const title = titleMatch?.[1]?.trim() || `${platformName}笔记`;
      const hashtagMatches = section.matchAll(/#([^\s#]+)/g);
      const hashtags = Array.from(hashtagMatches, m => m[0]);
      const content = section
        .replace(/标题[：:].+\n?/, "")
        .replace(/#[^\s#]+/g, "")
        .trim();
      return { title, content, hashtags, platform };
    });

    return NextResponse.json({ success: true, data: results, total: results.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "改写失败" },
      { status: 500 }
    );
  }
}
