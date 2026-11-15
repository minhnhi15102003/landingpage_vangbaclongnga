# Vàng Bạc Long Nga

Landing page khởi tạo bằng Next.js App Router, React và TypeScript.

## Chạy local

```bash
npm install
npm run dev
```

Mở [website Long Nga](http://127.0.0.1:3001/) hoặc [trang quản trị](http://127.0.0.1:3001/011011000110111101101110011001110110111001100111011000010011000100111001001101010011010000110001001110010011010100110110).

Lệnh `npm run dev` mặc định dùng địa chỉ `127.0.0.1:3001`. Trên máy này cổng 3000 có thể dẫn tới dịch vụ khác khi trình duyệt chọn IPv4, vì vậy dùng các đường dẫn trên để mở đúng website.

Repository có bản nội dung công khai và ảnh logo hiện tại để khởi tạo website khi chưa có dữ liệu lưu trữ. Tài khoản, khóa bí mật và phiên đăng nhập không nằm trong repository; trên máy mới chạy `npm.cmd run admin:setup` để thiết lập quản trị. Muốn cập nhật bản nội dung khởi tạo từ admin local trước khi commit, chạy `node scripts/export-public-content.cjs`.

## Ghi chú giao diện base

- Logo chữ, hình minh họa trang sức và giá đang là placeholder; thay bằng logo, ảnh và bảng giá chính thức khi có dữ liệu.
- Trang chủ đã có các khu vực: hero, bảng giá, sản phẩm, câu chuyện thương hiệu, giá trị, liên hệ và footer.
- Bố cục hiện tại theo phong cách tạp chí trang sức: chữ lớn, ảnh xen kẽ và các khối đỏ rượu vang/vàng nhạt. Footer dùng cùng khung trang, kiểu chữ và bảng màu.
- Các ảnh minh họa tạm đã được tối ưu WebP. Nguồn tạo và bộ prompt được ghi trong [public/images/README.md](public/images/README.md).
- Trang quản trị tại đường dẫn riêng ở trên quản lý nhóm giá, giá mua/bán, sản phẩm, bộ sưu tập, ảnh, thông báo, nội dung, liên hệ và SEO.
- Đăng nhập riêng bằng bcrypt, phiên HttpOnly và kiểm tra quyền tại server. Tạo/đổi tài khoản bằng `npm.cmd run admin:setup`.
- Mặc định lưu local ngoài public; có adapter kho GitHub riêng tư để lưu nội dung lâu dài khi triển khai serverless. Vercel mới deploy dùng bản nội dung đã đóng gói; muốn đăng nhập và sửa nội dung online cần cấu hình kho GitHub riêng tư.
- Xem [hướng dẫn quản trị, bảo mật và triển khai](docs/ADMIN.md) và [.env.example](.env.example).
