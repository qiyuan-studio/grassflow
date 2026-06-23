import { NextRequest, NextResponse } from "next/server";
import { verifyToken, purchaseLicense } from "@/lib/auth";

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
    const { plan } = body;

    if (plan !== "monthly" && plan !== "permanent") {
      return NextResponse.json(
        { error: "请选择购买方案: monthly(月付) 或 permanent(永久)" },
        { status: 400 }
      );
    }

    // In production, integrate with Stripe/LemonSqueezy here
    // For now, generate license key directly
    const result = purchaseLicense(payload.userId, plan);
    const price = plan === "monthly" ? 69 : 499;

    return NextResponse.json({
      success: true,
      message: `购买成功！${
        plan === "monthly" ? "月度会员" : "永久会员"
      }已激活`,
      data: {
        licenseKey: result.licenseKey,
        plan: result.plan,
        expiresAt: result.expiresAt,
        price: `¥${price}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "购买失败" },
      { status: 500 }
    );
  }
}
