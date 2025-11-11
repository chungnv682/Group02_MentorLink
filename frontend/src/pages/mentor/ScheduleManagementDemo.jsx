import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { ScheduleManagementCRUD } from '../components/mentor/dashboard';

/**
 * Demo page showing how to use ScheduleManagementCRUD component
 * Replace the old ScheduleManagement with this new component
 */
const ScheduleManagementDemo = () => {
    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white">
                            <h4 className="mb-0">Quản lí lịch làm việc - CRUD Demo</h4>
                            <small className="text-muted">
                                Component mới với đầy đủ tính năng CRUD và UI được cải thiện
                            </small>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {/* Replace your old ScheduleManagement component with this */}
                            <ScheduleManagementCRUD />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ScheduleManagementDemo;

/* 
HƯỚNG DẪN SỬ DỤNG:

1. Import component vào trang mentor dashboard:
   import { ScheduleManagementCRUD } from '../components/mentor/dashboard';

2. Thay thế component cũ:
   // Cũ
   <ScheduleManagement />
   
   // Mới
   <ScheduleManagementCRUD />

3. Đảm bảo có AuthContext để lấy thông tin mentor:
   - Component sử dụng useAuth() để lấy user.id làm mentorId
   
4. Đảm bảo có ToastContext để hiển thị thông báo:
   - Component sử dụng useToast() từ ToastContext

5. API endpoints được sử dụng:
   - GET /api/schedules/mentor/{mentorId} - Lấy tất cả lịch
   - POST /api/schedules/mentor/{mentorId} - Tạo lịch mới
   - PUT /api/schedules/{scheduleId}/mentor/{mentorId} - Cập nhật lịch
   - DELETE /api/schedules/{scheduleId}/mentor/{mentorId} - Xóa lịch
   - GET /api/time-slots - Lấy danh sách khung giờ

TÍNH NĂNG:
✅ CRUD hoàn chỉnh (Create, Read, Update, Delete)
✅ UI responsive và đẹp mắt
✅ Validation form đầy đủ
✅ Phân loại lịch theo tabs (Tất cả, Sắp tới, Đã đặt, Đã qua)
✅ Time slot selection với phân loại theo buổi
✅ Status hiển thị rõ ràng
✅ Không cho phép chỉnh sửa/xóa lịch đã đặt hoặc đã qua
✅ Loading states và error handling
✅ Toast notifications với ToastContext
✅ Modal cho create/edit/view
✅ Responsive design
*/