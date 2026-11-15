"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ADMIN_PATH } from "@/lib/admin-routes";

export default function AdminLogin({ configured, storageReady = true, deployed = false }: { configured: boolean; storageReady?: boolean; deployed?: boolean }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    try {
      const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: data.get("username"), password: data.get("password") }) });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error || "Không đăng nhập được.");
      window.location.assign(ADMIN_PATH);
    } catch (e) { setError(e instanceof Error ? e.message : "Không kết nối được máy chủ."); }
    finally { setBusy(false); }
  }
  return <main className="ad-login"><div className="ad-login-story"><span className="ad-monogram">LN</span><p className="ad-eyebrow">VÀNG BẠC LONG NGA</p><h1>Chăm chút<br />từng giá trị.</h1><p>Không gian quản lý bảng giá,<br />hình ảnh và câu chuyện của cửa hàng.</p><span className="ad-star" aria-hidden="true">✳</span></div><div className="ad-login-panel"><div className="ad-login-card">
    <p className="ad-eyebrow">DÀNH CHO QUẢN TRỊ VIÊN</p><h2>Chào mừng trở lại</h2><p>Đăng nhập để cập nhật website Long Nga.</p>
    {!storageReady ? <div className="ad-notice"><strong>Website đang dùng bản nội dung đã xuất bản.</strong><p>Để đăng nhập và lưu chỉnh sửa trên Vercel, hãy cấu hình kho nội dung GitHub riêng tư: <code>CONTENT_STORAGE=github</code>, <code>CONTENT_GITHUB_OWNER</code>, <code>CONTENT_GITHUB_REPO</code> và <code>CONTENT_GITHUB_TOKEN</code> trong Settings → Environment Variables, rồi triển khai lại.</p></div> : !configured ? <div className="ad-notice"><strong>Chưa thiết lập tài khoản.</strong>{deployed ? <p>Thêm <code>ADMIN_USERNAME</code>, <code>ADMIN_PASSWORD_HASH</code>, <code>AUTH_SECRET</code> và <code>ADMIN_ORIGIN</code> trong Vercel → Settings → Environment Variables, rồi triển khai lại. Tạo thông tin tài khoản bằng <code>npm.cmd run admin:setup</code> trên máy của bạn.</p> : <p>Mở terminal tại dự án, chạy <code>npm.cmd run admin:setup</code> để tự đặt mật khẩu, sau đó khởi động lại website. Không có tài khoản mặc định hoặc đăng ký công khai.</p>}</div> : <form method="post" action="/api/admin/login" onSubmit={submit}>
      <label className="ad-field"><span>Tên đăng nhập</span><input name="username" autoComplete="username" required maxLength={80} disabled={busy} autoFocus /></label>
      <label className="ad-field"><span>Mật khẩu</span><input name="password" type="password" autoComplete="current-password" required maxLength={72} disabled={busy} /></label>
      {error && <p className="ad-error" role="alert">{error}</p>}
      <button className="ad-primary" type="submit" disabled={busy}>{busy ? "Đang đăng nhập…" : "Đăng nhập"}<span aria-hidden="true">↗</span></button>
      <p className="ad-caption">Phiên tự kết thúc sau 30 phút không hoạt động hoặc tối đa 8 giờ.</p>
    </form>}
    <Link className="ad-back" href="/">← Trở về website</Link>
  </div></div></main>;
}
