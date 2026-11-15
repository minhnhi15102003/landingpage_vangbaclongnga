import type { CSSProperties } from "react";
import type { Photo } from "./content-schema";

export function photoVariables(photo: Photo, prefix = "photo"): CSSProperties {
  return {
    [`--${prefix}-position`]: `${photo.x}% ${photo.y}%`,
    [`--${prefix}-zoom`]: photo.zoom ?? 1,
  } as CSSProperties;
}
