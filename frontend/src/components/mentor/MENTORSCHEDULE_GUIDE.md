# 📅 Mentor Schedule Feature - Tài liệu Hướng Dẫn

## Giới Thiệu

Tính năng **Mentor Schedule** cho phép mentee xem và đặt lịch tư vấn của mentor theo từng slot thời gian. Thiết kế được lấy cảm hứng từ mô hình booking của **Booking Care**.

### Đặc Điểm Chính

✅ **Hiển thị lịch 3 ngày tới** - Chỉ cho phép xem lịch trong 3 ngày kế tiếp  
✅ **Định dạng theo ngày** - Nhóm các slot theo từng ngày (Hôm nay, Ngày mai, Ngày kia)  
✅ **Hiển thị giá & trạng thái** - Giá tiền (VNĐ) và trạng thái đặt (Còn trống/Đã đặt)  
✅ **Đặt lịch trực tiếp** - Modal xác nhận với thông tin chi tiết  
✅ **Responsive design** - Hỗ trợ mọi kích thước màn hình  
✅ **Loading & Error states** - Xử lý các trạng thái UI khác nhau  

---

## Cấu Trúc Files

```
frontend/src/
├── components/mentor/
│   └── MentorSchedule.jsx                 # Component chính
├── hooks/
│   ├── useSchedule.js                     # Custom hook (logic)
│   └── index.js                           # Export hook
├── services/mentor/
│   └── ScheduleService.js                 # API service
├── styles/components/
│   └── MentorSchedule.css                 # Styling
└── pages/mentor/
    └── MentorDetailPage.jsx               # Import & sử dụng component
```

---

## API Response Format

Dữ liệu từ backend có cấu trúc như sau:

```json
{
    "requestDateTime": "2025-10-27T19:25:03.136459",
    "respCode": "0",
    "description": "Get upcoming schedules for mentor successfully",
    "data": [
        {
            "scheduleId": 1,
            "date": "2025-10-27",
            "timeSlots": [
                {
                    "timeSlotId": 16,
                    "timeStart": 15,
                    "timeEnd": 16
                }
            ],
            "price": 500.0,
            "emailMentor": "mentor1@gmail.com",
            "isBooked": false
        }
    ]
}
```

### Thuộc Tính Quan Trọng:
- `scheduleId` (number): ID schedule
- `date` (string): Ngày (format: YYYY-MM-DD)
- `timeSlots` (array): Danh sách các khung giờ
  - `timeSlotId`: ID slot
  - `timeStart`: Giờ bắt đầu (0-23)
  - `timeEnd`: Giờ kết thúc (0-23)
- `price` (number): Giá tiền (VNĐ)
- `emailMentor` (string): Email mentor
- `isBooked` (boolean): Trạng thái đã đặt hay chưa

---

## Component API

### MentorSchedule Component

#### Props:
```jsx
<MentorSchedule 
    mentorId={mentorId}           // Required: ID của mentor
    mentorName="Nguyễn Bá Hiến"   // Optional: Tên mentor (hiển thị trong modal)
/>
```

#### Cách Sử Dụng:

```jsx
import { MentorSchedule } from '../../components/mentor';

function MentorDetailPage() {
    const { id } = useParams();
    
    return (
        <MentorSchedule 
            mentorId={id} 
            mentorName={mentor.fullname}
        />
    );
}
```

---

## Custom Hook - useSchedule

Quản lý toàn bộ logic liên quan đến schedule.

### Sử Dụng:

```jsx
import useSchedule from '../../hooks/useSchedule';

const { 
    schedules,                    // Array: Danh sách schedules
    groupedSchedules,             // Object: Schedules nhóm theo ngày
    loading,                      // Boolean: Đang tải
    error,                        // String: Thông báo lỗi
    fetchUpcomingSchedules,       // Function: Fetch lại dữ liệu
    getSortedTimeSlots,           // Function: Sắp xếp time slots
    formatTimeSlot,               // Function: Format thời gian (09:00 - 10:00)
    formatDate,                   // Function: Format ngày
    getDateLabel,                 // Function: Nhãn ngày (Hôm nay, Ngày mai...)
    formatPrice,                  // Function: Format giá VNĐ
    bookSlot                      // Function: Đặt slot
} = useSchedule(mentorId);
```

### Hàm Chính:

#### 1. fetchUpcomingSchedules()
```javascript
// Tự động gọi lần đầu khi component mount
// Lọc lịch 3 ngày tới
// Sắp xếp theo ngày

await fetchUpcomingSchedules();
```

#### 2. formatTimeSlot(timeStart, timeEnd)
```javascript
formatTimeSlot(15, 16)  // Output: "15:00 - 16:00"
```

#### 3. getDateLabel(dateString)
```javascript
getDateLabel("2025-10-27")  // Output: "Hôm nay"
getDateLabel("2025-10-28")  // Output: "Ngày mai"
getDateLabel("2025-10-29")  // Output: "Ngày kia"
```

#### 4. formatPrice(price)
```javascript
formatPrice(500)        // Output: "500,00₫"
formatPrice(500000)     // Output: "500.000,00₫"
```

#### 5. bookSlot(scheduleId, timeSlotId, bookingData)
```javascript
try {
    const response = await bookSlot(1, 16, {
        notes: 'Ghi chú thêm'
    });
    console.log('Đặt lịch thành công!');
} catch (error) {
    console.log('Lỗi:', error.message);
}
```

---

## ScheduleService API

### Các Phương Thức:

#### 1. getUpcomingSchedules(mentorId)
```javascript
const response = await ScheduleService.getUpcomingSchedules(4);
// GET /api/schedules/mentor/4/upcoming
```

#### 2. getSchedulesByDateRange(mentorId, startDate, endDate)
```javascript
const response = await ScheduleService.getSchedulesByDateRange(
    4,
    '2025-10-27',
    '2025-10-30'
);
// GET /api/schedules/mentor/4?startDate=2025-10-27&endDate=2025-10-30
```

#### 3. getTimeSlots()
```javascript
const response = await ScheduleService.getTimeSlots();
// GET /api/time-slots
```

#### 4. bookScheduleSlot(scheduleId, timeSlotId, bookingData)
```javascript
const response = await ScheduleService.bookScheduleSlot(1, 16, {
    notes: 'Tôi muốn tìm hiểu về du học Canada'
});
// POST /api/schedules/1/slots/16/book
```

---

## UI Layout

### Schedule Card Layout

```
┌─────────────────────────────────────────────────┐
│ 📅 Lịch làm việc (4 slot)          [3 ngày tới] │ Header
├─────────────────────────────────────────────────┤
│                                                 │
│ ✅ Hôm nay | 2025-10-27             [4 slot]  │ Date Section
│                                                 │
│ ┌──────────────┐  ┌──────────────┐             │
│ │ 💰 500.000₫  │  │ 💰 600.000₫  │             │
│ │ /slot        │  │ /slot        │             │
│ │              │  │              │             │
│ │ 🕒 Các khung  │  │ 🕒 Các khung  │             │ Schedule Items
│ │   giờ:       │  │   giờ:       │             │ (Grid Layout)
│ │ [9:00-10:00] │  │ [9:00-10:00] │             │
│ │ [15:00-16:00]│  │ [15:00-16:00]│             │
│ │ [20:00-21:00]│  │ [20:00-21:00]│             │
│ │              │  │              │             │
│ │ 📧 mentor@... │  │ 📧 mentor@... │             │
│ └──────────────┘  └──────────────┘             │
│                                                 │
├─────────────────────────────────────────────────┤
│ 📅 Hiển thị lịch trong 3 ngày tới  [🔄 Cập nhật]│ Footer
└─────────────────────────────────────────────────┘
```

### Time Slot Button States

```
✅ Còn Trống     → outline-primary (click để đặt)
🔒 Đã Đặt        → disabled (màu xám, không click)
```

### Booking Modal

```
┌──────────────────────────────────────┐
│ 🛒 Xác nhận đặt lịch          [×]   │
├──────────────────────────────────────┤
│                                      │
│ Cố vấn: Nguyễn Bá Hiến              │
│ 📅 Ngày: Hôm nay (2025-10-27)       │
│ 🕒 Giờ: 15:00 - 16:00               │
│ 💰 Giá: 500.000₫                    │
│                                      │
├──────────────────────────────────────┤
│ [Hủy]      [✓ Xác nhận đặt lịch]   │
└──────────────────────────────────────┘
```

---

## Styling & Responsive

### Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Desktop | ≥992px | 3-4 cards per row |
| Tablet | 576-991px | 2 cards per row |
| Mobile | <576px | 1 card per row |

### Color Scheme

| Element | Color | Hex |
|---------|-------|-----|
| Header | Blue | #0056b3 |
| Price Badge | Orange | #ff9800 |
| Available | Green | #28a745 |
| Booked | Red | #dc3545 |
| Time Slot Hover | Blue | #0d6efd |

---

## Status Handling

### Loading State
- Hiển thị spinner
- Thông báo "Đang tải lịch công tác..."

### Empty State
- Hiển thị icon calendar
- Thông báo "Chưa có lịch công tác"
- Gợi ý quay lại sau

### Error State
- Hiển thị Alert component
- Hiển thị nút "Thử lại"
- Log chi tiết error vào console

### Success State
- Modal hiển thị tick xanh
- Thông báo "Đặt lịch thành công!"
- Tự động đóng sau 2 giây

---

## Integration Steps

### Bước 1: Import Component
```jsx
import MentorSchedule from '../../components/mentor/MentorSchedule';
// Hoặc
import { MentorSchedule } from '../../components/mentor';
```

### Bước 2: Sử Dụng trong Page
```jsx
<MentorSchedule 
    mentorId={mentor.id} 
    mentorName={mentor.fullname}
/>
```

### Bước 3: Import CSS (nếu cần)
```jsx
import '../../styles/components/MentorSchedule.css';
// Tự động import khi component được sử dụng
```

---

## Debugging Tips

### Console Logs
- Kiểm tra API response: `console.log('Response:', response.data)`
- Kiểm tra schedule grouping: `console.log('Grouped:', groupedSchedules)`
- Kiểm tra error: `console.error('Error:', error)`

### Common Issues

#### ❌ Schedule không hiển thị
- Kiểm tra mentorId có chính xác không
- Kiểm tra API endpoint `/api/schedules/mentor/{id}/upcoming`
- Kiểm tra response format

#### ❌ Time slot không click được
- Kiểm tra `isBooked` status
- Kiểm tra button disabled state

#### ❌ Lỗi booking
- Kiểm tra authentication token
- Kiểm tra API endpoint `/api/schedules/{id}/slots/{id}/book`

---

## Future Enhancements

🚀 **Có thể cải thiện**:
1. Filter schedules theo giá, giờ
2. Calendar view thay vì grid view
3. Bookmark favorite schedules
4. Email notification sau khi đặt lịch
5. Hủy/Reschedule appointments
6. Review & rating sau tư vấn
7. Payment integration
8. Video call integration

---

## References

- Booking Care UI/UX: https://bookingcare.com/
- Bootstrap 5: https://getbootstrap.com/
- React Icons: https://react-icons.github.io/react-icons/
- API Documentation: `/backend/SCHEDULE_API.md` (nếu có)

---

**Created**: October 27, 2025  
**Author**: GitHub Copilot  
**Version**: 1.0.0
