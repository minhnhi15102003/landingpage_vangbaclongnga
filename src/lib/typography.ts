import { fontFaceCSS, fontFamily } from "./font-library";
import { typographySchema, type Typography } from "./typography-schema";
import { textTargetKeys, textTargets } from "./typography-targets";

export function typographyCSS(value?: Typography) {
  if (!value) return "";
  // Validate even at the rendering boundary; CSS only uses trusted selectors,
  // catalog font names, and bounded numeric values.
  const config = typographySchema.safeParse(value);
  if (!config.success) return "";
  const { headingFont, bodyFont, styles = {} } = config.data;
  const rules: string[] = [fontFaceCSS([headingFont, bodyFont, ...Object.values(styles).map((s) => s?.font)])];
  const heading = fontFamily(headingFont), body = fontFamily(bodyFont);
  if (heading) rules.push(`.ln-showcase{--display:${heading};}`);
  if (body) rules.push(`.ln-showcase{--subtitle:${body};--sans:${body};font-family:${body};}.ln-showcase .ln-button{font-family:${body};}`);
  for (const key of textTargetKeys) {
    const style = styles[key];
    if (!style) continue;
    const selector = textTargets[key].selector.split(",").map((s) => `.ln-showcase ${s.trim()}`).join(",");
    const declarations: string[] = [];
    const family = fontFamily(style.font);
    if (family) declarations.push(`font-family:${family}!important`);
    if (style.weight !== undefined) declarations.push(`font-weight:${style.weight}!important`);
    if (declarations.length) rules.push(`${selector}{${declarations.join(";")};}`);
    if (style.size !== undefined) rules.push(`@media(min-width:601px){${selector}{font-size:${style.size}px!important;}}`);
    if (style.mobileSize !== undefined) rules.push(`@media(max-width:600px){${selector}{font-size:${style.mobileSize}px!important;}}`);
  }
  return rules.join("\n");
}
