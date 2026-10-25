import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyFlow AI — Học tập cá nhân hóa",
  description: "Nền tảng hỗ trợ học tập cá nhân hóa bằng trí tuệ nhân tạo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
