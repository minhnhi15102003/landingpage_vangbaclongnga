"use client";
import Link from "next/link";
export default function AdminError({ reset }: { reset: () => void }) {
  return <main className="ad-login"><div className="ad-login-card"><p className="ad-eyebrow">LONG NGA / QUẢN TRỊ</p><h1>Chưa kết nối được kho nội dung</h1><p>Kiểm tra cấu hình lưu trữ, quyền truy cập và kết nối rồi thử lại. Nội dung chưa lưu sẽ không được tự động ghi đè.</p><button className="ad-primary" onClick={reset}>Thử lại</button><Link href="/">Về website</Link></div></main>;
}
