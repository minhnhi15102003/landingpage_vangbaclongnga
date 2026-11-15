"use client";
import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import type { Photo } from "@/lib/content-schema";
import { photoVariables } from "@/lib/photo-layout";

export type PhotoOption = { src: string; alt: string; x?: number; y?: number; zoom?: number };
export async function uploadImage(file: File) {
  if (file.size > 3_000_000 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Chọn ảnh JPG, PNG hoặc WebP tối đa 3 MB.");
  const body = new FormData(); body.set("file", file);
  const r = await fetch("/api/admin/upload", { method: "POST", body });
  const result = await r.json();
  if (!r.ok) throw new Error(result.error || "Tải ảnh thất bại.");
  return result.src as string;
}
export default function PhotoField({ value, onChange, options, onBusy, previewRatio = "3 / 4", fit = "cover" }: { value: Photo; onChange: (next: Photo) => void; options: PhotoOption[]; onBusy: (delta: number) => void; previewRatio?: string; fit?: "cover" | "contain" }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    const input = event.target; setBusy(true); onBusy(1); setError("");
    try { const src = await uploadImage(file); onChange({ ...value, src, x: 50, y: 50, zoom: 1 }); }
    catch (e) { setError(e instanceof Error ? e.message : "Tải ảnh thất bại."); }
    finally { setBusy(false); onBusy(-1); input.value = ""; }
  }
  return <fieldset className="ln-admin-photo" disabled={busy}><div className="ln-admin-photo-view"><div className="ln-admin-photo-preview" style={{ aspectRatio: previewRatio, ...photoVariables(value) }}><Image src={value.src} alt={value.alt} fill sizes="(max-width: 600px) 100vw, 45vw" unoptimized style={{ objectFit: fit }} /></div><p className="ln-admin-caption">Xem trước vị trí ảnh · Khung {previewRatio.replace(" / ", ":")}</p></div><div className="ln-admin-photo-tools">
    <label className="ln-admin-upload">{busy ? "Đang tải ảnh…" : "↑ Thay ảnh từ máy"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={busy} /></label>
    <span className="ln-admin-caption">JPG, PNG, WebP · Tối đa 3 MB</span>
    <label className="ln-admin-field"><span>Hoặc chọn từ thư viện ảnh</span><select value={value.src} onChange={(e) => { const selected = options.find((o) => o.src === e.target.value); if (selected) onChange({ src: selected.src, alt: selected.alt, x: selected.x ?? 50, y: selected.y ?? 50, zoom: selected.zoom ?? 1 }); }}>{options.map((o) => <option key={o.src} value={o.src}>{o.alt}</option>)}</select></label>
    <label className="ln-admin-field"><span>Mô tả ảnh (SEO)</span><input value={value.alt} maxLength={300} onChange={(e) => onChange({ ...value, alt: e.target.value })} /></label>
    <label className="ln-admin-range"><span>Căn ngang · {value.x}%</span><input type="range" min="0" max="100" value={value.x} onChange={(e) => onChange({ ...value, x: Number(e.target.value) })} /></label>
    <label className="ln-admin-range"><span>Căn dọc · {value.y}%</span><input type="range" min="0" max="100" value={value.y} onChange={(e) => onChange({ ...value, y: Number(e.target.value) })} /></label>
    <label className="ln-admin-range"><span>Phóng ảnh · {Math.round((value.zoom ?? 1) * 100)}%</span><input type="range" min="1" max="3" step="0.05" value={value.zoom ?? 1} onChange={(e) => onChange({ ...value, zoom: Number(e.target.value) })} /></label>
    <p className="ln-admin-caption">Kéo thanh để xem thay đổi ngay. Nếu ảnh vừa khít một chiều, tăng mức phóng để căn được chiều đó. Bấm “Lưu thay đổi” để áp dụng lên website.</p>
    <button type="button" className="ln-admin-secondary" onClick={() => onChange({ ...value, x: 50, y: 50, zoom: 1 })}>Đặt lại vị trí ảnh</button>
    {error && <p className="ln-admin-error" role="alert">{error}</p>}
  </div></fieldset>;
}
