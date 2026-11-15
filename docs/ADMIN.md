# Quản trị website Long Nga

## Mở và đăng nhập

1. Chạy `npm.cmd run dev` trong thư mục dự án (mặc định cổng 3001).
2. Mở [trang quản trị](http://127.0.0.1:3001/011011000110111101101110011001110110111001100111011000010011000100111001001101010011010000110001001110010011010100110110). Trang đăng nhập nằm tại cùng đường dẫn với hậu tố `/login`. Đường dẫn `/admin` cũ không còn sử dụng.
3. Nếu chưa thiết lập tài khoản, chạy `npm.cmd run admin:setup` trong terminal để tự đặt tên đăng nhập và mật khẩu. Mật khẩu không hiển thị khi nhập.
4. Khởi động lại website sau khi đổi cấu hình tài khoản.

Mỗi máy chủ phát triển dùng thư mục biên dịch riêng theo cổng để có thể mở cổng 3000 và 3001 cùng lúc. Bản build production dùng thư mục riêng. Khi chạy nhiều máy chủ, mỗi máy chủ cần dùng cổng khác nhau.

Không có tài khoản mặc định, đăng ký công khai hoặc đường dẫn đặt lại mật khẩu công khai. Bản local đã được thiết lập tài khoản riêng bằng mật khẩu ngẫu nhiên khi triển khai chức năng này; mật khẩu được cung cấp trong cuộc trò chuyện, không ghi vào tài liệu hay mã nguồn.

Đổi mật khẩu:

```powershell
npm.cmd run admin:setup -- --rotate
```

Tạo mật khẩu ngẫu nhiên thay vì tự nhập:

```powershell
npm.cmd run admin:setup -- --generate
```

Lệnh tạo cấu hình riêng trong `.env.local`, chỉ lưu hash bcrypt và khóa phiên. Đổi hash hoặc khóa sẽ làm mọi phiên cũ mất hiệu lực. Giữ mật khẩu trong trình quản lý mật khẩu; không gửi qua email/chat nhóm. Không commit `.env.local` hoặc `.data`.

## Các phần có thể sửa

- **Cửa hàng & SEO → Logo thương hiệu**: kéo thanh **Kích thước logo** từ 50–250%, xem thay đổi ngay, rồi bấm **Lưu thay đổi**. Logo dùng cho header và làm logo dự phòng cho footer. Giữ tỉ lệ ảnh, tự thu gọn theo chiều ngang khi màn hình nhỏ. Nút **Đặt lại kích thước logo** đưa về 100%.
- **Cửa hàng & SEO → Logo dọc cho footer**: tải ảnh logo riêng dạng dọc (JPG/PNG/WebP, tối đa 3 MB), xem trước và chỉnh kích thước 50–250% độc lập với header. Logo giữ đúng tỷ lệ, mặc định sát đầu cột. Có thể căn trái/giữa/phải trong cột footer và chỉnh khoảng cách phía trên 0–160px bằng thanh trượt hoặc nhập số; bản xem trước cập nhật ngay. Bấm **Lưu thay đổi** để áp dụng. Nút **Đặt lại vị trí logo footer** đưa về căn trái, cách trên 0px. Nút **Dùng chung logo thương hiệu** bỏ lựa chọn logo dọc và dùng lại logo chính, vẫn giữ căn chỉnh footer; nếu chưa có cả hai ảnh thì hiển thị tên thương hiệu bằng chữ.

- **Kiểu chữ**: chọn font tiêu đề/nội dung chung hoặc chọn từng phần chữ; sửa cỡ chữ máy tính, điện thoại và độ đậm. Có tìm kiếm font, mẫu dấu tiếng Việt và nút khôi phục. Để trống cỡ chữ để giữ thiết kế responsive. Các thay đổi website chỉ áp dụng sau khi bấm **Lưu thay đổi**. Phần **Chữ trong trang quản lý** áp dụng ngay, lưu bằng localStorage riêng cho trình duyệt, không đổi chữ của khách truy cập.

- **Bảng giá**: thêm, đổi tên, mô tả, xóa và sắp xếp nhóm; thêm/sửa/xóa/sắp xếp dòng giá. Nhập giá bằng số nguyên như `8500000`; để trống để hiện “Liên hệ”; giá `0` vẫn là `0`. Có tối đa 30 nhóm, 100 dòng mỗi nhóm, tổng 500 dòng.
- **Sản phẩm & bộ sưu tập**: tên, loại, mô tả và ảnh của hai sản phẩm nổi bật; thêm/sửa/xóa/ẩn/sắp xếp tối đa 16 bộ sản phẩm.
- **Ảnh website**: nền header, ảnh giới thiệu, ảnh thu nhỏ, ảnh chế tác, ảnh tuyển chọn và ảnh tư vấn. Các vị trí có dữ liệu riêng, không tự thay toàn bộ ảnh dùng chung trước đây.
- **Nội dung & thông báo**: bật/tắt thông báo; nội dung header, giới thiệu, chế tác, bảng giá, footer; câu hỏi tư vấn; ba cam kết.
- **Cửa hàng & SEO**: logo, tên, địa chỉ, điện thoại, email, Facebook, Zalo, Google Maps, tọa độ vị trí, tiêu đề và mô tả trang.

Bấm **Lưu thay đổi** để công bố toàn bộ bản đang sửa. Tải ảnh lên chỉ lưu tệp; ảnh chưa xuất hiện trên trang chủ đến khi bấm Lưu. Thanh căn ngang/dọc chọn phần ảnh hiển thị trong khung. Mỗi ảnh có mô tả thay thế cho khả năng truy cập và SEO.

Giá và nội dung được ghi đè theo bản hiện tại; ứng dụng không tạo bảng lịch sử giá hoặc nhật ký nhân viên. Nếu lưu trong GitHub, GitHub tự có lịch sử commit của kho, bao gồm các lần cập nhật trạng thái bảo mật. Đây không phải hệ thống cơ sở dữ liệu hay nơi lưu trữ ảnh không giới hạn.

Nếu hai cửa sổ cùng sửa, cửa sổ lưu sau nhận lỗi xung đột. **Tải bản mới** sẽ hỏi trước khi bỏ chỉnh sửa chưa lưu. Nếu phiên hết hạn, mở trang đăng nhập trong tab mới, đăng nhập rồi trở lại tab đang sửa để Lưu tiếp.

## Thư viện ảnh mới

Trong **Ảnh website → Thư viện 8 ảnh trang sức mới** có thể xem ảnh đầy đủ ở tab mới. Các ảnh cũng có trong danh sách **Hoặc chọn từ thư viện ảnh** của từng khu vực, sản phẩm và bộ sưu tập. Chọn ảnh sẽ tự đặt mô tả thay thế và vị trí căn ban đầu; có thể sửa lại trước khi Lưu. Các ảnh này là ảnh AI tạo từ mẫu tham khảo người dùng cung cấp, cùng tông da và nền lụa đỏ của website. Ảnh hiện tại trên trang chủ không tự bị thay thế khi bổ sung thư viện.

## Bảo mật hiện có

- Băm mật khẩu bằng bcrypt (bcryptjs), cost 12 khi tạo bằng script. Tối thiểu 12 ký tự, tối đa 72 byte UTF-8; không lưu mật khẩu gốc.
- Phiên ngẫu nhiên 256 bit; phía kho chỉ lưu hash HMAC của token. Cookie HttpOnly, SameSite=Strict, Secure trên production, tên `__Host-` và Path=/, không Domain.
- Tối đa 8 giờ mỗi phiên, hết hạn sau 30 phút không có thao tác với máy chủ. Chỉ tải lại dữ liệu, lưu và upload được xem là hoạt động; gõ chữ trong trình duyệt không tự kéo dài phiên.
- Tối đa 5 lần thử trong 15 phút cho toàn tài khoản, và 10 lần cho mỗi IP trên Vercel. Giới hạn tính cả yêu cầu đang xử lý và các lần đăng nhập thành công trong khi cửa sổ đang đếm; đăng nhập thành công xóa hai bucket liên quan. Một đợt thử sai có thể tạm khóa cả chủ tài khoản để bảo vệ tài khoản duy nhất.
- Trạng thái giới hạn và phiên lưu trong kho bền vững; không phụ thuộc biến RAM của một Vercel function. Khóa/ghi đồng thời bằng SHA trên GitHub hoặc khóa tệp + ghi nguyên tử tại local.
- Từng API quản trị và trang quản trị tự kiểm tra phiên ở server. Middleware chỉ đặt CSP; không dùng middleware làm lớp kiểm tra quyền duy nhất.
- So sánh Origin và miền cấu hình cho mọi thao tác POST/PUT, kể cả đăng nhập/đăng xuất; không bật CORS cho nguồn ngoài.
- Đầu vào có schema phía server và giới hạn kích thước request. Nội dung văn bản được React escape; không cho nhập HTML thực thi. Liên kết ngoài chỉ nhận HTTPS. Iframe bản đồ dựng từ tọa độ, không nhận HTML iframe tùy ý.
- Chỉ nhận JPG/PNG/WebP tối đa 3 MB, 24 triệu pixel; đọc bằng bộ giải mã ảnh rồi chuyển sang WebP, loại metadata/EXIF, tên tệp là UUID; không nhận SVG, ảnh động hay tệp thực thi. Ảnh đầu ra tối đa 900 KB để phù hợp kho GitHub. Phần ảnh cũ chỉ bị bỏ tham chiếu, chưa tự xóa để tránh làm hỏng nội dung đang dùng.
- Admin có CSP nonce theo từng request, chống nhúng iframe, no-store, noindex; khóa bí mật chỉ dùng trong module server. Chính sách CSP dành cho CSS vẫn cho phép inline style để hỗ trợ style vị trí ảnh của React.
- Production bắt buộc HTTPS để cookie Secure hoạt động. Đây là đăng nhập một tài khoản bằng mật khẩu; **chưa có xác thực hai yếu tố, phân quyền nhiều nhân viên hoặc phục hồi qua email**.

Nguồn triển khai: [Next.js Authentication](https://nextjs.org/docs/app/guides/authentication), [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [Next.js CSP](https://nextjs.org/docs/14/app/building-your-application/configuring/content-security-policy).

## Lưu local

`CONTENT_STORAGE=local` lưu các tệp riêng ngoài thư mục public:

```text
.data/
  content.json
  security.json
  media/<uuid>.webp
```

Không có JSON nội dung riêng thì trang chủ dùng dữ liệu mẫu trong mã nguồn. Lần Lưu đầu tiên tạo nội dung riêng. `.data` và `.env.local` được gitignore. Sao lưu `.data` ngoài Git nếu cần; không xóa khi khởi động lại hoặc nâng cấp dự án. Sau một sự cố tiến trình ghi bị dừng đột ngột, nếu có khóa `.data/.write-lock`, chỉ gỡ khóa khi đã dừng mọi tiến trình đang ghi.

Không dùng cách ghi tệp local cho Vercel: đĩa triển khai không phải kho ghi dữ liệu lâu dài. Ứng dụng từ chối cấu hình local khi phát hiện Vercel.

## Cấu hình kho GitHub cho Vercel

Khi mới deploy và chưa cấu hình kho nội dung (hoặc vẫn đặt `CONTENT_STORAGE=local`), trang công khai dùng bản nội dung và logo đã đóng gói trong repository. Trang quản trị hiển thị hướng dẫn cấu hình; đăng nhập, lưu chỉnh sửa và upload ảnh chỉ hoạt động sau khi có kho bền vững. Ứng dụng không dùng ổ tạm của Vercel để lưu phiên hay dữ liệu quản trị. Khi đã chọn `CONTENT_STORAGE=github`, lỗi cấu hình/kết nối kho vẫn được báo để tránh hiển thị nhầm nội dung cũ.

Đây là adapter đã chuẩn bị sẵn; chưa tự tạo kho hoặc kết nối tài khoản GitHub. Cần chủ cửa hàng chọn và cung cấp cấu hình trước khi sử dụng trên mạng.

1. Tạo **kho riêng tư riêng cho nội dung**, ví dụ `longnga-content`, thêm README để có nhánh `main`. Không dùng kho mã nguồn đang liên kết deploy: các lần lưu sẽ tạo commit, không nên kích hoạt build lại toàn bộ website.
2. Tạo fine-grained access token chỉ cho kho nội dung này, quyền **Contents: Read and write**; không cấp quyền các kho khác. Metadata read là quyền mặc định. Có ngày hết hạn và nhắc gia hạn.
3. Thêm biến môi trường sau trên dịch vụ triển khai:

```dotenv
CONTENT_STORAGE=github
CONTENT_GITHUB_OWNER=<tai-khoan-github>
CONTENT_GITHUB_REPO=longnga-content
CONTENT_GITHUB_BRANCH=main
CONTENT_GITHUB_TOKEN=<token-rieng>
ADMIN_USERNAME=<ten-dang-nhap>
ADMIN_PASSWORD_HASH=<hash-bcrypt>
AUTH_SECRET=<khoa-base64url>
ADMIN_ORIGIN=https://ten-mien-chinh-cua-ban.vn
```

Lấy username/hash/secret từ `.env.local` đã được script thiết lập. Trong giao diện biến môi trường Vercel, nhập hash **nguyên bản**: bỏ dấu `\` trước các `$` và không thêm dấu nháy. Không đặt các biến bí mật với tiền tố `NEXT_PUBLIC_`.

4. Dùng bộ tài khoản/khóa khác cho Preview, tốt nhất kho nội dung Preview riêng; không cho bản Preview sửa dữ liệu thật. `ADMIN_ORIGIN` phải khớp chính xác origin đang truy cập, không dấu `/` cuối, không đường dẫn. Đổi tên miền cần cập nhật biến này và deploy lại.
5. Deploy. Trước lần lưu đầu, ứng dụng dùng nội dung mặc định. Khi đó vào admin và Lưu để tạo `content.json`; lần đăng nhập đầu tạo `security.json`. **Ảnh hoặc nội dung đã sửa local không tự chuyển sang kho GitHub.** Trước khi chuyển adapter, sao lưu và chép `content.json` + thư mục `media` từ `.data` vào kho nội dung qua công cụ GitHub/Git; không cần chuyển `security.json` (đăng nhập lại).
6. Bản công khai có cache dữ liệu tối đa 60 giây; Lưu từ admin làm mất cache ngay trên deployment đó. Sau khi sửa trực tiếp bằng công cụ khác, đợi cache hết hạn. Ảnh upload dùng URL mới và cache dài; ảnh cũ vẫn có thể được người đã biết URL truy cập.

Kho GitHub cần truy cập được và còn hạn mức API; nếu kho lỗi hoặc hết hạn token, admin dừng ghi và đăng nhập dừng hoạt động thay vì bỏ qua kiểm tra bảo mật. Ứng dụng kiểm tra kho phải riêng tư. Adapter phù hợp website nhỏ, ít người sửa; không có cam kết hoạt động 24/24 hoặc lưu trữ vô hạn. Trạng thái bảo mật/phiên cũng tạo ghi API và commit; không dùng cấu hình này cho hệ thống đông người đăng nhập.

[GitHub Contents API](https://docs.github.com/en/rest/repos/contents) yêu cầu SHA để cập nhật tệp có sẵn; ứng dụng dùng SHA để tránh ghi đè. Mỗi ảnh tối ưu dưới 1 MB để đọc bằng API này. Khi cần nhiều ảnh, lượng truy cập lớn, hoặc mức sẵn sàng cao, nên chuyển adapter sang kho object và dịch vụ phiên/giới hạn truy cập phù hợp.

### Chọn gói triển khai

Vercel nêu rõ [Hobby chỉ dành cho mục đích cá nhân, phi thương mại](https://vercel.com/docs/plans/hobby). Website giới thiệu cửa hàng cần chọn gói/dịch vụ cho phép sử dụng thương mại; không mặc định dùng Hobby cho bản kinh doanh chính thức. Chưa thực hiện deploy hay trỏ tên miền trong thay đổi này.

## Biên dịch

```powershell
npm.cmd run build
```

Khởi chạy production cần HTTPS phía reverse proxy và biến môi trường riêng. Không tắt Secure cookie để đưa bản production lên mạng qua HTTP.
