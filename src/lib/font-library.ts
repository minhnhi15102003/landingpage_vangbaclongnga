import installedFonts from "./fonts.generated.json";

export type FontFace = { weight: string; style: string; src?: string; local?: string[] };
export type FontOption = { id: string; label: string; family: string; faces: FontFace[]; localOnly: boolean };
const builtins: FontOption[] = [
  { id: "oswald", label: "Oswald", family: "Oswald", faces: [], localOnly: false },
  { id: "be-vietnam-pro", label: "Be Vietnam Pro", family: "Be Vietnam Pro", faces: [], localOnly: false },
  { id: "dm-sans", label: "DM Sans", family: "DM Sans", faces: [], localOnly: false },
  { id: "playfair-display", label: "Playfair Display", family: "Playfair Display", faces: [], localOnly: false },
];
const localFonts = installedFonts as { id: string; label: string; faces: FontFace[]; localOnly: boolean }[];
export const fontOptions: FontOption[] = [...builtins, ...localFonts.map((font) => ({ ...font, family: `LN-${font.id}` }))];
const byId = new Map(fontOptions.map((font) => [font.id, font]));
export const installedFontCount = installedFonts.length;
export function findFont(id?: string) { return id ? byId.get(id) : undefined; }
export function fontFamily(id?: string) {
  const font = findFont(id);
  return font ? `${cssString(font.family)}, "Be Vietnam Pro", Arial, sans-serif` : undefined;
}
function cssString(value: string) { return JSON.stringify(value).replace(/</g, "\\3c "); }
export function fontFaceCSS(ids: (string | undefined)[]) {
  return [...new Set(ids)].flatMap((id) => {
    const font = findFont(id);
    return font?.faces.map((face) => {
      const sources = face.src ? `url(${cssString(face.src)}) format("woff")` : (face.local ?? []).map((name) => `local(${cssString(name)})`).join(",");
      return `@font-face{font-family:${cssString(font.family)};src:${sources};font-weight:${face.weight};font-style:${face.style};font-display:swap;}`;
    }) ?? [];
  }).join("\n");
}
