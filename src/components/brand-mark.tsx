import Image from "next/image";
import { logoVariables } from "@/lib/logo-layout";
export type BrandProps = { name: string; shortName: string; tagline: string; logo: string; logoScale?: number };
export default function BrandMark({ name = "Vàng Bạc Long Nga", shortName = "LONG NGA", tagline = "VÀNG BẠC · TRANG SỨC", logo = "", logoScale, vertical = false }: Partial<BrandProps> & { vertical?: boolean }) {
  return (
    <a className="brand" href="#dau-trang" aria-label={`${name} – về đầu trang`} style={logoVariables(logoScale)}>
      {logo ? <Image className={`brand-logo${vertical ? " brand-logo-vertical" : ""}`} src={logo} alt={name} width={vertical ? 120 : 150} height={vertical ? 180 : 64} unoptimized /> : <span className="brand-symbol" aria-hidden="true">LN</span>}
      <span className="brand-name">
        <strong>{shortName}</strong>
        <small>{tagline}</small>
      </span>
    </a>
  );
}
