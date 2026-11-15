import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./editorial.css";

export const metadata: Metadata = {
  title: "Vàng Bạc Long Nga | Vẻ đẹp bền lâu",
  description:
    "Khám phá các thiết kế vàng bạc tinh tế và tham khảo bảng giá cập nhật từ Vàng Bạc Long Nga.",
  keywords: ["Vàng Bạc Long Nga", "trang sức", "vàng bạc", "bảng giá vàng"],
  openGraph: {
    title: "Vàng Bạc Long Nga | Vẻ đẹp bền lâu",
    description: "Trang sức tinh tế, giá trị vẹn nguyên theo thời gian.",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
