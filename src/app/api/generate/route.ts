import { NextRequest, NextResponse } from "next/server";
import { generateContent, type GenerateOptions } from "@/lib/deepseek";
import { verifyToken } from "@/lib/auth";
import { getSubscription, logGeneration, getGenerationCountToday, getUserGenerationCountToday, saveContent } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, platform, count, tone, keywords } = body;

    if (!topic || !platform) {
      return NextResponse.json(
        { error: "请提供主题和平台" },
        { status: 400 }
      );
    }

    const validPlatforms = ["xiaohongshu", "douyin", "weibo", "zhihu"];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: "不支持的平台，可选: xiaohongshu, douyin, weibo, zhihu" },
        { status: 400 }
      );
    }

    // Get auth token
    const authHeader = request.headers.get("authorization");
    let userId: number | null = null;
    let userInfo: any = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.userId;
        userInfo = { userId: payload.userId, email: payload.email };
      }
    }

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    
    if (userId) {
      const subscription = getSubscription(userId) as any;
      const todayCount = getUserGenerationCountToday(userId);
      const maxGen = subscription?.max_generations || 3;
      
      if (todayCount + (count || 1) > maxGen) {
        return NextResponse.json(
          { error: `今日生成次数已达上限 (${maxGen}次)` },
          { status: 429 }
        );
      }
    } else {
      // Free demo: 3 generations per IP per day
      const todayCount = getGenerationCountToday(ip);
      if (todayCount + (count || 1) > 3) {
        return NextResponse.json(
          { error: "免费体验每日限3次，请登录后继续使用" },
          { status: 429 }
        );
      }
    }

    // Generate content
    const options: GenerateOptions = {
      topic,
      platform,
      count: Math.min(count || 1, 10), // Max 10 per request
      tone,
      keywords,
    };

    const results = await generateContent(options);
    
    // Save to DB and log
    const tokensUsed = JSON.stringify(results).length;
    for (const result of results) {
      saveContent(userId, platform, topic, result.title, result.content, result.hashtags, tokensUsed);
    }
    logGeneration(ip, userId, platform, results.length);

    return NextResponse.json({
      success: true,
      data: results,
      user: userInfo,
    });
  } catch (error: any) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error.message || "生成失败，请稍后重试" },
      { status: 500 }
    );
  }
}
