import { z } from "zod";
import { findFont } from "./font-library";
import { textTargetKeys } from "./typography-targets";

export const fontIdSchema = z.string().max(80).refine((id) => !!findFont(id), "Chọn font có trong thư viện.");
export const textStyleSchema = z.object({
  font: fontIdSchema.optional(),
  size: z.number().int().min(8).max(800).optional(),
  mobileSize: z.number().int().min(8).max(800).optional(),
  weight: z.number().int().min(100).max(900).multipleOf(100).optional(),
}).strict();
export const typographySchema = z.object({
  headingFont: fontIdSchema.optional(), bodyFont: fontIdSchema.optional(),
  styles: z.partialRecord(z.enum(textTargetKeys), textStyleSchema).optional(),
}).strict();
export type Typography = z.infer<typeof typographySchema>;
export type TextStyle = z.infer<typeof textStyleSchema>;
