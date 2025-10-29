# Nội dung Mới cho MentorLink - Hướng Dẫn Triển Khai

## 📋 Tổng quan

Tôi vừa thêm hai trang mới cho dự án MentorLink:
- **Trang "Về MentorLink"** (`/about`) - Giới thiệu về dự án, tầm nhìn, sứ mệnh, giá trị cốt lõi
- **Trang "Trở thành Cố vấn"** (`/become-mentor`) - Hướng dẫn cho những người muốn trở thành mentor

## 📁 Những file được thêm/sửa

### File được tạo mới:

1. **`frontend/src/pages/common/AboutPage.jsx`**
   - Trang "Về MentorLink"
   - Bao gồm: Tầm nhìn, Sứ mệnh, Giá trị cốt lõi, Triết lý, Câu chuyện
   - Responsive design, Bootstrap components

2. **`frontend/src/pages/common/BecomeACounselorPage.jsx`**
   - Trang "Trở thành Cố vấn"
   - Bao gồm: Tổng quan, Những việc có thể làm, Lợi ích, Quy trình, FAQ
   - Accordion, Timeline process, Responsive design

3. **`frontend/src/styles/components/About.css`**
   - CSS cho trang AboutPage
   - Gradient backgrounds, hover effects, responsive layout

4. **`frontend/src/styles/components/BecomeACounselor.css`**
   - CSS cho trang BecomeACounselorPage
   - Custom styling cho process timeline, cards, accordion

### File được sửa:

1. **`frontend/src/pages/common/index.js`**
   - Thêm export cho `AboutPage` và `BecomeACounselorPage`

2. **`frontend/src/routes/index.jsx`**
   - Thêm import cho hai component mới
   - Thêm hai routes:
     - `GET /about` → `AboutPage`
     - `GET /become-mentor` → `BecomeACounselorPage`

## 🔗 Navigation

Header đã có sẵn link đến hai trang mới:
- **"Về MentorLink"** link → `/about`
- **"Trở thành Cố vấn"** link → `/become-mentor`

(Nếu Header chưa có, hãy thêm link sau đây vào file `Header.jsx`):
```jsx
<Nav.Link as={Link} to="/about" className="nav-link">Về MentorLink</Nav.Link>
<Nav.Link as={Link} to="/become-mentor" className="nav-link">Trở thành Cố vấn</Nav.Link>
```

## 🎨 Thiết kế & Nội dung

### Trang "Về MentorLink":
- **Hero Section**: Giới thiệu với gradient background
- **Tầm nhìn & Sứ mệnh**: Hai card hiển thị tầm nhìn và sứ mệnh
- **Giá trị cốt lõi**: 4 card mô tả Minh bạch, Tiện lợi, Đa dạng, Bảo mật & Tín cậy
- **Triết lý**: Card dài giải thích triết lý của MentorLink
- **Câu chuyện**: Card kể câu chuyện hình thành của MentorLink
- **CTA**: Nút "Tìm Mentor" và "Trở thành Mentor"

### Trang "Trở thành Cố vấn":
- **Hero Section**: Giới thiệu với gradient background màu khác
- **Tổng quan**: Giải thích MentorLink là nền tảng trung gian
- **Những việc có thể làm**: 5 card mô tả các loại dịch vụ mentor có thể cung cấp
- **Lợi ích**: 4 card mô tả lợi ích khi tham gia (Thêm doanh thu, Tạo tác động, Xây dựng thương hiệu, Mở rộng mạng lưới)
- **Quy trình hoạt động**: Timeline với 5 bước
- **Chia sẻ câu chuyện**: Card khuyến khích mentor chia sẻ câu chuyện của họ
- **FAQ**: Accordion với 6 câu hỏi phổ biến
- **CTA**: Nút "Đăng ký ngay" và "Tôi muốn tìm mentor"

## 🚀 Cách sử dụng

### 1. Kiểm tra xem các file đã được thêm:
```bash
# Frontend pages
ls -la frontend/src/pages/common/About*
ls -la frontend/src/pages/common/BecomeAC*

# CSS styles
ls -la frontend/src/styles/components/About.css
ls -la frontend/src/styles/components/BecomeACounselor.css
```

### 2. Restart dev server:
```bash
cd frontend
npm run dev
```

### 3. Truy cập các trang mới:
- Trang "Về MentorLink": http://localhost:5173/about
- Trang "Trở thành Cố vấn": http://localhost:5173/become-mentor

## ✨ Đặc điểm

✅ **Responsive Design**: Tất cả trang đều responsive cho mobile, tablet, desktop
✅ **Bootstrap Components**: Sử dụng React Bootstrap cho consistency
✅ **Gradient Backgrounds**: Màu gradient hiện đại và bắt mắt
✅ **Hover Effects**: Các card có animation khi hover
✅ **Icons**: Sử dụng Bootstrap Icons (`bi`) cho visual enhancement
✅ **FAQ Accordion**: Accordion tương tác trên trang "Trở thành Cố vấn"
✅ **Timeline Process**: Hiển thị quy trình 5 bước một cách trực quan

## 📝 Nội dung

Tất cả nội dung đã được viết phù hợp với:
- ✅ Logic của dự án MentorLink (nền tảng trung gian mentor-mentee)
- ✅ Tham khảo cách viết của MoraNow
- ✅ Tiếng Việt chính tắc, dễ hiểu
- ✅ Không copy 1:1, tùy chỉnh để phù hợp với đặc thù MentorLink

## 🔧 Tùy chỉnh thêm

Nếu bạn muốn tùy chỉnh:

### Thay đổi màu gradient:
- AboutPage: Sửa `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- BecomeACounselorPage: Sửa `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`

### Thêm/bớt section:
- Edit trực tiếp trong file `.jsx`

### Thay đổi nội dung:
- Edit text trong các component

### Thay đổi styling:
- Edit các file `.css` tương ứng

## 📞 Hỗ trợ

Nếu gặp lỗi:
1. Kiểm tra xem tất cả import đã đúng
2. Kiểm tra xem routes đã được thêm
3. Restart dev server
4. Hard reload trình duyệt (Ctrl+Shift+R)

---

**Chúc mừng! Bạn đã thêm thành công hai trang nội dung mới cho MentorLink! 🎉**
