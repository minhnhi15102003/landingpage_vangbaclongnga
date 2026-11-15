"use client";
import Image from "next/image";
import type { ReactNode } from "react";
import { DEFAULT_LOGO_SCALE, MIN_LOGO_SCALE, MAX_LOGO_SCALE, logoVariables } from "@/lib/logo-layout";

export default function LogoSizeControl({ src, scale = DEFAULT_LOGO_SCALE, onChange, vertical = false, preview }: {
  src: string; scale?: number; onChange: (scale: number) => void; vertical?: boolean; preview?: ReactNode;
}) {
  return <div className="ad-logo-size-control">
    {preview ?? <div className="ad-logo-preview" style={logoVariables(scale)}><Image className={`brand-logo${vertical ? " brand-logo-vertical" : ""}`} src={src} alt={vertical ? "Xem trước logo dọc footer" : "Xem trước logo cửa hàng"} width={vertical ? 120 : 150} height={vertical ? 180 : 64} unoptimized /></div>}
    <label className="ad-range"><span>Kích thước logo{vertical ? " footer" : ""} · {scale}%</span><input type="range" min={MIN_LOGO_SCALE} max={MAX_LOGO_SCALE} step="5" value={scale} onChange={(event) => onChange(Number(event.target.value))} /></label>
    <p className="ad-caption">Giữ nguyên tỉ lệ ảnh. {vertical ? "Chỉ áp dụng cho logo dọc ở footer." : "Footer dùng chung logo này khi chưa có logo dọc riêng."} Tự thu gọn khi màn hình nhỏ. Bấm “Lưu thay đổi” để áp dụng.</p>
    <button type="button" className="ad-secondary" onClick={() => onChange(DEFAULT_LOGO_SCALE)}>Đặt lại kích thước logo{vertical ? " footer" : ""}</button>
  </div>;
}
