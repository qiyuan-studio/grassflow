import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "草神 GrassFlow - AI 小红书/抖音批量种草工具",
  description: "一键批量生成小红书种草笔记、抖音脚本。AI模仿真人语气，自动配图描述、热门标签，助你低成本获取流量。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
