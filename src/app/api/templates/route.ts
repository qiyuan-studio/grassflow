import { NextRequest, NextResponse } from "next/server";

// 预制内容模板库 — 覆盖10大品类，每品类10+模板
const TEMPLATES: Record<string, any[]> = {
  "美妆": [
    { title: "无滤镜实测！XX产品到底值不值得买？", tone: "种草", structure: "开头：真实使用背景 → 中间：3个核心卖点 → 结尾：总结推荐", tips: "强调真实使用感受，多放对比图" },
    { title: "黄皮素人实测！XX色号上嘴效果太惊讶了", tone: "干货", structure: "开头：肤质介绍 → 中间：不同光线效果 → 结尾：适合人群总结", tips: "说清楚自己肤色/肤质类型，方便粉丝对照" },
    { title: "学生党必看！XX平价替代找到了", tone: "亲切", structure: "开头：价格对比勾引兴趣 → 中间：使用体验对比 → 结尾：省钱的满足感", tips: "突出性价比，强调学生也能买得起" },
    { title: "成分党深扒！XX产品到底值那个价吗？", tone: "专业", structure: "开头：成分表分析 → 中间：功效对比 → 结尾：值不值得买", tips: "列出关键成分及其功效，对比同价位产品" },
    { title: "XX产品用到空瓶！我的真实感受", tone: "亲切", structure: "开头：购买背景 → 中间：使用周期体验 → 结尾：会回购吗", tips: "空瓶最有说服力，强调用了多久" },
    { title: "闺蜜推荐了XX，我试了一周后…", tone: "幽默", structure: "开头：一开始的怀疑 → 中间：逐天体验 → 结尾：真香了", tips: "用轻松幽默的语气讲述使用过程" },
    { title: "我的化妆包里永远有XX | 年度爱用", tone: "种草", structure: "开头：为什么一直回购 → 中间：各种场景下的表现 → 结尾：囤货记录", tips: "强调复购次数，真的是真爱" },
    { title: "油皮/干皮/混合皮，XX适合哪种？", tone: "干货", structure: "开头：不同肤质痛点 → 中间：XX对各肤质表现 → 结尾：按肤质推荐", tips: "分肤质讲解，让不同粉丝都能对号入座" },
    { title: "XX新品开箱！第一印象太惊喜了", tone: "种草", structure: "开头：开箱的兴奋 → 中间：外观/质地/味道 → 结尾：初步使用感受", tips: "开箱视频/图文自带流量，第一时间发布" },
    { title: "XX和YY到底哪个好？保姆级对比来了", tone: "干货", structure: "开头：纠结的痛点 → 中间：多维度对比 → 结尾：按需求推荐", tips: "客观对比，不偏袒，帮粉丝做选择" },
  ],
  "数码": [
    { title: "XX耳机用了30天，我后悔了...", tone: "幽默", structure: "开头：标题党勾引 → 中间：发现真香的过程 → 结尾：早买早享受", tips: "后悔的是没早买！反转式标题效果最好" },
    { title: "XX对比YY，差距到底有多大？一图看懂", tone: "干货", structure: "开头：为什么要对比 → 中间：参数/体验对比表 → 结尾：按需推荐", tips: "用表格和实拍对比图，直观展示差异" },
    { title: "学生党千元内XX推荐！闭眼入不踩雷", tone: "亲切", structure: "开头：预算有限怎么选 → 中间：3-5款推荐 → 结尾：最佳选择", tips: "重点推荐高性价比产品，标注最低入手价" },
    { title: "XX用了3个月的真实体验：这些优缺点你要知道", tone: "专业", structure: "开头：长测背景 → 中间：逐项优缺点 → 结尾：适合谁买", tips: "长时间使用报告更有说服力" },
    { title: "XX开箱即用！这些功能太绝了", tone: "种草", structure: "开头：开箱的惊喜 → 中间：3个最爱的功能 → 结尾：综合评分", tips: "突出开箱第一印象，功能亮点要说人话" },
    { title: "还在纠结XX和YY？告诉你该怎么选", tone: "干货", structure: "开头：大家最关心的问题 → 中间：核心差异 → 结尾：最终推荐", tips: "直接解决用户选择困难症" },
    { title: "XX配件分享！这些买了绝不后悔", tone: "种草", structure: "开头：主设备搭配什么好 → 中间：5个必买配件 → 结尾：搭配方案", tips: "配件类的种草转化率特别高" },
    { title: "一年前买的XX，现在怎么样了？", tone: "亲切", structure: "开头：购买时间背景 → 中间：长期体验 → 结尾：总评价", tips: "长期使用测评，展示产品耐久性" },
    { title: "XX vs YY vs ZZ，三款热门横评", tone: "专业", structure: "开头：市面选择太多 → 中间：三维度对比 → 结尾：场景化推荐", tips: "最全面的对比测评，SEO长尾流量" },
    { title: "提升效率！我在用XX搞定YY工作流", tone: "干货", structure: "开头：痛点引入 → 中间：XX如何解决 → 结尾：工作流总结", tips: "面向效率提升，吸引专业用户" },
  ],
  "美食": [
    { title: "宿舍也能做！XX微波炉美食3分钟搞定", tone: "亲切", structure: "开头：场景引入 → 中间：超简单步骤 → 结尾：成品展示", tips: "强调简单快手，适合学生党/打工人" },
    { title: "XX探店‼️我不允许还有人不知道这家店", tone: "种草", structure: "开头：店铺环境和第一印象 → 中间：点的每道菜点评 → 结尾：必点推荐", tips: "照片要诱人，点出具体菜品名称和价格" },
    { title: "XX零食清单！回购100次的那种", tone: "种草", structure: "开头：零食爱好者的自白 → 中间：列表式推荐 → 结尾：购买链接", tips: "每款零食简短点评，图片要诱人" },
    { title: "懒人福音！XX速食测评，这个真的好吃", tone: "幽默", structure: "开头：懒人宣言 → 中间：逐个试吃 → 结尾：排雷推荐", tips: "速食类测评，用真实的反应吸引人" },
    { title: "XX做法大公开！和店里一个味", tone: "干货", structure: "开头：为什么要自制 → 中间：详细步骤 → 结尾：成品对比", tips: "写出关键步骤和配料比例，方便复刻" },
    { title: "减肥也能吃！XX减脂餐好吃不胖", tone: "专业", structure: "开头：减肥饮食误区 → 中间：XX减脂食谱 → 结尾：热量参考", tips: "标注卡路里和营养成分，真实可靠" },
    { title: "XX食材这样做，隔壁小孩都馋哭了", tone: "幽默", structure: "开头：常见食材的新吃法 → 中间：详细做法 → 结尾：味道惊艳", tips: "用常见食材做不一样的味道" },
    { title: "XX自制火锅底料，完胜超市买的", tone: "干货", structure: "开头：火锅爱好者 → 中间：底料配方和步骤 → 结尾：涮菜推荐", tips: "配方要具体，写出用量" },
    { title: "XX烘焙初体验！零失败配方来了", tone: "亲切", structure: "开头：烘焙小白的尝试 → 中间：超详细步骤 → 结尾：避坑指南", tips: "适合新手的配方，详细到每一步" },
    { title: "一周不重样！XX食材的一周吃法", tone: "干货", structure: "开头：买了一大份怎么吃 → 中间：每天一种做法 → 结尾：总结", tips: "解决单一食材吃不完的问题" },
  ],
  "穿搭": [
    { title: "XX单品的一衣多穿！一周不重样", tone: "种草", structure: "开头：单品介绍 → 中间：7种搭配 → 结尾：最推荐搭配", tips: "展示搭配力，提高单品价值感" },
    { title: "小个子/高个子必看！XX穿搭显高10cm", tone: "干货", structure: "开头：身高痛點 → 中间：穿搭技巧 → 结尾：效果对比", tips: "分身高类型给出具体建议" },
    { title: "1688/淘宝 XX元好物分享！质感绝了", tone: "亲切", structure: "开头：挖宝的快乐 → 中间：好物逐个展示 → 结尾：购买渠道", tips: "性价比穿搭最受欢迎" },
    { title: "梨形/苹果/沙漏身材怎么穿XX？", tone: "干货", structure: "开头：身材类型分析 → 中间：各种身材穿搭建议 → 结尾：避雷指南", tips: "分身材类型讲，精准触达目标用户" },
    { title: "XX色系穿搭！高级感拉满", tone: "种草", structure: "开头：色系氛围感 → 中间：搭配方案 → 结尾：配色公式", tips: "高级感配色方案，强调色彩氛围" },
    { title: "面试/约会/见家长怎么穿XX？场景穿搭指南", tone: "专业", structure: "开头：场景穿搭的重要性 → 中间：不同场景方案 → 结尾：万能公式", tips: "场景化穿搭，实用性最强" },
    { title: "XX品牌拆箱！这些值得买这些快跑", tone: "幽默", structure: "开头：品牌背景 → 中间：红黑榜 → 结尾：认真推荐", tips: "红黑榜形式互动性强" },
    { title: "降温了！XX外套选购指南", tone: "干货", structure: "开头：换季痛点 → 中间：不同厚度/材质推荐 → 结尾：闭眼入推荐", tips: "季节性强，搜索流量大" },
    { title: "XX配饰搭配！让基础款变高级的秘密", tone: "种草", structure: "开头：配饰的重要性 → 中间：不同配饰搭配 → 结尾：购买建议", tips: "配饰是提高客单价的好品类" },
    { title: "我的XX胶囊衣橱！10件单品过一季", tone: "干货", structure: "开头：极简穿搭理念 → 中间：10件单品清单 → 结尾：搭配方案", tips: "胶囊衣橱概念自带话题" },
  ],
  "家居": [
    { title: "XX好物让出租屋秒变温馨小窝", tone: "亲切", structure: "开头：租房党的痛点 → 中间：改造好物推荐 → 结尾：改造前后对比", tips: "前后对比图流量最大" },
    { title: "XX家居收纳大法！空间翻倍", tone: "干货", structure: "开头：收纳痛点 → 中间：分区收纳方案 → 结尾：收纳前后对比", tips: "收纳技巧实用性强，收藏率高" },
    { title: "XX平价家居好物！幸福感拉满", tone: "种草", structure: "开头：装修/布置背景 → 中间：好物逐个介绍 → 结尾：总花费", tips: "标出价格，让人感觉物超所值" },
    { title: "XX家居翻新！几百块搞定一面墙", tone: "种草", structure: "开头：翻新前的样子 → 中间：改造过程 → 结尾：改造成果", tips: "DIY翻新内容自带流量" },
    { title: "XX灯饰氛围感太绝了！每一盏都想拥有", tone: "种草", structure: "开头：氛围灯的重要性 → 中间：不同场景灯饰 → 结尾：搭配建议", tips: "氛围感是关键，图片要暗调有质感" },
    { title: "XX家电选购指南！看完不踩坑", tone: "干货", structure: "开头：选购常见误区 → 中间：各价位推荐 → 结尾：最终投票", tips: "列出具体型号和实时价格" },
    { title: "家居博主私藏的XX店铺合集", tone: "干货", structure: "开头：博主身份介绍 → 中间：店铺逐个推荐 → 结尾：必买清单", tips: "店铺推荐类内容收藏率高" },
    { title: "XX绿植推荐！好看又好养的室内植物", tone: "亲切", structure: "开头：给家里添点绿 → 中间：植物推荐 → 结尾：养护小技巧", tips: "绿植类内容氛围好，适合拍照" },
    { title: "XX小户型收纳神器！空间利用到极致", tone: "干货", structure: "开头：小户型烦恼 → 中间：收纳神器逐个展示 → 结尾：布局建议", tips: "针对小户型精准吸引流量" },
    { title: "XX卧室改造！花500块拥有酒店体验", tone: "种草", structure: "开头：卧室痛点 → 中间：改造物品清单 → 结尾：改造前后对比", tips: "低预算改造最容易引发共鸣" },
  ],
  "母婴": [
    { title: "新手妈妈必看！XX母婴好物TOP10", tone: "亲切", structure: "开头：新手妈妈的迷茫 → 中间：TOP10清单 → 结尾：购买建议", tips: "新手妈妈是最精准的目标人群" },
    { title: "XX奶粉/纸尿裤测评！哪款最适合你家宝宝", tone: "干货", structure: "开头：选择困难 → 中间：逐款测评 → 结尾：按需推荐", tips: "奶粉/纸尿裤测评是母婴类刚需内容" },
    { title: "XX早教玩具推荐！宝宝玩不腻还益智", tone: "干货", structure: "开头：早教理念 → 中间：不同年龄段推荐 → 结尾：使用心得", tips: "分年龄段推荐，更精准" },
    { title: "带娃神器！XX让妈妈解放双手", tone: "种草", structure: "开头：带娃的辛苦 → 中间：神器逐个展示 → 结尾：使用场景", tips: "解放双手是妈妈最关心的点" },
    { title: "XX宝宝辅食食谱！营养又美味", tone: "专业", structure: "开头：辅食添加时机 → 中间：各月龄食谱 → 结尾：注意事项", tips: "辅食内容实用性强，收藏率高" },
    { title: "XX婴儿车/安全座椅选购攻略", tone: "干货", structure: "开头：安全第一 → 中间：选购要点 → 结尾：推荐清单", tips: "大件商品选购，用户决策时间长" },
    { title: "XX产后恢复好物！妈妈也要爱自己", tone: "亲切", structure: "开头：产后变化 → 中间：恢复好物 → 结尾：心态调整", tips: "产后恢复话题共鸣度高" },
    { title: "XX绘本推荐！培养宝宝阅读习惯", tone: "干货", structure: "开头：阅读习惯的重要性 → 中间：不同年龄段绘本 → 结尾：亲子共读技巧", tips: "绘本推荐收藏率高，搜索量大" },
    { title: "XX待产包清单！一张图搞定所有", tone: "干货", structure: "开头：待产焦虑 → 中间：清单式分类 → 结尾：购买渠道", tips: "清单类内容易传播，方便保存" },
    { title: "XX宝宝周岁布置！在家也能拍大片", tone: "种草", structure: "开头：仪式感的重要性 → 中间：布置方案 → 结尾：拍照技巧", tips: "仪式感内容引发分享欲" },
  ],
  "宠物": [
    { title: "XX猫粮/狗粮测评！到底哪款主子最爱", tone: "干货", structure: "开头：选粮焦虑 → 中间：逐款测评 → 结尾：最终推荐", tips: "宠物食品测评是最核心内容" },
    { title: "XX宠物好物推荐！这些东西不能不买", tone: "种草", structure: "开头：养宠必备 → 中间：好物清单 → 结尾：避雷指南", tips: "宠物用品种草转化率很高" },
    { title: "XX猫/狗日常！我家主子也太可爱了吧", tone: "幽默", structure: "开头：介绍主子 → 中间：日常趣事 → 结尾：萌照暴击", tips: "萌宠日常永远自带流量" },
    { title: "新手养猫/养狗必看！XX注意事项", tone: "干货", structure: "开头：决定养宠前 → 中间：准备清单 → 结尾：养宠建议", tips: "新手养宠内容搜索量大" },
    { title: "XX宠物玩具推荐！再也不用担心拆家了", tone: "亲切", structure: "开头：拆家痛点 → 中间：不同玩具推荐 → 结尾：玩耍建议", tips: "解决实际问题的内容互动率好" },
    { title: "XX宠物医院体验！这些情况一定要去", tone: "专业", structure: "开头：宠物生病的担忧 → 中间：常见病症和处理 → 结尾：医院推荐", tips: "宠物医疗内容帮助性强，收藏高" },
    { title: "和猫咪/狗狗一起旅行！XX宠物友好地", tone: "种草", structure: "开头：带宠旅行的意义 → 中间：目的地推荐 → 结尾：出行准备", tips: "宠物旅行是新兴热门话题" },
    { title: "XX宠物零食DIY！健康又省钱", tone: "干货", structure: "开头：市售零食担忧 → 中间：DIY食谱 → 结尾：保存方法", tips: "DIY零食内容展现主人爱宠之心" },
    { title: "领养代替购买！XX救助故事暖哭了", tone: "亲切", structure: "开头：领养背景 → 中间：救助过程 → 结尾：呼吁领养", tips: "情感类内容传播力最强" },
    { title: "XX品种猫/狗优缺点！想养的看这篇", tone: "干货", structure: "开头：品种科普 → 中间：优缺点分析 → 结尾：适合人群", tips: "品种介绍帮助决策，搜索流量大" },
  ],
};

const CATEGORIES = Object.keys(TEMPLATES);

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") || "";
  const search = request.nextUrl.searchParams.get("search") || "";

  let results: { category: string; templates: any[] }[] = [];

  if (category && TEMPLATES[category]) {
    results = [{ category, templates: TEMPLATES[category] }];
  } else if (search) {
    // Search across all categories
    for (const [cat, templates] of Object.entries(TEMPLATES)) {
      const matched = templates.filter(
        (t: any) =>
          t.title.includes(search) ||
          t.tone.includes(search) ||
          t.tips.includes(search)
      );
      if (matched.length > 0) {
        results.push({ category: cat, templates: matched });
      }
    }
  } else {
    // Return all
    for (const [cat, templates] of Object.entries(TEMPLATES)) {
      results.push({ category: cat, templates });
    }
  }

  return NextResponse.json({
    success: true,
    categories: CATEGORIES,
    data: results,
    total: results.reduce((sum, r) => sum + r.templates.length, 0),
  });
}
