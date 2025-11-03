# Migration Guide: Feedback & Review Management

## ✅ Đã hoàn thành

### 1. Backend API Structure

#### Feedback Management
**Controller:** `FeedbackManagementController.java`
**Service:** `FeedbackService.java`
**Base URL:** `/api/admin/feedback-management`

**Endpoints:**
- POST `/get-all-feedbacks` - List with filters
- GET `/{id}` - Get details
- PUT `/{id}/respond` - Respond to feedback
- PUT `/{id}/mark-in-progress` - Mark in progress
- PUT `/{id}/mark-resolved` - Mark resolved
- PUT `/{id}/reject` - Reject
- DELETE `/{id}` - Delete
- PUT `/bulk-resolve` - Bulk resolve
- GET `/statistics` - Get stats

**DTOs Created:**
- `FeedbackFilterRequest.java`
- `FeedbackResponseRequest.java`
- `FeedbackDetailResponse.java`
- `FeedbackStatisticsResponse.java`

#### Review Management
**Controller:** Cần tạo `ReviewManagementController.java`
**Service:** Cần tạo `ReviewService.java`
**Base URL:** `/api/admin/review-management`

**Endpoints (Cần implement):**
- POST `/get-all-reviews`
- GET `/{id}`
- PUT `/{id}/approve`
- PUT `/{id}/reject`
- DELETE `/{id}`
- PUT `/bulk-approve`
- PUT `/bulk-reject`
- GET `/statistics`
- PUT `/{id}/handle-report`

### 2. Frontend Services

#### Feedback Service
**File:** `frontend/src/services/admin/feedbackManagementService.js` ✅

**Functions:**
- `getAllFeedbacks(params)`
- `getFeedbackById(id)`
- `respondToFeedback(id, response, markAsResolved)`
- `markFeedbackInProgress(id)`
- `markFeedbackResolved(id)`
- `rejectFeedback(id)`
- `deleteFeedback(id)`
- `bulkResolveFeedbacks(feedbackIds)`
- `getFeedbackStatistics()`

#### Review Service
**File:** `frontend/src/services/admin/reviewManagementService.js` ✅

**Functions:**
- `getAllReviews(params)`
- `getReviewById(id)`
- `approveReview(id)`
- `rejectReview(id)`
- `deleteReview(id)`
- `bulkApproveReviews(reviewIds)`
- `bulkRejectReviews(reviewIds)`
- `getReviewStatistics()`
- `handleReportedReview(id, action)`

### 3. Frontend Components

#### FeedbackManagement.jsx
**Status:** 🔨 Đang cập nhật (cần hoàn thiện)

**Cần làm:**
1. Xóa hết mock data
2. Cập nhật stats cards với data từ API
3. Cập nhật filter button với `handleSearch` và loading state
4. Cập nhật table với:
   - Loading spinner
   - Empty state
   - Checkbox cho bulk operations
   - API data thay vì mock
   - Format dates từ ISO string
5. Cập nhật modal với:
   - Response textarea state
   - Handle buttons với API calls
6. Thêm pagination footer

#### ReviewManagement.jsx
**Status:** ⏳ Chưa bắt đầu

**Cần làm tương tự FeedbackManagement:**
1. Add imports (useState, useEffect, Spinner, API functions, useToast)
2. Add state management
3. Add useEffect hooks for data fetching
4. Add API handler functions
5. Remove mock data
6. Update UI with API data
7. Add loading states
8. Add pagination

## 🔧 Chi tiết cập nhật FeedbackManagement

### Step 1: Remove Mock Data
Xóa toàn bộ array `feedbackReportsMock` (đã đổi tên từ `feedbackReports`)

### Step 2: Update filteredFeedbacks
```javascript
// Client-side filtering không còn cần thiết vì backend đã filter
// Chỉ cần dùng feedbackReports trực tiếp
```

### Step 3: Update Stats Cards
```javascript
<h3 className="mb-0 text-warning">{stats.pending || 0}</h3>
<h3 className="mb-0 text-primary">{stats.inProgress || 0}</h3>
<h3 className="mb-0 text-success">{stats.resolved || 0}</h3>
<h3 className="mb-0 text-danger">{stats.highPriority || 0}</h3>
```

### Step 4: Update Filter Button
```javascript
<Button 
    variant="outline-secondary" 
    className="w-100"
    onClick={handleSearch}
    disabled={loading}
>
    {loading ? <Spinner animation="border" size="sm" /> : 'Lọc'}
</Button>
```

### Step 5: Update Table Header
```javascript
<h6 className="mb-0">Danh sách phản hồi & báo cáo ({pagination.totalElements || 0})</h6>
<Button 
    variant="outline-primary" 
    size="sm"
    onClick={handleSelectAll}
>
    {selectedFeedbackIds.length === feedbackReports.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
</Button>
<Button 
    variant="outline-success" 
    size="sm"
    onClick={handleBulkResolve}
    disabled={selectedFeedbackIds.length === 0}
>
    Xử lý đã chọn ({selectedFeedbackIds.length})
</Button>
```

### Step 6: Update Table Body
```javascript
{loading ? (
    <tr>
        <td colSpan="7" className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
        </td>
    </tr>
) : feedbackReports.length === 0 ? (
    <tr>
        <td colSpan="7" className="text-center py-5">
            <p className="text-muted">Không có dữ liệu</p>
        </td>
    </tr>
) : (
    feedbackReports.map((feedback) => (
        <tr key={feedback.id}>
            <td>
                <Form.Check 
                    type="checkbox"
                    checked={selectedFeedbackIds.includes(feedback.id)}
                    onChange={() => handleSelectFeedback(feedback.id)}
                />
            </td>
            {/* ... rest of the row ... */}
            <td>
                <span className="text-muted">
                    {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </span>
            </td>
            <td>
                <div className="d-flex gap-1">
                    <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleViewFeedback(feedback)}
                        title="Xem chi tiết"
                    >
                        <FaEye />
                    </Button>
                    {feedback.status !== 'RESOLVED' && (
                        <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleViewFeedback(feedback)}
                            title="Phản hồi"
                        >
                            <FaReply />
                        </Button>
                    )}
                    <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDelete(feedback.id)}
                        title="Xóa"
                    >
                        <FaTrash />
                    </Button>
                </div>
            </td>
        </tr>
    ))
)}
```

### Step 7: Update Modal Actions
```javascript
{selectedFeedback.status === 'PENDING' && (
    <div>
        <h6>Phản hồi:</h6>
        <Form.Control
            as="textarea"
            rows={3}
            placeholder="Nhập phản hồi của bạn..."
            className="mb-3"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
        />
        <div className="d-flex gap-2">
            <Button 
                variant="success"
                onClick={handleRespondAndResolve}
            >
                <FaReply className="me-1" />
                Gửi phản hồi & Đánh dấu đã giải quyết
            </Button>
            <Button 
                variant="warning"
                onClick={() => handleMarkInProgress(selectedFeedback.id)}
            >
                Đánh dấu đang xử lý
            </Button>
            <Button 
                variant="danger"
                onClick={() => handleReject(selectedFeedback.id)}
            >
                Từ chối
            </Button>
        </div>
    </div>
)}
```

### Step 8: Add Pagination
```javascript
{!loading && pagination.totalPages > 1 && (
    <Card.Footer>
        <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted">
                Hiển thị {feedbackReports.length} / {pagination.totalElements} kết quả
            </div>
            <div className="d-flex gap-2">
                <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                    Trước
                </Button>
                <span className="align-self-center">
                    Trang {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                    Sau
                </Button>
            </div>
        </div>
    </Card.Footer>
)}
```

## 📝 TODO Backend

### Feedback Management (Cần implement Service)
- [ ] Create Feedback entity
- [ ] Create Feedback repository
- [ ] Implement FeedbackServiceImpl
- [ ] Add proper error handling
- [ ] Add validation

### Review Management (Cần tạo toàn bộ)
- [ ] Create Review entity (hoặc sử dụng existing)
- [ ] Create ReviewManagementController
- [ ] Create ReviewService interface
- [ ] Implement ReviewServiceImpl
- [ ] Create DTOs (ReviewFilterRequest, ReviewDetailResponse, ReviewStatisticsResponse)

## 🧪 Testing Checklist

### Feedback Management
- [ ] Fetch feedbacks list
- [ ] Filter by type, status
- [ ] Search by keyword
- [ ] Pagination
- [ ] View details
- [ ] Respond and mark resolved
- [ ] Mark in progress
- [ ] Reject feedback
- [ ] Delete feedback
- [ ] Bulk resolve
- [ ] Statistics display
- [ ] Loading & error states

### Review Management
- [ ] Tương tự như trên

## 🎯 Next Steps

1. **Hoàn thiện FeedbackManagement component** (ưu tiên cao)
   - Apply tất cả các cập nhật ở trên
   - Test với mock API nếu backend chưa sẵn sàng

2. **Tạo backend implementation**
   - Entity, Repository, Service cho Feedback
   - Entity, Repository, Service, Controller cho Review

3. **Cập nhật ReviewManagement component** (tương tự FeedbackManagement)

4. **Integration testing**
   - Test với backend thực tế
   - Fix bugs và adjust

5. **Documentation**
   - API documentation
   - User guide
   - Admin guide

## 📂 Files Created

### Backend
- ✅ `controller/admin/FeedbackManagementController.java`
- ✅ `service/admin/FeedbackService.java`
- ✅ `dto/request/admin/feedback/FeedbackFilterRequest.java`
- ✅ `dto/request/admin/feedback/FeedbackResponseRequest.java`
- ✅ `dto/response/admin/FeedbackDetailResponse.java`
- ✅ `dto/response/admin/FeedbackStatisticsResponse.java`

### Frontend
- ✅ `services/admin/feedbackManagementService.js`
- ✅ `services/admin/reviewManagementService.js`
- ✅ `services/admin/index.js` (updated)
- 🔨 `components/admin/FeedbackManagement.jsx` (partially updated)
- ⏳ `components/admin/ReviewManagement.jsx` (not started)

---

**Note:** Backend service implementation (FeedbackServiceImpl, ReviewServiceImpl) cần được tạo để API hoạt động. Frontend đã sẵn sàng khi backend complete.
