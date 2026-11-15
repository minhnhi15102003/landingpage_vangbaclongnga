import Image from "next/image";
import BrandMark from "@/components/brand-mark";
import EditorialPhoto from "@/components/editorial-photo";
import { photoVariables } from "@/lib/photo-layout";
import { typographyCSS } from "@/lib/typography";
import { logoVariables, footerLogoSettings, footerLogoVariables } from "@/lib/logo-layout";
import SiteHeader from "@/components/site-header";
import { getPublicContent } from "@/lib/content";
import { campaignImages } from "@/lib/image-library";
import type { SiteContent } from "@/lib/content-schema";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getPublicContent();
  return { title: site.seoTitle, description: site.seoDescription, openGraph: { title: site.seoTitle, description: site.seoDescription, locale: "vi_VN", type: "website" } };
}

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d={diagonal ? "M4 14 14 4M4 4h10v10" : "M2 9h14m-5-5 5 5-5 5"} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PromiseIcon({ kind }: { kind: "quality" | "care" | "lasting" }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      {kind === "quality" && <><path d="m6 13 6-7h12l6 7-12 17L6 13Z" stroke="currentColor" strokeWidth="1.5" /><path d="M6 13h24M12 6l6 24 6-24M12 13l6-7 6 7" stroke="currentColor" strokeWidth="1.2" /></>}
      {kind === "care" && <><path d="M18 29 6.5 18a7 7 0 0 1 9.9-9.9L18 9.7l1.6-1.6a7 7 0 0 1 9.9 9.9L18 29Z" stroke="currentColor" strokeWidth="1.5" /><path d="m12 18 4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
      {kind === "lasting" && <><path d="M18 18c-5-9-14-9-14 0s9 9 14 0 14-9 14 0-9 9-14 0Z" stroke="currentColor" strokeWidth="1.7" /><path d="M18 5v4m0 18v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></>}
    </svg>
  );
}

function PriceSection({ content }: { content: SiteContent }) {
  const { prices, copy, site, updatedAt } = content;
  const money = (value: number | null) => value === null ? "Liên hệ" : new Intl.NumberFormat("vi-VN").format(value);
  return <section className="ln-price ln-inner" id="bang-gia" aria-labelledby="price-title">
    <div className="ln-section-heading ln-rule"><div><span className="ln-kicker">{copy.priceKicker}</span><h2 className="ln-lines" id="price-title">{copy.priceTitle}</h2></div><p className="ln-lines">{copy.priceDescription}</p></div>
    {prices.groups.length === 0 && <p>Bảng giá đang được cập nhật. Vui lòng liên hệ cửa hàng.</p>}
    {prices.groups.map((group) => <div className="price-card ln-price-group" key={group.id}>
      <div className="price-toolbar ln-price-group-heading">
        <div><h3>{group.name}</h3>{group.description && <p>{group.description}</p>}</div>
        <div className="ln-price-meta"><span className="price-status"><i aria-hidden="true" />{updatedAt ? `Cập nhật ${new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(updatedAt))}` : "Đang cập nhật giá"}</span><span className="ln-price-unit">{prices.unit}</span></div>
      </div>
      <div className="ln-price-scroll"><table className="price-table"><caption className="sr-only">{group.name} — giá mua vào và bán ra tại {site.name}</caption>
        <thead><tr><th scope="col">Loại sản phẩm</th><th scope="col">Mua vào</th><th scope="col">Bán ra</th></tr></thead>
        <tbody>{group.items.map((row) => <tr key={row.id}><th scope="row"><div className="price-product"><span><strong>{row.name}</strong><small>{row.detail}</small></span></div></th><td>{money(row.buy)}</td><td>{money(row.sell)}</td></tr>)}</tbody>
      </table></div><p className="price-note">{copy.priceNote}</p>
    </div>)}
  </section>;
}

export default async function Home() {
  const content = await getPublicContent();
  const { site, copy, images, products, collections: occasions, questions, promises, announcement } = content;
  const storeInfo = { ...site, phoneHref: `tel:${site.phone.replace(/\s/g, "")}`, mapEmbed: `https://www.google.com/maps?q=${site.latitude},${site.longitude}&z=17&output=embed` };
  return (
    <main className="ln-page" id="dau-trang">
      <style>{typographyCSS(content.typography)}</style>
      <div className="ln-showcase" style={logoVariables(site.logoScale)}>
        {announcement.enabled && announcement.text && <aside className="ln-store-announcement">{announcement.text}</aside>}
        <section className="ln-hero" aria-labelledby="hero-title">
          <EditorialPhoto photo={images.hero} mobilePhoto={images.hero.src === campaignImages.fanHero.src ? campaignImages.fanNecklace : undefined} className="ln-hero-photo" sizes="(min-width: 1648px) 1600px, (max-width: 600px) 100vw, (max-width: 800px) calc(100vw - 24px), calc(100vw - 48px)" priority />
          <div className="ln-hero-shade" />
          <SiteHeader brand={site} />
          <h1 className="ln-hero-title" id="hero-title"><span className="ln-hero-word">{copy.heroTitle}</span><span className="ln-hero-vertical">{copy.heroVertical}</span></h1>
          <a className="ln-button ln-hero-discover" href="#san-pham">{copy.heroButton} <Arrow diagonal /></a>
          <div className="ln-hero-bottom">
            <span className="ln-hero-signature">{copy.heroSignature} <span aria-hidden="true">✳</span></span>
            <p className="ln-lines">{copy.heroDescription}</p>
            <a className="ln-hero-price" href="#bang-gia">XEM BẢNG GIÁ <Arrow /></a>
          </div>
        </section>

        <section className="ln-intro ln-inner" aria-labelledby="intro-title">
          <div className="ln-intro-copy">
            <span className="ln-kicker">{copy.introKicker}</span>
            <h2 className="ln-lines" id="intro-title">{copy.introTitle}</h2>
            <div className="ln-intro-inset"><EditorialPhoto photo={images.introInset} sizes="(max-width: 700px) 46vw, 19vw" /><span className="ln-photo-cross" aria-hidden="true">＋</span></div>
            <p className="ln-intro-note ln-lines">{copy.introNote}</p>
          </div>
          <div className="ln-intro-edit">
            <a className="ln-mini-product" href="#san-pham">
              <div className="ln-mini-art" style={photoVariables(images.miniRing)}><Image src={images.miniRing.src} alt={images.miniRing.alt} unoptimized width={1254} height={1254} quality={90} sizes="(max-width: 360px) 62px, (max-width: 600px) 80px, (max-width: 800px) 54px, (max-width: 1100px) 70px, 95px" /></div>
              <div><h3>{copy.miniRingTitle}</h3><p className="ln-lines">{copy.miniRingDescription}</p></div><Arrow diagonal />
            </a>
            <a className="ln-mini-product" href="#san-pham">
              <div className="ln-mini-art" style={photoVariables(images.miniBangle)}><Image className="ln-mini-bangle" src={images.miniBangle.src} alt={images.miniBangle.alt} unoptimized width={1254} height={1254} quality={90} sizes="(max-width: 360px) 62px, (max-width: 600px) 80px, (max-width: 800px) 54px, (max-width: 1100px) 70px, 95px" /></div>
              <div><h3>{copy.miniBangleTitle}</h3><p className="ln-lines">{copy.miniBangleDescription}</p></div><Arrow diagonal />
            </a>
            <EditorialPhoto photo={images.introPortrait} className="ln-intro-portrait" sizes="(max-width: 700px) 88vw, 43vw" />
          </div>
        </section>

        <section className="ln-signature ln-inner" id="san-pham" aria-labelledby="signature-title">
          <div className="ln-section-heading ln-rule"><h2 className="ln-lines" id="signature-title">{copy.signatureTitle}</h2><p className="ln-lines">{copy.signatureDescription}</p></div>
          <div className="ln-signature-grid">
            <article className="ln-signature-copy"><span className="ln-kicker">{products[0].category}</span><h3>{products[0].name}</h3><p>{products[0].description}</p><a href="#thong-tin-cua-hang">TÌM HIỂU THÊM <Arrow /></a></article>
            <EditorialPhoto photo={products[0].photo} className="ln-signature-photo" sizes="(max-width: 700px) 43vw, 24vw" />
            <EditorialPhoto photo={products[1].photo} className="ln-signature-photo" sizes="(max-width: 700px) 43vw, 24vw" />
            <article className="ln-signature-copy"><span className="ln-kicker">{products[1].category}</span><h3>{products[1].name}</h3><p>{products[1].description}</p><a href="#thong-tin-cua-hang">TÌM HIỂU THÊM <Arrow /></a></article>
          </div>
        </section>

        <section className="ln-craft ln-inner" id="ve-chung-toi" aria-labelledby="craft-title">
          <EditorialPhoto photo={images.craft} className="ln-craft-photo" sizes="(max-width: 700px) 88vw, 45vw" />
          <div className="ln-craft-copy">
            <span className="ln-kicker">{copy.craftKicker}</span><h2 className="ln-lines" id="craft-title">{copy.craftTitle}</h2>
            <p>{copy.craftDescription}</p>
            <a className="ln-button ln-button-red" href="#loi-hua">{copy.craftButton} <Arrow diagonal /></a>
          </div>
        </section>

        <section className="ln-spotlight" aria-labelledby="spotlight-title">
          <span className="ln-spotlight-watermark" aria-hidden="true">{site.shortName}</span>
          <div className="ln-spotlight-grid ln-inner">
            <EditorialPhoto photo={images.spotlightMain} className="ln-spotlight-main" sizes="(max-width: 700px) 58vw, 32vw" />
            <div className="ln-spotlight-copy"><span className="ln-kicker">{copy.spotlightKicker}</span><h3 className="ln-lines">{copy.spotlightTitle}</h3><p className="ln-lines">{copy.spotlightDescription}</p><a className="ln-button ln-button-red" href="#bo-suu-tap">{copy.spotlightButton} <Arrow /></a></div>
            <EditorialPhoto photo={images.spotlightDetail} className="ln-spotlight-detail" sizes="(max-width: 700px) 26vw, 18vw" />
            <div className="ln-spotlight-heading"><h2 className="ln-lines" id="spotlight-title">{copy.spotlightHeading}</h2><p className="ln-lines">{copy.spotlightCaption}</p></div>
            <span className="ln-spotlight-star" aria-hidden="true">✳</span>
          </div>
        </section>

        <section className="ln-occasions ln-inner" id="bo-suu-tap" aria-labelledby="occasion-title">
          <div className="ln-centered-heading"><span className="ln-kicker">{copy.collectionKicker}</span><h2 id="occasion-title">{copy.collectionTitle}</h2></div>
          <div className="ln-occasion-grid">
            {occasions.filter((item) => item.visible).map((occasion) => <a className="ln-occasion-card" href="#thong-tin-cua-hang" key={occasion.id}><EditorialPhoto photo={occasion.photo} sizes="(max-width: 700px) 43vw, 23vw" /><h3>{occasion.name}</h3><p>{occasion.description}</p></a>)}
          </div>
        </section>

        <PriceSection content={content} />

        <section className="ln-consultation ln-inner" id="lien-he" aria-labelledby="consultation-title">
          <EditorialPhoto photo={images.consultation} className={`ln-consultation-photo${[campaignImages.fanSetPortrait.src, campaignImages.fanSetNoFace.src].includes(images.consultation.src) ? " ln-consultation-portrait" : ""}${images.consultation.src === campaignImages.fanSetSelectedHQ.src ? " ln-consultation-selected" : ""}`} sizes="(max-width: 700px) 88vw, 36vw" />
          <div className="ln-consultation-copy"><span className="ln-kicker">{copy.consultationKicker}</span><h2 className="ln-lines" id="consultation-title">{copy.consultationTitle}</h2>
            <div className="ln-questions">{questions.map((question, index) => <details key={question.id} open={index === 0}><summary>{question.title}<i aria-hidden="true">＋</i></summary><p>{question.text}</p></details>)}</div>
            <a className="ln-text-link" href="#thong-tin-cua-hang">{copy.consultationButton} <Arrow diagonal /></a>
          </div>
        </section>

        <section className="ln-promises ln-inner" id="loi-hua" aria-labelledby="promise-title">
          <div className="ln-centered-heading"><span className="ln-kicker">{copy.promisesKicker}</span><h2 id="promise-title">{copy.promisesTitle}</h2></div>
          <div className="ln-promise-grid">
            {promises.map((promise) => <article key={promise.kind}><PromiseIcon kind={promise.kind} /><h3>{promise.title}</h3><p>{promise.description}</p></article>)}
          </div>
        </section>
        <footer className="ln-footer" id="chan-trang" aria-label="Thông tin và điều hướng cuối trang">
          <div className="ln-inner">
            <details className="ln-location-map">
              <summary><span className="ln-map-caption"><svg width="18" height="22" viewBox="0 0 18 22" fill="none" aria-hidden="true"><path d="M16 8c0 5-7 12-7 12S2 13 2 8a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.2" /><circle cx="9" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" /></svg>{site.address}</span><span className="ln-map-toggle">XEM BẢN ĐỒ <span aria-hidden="true">＋</span></span></summary>
              <div className="ln-footer-map">
                <iframe title="Vị trí Vàng Bạc Long Nga tại Thôn Bái Thượng, Xã Lam Sơn, Thanh Hóa" src={storeInfo.mapEmbed} width="1000" height="320" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                <a href={storeInfo.maps} target="_blank" rel="noopener noreferrer">MỞ CHỈ ĐƯỜNG TRÊN GOOGLE MAPS <Arrow diagonal /></a>
              </div>
            </details>
            <div className="ln-footer-grid">
              <div className="ln-footer-brand footer-logo-layout" style={footerLogoVariables(site)}><BrandMark {...site} {...footerLogoSettings(site)} /><p className="ln-lines">{copy.footerDescription}</p></div>
              <nav className="ln-footer-column" aria-label="Khám phá Long Nga"><h3>KHÁM PHÁ</h3><a href="#bang-gia">Bảng giá</a><a href="#san-pham">Sản phẩm</a><a href="#bo-suu-tap">Bộ sưu tập</a></nav>
              <nav className="ln-footer-column" aria-label="Đồng hành cùng Long Nga"><h3>ĐỒNG HÀNH</h3><a href="#ve-chung-toi">Về Long Nga</a><a href="#lien-he">Tư vấn trang sức</a><a href="#loi-hua">Lời hứa từ Long Nga</a></nav>
              <nav className="ln-footer-column" aria-label="Kết nối với Long Nga"><h3>KẾT NỐI</h3><a href={storeInfo.facebook} target="_blank" rel="noopener noreferrer">Facebook <Arrow diagonal /></a><a href={storeInfo.zalo} target="_blank" rel="noopener noreferrer">Zalo · {storeInfo.phone} <Arrow diagonal /></a><a href={`mailto:${storeInfo.email}`}>Gửi email <Arrow diagonal /></a><a href={storeInfo.phoneHref}>Gọi cửa hàng <Arrow diagonal /></a></nav>
            </div>
            <div className="ln-footer-wordmark" aria-hidden="true">{site.shortName}<span>✳</span></div>
            <div className="ln-footer-bottom" id="cuoi-trang">
              <span>© {new Date().getFullYear()} {site.name}</span>
              <address className="ln-footer-inline-contact" id="thong-tin-cua-hang">
                <a href={storeInfo.maps} target="_blank" rel="noopener noreferrer">{storeInfo.address}</a>
                <a href={storeInfo.phoneHref} aria-label={`Gọi cửa hàng: ${storeInfo.phone}`}>{storeInfo.phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3")}</a>
              </address>
              <a href="#dau-trang">VỀ ĐẦU TRANG <Arrow diagonal /></a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
