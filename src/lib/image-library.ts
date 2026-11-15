import type { Photo } from "./content-schema";

// Newly generated campaign photographs can be selected without uploading again.
export const campaignImages = {
  cloverDrape: { src: "/images/campaign/clover-bracelet-drape.webp", alt: "Lắc vàng cỏ bốn lá trên cổ tay đặt trên lụa đỏ", x: 50, y: 50 },
  cloverRaised: { src: "/images/campaign/clover-bracelet-raised.webp", alt: "Lắc vàng hoa bốn cánh và thanh nối trên cổ tay nghiêng", x: 50, y: 52 },
  butterfly: { src: "/images/campaign/butterfly-necklace.webp", alt: "Dây chuyền vàng bướm dáng chữ Y trên cổ người mẫu", x: 50, y: 53 },
  leafNecklace: { src: "/images/campaign/leaf-pearl-necklace.webp", alt: "Dây chuyền vàng họa tiết lá và ngọc trai trên cổ người mẫu", x: 50, y: 50 },
  leafEarrings: { src: "/images/campaign/leaf-pearl-earrings.webp", alt: "Bông tai vàng lá và ngọc trai đeo trên tai người mẫu", x: 50, y: 50 },
  leafBracelet: { src: "/images/campaign/leaf-pearl-bracelet.webp", alt: "Lắc vàng bản lá và ngọc trai đeo trên cổ tay", x: 50, y: 50 },
  fanHero: { src: "/images/campaign/fan-gold-hero-selected-v3.webp", alt: "Dây chuyền vàng hình quạt trên cổ và vai nghiêng cùng lụa đỏ burgundy", x: 85, y: 50 },
  fanNecklace: { src: "/images/campaign/fan-gold-necklace-pose-v4.webp", alt: "Dây chuyền vàng hình quạt xòe trên cổ và vai nghiêng nhẹ cùng lụa đỏ burgundy", x: 50, y: 50 },
  fanNecklaceWide: { src: "/images/campaign/fan-gold-necklace-wide-pose-v4.webp", alt: "Dây chuyền vàng hình quạt trên vai người mẫu góc ba phần tư cùng lụa đỏ burgundy", x: 85, y: 50 },
  fanEarrings: { src: "/images/campaign/fan-gold-earrings-v2.webp", alt: "Bông tai vàng dáng quạt rủ với những nan vàng đan thoáng", x: 50, y: 50 },
  fanBracelet: { src: "/images/campaign/fan-gold-bracelet-v2.webp", alt: "Lắc tay vàng họa tiết quạt xòe trên cổ tay đặt trên lụa đỏ", x: 50, y: 50 },
  fanRing: { src: "/images/campaign/fan-gold-ring-pose-v2.webp", alt: "Nhẫn vàng mặt quạt xòe đeo trên bàn tay buông nhẹ qua nếp lụa đỏ burgundy", x: 48, y: 50 },
  fanSet: { src: "/images/campaign/fan-gold-set-v2.webp", alt: "Bộ dây chuyền và lắc tay vàng hình quạt xòe phối cùng lụa đỏ burgundy", x: 50, y: 50 },
  fanSetGraceful: { src: "/images/campaign/fan-gold-set-graceful-v3.webp", alt: "Bộ dây chuyền và lắc tay vàng hình quạt, bàn tay đặt nhẹ trên vai cùng lụa đỏ burgundy", x: 50, y: 46 },
  fanSetPortrait: { src: "/images/campaign/fan-gold-set-portrait-v4.webp", alt: "Người mẫu nghiêng nhẹ, tay nâng hờ gần cằm, đeo bộ vàng hình quạt cùng lụa đỏ burgundy", x: 55, y: 48 },
  fanSetNoFace: { src: "/images/campaign/fan-gold-set-no-face-v5.webp", alt: "Ảnh cận không lộ mặt, dáng hai tay mềm mại cùng dây chuyền và lắc vàng hình quạt trên lụa đỏ burgundy", x: 50, y: 50 },
  fanSetSelectedHQ: { src: "/images/campaign/fan-gold-set-selected-hq-v7.webp", alt: "Ảnh cận bộ dây chuyền và lắc tay vàng hình quạt, dáng tay thanh thoát trên lụa đỏ burgundy", x: 50, y: 50 },
} satisfies Record<string, Photo>;

export const campaignPhotos: Photo[] = Object.values(campaignImages);
