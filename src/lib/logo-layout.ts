import type { CSSProperties } from "react";

export const DEFAULT_LOGO_SCALE = 100;
export const MIN_LOGO_SCALE = 50;
export const MAX_LOGO_SCALE = 250;
export const MAX_FOOTER_LOGO_MARGIN_TOP = 160;
export type FooterLogoPosition = {
  footerLogoAlign?: "left" | "center" | "right";
  footerLogoMarginTop?: number;
};

export function footerLogoVariables({ footerLogoAlign = "left", footerLogoMarginTop = 0 }: FooterLogoPosition): CSSProperties {
  return {
    "--footer-logo-margin-top": `${footerLogoMarginTop}px`,
    "--footer-logo-margin-left": footerLogoAlign === "left" ? "0px" : "auto",
    "--footer-logo-margin-right": footerLogoAlign === "right" ? "0px" : "auto",
  } as CSSProperties;
}

export function logoVariables(scale = DEFAULT_LOGO_SCALE): CSSProperties {
  return { "--logo-scale": scale / 100 } as CSSProperties;
}

export function footerLogoSettings(site: { logo: string; logoScale?: number; footerLogo?: string; footerLogoScale?: number }) {
  const vertical = !!site.footerLogo;
  return {
    logo: site.footerLogo || site.logo,
    logoScale: vertical ? site.footerLogoScale : site.logoScale,
    vertical,
  };
}
