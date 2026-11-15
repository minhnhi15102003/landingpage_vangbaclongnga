import type { Photo, SiteContent } from "./content-schema";
import { storeInfo } from "./store-info";
import { campaignImages } from "./image-library";

const photo = (file: string, alt: string, x = 50, y = 50): Photo => ({ src: `/images/${file}.webp`, alt, x, y });
const earring = campaignImages.fanEarrings;
const necklace = campaignImages.fanNecklace;

export const defaultContent: SiteContent = {
  schemaVersion: 1, updatedAt: null,
  site: {
    name: "Vàng Bạc Long Nga", shortName: "LONG NGA", tagline: "VÀNG BẠC · TRANG SỨC", logo: "",
    address: storeInfo.address, phone: storeInfo.phone, email: storeInfo.email,
    facebook: storeInfo.facebook, zalo: storeInfo.zalo, maps: storeInfo.maps,
    latitude: 19.9007188, longitude: 105.3823877,
    seoTitle: "Vàng Bạc Long Nga | Vẻ đẹp bền lâu",
    seoDescription: "Khám phá các thiết kế vàng bạc tinh tế và tham khảo bảng giá cập nhật từ Vàng Bạc Long Nga.",
  },
  announcement: { enabled: false, text: "" },
  copy: {
    heroTitle: "MỚI", heroVertical: "BỘ SƯU TẬP", heroButton: "KHÁM PHÁ NGAY", heroSignature: "NÉT RIÊNG", heroDescription: "Mỗi món trang sức,\nmột câu chuyện của riêng bạn.",
    introKicker: "LONG NGA / FINE JEWELLERY", introTitle: "Gìn giữ\nkhoảnh khắc.\nTrao gửi\nyêu thương.", introNote: "MỘT MÓN QUÀ. MỘT DẤU ẤN.\nTrân trọng từng lựa chọn của bạn.",
    miniRingTitle: "DẤU ẤN VÀNG SON", miniRingDescription: "Những đường nét tinh tế,\ncho điều ý nghĩa ở lại.", miniBangleTitle: "NÉT DUYÊN THANH LỊCH", miniBangleDescription: "Điểm nhấn vừa vặn,\nđồng hành cùng mỗi ngày.",
    signatureTitle: "Điểm nhấn\ncủa riêng bạn.", signatureDescription: "Được chọn bằng sự tinh tế.\nĐược đeo bằng sự tự tin.",
    craftKicker: "VẺ ĐẸP TỪ SỰ CHĂM CHÚT", craftTitle: "Từ đôi tay\nđến nét\ntinh tế.", craftDescription: "Một món trang sức đẹp bắt đầu từ sự tận tâm trong từng chi tiết. Long Nga trân trọng những giá trị được gìn giữ qua từng thiết kế.", craftButton: "CÂU CHUYỆN LONG NGA",
    spotlightKicker: "TUYỂN CHỌN ĐẶC BIỆT", spotlightTitle: "Ít cầu kỳ hơn.\nNhiều dấu ấn hơn.", spotlightDescription: "Khám phá những thiết kế\nđồng hành cùng bạn mỗi ngày.", spotlightButton: "XEM BỘ SƯU TẬP", spotlightHeading: "Tỏa sáng\nmỗi ngày.", spotlightCaption: "Một lựa chọn tinh tế.\nMột nét đẹp bền lâu.",
    collectionKicker: "CHO TỪNG KHOẢNH KHẮC", collectionTitle: "Bộ sưu tập tuyển chọn.",
    priceKicker: "THÔNG TIN TỪ CỬA HÀNG", priceTitle: "Bảng giá\ntại Long Nga.", priceDescription: "Tham khảo trước khi chọn lựa.\nVui lòng xác nhận báo giá tại thời điểm giao dịch.", priceNote: "Giá và đơn vị tính được xác nhận theo từng loại sản phẩm tại cửa hàng.",
    consultationKicker: "LONG NGA ĐỒNG HÀNH CÙNG BẠN", consultationTitle: "Chọn điều\nthật vừa vặn.", consultationButton: "THÔNG TIN CỬA HÀNG",
    promisesKicker: "ĐIỀU CHÚNG TÔI GÌN GIỮ", promisesTitle: "Lời hứa từ Long Nga.", footerDescription: "Vẻ đẹp tinh tế, giá trị bền lâu.\nTrân trọng từng dấu ấn của bạn.",
  },
  images: {
    hero: campaignImages.fanHero,
    introInset: campaignImages.fanBracelet, introPortrait: campaignImages.fanSet,
    miniRing: photo("intro-ring-render", "Nhẫn vàng đính đá trắng"), miniBangle: photo("intro-bangle-render", "Vòng tay vàng chạm hoa văn"),
    craft: photo("editorial-craft", "Đôi tay người thợ chăm chút chiếc nhẫn vàng", 42),
    spotlightMain: campaignImages.fanNecklaceWide, spotlightDetail: campaignImages.fanBracelet, consultation: campaignImages.fanSetSelectedHQ,
  },
  products: [
    { id: "product-necklace", category: "DÂY CHUYỀN", name: "ÁNH VÀNG DỊU DÀNG", description: "Một nét chạm thanh lịch, làm nổi bật vẻ đẹp tự nhiên và phong cách riêng.", photo: necklace },
    { id: "product-earring", category: "BÔNG TAI", name: "NGỌC NGÀ TINH KHÔI", description: "Vẻ đẹp tinh giản trong từng chi tiết, dành cho những khoảnh khắc đáng nhớ.", photo: earring },
  ],
  collections: [
    { id: "collection-earring", name: "CHO NGÀY TRỌNG ĐẠI", description: "Lưu giữ một lời hẹn ước", photo: earring, visible: true },
    { id: "collection-bracelet", name: "DẤU ẤN CỦA BẠN", description: "Một điểm nhấn thật vừa vặn", photo: campaignImages.fanBracelet, visible: true },
    { id: "collection-ring", name: "MÓN QUÀ TRÂN QUÝ", description: "Gửi trao điều ý nghĩa", photo: campaignImages.fanRing, visible: true },
    { id: "collection-necklace", name: "VẺ ĐẸP MỖI NGÀY", description: "Thanh lịch theo cách riêng", photo: campaignImages.fanNecklace, visible: true },
  ],
  prices: { unit: "VNĐ / chỉ", groups: [{ id: "group-main", name: "Bảng giá vàng bạc", description: "", items: [
    { id: "price-9999", name: "Vàng 999.9", detail: "Vàng 24K", buy: null, sell: null, tone: "gold" },
    { id: "price-750", name: "Vàng 750", detail: "Vàng 18K", buy: null, sell: null, tone: "warm" },
    { id: "price-610", name: "Vàng 610", detail: "Vàng 14.6K", buy: null, sell: null, tone: "soft" },
    { id: "price-silver", name: "Bạc trang sức", detail: "Bạc cao cấp", buy: null, sell: null, tone: "silver" },
  ] }] },
  questions: [
    { id: "question-style", title: "Chọn trang sức theo phong cách của bạn", text: "Một thiết kế tinh giản cho mỗi ngày, hay một điểm nhấn cho dịp đặc biệt? Long Nga cùng bạn tìm món trang sức phù hợp với sở thích và khoảnh khắc của mình." },
    { id: "question-price", title: "Tham khảo giá trước khi ghé cửa hàng", text: "Bạn có thể xem bảng giá trên trang và liên hệ cửa hàng để xác nhận giá, chất liệu cùng thông tin cụ thể của từng sản phẩm." },
    { id: "question-gift", title: "Một món quà mang nhiều ý nghĩa", text: "Hãy chia sẻ người bạn muốn tặng và dịp đặc biệt của họ. Chúng tôi sẽ đồng hành cùng bạn trong việc lựa chọn." },
  ],
  promises: [
    { kind: "quality", title: "THÔNG TIN RÕ RÀNG", description: "An tâm trong từng lựa chọn." },
    { kind: "care", title: "TƯ VẤN TẬN TÂM", description: "Lắng nghe điều bạn mong muốn." },
    { kind: "lasting", title: "ĐỒNG HÀNH DÀI LÂU", description: "Trân trọng từng dấu ấn của bạn." },
  ],
};
