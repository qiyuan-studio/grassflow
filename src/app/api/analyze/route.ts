import { NextRequest, NextResponse } from "next/server";
import { analyzeCompetitor } from "@/lib/deepseek";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "登录已过期" }, { status: 401 });
    }

    const body = await request.json();
    const { product, platform } = body;

    if (!product) {
      return NextResponse.json({ error: "请提供产品名称" }, { status: 400 });
    }

    const result = await analyzeCompetitor(product, platform || "xiaohongshu");
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "分析失败" },
      { status: 500 }
    );
  }
}
