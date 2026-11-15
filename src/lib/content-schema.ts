import { z } from "zod";
import { typographySchema } from "./typography-schema";
import { MIN_LOGO_SCALE, MAX_LOGO_SCALE, MAX_FOOTER_LOGO_MARGIN_TOP } from "./logo-layout";

const text = z.string().trim().max(1600);
const title = z.string().trim().min(1).max(160);
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/);
export const imageSource = z.string().regex(/^\/(?:images\/[a-zA-Z0-9_/-]+\.(?:webp|png|jpe?g)|api\/media\/[a-f0-9-]{36}\.webp)$/);
export const photoSchema = z.object({
  src: imageSource, alt: z.string().trim().min(1).max(300),
  x: z.number().min(0).max(100), y: z.number().min(0).max(100),
  zoom: z.number().min(1).max(3).optional(),
}).strict();
const httpsLink = z.string().url().max(2500).refine((value) => new URL(value).protocol === "https:", "Chỉ chấp nhận liên kết https.");
const copySchema = z.object({
  heroTitle: title, heroVertical: title, heroButton: title, heroSignature: title, heroDescription: text,
  introKicker: title, introTitle: text, introNote: text,
  miniRingTitle: title, miniRingDescription: text, miniBangleTitle: title, miniBangleDescription: text,
  signatureTitle: text, signatureDescription: text,
  craftKicker: title, craftTitle: text, craftDescription: text, craftButton: title,
  spotlightKicker: title, spotlightTitle: text, spotlightDescription: text, spotlightButton: title,
  spotlightHeading: text, spotlightCaption: text,
  collectionKicker: title, collectionTitle: title,
  priceKicker: title, priceTitle: text, priceDescription: text, priceNote: text,
  consultationKicker: title, consultationTitle: text, consultationButton: title,
  promisesKicker: title, promisesTitle: title, footerDescription: text,
}).strict();
export const imageKeys = ["hero", "introInset", "introPortrait", "miniRing", "miniBangle", "craft", "spotlightMain", "spotlightDetail", "consultation"] as const;
export const contentSchema = z.object({
  schemaVersion: z.literal(1), updatedAt: z.string().datetime().nullable(),
  site: z.object({
    name: title, shortName: title, tagline: title, logo: z.union([z.literal(""), imageSource]),
    logoScale: z.number().int().min(MIN_LOGO_SCALE).max(MAX_LOGO_SCALE).optional(),
    footerLogo: z.union([z.literal(""), imageSource]).optional(),
    footerLogoScale: z.number().int().min(MIN_LOGO_SCALE).max(MAX_LOGO_SCALE).optional(),
    footerLogoAlign: z.enum(["left", "center", "right"]).optional(),
    footerLogoMarginTop: z.number().int().min(0).max(MAX_FOOTER_LOGO_MARGIN_TOP).optional(),
    address: title, phone: z.string().regex(/^\+?[0-9 ]{9,16}$/), email: z.string().email().max(200),
    facebook: httpsLink, zalo: httpsLink, maps: httpsLink,
    latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180),
    seoTitle: title, seoDescription: z.string().trim().min(1).max(320),
  }).strict(),
  announcement: z.object({ enabled: z.boolean(), text }).strict(),
  typography: typographySchema.optional(),
  copy: copySchema,
  images: z.record(z.enum(imageKeys), photoSchema),
  products: z.array(z.object({ id, category: title, name: title, description: text, photo: photoSchema }).strict()).length(2),
  collections: z.array(z.object({ id, name: title, description: text, photo: photoSchema, visible: z.boolean() }).strict()).max(16),
  prices: z.object({
    unit: z.string().trim().min(1).max(80),
    groups: z.array(z.object({
      id, name: title, description: text,
      items: z.array(z.object({
        id, name: title, detail: z.string().trim().max(160),
        buy: z.number().int().min(0).max(1_000_000_000_000).nullable(),
        sell: z.number().int().min(0).max(1_000_000_000_000).nullable(),
        tone: z.enum(["gold", "warm", "soft", "silver"]),
      }).strict()).max(100),
    }).strict()).max(30),
  }).strict(),
  questions: z.array(z.object({ id, title, text }).strict()).max(15),
  promises: z.array(z.object({ kind: z.enum(["quality", "care", "lasting"]), title, description: text }).strict()).length(3),
}).strict().superRefine((value, ctx) => {
  const ids = [ ...value.products.map((x) => x.id), ...value.collections.map((x) => x.id),
    ...value.prices.groups.flatMap((g) => [g.id, ...g.items.map((x) => x.id)]), ...value.questions.map((x) => x.id) ];
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "Mã dữ liệu bị trùng." });
  if (value.prices.groups.reduce((n, g) => n + g.items.length, 0) > 500) ctx.addIssue({ code: "custom", message: "Tối đa 500 dòng giá." });
});

export type SiteContent = z.infer<typeof contentSchema>;
export type Photo = z.infer<typeof photoSchema>;
export type ImageKey = typeof imageKeys[number];

export const imageLabels: Record<ImageKey, string> = {
  hero: "Nền header", introInset: "Ảnh nhỏ phần giới thiệu", introPortrait: "Ảnh lớn phần giới thiệu",
  miniRing: "Ảnh nhẫn thu nhỏ", miniBangle: "Ảnh vòng tay thu nhỏ", craft: "Ảnh chế tác",
  spotlightMain: "Ảnh chính khu vực tuyển chọn", spotlightDetail: "Ảnh phụ khu vực tuyển chọn", consultation: "Ảnh tư vấn",
};

export const copyLabels: Record<keyof SiteContent["copy"], string> = {
  heroTitle: "Header · Chữ lớn", heroVertical: "Header · Chữ dọc", heroButton: "Header · Nút khám phá", heroSignature: "Header · Dòng nhấn", heroDescription: "Header · Mô tả",
  introKicker: "Giới thiệu · Nhãn", introTitle: "Giới thiệu · Tiêu đề", introNote: "Giới thiệu · Lời nhắn",
  miniRingTitle: "Ảnh nhẫn nhỏ · Tên", miniRingDescription: "Ảnh nhẫn nhỏ · Mô tả", miniBangleTitle: "Ảnh vòng nhỏ · Tên", miniBangleDescription: "Ảnh vòng nhỏ · Mô tả",
  signatureTitle: "Sản phẩm · Tiêu đề", signatureDescription: "Sản phẩm · Mô tả",
  craftKicker: "Chế tác · Nhãn", craftTitle: "Chế tác · Tiêu đề", craftDescription: "Chế tác · Mô tả", craftButton: "Chế tác · Nút",
  spotlightKicker: "Tuyển chọn · Nhãn", spotlightTitle: "Tuyển chọn · Tiêu đề", spotlightDescription: "Tuyển chọn · Mô tả", spotlightButton: "Tuyển chọn · Nút",
  spotlightHeading: "Tuyển chọn · Dòng nhấn", spotlightCaption: "Tuyển chọn · Chú thích",
  collectionKicker: "Bộ sưu tập · Nhãn", collectionTitle: "Bộ sưu tập · Tiêu đề",
  priceKicker: "Bảng giá · Nhãn", priceTitle: "Bảng giá · Tiêu đề", priceDescription: "Bảng giá · Mô tả", priceNote: "Bảng giá · Ghi chú",
  consultationKicker: "Tư vấn · Nhãn", consultationTitle: "Tư vấn · Tiêu đề", consultationButton: "Tư vấn · Nút",
  promisesKicker: "Cam kết · Nhãn", promisesTitle: "Cam kết · Tiêu đề", footerDescription: "Footer · Mô tả thương hiệu",
};
