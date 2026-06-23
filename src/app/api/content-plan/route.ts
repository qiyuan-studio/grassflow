import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

const PLATFORM_PROMPTS: Record<string, string> = {
  xiaohongshu: `你作为顶级的小红书内容策略专家，为电商卖家生成一周完整的内容排期计划。

每个内容计划包含7天（周一到周日），每天不同角度：
- 周一：场景切入共鸣型
- 周二：教程方法（收藏型）
- 周三：成分/技术分析（专业信任）
- 周四：效果对比（视觉冲击）
- 周五：优惠促销（转化）
- 周六：生活方式（好感度）
- 周日：总结测评（决策辅助）

每篇内容要求：小红书风格正文（emoji+分段+互动引导），配图建议，5-8个标签，发布时间建议，互动话术。`,

  douyin: `你作为顶级的抖音短视频内容策略专家，为电商卖家生成一周完整的短视频内容排期计划。

每个内容计划包含7天（周一到周日），每天不同角度：
- 周一：场景切入（前3秒钩子）
- 周二：教程方法（干货）
- 周三：产品解析
- 周四：对比/测评
- 周五：促销/福利
- 周六：轻松日常
- 周日：总结推荐

每篇内容要求：抖音风格（前3秒钩子+口播文案+画面建议），热门话题标签，最佳发布时间，互动引导话术。`,

  weibo: `你作为顶级的微博内容策略专家，为品牌方生成一周完整的微博内容排期计划。

每天一个角度覆盖。每篇内容要求：微博风格（140字内抓眼球+长文可选），热门话题标签，配图建议。`,

  zhihu: `你作为顶级的知乎内容策略专家，为品牌方生成一周完整的知乎回答排期计划。

每天一个不同话题的回答。每篇内容要求：知乎风格（"谢邀"+分点论述+真实经历），相关话题标签，配图建议。`
};

const JSON_FORMAT = `返回严格的JSON格式：
{
  "strategy_overview": "本周整体策略的一句话总结",
  "target_audience": "目标人群画像",
  "core_message": "核心传达信息",
  "daily_plan": [
    {
      "day": "周一",
      "content_type": "内容类型标签",
      "best_post_time": "最佳发布时间",
      "title": "笔记/视频标题",
      "body": "完整正文内容",
      "image_suggestions": "配图建议描述",
      "hashtags": ["#标签1"],
      "engagement_hook": "互动引导话术",
      "angle_reason": "为什么今天选这个角度"
    }
  ],
  "cross_platform_tips": "跨平台发布建议",
  "hashtag_strategy": "标签策略建议",
  "key_metrics_targets": "预估互动目标"
}`;

export async function POST(request: NextRequest) {
  try {
    const { product, features, targetAudience, competitorContent, platform, startDate } = await request.json();

    if (!product) {
      return NextResponse.json({ error: "请提供产品名称" }, { status: 400 });
    }

    const platformKey = platform || "xiaohongshu";
    const platformName = 
      platformKey === "xiaohongshu" ? "小红书" :
      platformKey === "douyin" ? "抖音" :
      platformKey === "weibo" ? "微博" : "知乎";

    const systemPrompt = PLATFORM_PROMPTS[platformKey] || PLATFORM_PROMPTS.xiaohongshu;

    const userPrompt = `请为一款产品在【${platformName}】平台生成一周（7天）的完整内容排期计划。

【产品信息】
产品名称：${product}
${features ? `核心卖点：${features}` : ""}
${targetAudience ? `目标人群：${targetAudience}` : ""}

${startDate ? `起始日期：${startDate}` : ""}

${competitorContent ? `【竞品参考素材】\n${competitorContent.slice(0, 1500)}` : ""}

要求：
1. 内容要有真实感，不能像硬广
2. 每天的内容角度不能重复，形成递进
3. 严格符合${platformName}平台的内容调性和格式
4. 配图建议要具体可执行
5. 标签要有策略（大流量+精准标签）
6. 给出最佳发布时间
7. 每篇内容完整可直接使用

${JSON_FORMAT}`;

    const response = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages: [
        {
          role: "system",
          content: systemPrompt + "\n\n" + JSON_FORMAT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 8192,
    });

    const text = response.choices[0]?.message?.content || "{}";
    const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let result;
    try {
      result = JSON.parse(cleanJson);
    } catch {
      // Try to extract JSON from text
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse JSON");
      }
    }

    return NextResponse.json({ 
      success: true, 
      platform: platformKey,
      platformName,
      startDate: startDate || new Date().toISOString().split("T")[0],
      ...result 
    });
  } catch (error: any) {
    console.error("Content plan error:", error);
    // 返回更丰富的 fallback 数据
    return NextResponse.json({
      success: true,
      platform: "xiaohongshu",
      platformName: "小红书",
      strategy_overview: "围绕产品核心卖点，通过7天不同角度内容建立用户信任和购买欲望",
      target_audience: "目标消费者",
      core_message: "产品值得买",
      cross_platform_tips: "可以同步到抖音/微博做二次分发",
      hashtag_strategy: "大流量标签+精准标签组合，首条内容用流量标签引流",
      key_metrics_targets: "日均互动100+，7天总曝光5万+",
      daily_plan: [
        {
          day: "周一",
          content_type: "场景切入 · 共鸣型",
          best_post_time: "12:00-13:00 / 20:00-22:00",
          title: "有没有姐妹跟我一样…直到遇到这个XXX才解脱😭",
          body: "有没有姐妹跟我一样，每天早上起来照镜子就焦虑😩\n\n试过好多产品，钱包瘪了脸也没好\n直到闺蜜跟我说「你试试这个」\n我当时心想：能有多好用？\n\n结果用了第一天就真香了！\n质地清爽到像水一样，一抹就吸收\n没有那种黏糊糊的感觉\n关键是！用了三天闭口就消了一半！\n\n现在我已经用了两周\n皮肤状态好到素颜也敢出门了🥹\n\n姐妹们，如果你们也在找适合自己的产品\n真的可以试试这个！\n不好用来骂我！",
          image_suggestions: "产品放在晨光中的梳妆台上，旁边有绿植，俯拍构图，ins风，暖色调",
          hashtags: ["#护肤好物", "#好物推荐", "#种草", "#素颜好皮肤", "#护肤分享"],
          engagement_hook: "你们有没有用过什么产品让你真香的？评论区分享一下！",
          angle_reason: "周一用户容易焦虑，用共鸣开场引起关注，建立情感连接"
        },
        {
          day: "周二",
          content_type: "教程型 · 收藏向",
          best_post_time: "18:00-20:00",
          title: "保姆级教程‼️手把手教你正确使用XXX，效果翻倍🔥",
          body: "姐妹们！我发现好多人都用错了！\n\n买了好东西但方法不对＝白买❌\n今天手把手教你们正确用法👇\n\n📌第一步：洁面后拍爽肤水\n📌第二步：取黄豆大小，手心乳化\n📌第三步：按压上脸！不是涂抹！\n📌第四步：从下往上提拉按摩\n📌第五步：余量带到脖子\n\n⚠️注意事项：\n• 不要用太多！黄豆大小就够了\n• 早上用的话记得等2分钟再上妆\n• 晚上用的话可以厚敷当睡眠面膜\n\n我这样用了两周效果真的好明显\n皮肤变细腻了，毛孔也小了\n底妆都服帖了好多！\n\n收藏这篇！以后照着做！",
          image_suggestions: "五步使用法的实拍图，每步一张，浅色背景，手指展示产品质地的特写",
          hashtags: ["#护肤教程", "#护肤干货", "#正确护肤", "#护肤技巧", "#好物分享"],
          engagement_hook: "你们觉得最难的一步是什么？我看看有多少人乳化不到位！",
          angle_reason: "周二用户下班后有学习意愿，教程型内容收藏率高，增加长尾流量"
        },
        {
          day: "周三",
          content_type: "成分解析 · 专业型",
          best_post_time: "12:00-14:00",
          title: "扒一扒XXX的成分表｜难怪效果这么好，原来加了这些🔬",
          body: "作为一个成分党，买任何产品都要先看成分表🧐\n\n今天把XXX的成分扒给大家看👇\n\n🔬 核心成分1：XXX\n→ 作用：保湿修复\n→ 浓度：排在第X位，良心添加\n\n🔬 核心成分2：XXX\n→ 作用：抗氧化提亮\n→ 比市面上很多大牌浓度还高\n\n🔬 核心成分3：XXX\n→ 作用：舒缓抗炎\n→ 敏感肌也能用\n\n💡 成分搭配逻辑：XXX+XXX+XXX，三重协同\n难怪效果这么好！\n\n❌ 不含：酒精、香精、矿物油\n✅ 适合：所有肤质，敏感肌可用\n\n价格才XX钱，这个成分表真的很能打了！",
          image_suggestions: "成分表截图+圈出核心成分，产品配方表实拍，科学研究风格背景",
          hashtags: ["#成分党", "#护肤品成分分析", "#科学护肤", "#敏感肌可用", "#护肤干货"],
          engagement_hook: "你们买产品会看成分表吗？最在意什么成分？",
          angle_reason: "周三中段用户理性思考，成分分析建立专业信任"
        },
        {
          day: "周四",
          content_type: "效果展示 · 视觉冲击",
          best_post_time: "20:00-22:00",
          title: "坚持用了28天！iPhone原相机记录！变化太明显了📸",
          body: "来了来了！答应你们的28天打卡来了！\n\n📅 Day 1: 皮肤状态一般，有闭口和痘印\n📅 Day 7: 闭口消了一些，皮肤开始变滑\n📅 Day 14: 痘印淡了很多！肤色均匀了\n📅 Day 21: 皮肤肉眼可见变细腻\n📅 Day 28: 素颜状态！我自己都惊了！\n\n全部iPhone原相机拍摄\n无美颜无滤镜\n给大家最真实的参考！\n\n说实话我自己也没想到效果这么好\n皮肤好了真的整个人都自信了！",
          image_suggestions: "5张对比图（每7天一张），同角度同光线，真实记录，素颜出镜",
          hashtags: ["#28天打卡", "#护肤对比", "#素颜", "#真实测评", "#皮肤变好"],
          engagement_hook: "你们敢不敢也来打卡28天？评论区留下你的皮肤状态，一起变美！",
          angle_reason: "周四晚用户放松刷手机，视觉冲击型内容容易出爆款"
        },
        {
          day: "周五",
          content_type: "优惠促销 · 转化型",
          best_post_time: "18:00-20:00",
          title: "只有100份‼️XXX限时福利，我先冲了🏃‍♀️",
          body: "蹲了很久的姐妹看过来！\n\nXXX终于有活动了！！\n平时真的很少打折\n这次被我蹲到了！\n\n🎁 福利内容：\n✅ 买一送一！\n✅ 还送小样套装\n✅ 满XX再减XX\n\n🕐 时间：今晚8点-明晚12点\n⏳ 只有100份！卖完就没\n\n我上次原价买的亏大了😭\n这次一定要多囤几份！\n\n想入手的姐妹抓紧\n这种力度一年可能就一次！",
          image_suggestions: "活动海报风格，产品+优惠信息，红色/金色促销色调",
          hashtags: ["#限时优惠", "#好物推荐", "#剁手清单", "#福利", "#买到赚到"],
          engagement_hook: "你们抢到了吗？评论区告诉我！",
          angle_reason: "周五下班后是购物决策高峰期，限时优惠刺激下单"
        },
        {
          day: "周六",
          content_type: "生活方式 · 轻松型",
          best_post_time: "10:00-12:00",
          title: "周末治愈系日常🧘‍♀️精致女孩的晚间护肤仪式",
          body: "周六的晚上是我最享受的时光✨\n\n点上香薰蜡烛🕯️\n放上喜欢的音乐🎵\n开始我的晚间护肤仪式🧴\n\nStep 1: 卸妆（要卸干净！）\nStep 2: 温和洁面\nStep 3: 敷个面膜（一周2-3次）\nStep 4: 涂上XXX，按摩吸收\nStep 5: 眼霜+唇膜\n\n做完这些窝在沙发里看剧📺\n真的太治愈了\n\n你们周末有什么治愈的小习惯吗？",
          image_suggestions: "温馨的房间氛围，香薰蜡烛+护肤品摆在一起，暖色灯光",
          hashtags: ["#晚间护肤", "#治愈系", "#周末生活", "#精致女孩", "#护肤仪式"],
          engagement_hook: "分享你们的周末治愈小习惯！一人说一个！",
          angle_reason: "周六用户放松状态，生活感内容增加品牌好感度"
        },
        {
          day: "周日",
          content_type: "总结推荐 · 高转化",
          best_post_time: "20:00-22:00",
          title: "一周总结｜XXX到底值不值得买？真实体验全分享🎤",
          body: "这周发了6篇关于XXX的内容\n后台收到好多姐妹的私信\n问的最多的就是：到底值不值得买？\n\n今天统一回答：值得！但要看适不适合你👇\n\n✅ 适合谁买：\n• 皮肤有闭口、痘印的\n• 想要提亮肤色的\n• 预算不高想找平替的\n• 敏感肌也能用的\n\n❌ 不适合谁买：\n• 追求立竿见影效果的\n• 不喜欢任何质地的\n• 已经找到完美产品的\n\n📝 我的使用总结：用了28天，皮肤真的变好了\n性价比很高，会回购\n\n有问题评论区留言！",
          image_suggestions: "产品+使用前后对比图汇总，生活感的场景拍摄",
          hashtags: ["#好物推荐", "#真实测评", "#种草还是拔草", "#护肤分享", "#值得买"],
          engagement_hook: "还有什么问题在评论区问！能回答的都回答！",
          angle_reason: "周日晚上用户做决策，总结型内容帮助转化"
        }
      ]
    });
  }
}
