import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "请提供邮箱和密码" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度至少6位" },
        { status: 400 }
      );
    }

    const result = await registerUser(email, password);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "注册失败" },
      { status: 400 }
    );
  }
}
