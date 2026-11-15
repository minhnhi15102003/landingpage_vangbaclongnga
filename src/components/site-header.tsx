"use client";

import { useEffect, useRef, useState } from "react";
import BrandMark from "./brand-mark";
import type { BrandProps } from "./brand-mark";

const links = [
  { href: "#bang-gia", label: "Bảng giá" },
  { href: "#san-pham", label: "Sản phẩm" },
  { href: "#ve-chung-toi", label: "Về Long Nga" },
  { href: "#lien-he", label: "Liên hệ" },
];

function restoreScrolling(lock: { current: string | null }) {
  if (lock.current !== null) {
    document.body.style.overflow = lock.current;
    lock.current = null;
  }
}

export default function SiteHeader({ brand }: { brand?: BrandProps }) {
  const [open, setOpen] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  const scrollLock = useRef<string | null>(null);

  useEffect(() => {
    const dialog = drawer.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) {
        scrollLock.current = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialog.showModal();
      }
      return;
    }
    if (!dialog.open) return;
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 240;
    const timer = window.setTimeout(() => { dialog.close(); restoreScrolling(scrollLock); }, delay);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const dialog = drawer.current;
    return () => {
      dialog?.close();
      restoreScrolling(scrollLock);
    };
  }, []);

  function onClosed() {
    if (drawer.current?.open) return;
    setOpen(false);
    restoreScrolling(scrollLock);
  }

  return (
    <header className="site-header editorial-header">
      <div className="header-inner section-wrap">
        <BrandMark {...brand} />
        <nav className="main-nav" aria-label="Điều hướng chính">
          {links.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}
        </nav>
        <a className="header-cta" href="#bang-gia">Xem bảng giá <span aria-hidden="true">↗</span></a>
        <div className="mobile-nav">
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-haspopup="dialog"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            onClick={() => setOpen(!open)}
          >
            <span className="menu-label">MENU</span>
            <span className="menu-lines" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </div>
      <dialog ref={drawer} className="site-menu-drawer" id="mobile-navigation" aria-labelledby="site-menu-title" data-state={open ? "open" : "closed"}
        onCancel={(event) => { event.preventDefault(); setOpen(false); }} onClose={onClosed}
        onPointerDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <div className="site-menu-panel">
          <div className="site-menu-heading"><h2 id="site-menu-title" className="site-menu-title">MENU</h2><button className="site-menu-close" type="button" aria-label="Đóng menu" onClick={() => setOpen(false)}><span aria-hidden="true">×</span></button></div>
          <nav className="mobile-nav-links" aria-label="Điều hướng">
            {links.map((link) => <a href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}<span aria-hidden="true">↗</span></a>)}
          </nav>
        </div>
      </dialog>
    </header>
  );
}
