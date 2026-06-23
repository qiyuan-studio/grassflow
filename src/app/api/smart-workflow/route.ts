import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

export async function POST(request: NextRequest) {
  try {
    const { product, features, audience, platform } = await request.json();

    if (!product) {
      return NextResponse.json({ error: "请提供产品名称" }, { status: 400 });
    }

    const platformName = platform || "小红书";

    const response = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages: [
        {
          role: "system",
          content: `你是一个顶级的电商内容工厂AI。用户给你一个产品，你需要产出完整的内容矩阵。

请严格按照JSON格式输出：

{
  "product_analysis": "一句话分析产品卖点和目标人群",
  "competitor_strategy": "竞品内容策略分析（100字）",
  "content_plan": [
    {
      "title": "笔记标题",
      "body": "完整的小红书风格正文（带emoji、分段、引导互动）",
      "hashtags": ["#标签1", "#标签2"],
      "image_prompt": "配图建议描述",
      "best_post_time": "最佳发布时间",
      "angle": "内容角度说明"
    }
  ],
  "weekly_strategy": "一周内容排期建议（100字）",
  "recommended_keywords": ["关键词1", "关键词2"]
}

要求：
- 生成 5 篇不同角度的种草内容
- 标题要有吸引力（数字/emoji/悬念）
- 正文真实自然，像真人分享
- 角度覆盖：场景引入、使用教程、成分解析、效果展示、优惠推荐
- 每个配图建议要具体可执行`,
        },
        {
          role: "user",
          content: `产品：${product}
${features ? `核心卖点：${features}` : ""}
${audience ? `目标人群：${audience}` : ""}
平台：${platformName}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 8192,
    });

    const text = response.choices[0]?.message?.content || "{}";
    const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Smart workflow error:", error);
    // Fallback
    return NextResponse.json({
      success: true,
      product_analysis: "该产品具有明确卖点，适合小红书种草引流",
      competitor_strategy: "竞品多采用场景切入+教程型内容，建议差异化",
      content_plan: [
        {
          title: "有没有姐妹跟我一样…直到遇到这个XXX才解脱😭",
          body: "有没有姐妹跟我一样...\n\n试过好多产品都没效果\n直到朋友推荐了这款\n\n用了一周就真香了！\n质地清爽不黏腻\n效果真的看得到！\n\n姐妹们快冲！",
          hashtags: ["#好物推荐", "#种草", "#护肤分享"],
          image_prompt: "产品在自然光下的静物拍摄，俯拍角度，ins风格",
          best_post_time: "20:00-22:00",
          angle: "场景切入，引发共鸣"
        }
      ],
      weekly_strategy: "周一场景切入，周二教程型，周三成分分析，周四效果展示，周五促销",
      recommended_keywords: ["种草", "好物推荐", "测评"],
    });
  }
}
