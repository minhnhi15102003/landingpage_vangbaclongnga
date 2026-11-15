"use client";
import { useState, type ChangeEvent } from "react";
import { DEFAULT_LOGO_SCALE, MAX_FOOTER_LOGO_MARGIN_TOP, footerLogoVariables, type FooterLogoPosition } from "@/lib/logo-layout";
import BrandMark from "@/components/brand-mark";
import { uploadImage } from "./photo-field";
import LogoSizeControl from "./logo-size-control";

export default function FooterLogoField({ src, scale, fallbackSrc, fallbackScale, position, onPositionChange, onChange, onBusy }: {
  src?: string; scale?: number;
  fallbackSrc: string; fallbackScale?: number;
  position: FooterLogoPosition; onPositionChange: (next: FooterLogoPosition) => void;
  onChange: (next: { src: string; scale?: number }) => void;
  onBusy: (delta: number) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const marginTop = position.footerLogoMarginTop ?? 0;
  const preview = <div className="ad-logo-preview ad-footer-logo-preview footer-logo-layout" style={footerLogoVariables(position)}>
    <BrandMark logo={src || fallbackSrc} logoScale={src ? scale : fallbackScale} vertical={!!src} />
  </div>;
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target, file = input.files?.[0];
    if (!file) return;
    setBusy(true); setError(""); onBusy(1);
    try {
      const next = await uploadImage(file);
      onChange({ src: next, scale: scale ?? DEFAULT_LOGO_SCALE });
    } catch (error) { setError(error instanceof Error ? error.message : "Tải logo dọc thất bại."); }
    finally { setBusy(false); onBusy(-1); input.value = ""; }
  }
  return <div>
    {src ? <LogoSizeControl src={src} scale={scale} vertical preview={preview} onChange={(next) => onChange({ src, scale: next })} /> : <>{preview}<p className="ad-caption">Chưa có logo dọc riêng. Footer đang dùng logo thương hiệu.</p></>}
    <div className="ad-footer-logo-controls">
      <label className="ad-field"><span>Căn ngang logo footer</span><select value={position.footerLogoAlign ?? "left"} onChange={(event) => onPositionChange({ ...position, footerLogoAlign: event.target.value as FooterLogoPosition["footerLogoAlign"] })}>
        <option value="left">Căn trái</option><option value="center">Căn giữa</option><option value="right">Căn phải</option>
      </select></label>
      <label className="ad-range"><span>Khoảng cách phía trên logo · {marginTop}px</span><input type="range" min="0" max={MAX_FOOTER_LOGO_MARGIN_TOP} step="1" value={marginTop} onChange={(event) => onPositionChange({ ...position, footerLogoMarginTop: Number(event.target.value) })} /></label>
      <label className="ad-field"><span>Khoảng cách trên (px)</span><input type="number" min="0" max={MAX_FOOTER_LOGO_MARGIN_TOP} step="1" value={marginTop} onChange={(event) => { const next = event.target.valueAsNumber; if (Number.isInteger(next) && next >= 0 && next <= MAX_FOOTER_LOGO_MARGIN_TOP) onPositionChange({ ...position, footerLogoMarginTop: next }); }} /></label>
      <p className="ad-caption">Đặt 0px để logo sát đầu cột. Bản xem trước cập nhật ngay; bấm “Lưu thay đổi” để áp dụng trên website.</p>
      <button type="button" className="ad-secondary" onClick={() => onPositionChange({ footerLogoAlign: "left", footerLogoMarginTop: 0 })}>Đặt lại vị trí logo footer</button>
    </div>
    <div className="ad-panel-actions">
      <label className="ad-upload">{busy ? "Đang tải…" : src ? "↑ Thay logo dọc footer" : "↑ Tải logo dọc footer"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={upload} /></label>
      {src && <button type="button" className="ad-secondary" disabled={busy} onClick={() => { onChange({ src: "" }); setError(""); }}>Dùng chung logo thương hiệu</button>}
    </div>
    <p className="ad-caption">JPG, PNG, WebP · Tối đa 3 MB. Nên dùng PNG hoặc WebP nền trong suốt.</p>
    {error && <p className="ad-error" role="alert">{error}</p>}
  </div>;
}
