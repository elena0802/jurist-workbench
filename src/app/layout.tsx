import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jurist Workbench | 형사법 출제 워크벤치",
  description:
    "지식 베이스와 평가 쟁점 설계를 통해 형사법 사례형 시험 초안을 작성합니다. 한국 형사법 교수를 위한 출제 워크플로.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${notoSerif.variable} min-h-screen`}>{children}</body>
    </html>
  );
}
