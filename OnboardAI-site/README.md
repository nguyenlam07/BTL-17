# OnboardAI – Website hợp nhất (New Hire · Mentor · HR/Admin)

Prototype frontend thuần HTML/CSS/JS, chạy tĩnh, không cần build.

## Cấu trúc
```
index.html            Trang chủ chọn vai trò
auth/                 Đăng nhập (login.html), Đăng ký (register.html) – giả lập bằng localStorage
newhire/              Nhân viên mới: index (tổng quan), checklist, ai-help
mentor/               Mentor: index (mentee · check-in · giao nhiệm vụ, điều hướng bằng hash)
hr/                   HR/Admin: index (báo cáo), employees, journeys (Bootstrap 5.3 + FontAwesome 6.4 qua CDN)
shared/role-switcher.js   Thanh chuyển vai trò chèn vào sidebar của mọi trang
docs/                 Tài liệu nhóm (screen list, kịch bản OBS, báo cáo AI, link Figma)
```
Mỗi phân hệ giữ CSS/JS riêng để không xung đột selector (`.sidebar`, `.nav-link`...).

## Chạy thử
Mở `index.html` bằng VS Code Live Server hoặc `python3 -m http.server` rồi vào `http://localhost:8000`.
Cần Internet để tải Bootstrap/FontAwesome (phân hệ HR) và Google Fonts.

## Giới hạn (cần nói trung thực khi trình bày)
- Dữ liệu mẫu; localStorage theo từng trình duyệt. Đăng nhập/đăng ký chỉ giả lập (mật khẩu băm SHA-256 lưu localStorage, không an toàn cho dữ liệu thật); không backend, đồng bộ hay AI API thật.
- Dữ liệu giữa 3 phân hệ chưa liên thông (tên nhân sự, tiến độ ở HR/Mentor là dữ liệu riêng).
- HR: nút Thêm/Sửa/Gửi email/Giao mentor chỉ hiện thông báo mô phỏng; Xóa chỉ xóa trong phiên hiện tại.
- Link Figma/Canva, video OBS, báo cáo AI trong `docs/` còn là bản nháp cần nhóm điền.

## Tài khoản demo
Mật khẩu chung `123456`: `newhire@onboardai.vn`, `mentor@onboardai.vn`, `hr@onboardai.vn`. Đăng ký mới sẽ chuyển thẳng tới không gian theo vai trò đã chọn.
