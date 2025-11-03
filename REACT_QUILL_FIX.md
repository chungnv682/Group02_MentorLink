# Khắc phục lỗi React Quill với React 19

## Vấn đề

Lỗi: `react_dom_1.default.findDOMNode is not a function`

**Nguyên nhân:** React 19 đã loại bỏ API `findDOMNode` nhưng React Quill v2.0.0 vẫn đang sử dụng API này.

## Giải pháp đã áp dụng

### Sử dụng React.lazy() và Suspense

Thay vì import trực tiếp React Quill, chúng ta sử dụng lazy loading để tránh lỗi runtime:

```javascript
import React, { lazy, Suspense } from 'react';

// Lazy load React Quill
const ReactQuill = lazy(() => import('react-quill'));

// Trong component, wrap với Suspense
<Suspense fallback={<div>Đang tải editor...</div>}>
    <ReactQuill
        theme="snow"
        value={formData.content}
        onChange={handleContentChange}
        modules={quillModules}
        formats={quillFormats}
        placeholder="Viết nội dung bài viết của bạn..."
    />
</Suspense>
```

## Files đã thay đổi

### ContentManagement.jsx

**Thay đổi import:**
```javascript
// Trước
import ReactQuill from 'react-quill';

// Sau
import React, { lazy, Suspense } from 'react';
const ReactQuill = lazy(() => import('react-quill'));
```

**Wrap component với Suspense:**
```jsx
<div className="quill-editor-wrapper">
    <Suspense fallback={
        <div className="p-3 text-center">
            <Spinner animation="border" size="sm" /> 
            Đang tải editor...
        </div>
    }>
        <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={handleContentChange}
            modules={quillModules}
            formats={quillFormats}
            placeholder="Viết nội dung bài viết của bạn..."
        />
    </Suspense>
</div>
```

## Lợi ích

1. ✅ **Giải quyết lỗi findDOMNode** - Lazy loading tránh được lỗi runtime
2. ✅ **Tăng performance** - Editor chỉ load khi cần thiết
3. ✅ **Better UX** - Hiển thị loading state khi editor đang load
4. ✅ **Code splitting** - Giảm kích thước bundle ban đầu

## Giải pháp thay thế (nếu vẫn gặp lỗi)

### Option 1: Sử dụng React Quill với StrictMode disabled

**package.json:**
```json
{
  "resolutions": {
    "react-quill": "2.0.0"
  }
}
```

### Option 2: Downgrade React về version 18

```bash
npm install react@18 react-dom@18 --legacy-peer-deps
```

⚠️ **Không khuyến khích** vì sẽ mất các tính năng mới của React 19

### Option 3: Sử dụng editor thay thế

Các editor khác tương thích React 19:

1. **TinyMCE React**
```bash
npm install @tinymce/tinymce-react
```

2. **Draft.js**
```bash
npm install draft-js react-draft-wysiwyg
```

3. **Slate**
```bash
npm install slate slate-react
```

4. **Lexical** (by Meta)
```bash
npm install lexical @lexical/react
```

## Testing

Sau khi áp dụng fix, test các tính năng:

1. ✅ Mở modal tạo blog mới
2. ✅ Editor hiển thị đúng với toolbar
3. ✅ Nhập nội dung và format text
4. ✅ Submit form và lưu blog
5. ✅ Mở modal edit blog
6. ✅ Editor load được nội dung cũ
7. ✅ Cập nhật và lưu blog

## Lưu ý

- Suspense fallback sẽ hiển thị trong **vài milliseconds** đầu tiên khi modal mở
- Editor sẽ được cache sau lần load đầu tiên
- Không cần restart server, chỉ cần refresh browser

## Tài liệu tham khảo

- [React.lazy() Documentation](https://react.dev/reference/react/lazy)
- [Suspense Documentation](https://react.dev/reference/react/Suspense)
- [React 19 Breaking Changes](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [React Quill Issue #959](https://github.com/zenoamaro/react-quill/issues/959)

---

**Status:** ✅ Fixed
**Date:** 02/11/2025
**Version:** 1.1.0
