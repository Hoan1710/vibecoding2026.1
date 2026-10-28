import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#080C14",
};

export const metadata: Metadata = {
  title: "EventViet · Chuyên Gia Tổ Chức Sự Kiện & Đặt Lịch Tư Vấn",
  description:
    "Trợ lý AI tư vấn tổ chức sự kiện chuyên nghiệp: Year-End Gala, Hội nghị Doanh nghiệp, Team Building, Khai trương trọn gói.",
  keywords: "tổ chức sự kiện, year-end party, gala dinner, hội nghị, team building, EventViet",
  openGraph: {
    title: "EventViet · Trợ Lý Tư Vấn Sự Kiện 24/7",
    description: "Giải pháp sự kiện sáng tạo, báo giá minh bạch & hỗ trợ đặt lịch tư vấn tức thì.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full">
      <body className={`${plusJakartaSans.className} h-full antialiased selection:bg-amber-500/20 selection:text-amber-300`}>
        {children}
      </body>
    </html>
  );
}
