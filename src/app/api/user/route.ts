import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getUserFromToken } from "@/lib/auth";
import { getContentHistory } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const user = getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const history = getContentHistory(user.id);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          email: user.email,
          nickname: user.nickname,
          subscription: user.subscription,
        },
        history,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "获取失败" },
      { status: 500 }
    );
  }
}
