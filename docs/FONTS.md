# Thư viện font tiếng Việt

Mục **Kiểu chữ** trong admin tìm và chọn font từ thư viện đã nhập. Chỉ font đang dùng mới có khai báo `@font-face` trên trang; không tải toàn bộ thư viện khi mở website.

## Nhập lại font từ Windows

```powershell
python scripts/import-vietnamese-fonts.py
```

Cần Python và `fontTools`. Lệnh đọc hai thư mục cài font của Windows và người dùng hiện tại; không sửa font gốc. Chỉ nhận font có đủ bộ chữ Unicode tiếng Việt, gồm đầy đủ dấu và chữ hoa/thường. Font dùng bảng mã cũ hoặc thiếu dấu không được đưa vào danh sách.

Kết quả gồm tệp WOFF trong `public/fonts/vietnamese/` và danh mục `src/lib/fonts.generated.json`. Đây là thư mục đầu ra được quản lý: script gỡ các tệp WOFF không còn được danh mục tham chiếu. ID họ font ổn định theo tên; tệp font được đặt tên theo hash nguồn để tránh trùng và giữ cache. Các font được rút gọn còn Latin, tiếng Việt, dấu kết hợp và ký hiệu cần thiết; font có cờ không cho rút gọn được giữ đầy đủ.

Font có cờ hạn chế nhúng, dữ liệu quyền nhúng mâu thuẫn hoặc bảng dữ liệu không chuyển đổi được dùng `local()` thay vì sao chép; danh sách đánh dấu **trên máy này**. Khi chọn các font đó, trình duyệt trên máy chưa cài font sẽ dùng font dự phòng. Việc đọc cờ tuân theo trường [OpenType OS/2 fsType](https://learn.microsoft.com/en-us/typography/opentype/spec/os2#fstype); script không sửa cờ nhúng của font. Thông tin bản quyền trong bảng tên font được giữ trong các tệp xuất.

## Cấu hình kiểu chữ

Nội dung có thêm trường `typography` tùy chọn, nên dữ liệu cũ không cần chuyển đổi. Font chỉ nhận ID trong danh mục; selector do mã nguồn quy định. Cỡ chữ từ 8–800 px, độ đậm từ 100–900. Cỡ máy tính áp dụng từ 601 px, cỡ điện thoại đến 600 px; bỏ trống một cỡ sẽ giữ CSS responsive hiện tại của cỡ đó.

Kiểm tra:

```powershell
node --test scripts/check-typography.cjs
```
