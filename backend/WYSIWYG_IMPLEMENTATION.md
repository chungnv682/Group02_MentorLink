# Hướng dẫn Triển khai WYSIWYG Editor cho Blog

## Tóm tắt các thay đổi

### 1. **Entity Blog.java** ✅
- Cột `content` đã được thay đổi từ `TEXT` sang `LONGTEXT`
- Điều này cho phép lưu trữ nội dung HTML phong phú từ WYSIWYG editor (bao gồm ảnh, định dạng, v.v.)

```java
@Column(name = "content", columnDefinition = "LONGTEXT")
private String content;
```

### 2. **DTO Request** ✅
Đã tạo hai DTO request mới:

#### CreateBlogRequest.java
```java
- title (bắt buộc)
- content (bắt buộc) - Hỗ trợ HTML từ WYSIWYG editor
- isPublished (tùy chọn)
```
⚠️ LƯU Ý: Không cần `statusId` - system sẽ tự động đặt status = PENDING

#### UpdateBlogRequest.java
```java
- title (bắt buộc)
- content (bắt buộc) - Hỗ trợ HTML từ WYSIWYG editor
- isPublished (tùy chọn)
```
⚠️ LƯU Ý: Không cần `statusId` - system sẽ tự động reset status = PENDING

### 3. **BlogService.java** ✅
Thêm hai method mới:
```java
BlogResponse createBlog(CreateBlogRequest request, Long authorId);
BlogResponse updateBlog(Long blogId, UpdateBlogRequest request, Long authorId);
```

### 4. **BlogServiceImpl.java** ✅
Đã implement các method:

#### createBlog()
- Tự động lấy status "Pending" từ database
- Không cần client truyền statusId
- Log: "Blog created successfully with ID: X and status: PENDING"

#### updateBlog()
- Tự động reset status về "Pending" khi blog được cập nhật
- Chỉ author hoặc admin mới có thể cập nhật blog
- Log: "Blog updated successfully with ID: X and status reset to: PENDING"

### 5. **BlogController.java** ✅
Thêm hai endpoint mới:

#### POST /blogs
```
Request: CreateBlogRequest + authorId (query param)
Response: BlogResponse
Status: PENDING (tự động)
```

#### PUT /blogs/{id}
```
Request: UpdateBlogRequest + authorId (query param)
Response: BlogResponse
Status: Reset to PENDING (tự động)
```

## Quy trình làm việc

### Khi người dùng tạo blog mới:
1. Frontend gửi POST /blogs với HTML content từ WYSIWYG editor
2. Backend tự động gán status = PENDING
3. Admin sẽ review blog
4. Nếu phê duyệt → status = APPROVED, isPublished = true

### Khi người dùng cập nhật blog:
1. Frontend gửi PUT /blogs/{id} với HTML content mới
2. Backend tự động reset status = PENDING (yêu cầu review lại)
3. Admin sẽ review blog được cập nhật
4. Nếu phê duyệt → status = APPROVED, isPublished = true

## Setup Database

Chạy script migration sau (nếu cần):

```sql
-- Cập nhật column content thành LONGTEXT
ALTER TABLE blog MODIFY COLUMN content LONGTEXT;

-- Đảm bảo có các status cần thiết
INSERT INTO status (code, name) VALUES ('PENDING', 'Pending') ON DUPLICATE KEY UPDATE name='Pending';
INSERT INTO status (code, name) VALUES ('APPROVED', 'Approved') ON DUPLICATE KEY UPDATE name='Approved';
INSERT INTO status (code, name) VALUES ('REJECTED', 'Rejected') ON DUPLICATE KEY UPDATE name='Rejected';
```

File script đã được tạo tại: `src/main/resources/db-migration-wysiwyg.sql`

## Hỗ trợ WYSIWYG Editor

Content field hiện tại hỗ trợ:
- ✅ Định dạng text (bold, italic, underline, v.v.)
- ✅ Danh sách (ordered, unordered)
- ✅ Tiêu đề (h1, h2, h3, v.v.)
- ✅ Liên kết (hyperlinks)
- ✅ Ảnh (dưới dạng base64 hoặc URL)
- ✅ Bảng (nếu WYSIWYG editor hỗ trợ)
- ✅ Mã (code blocks)
- ✅ HTML đầy đủ

## Frontend Integration

### Ví dụ sử dụng WYSIWYG Editor (với Quill hoặc TinyMCE):

#### Tạo blog mới:
```javascript
const createBlog = async (title, htmlContent, authorId) => {
  const response = await fetch(`/blogs?authorId=${authorId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title,
      content: htmlContent,  // HTML từ WYSIWYG editor
      isPublished: false
    })
  });
  return await response.json();
};
```

#### Cập nhật blog:
```javascript
const updateBlog = async (blogId, title, htmlContent, authorId) => {
  const response = await fetch(`/blogs/${blogId}?authorId=${authorId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title,
      content: htmlContent,  // HTML từ WYSIWYG editor
      isPublished: false
    })
  });
  return await response.json();
};
```

## Validation & Error Handling

- ✅ Title: bắt buộc, không được để trống
- ✅ Content: bắt buộc, không được để trống
- ✅ Author: phải tồn tại trong hệ thống
- ✅ Update: chỉ author hoặc admin có thể cập nhật
- ✅ Status "Pending": phải tồn tại trong database

## Compile & Test

Sau khi thay đổi, hãy chạy:

```bash
mvn clean compile -DskipTests
```

Đảm bảo không có compile errors trước khi deploy.

## Lợi ích của cách thiết kế này

1. **Workflow rõ ràng**: Tất cả blog mới/cập nhật đều phải qua PENDING trước khi được phê duyệt
2. **Bảo mật**: Chỉ author mới có thể cập nhật blog của mình
3. **Hỗ trợ WYSIWYG đầy đủ**: Content field có thể lưu HTML phức tạp
4. **Dễ bảo trì**: Tự động quản lý status, không cần client xử lý logic
5. **Mở rộng được**: Dễ dàng thêm các status khác (DRAFT, ARCHIVED, v.v.)

