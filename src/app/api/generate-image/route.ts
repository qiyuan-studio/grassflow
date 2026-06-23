import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, style } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "请提供图片描述" }, { status: 400 });
    }

    // 用 DeepSeek 优化图片描述 prompt
    const styleInstruction = style === "插画" ? "插画风格, 扁平化, 色彩鲜艳, 适合社交媒体" :
                             style === "摄影" ? "摄影写实风格, 光影真实, 高清质感" :
                             style === "手绘" ? "手绘风格, 水彩质感, 温暖柔和" :
                             "ins风格, 干净简约, 高级感";
    
    const response = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages: [
        {
          role: "system",
          content: `你是一个专业的 AI 图片提示词工程师。根据用户的需求，生成高质量的英文图片生成提示词。

要求：
1. 将用户的描述转换为英文（AI 模型都是英文 prompt）
2. 包含风格、光线、构图、色彩等专业描述
3. 长度为 50-100 个英文单词
4. 适合小红书/抖音等社交媒体配图风格

只输出英文提示词，不要任何解释。`,
        },
        {
          role: "user",
          content: `主题：${prompt}
风格要求：${styleInstruction}
请生成适合社交媒体内容的配图提示词。`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const imagePrompt = response.choices[0]?.message?.content?.trim() || prompt;

    // 由于我们没有直接的图片生成API，这里返回prompt让前端调用免费API
    // 同时提供 Unsplash 占位图方案
    return NextResponse.json({
      success: true,
      imagePrompt,
      // 提供 Unsplash 占位图（关键词搜索）
      placeholderUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(prompt.split(" ").slice(0, 3).join(","))}`,
      tips: "复制提示词到 Midjourney/Stable Diffusion/DALL-E 生成图片",
    });
  } catch (error: any) {
    console.error("Image prompt error:", error);
    return NextResponse.json({
      success: true,
      imagePrompt: "A beautiful product photography, clean background, soft lighting, professional composition, social media style",
      placeholderUrl: "https://source.unsplash.com/800x600/?product",
      tips: "请复制提示词到图片生成工具",
    });
  }
}
