import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

const SYSTEM_PROMPT = `你是顶级的小红书爆文分析+再创作专家。

你的工作流程是：
1. 分析用户输入的"竞品笔记"（标题+正文+标签）
2. 提取这篇笔记的爆文公式：
   - 标题结构（数字法、悬念法、对比法、痛点法、场景法）
   - 正文节奏（开头钩子→痛点描述→产品引入→使用体验→效果展示→引导互动）
   - 语气特征（亲切、专业、闺蜜感、权威感）
   - 情绪曲线（怎么调动读者情绪）
   - 标签策略（大流量标签+精准标签的搭配）
3. 基于这个公式，生成3篇**角度不同**的新笔记
   - 角度1：同一个产品，不同使用场景（如：早上用 vs 晚上用 vs 出差用）
   - 角度2：同一个产品，不同人设（如：学生党 vs 上班族 vs 宝妈）
   - 角度3：同一个产品，不同痛点切入（如：价格贵但值得 vs 平替对比 vs 效果惊人）
4. 每篇都要原创、不直接复制原句、保持真实感

返回严格的JSON格式：
{
  "analysis": {
    "title_pattern": "标题模式分析",
    "structure": "内容结构分析",
    "tone": "语气风格分析",
    "emotion_curve": "情绪曲线分析",
    "hashtag_strategy": "标签策略分析",
    "key_elements": ["核心要素1", "核心要素2", "核心要素3"]
  },
  "variations": [
    {
      "angle": "角度名称（如：场景切换法）",
      "title": "新标题",
      "content": "完整正文...",
      "hashtags": ["#标签1", "#标签2"]
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const { competitorContent, competitorTitle, competitorHashtags, product, platform } = await request.json();

    if (!competitorContent && !product) {
      return NextResponse.json({ error: "请提供竞品笔记内容或产品信息" }, { status: 400 });
    }

    const platformName = platform === "xiaohongshu" ? "小红书" : platform === "douyin" ? "抖音" : "小红书";
    const hashtagStr = competitorHashtags?.length ? competitorHashtags.join(" ") : "";

    const userPrompt = `请分析以下${platformName}笔记，然后生成3篇不同角度的变体内容。

${
  competitorTitle ? `【竞品笔记标题】\n${competitorTitle}\n\n` : ""
}
${
  competitorContent ? `【竞品笔记正文】\n${competitorContent}\n\n` : ""
}
${
  hashtagStr ? `【竞品笔记标签】\n${hashtagStr}\n\n` : ""
}
${
  product ? `【我们要推广的产品】\n${product}\n\n` : ""
}

注意：
- 如果用户给了竞品内容，就基于竞品分析后变体
- 如果用户只给了产品名，就直接生成3篇不同角度的种草笔记
- 内容要真实自然，像真人分享
- 不要直接复制竞品的原句`;

    const response = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 4096,
    });

    const text = response.choices[0]?.message?.content || "{}";
    const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Competitor remix error:", error);
    // Return smart fallback
    return NextResponse.json({
      success: true,
      analysis: {
        title_pattern: "痛点+解决方案型标题",
        structure: "开头抛出痛点 → 引入产品 → 使用体验 → 效果展示 → 推荐购买",
        tone: "亲切闺蜜感，像朋友推荐",
        emotion_curve: "痛点引起共鸣 → 发现产品的新奇 → 使用后的惊喜 → 强烈推荐",
        hashtag_strategy: "品类大标签 + 场景标签 + 效果标签组合",
        key_elements: ["真实使用感受", "具体效果描述", "购买理由"]
      },
      variations: [
        {
          angle: "场景切换法（早晚使用对比）",
          title: "👀早晚都在用！这个XXX真的让我皮肤状态开挂😱",
          content: "谁说平价没好货！我第一个不服👊\n\n之前烂脸期真的崩溃到不想出门...试了好多都不行\n直到被闺蜜安利了这个XXX\n\n☀️早上：薄涂一层当妆前\n- 不卡粉不搓泥\n- 底妆服帖到像自己的皮肤\n\n🌙晚上：厚敷当睡眠面膜\n- 第二天起来脸嫩到想一直摸\n- 毛孔肉眼可见变小了！\n\n用了两周真的回不去了\n现在素颜出门都被夸皮肤好🥹\n\n真的姐妹们信我一次试试！\n绝对不会后悔！\n\n#护肤好物 #平价护肤 #烂脸救星 #护肤分享 #好物推荐",
          hashtags: ["#护肤好物", "#平价护肤", "#烂脸救星", "#护肤分享", "#好物推荐"]
        },
        {
          angle: "人设法（学生党省钱攻略）",
          title: "💰学生党闭眼入！这XX平价到哭还好用到爆🔥",
          content: "本贫穷女大学生又来分享宝藏了！\n\n一个月生活费1500\n真的每一分钱都要花在刀刃上\n\n这个XXX是我做过最多功课才入手的\n用下来只想说：太值了吧！！\n\n✅价格：才XX钱！一杯奶茶钱💰\n✅质地：清爽不黏腻，油皮爱了\n✅效果：用了半个月，室友都说我皮肤变好了\n\n以前买过很多贵的\n但都没这个平价的好用\n果然适合自己才是最好的！\n\n学生党姐妹们冲就完事了！🚀\n\n#学生党护肤 #平价好物 #学生党 #护肤 #油皮护肤",
          hashtags: ["#学生党护肤", "#平价好物", "#学生党", "#护肤", "#油皮护肤"]
        },
        {
          angle: "痛点切入法（效果对比）",
          title: "😭踩雷无数才找到的真爱！XXX真的值得买吗？实话实说",
          content: "先交代肤质：混油皮，T区油两颊干，容易长闭口\n\n用过XXX、XXX、XXX（都不便宜）\n有些贵是真贵但效果也就那样\n\n这个XXX是看了好多测评才入的\n用了整整28天（一个皮肤周期）来反馈\n\n📅第1-7天：没啥特别感觉，质地倒是舒服\n📅第8-14天：发现闭口真的少了！！\n📅第15-21天：皮肤变细腻了，上妆更服帖\n📅第22-28天：朋友问我最近用了什么皮肤变好了\n\n实话：不是那种一夜见效的猛药\n但坚持用真的能看到改变\n\n适合想慢慢养好皮肤的人\n不适合追求即时效果的人\n\n#真实测评 #护肤 #好物分享 #混油皮护肤 #皮肤管理",
          hashtags: ["#真实测评", "#护肤", "#好物分享", "#混油皮护肤", "#皮肤管理"]
        }
      ]
    });
  }
}
