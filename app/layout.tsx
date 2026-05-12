import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "自媒体账号 AI 诊断师",
  description: "数据驱动的账号诊断 × 爆款规律提炼 × 内容直接生成。支持小红书、抖音、B站、公众号。",
  keywords: "小红书诊断,抖音账号分析,自媒体运营,爆款分析,AI诊断",
  openGraph: {
    title: "自媒体账号 AI 诊断师",
    description: "输入账号链接，AI 帮你诊断账号健康度、分析爆款规律、生成内容建议",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
