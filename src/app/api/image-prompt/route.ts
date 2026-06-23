import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

const SYSTEM_PROMPT = `你是一个专业的AI配图Prompt工程师，专门为小红书种草笔记生成配图Prompt。

针对不同内容类型和平台，你需要生成适合AI绘图工具（如Midjourney、DALL-E、Stable Diffusion）的Prompt。

规则：
1. 每次生成3个不同的配图方案
2. Prompt要用英文（Midjourney/DALL-E最佳语言）
3. 每个方案包含：场景描述、构图建议、色调风格
4. 给每个方案标注适合的AI工具（MJ/DE/SD）
5. 如果是产品展示类，要包含产品放置角度和背景

返回格式（严格JSON，不要代码块）：
{
  "image_prompts": [
    {
      "id": 1,
      "style": "场景风格名称（如：ins风、极简、生活感）",
      "english_prompt": "详细的英文Prompt，供Midjourney/DALL-E使用",
      "chinese_description": "中文描述：这个画面应该是什么样的",
      "recommended_tool": "MJ/DE/SD",
      "composition": "构图说明",
      "color_tone": "色调风格说明",
      "usage_tip": "使用这个图片时的搭配建议"
    }
  ],
  "cover_prompt": "封面图专用的英文Prompt（小红书封面很重要）"
}`;

export async function POST(request: NextRequest) {
  try {
    const { content, title, platform, product } = await request.json();
    
    if (!content && !product) {
      return NextResponse.json({ error: "请提供内容或产品信息" }, { status: 400 });
    }

    const platformName = 
      platform === "xiaohongshu" ? "小红书" :
      platform === "douyin" ? "抖音" : "通用";

    const userPrompt = `请为以下${platformName}种草内容生成配图Prompt：

${product ? `产品/主题：${product}` : ""}
${title ? `标题：${title}` : ""}
${content ? `正文内容（片段）：${content.slice(0, 500)}` : ""}

要求：
- 风格要符合${platformName}平台的视觉调性
- 要有视觉冲击力，提高点击率
- 如果是产品图，要突出产品卖点
- 3个不同的视觉方案`;

    const response = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const text = response.choices[0]?.message?.content || "{}";
    const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Image prompt error:", error);
    // Return fallback prompts
    return NextResponse.json({
      success: true,
      image_prompts: [
        {
          id: 1,
          style: "ins风生活感",
          english_prompt: "Aesthetic flat lay of skincare products on marble surface, soft natural lighting from window, pastel color palette, minimalist composition, shot from top-down angle, high quality, 4K, commercial photography style",
          chinese_description: "俯拍角度，大理石台面上精美摆放的护肤品，自然光从窗户洒入，粉嫩色调",
          recommended_tool: "MJ",
          composition: "俯拍平铺构图",
          color_tone: "柔和的莫兰迪色系",
          usage_tip: "适合做首图，显示产品全貌"
        },
        {
          id: 2,
          style: "真人试用感",
          english_prompt: "Close-up shot of woman applying skincare product on her face, morning sunlight, glowing skin texture, dewy finish, natural makeup look, shallow depth of field, warm tones, candid moment",
          chinese_description: "特写镜头，女性正在涂抹护肤品，晨光中的皮肤质感光泽通透",
          recommended_tool: "DE",
          composition: "人像特写构图",
          color_tone: "温暖的暖色调",
          usage_tip: "适合展示使用效果，增强真实感"
        },
        {
          id: 3,
          style: "产品拆解风",
          english_prompt: "Scientific laboratory aesthetic, skincare ingredients floating in the air, glass bottles with amber liquid, glowing particles, dark background with blue accent lighting, macro photography, ultra detailed",
          chinese_description: "暗色背景下的护肤品成分可视化，蓝色氛围光，玻璃瓶中琥珀色液体发光",
          recommended_tool: "SD",
          composition: "中心构图",
          color_tone: "暗调蓝紫金属色",
          usage_tip: "适合成分党、专业向内容"
        }
      ],
      cover_prompt: "Minimalist beauty product on pastel background with natural lighting, soft shadows, commercial product photography, high end aesthetic, 8K, centered composition"
    });
  }
}
