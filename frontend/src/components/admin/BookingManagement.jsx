import React, { useState } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form,
    InputGroup, Modal, Nav, Tab, Alert
} from 'react-bootstrap';
import {
    FaSearch, FaEye, FaCalendarAlt, FaClock,
    FaUser, FaCheckCircle, FaTimesCircle, FaHistory
} from 'react-icons/fa';

const BookingManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDate, setFilterDate] = useState('');

    // Mock data - thay thế bằng API call thực tế
    const bookings = [
        {
            id: 1,
            mentorId: 123,
            mentorName: 'Nguyễn Văn An',
            customerId: 456,
            customerName: 'Trần Thị Bình',
            customerEmail: 'thibinh@email.com',
            date: '2024-01-20',
            timeSlot: 'MORNING',
            timeSlotText: '9:00 - 12:00',
            status: 'CONFIRMED',
            createdAt: '2024-01-15',
            service: 'Tư vấn career path',
            notes: 'Cần tư vấn về chuyển đổi nghề nghiệp từ Marketing sang IT',
            paymentStatus: 'PAID',
            amount: 500000
        },
        {
            id: 2,
            mentorId: 789,
            mentorName: 'Lê Minh Hoàng',
            customerId: 101,
            customerName: 'Phạm Văn Đức',
            customerEmail: 'vanduc@email.com',
            date: '2024-01-18',
            timeSlot: 'AFTERNOON',
            timeSlotText: '14:00 - 17:00',
            status: 'PENDING',
            createdAt: '2024-01-16',
            service: 'Code review',
            notes: 'Review dự án React + Node.js',
            paymentStatus: 'PENDING',
            amount: 300000
        },
        {
            id: 3,
            mentorId: 123,
            mentorName: 'Nguyễn Văn An',
            customerId: 112,
            customerName: 'Ngô Thị Mai',
            customerEmail: 'thimai@email.com',
            date: '2024-01-16',
            timeSlot: 'MORNING',
            timeSlotText: '9:00 - 12:00',
            status: 'CANCELLED',
            createdAt: '2024-01-14',
            cancelledAt: '2024-01-15',
            cancelReason: 'Mentor bận đột xuất',
            service: 'Tư vấn kỹ thuật',
            notes: 'Hỗ trợ giải quyết vấn đề performance',
            paymentStatus: 'REFUNDED',
            amount: 400000
        },
        {
            id: 4,
            mentorId: 456,
            mentorName: 'Hoàng Thị Lan',
            customerId: 789,
            customerName: 'Vũ Minh Tâm',
            customerEmail: 'minhtam@email.com',
            date: '2024-01-15',
            timeSlot: 'AFTERNOON',
            timeSlotText: '14:00 - 17:00',
            status: 'COMPLETED',
            createdAt: '2024-01-10',
            completedAt: '2024-01-15',
            service: 'Phỏng vấn mock',
            notes: 'Luyện tập phỏng vấn cho vị trí Senior Developer',
            paymentStatus: 'PAID',
            amount: 600000,
            rating: 5,
            review: 'Buổi tư vấn rất hữu ích, mentor nhiệt tình và chuyên nghiệp.'
        }
    ];

    const schedules = [
        {
            id: 1,
            mentorId: 123,
            mentorName: 'Nguyễn Văn An',
            date: '2024-01-20',
            timeSlot: 'MORNING',
            timeSlotText: '9:00 - 12:00',
            isBooked: true,
            bookingId: 1
        },
        {
            id: 2,
            mentorId: 123,
            mentorName: 'Nguyễn Văn An',
            date: '2024-01-20',
            timeSlot: 'AFTERNOON',
            timeSlotText: '14:00 - 17:00',
            isBooked: false,
            bookingId: null
        },
        {
            id: 3,
            mentorId: 789,
            mentorName: 'Lê Minh Hoàng',
            date: '2024-01-18',
            timeSlot: 'MORNING',
            timeSlotText: '9:00 - 12:00',
            isBooked: false,
            bookingId: null
        }
    ];

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'CONFIRMED': return 'info';
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ xác nhận';
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'COMPLETED': return 'Hoàn thành';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    const getPaymentStatusBadgeVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'PAID': return 'success';
            case 'REFUNDED': return 'info';
            case 'FAILED': return 'danger';
            default: return 'secondary';
        }
    };

    const getPaymentStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ thanh toán';
            case 'PAID': return 'Đã thanh toán';
            case 'REFUNDED': return 'Đã hoàn tiền';
            case 'FAILED': return 'Thất bại';
            default: return status;
        }
    };

    const handleViewBooking = (booking) => {
        setSelectedBooking(booking);
        setShowModal(true);
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.mentorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.service.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
        const matchesDate = !filterDate || booking.date === filterDate;

        return matchesSearch && matchesStatus && matchesDate;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Kiểm tra xem schedule có booking COMPLETED không
    const getScheduleStatus = (schedule) => {
        const completedBooking = bookings.find(booking =>
            booking.mentorId === schedule.mentorId &&
            booking.date === schedule.date &&
            booking.timeSlot === schedule.timeSlot &&
            booking.status === 'COMPLETED'
        );
        return {
            isBooked: completedBooking ? true : schedule.isBooked,
            bookingId: completedBooking ? completedBooking.id : schedule.bookingId,
            isCompleted: !!completedBooking
        };
    };

    return (
        <div className="booking-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Quản lý đặt lịch & lịch hẹn</h4>
                    <p className="text-muted mb-0">Quản lý các cuộc hẹn giữa mentor và khách hàng</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                        <FaCalendarAlt className="me-1" />
                        Xem lịch
                    </Button>
                    <Button variant="primary" size="sm">
                        <FaHistory className="me-1" />
                        Báo cáo
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="stats-card border-start border-warning border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Chờ xác nhận</h6>
                                    <h3 className="mb-0 text-warning">12</h3>
                                </div>
                                <div className="stats-icon bg-warning">
                                    <FaClock />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="stats-card border-start border-info border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Đã xác nhận</h6>
                                    <h3 className="mb-0 text-info">28</h3>
                                </div>
                                <div className="stats-icon bg-info">
                                    <FaCheckCircle />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="stats-card border-start border-success border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Hoàn thành</h6>
                                    <h3 className="mb-0 text-success">145</h3>
                                </div>
                                <div className="stats-icon bg-success">
                                    <FaCheckCircle />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="stats-card border-start border-danger border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Đã hủy</h6>
                                    <h3 className="mb-0 text-danger">18</h3>
                                </div>
                                <div className="stats-icon bg-danger">
                                    <FaTimesCircle />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Tab.Container defaultActiveKey="bookings">
                <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                        <Nav.Link eventKey="bookings">Quản lý đặt lịch</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="schedules">Lịch mentor</Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    {/* Bookings Management Tab */}
                    <Tab.Pane eventKey="bookings">
                        {/* Filters */}
                        <Card className="mb-4">
                            <Card.Body>
                                <Row className="align-items-end">
                                    <Col md={4}>
                                        <Form.Label>Tìm kiếm</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>
                                                <FaSearch />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Tìm theo mentor, khách hàng hoặc dịch vụ..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label>Trạng thái</Form.Label>
                                        <Form.Select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                        >
                                            <option value="all">Tất cả trạng thái</option>
                                            <option value="PENDING">Chờ xác nhận</option>
                                            <option value="CONFIRMED">Đã xác nhận</option>
                                            <option value="COMPLETED">Hoàn thành</option>
                                            <option value="CANCELLED">Đã hủy</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label>Ngày hẹn</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={filterDate}
                                            onChange={(e) => setFilterDate(e.target.value)}
                                        />
                                    </Col>
                                    <Col md={2}>
                                        <Button variant="outline-secondary" className="w-100">
                                            Lọc
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Bookings Table */}
                        <Card>
                            <Card.Header className="bg-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">Danh sách đặt lịch ({filteredBookings.length})</h6>
                                    <div className="d-flex gap-2">
                                        <Button variant="outline-primary" size="sm">Chọn tất cả</Button>
                                        <Button variant="outline-success" size="sm">Xác nhận đã chọn</Button>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table responsive hover className="mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th width="5%">
                                                <Form.Check type="checkbox" />
                                            </th>
                                            <th width="15%">Mentor</th>
                                            <th width="15%">Khách hàng</th>
                                            <th width="15%">Thời gian</th>
                                            <th width="15%">Dịch vụ</th>
                                            <th width="10%">Trạng thái</th>
                                            <th width="10%">Thanh toán</th>
                                            <th width="15%">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBookings.map((booking) => (
                                            <tr key={booking.id}>
                                                <td>
                                                    <Form.Check type="checkbox" />
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="fw-medium">{booking.mentorName}</div>
                                                        <small className="text-muted">ID: {booking.mentorId}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="fw-medium">{booking.customerName}</div>
                                                        <small className="text-muted">{booking.customerEmail}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="fw-medium">{booking.date}</div>
                                                        <small className="text-muted">{booking.timeSlotText}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="fw-medium">{booking.service}</div>
                                                        <small className="text-muted">{formatCurrency(booking.amount)}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg={getStatusBadgeVariant(booking.status)}>
                                                        {getStatusText(booking.status)}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge bg={getPaymentStatusBadgeVariant(booking.paymentStatus)}>
                                                        {getPaymentStatusText(booking.paymentStatus)}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            onClick={() => handleViewBooking(booking)}
                                                        >
                                                            <FaEye />
                                                        </Button>
                                                        {booking.status === 'PENDING' && (
                                                            <Button variant="outline-success" size="sm">
                                                                <FaCheckCircle />
                                                            </Button>
                                                        )}
                                                        {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                                                            <Button variant="outline-danger" size="sm">
                                                                <FaTimesCircle />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Tab.Pane>

                    {/* Schedules Management Tab */}
                    <Tab.Pane eventKey="schedules">
                        <Card>
                            <Card.Header className="bg-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">Lịch làm việc của mentor ({schedules.length})</h6>
                                    <Button variant="primary" size="sm">
                                        <FaCalendarAlt className="me-1" />
                                        Xem dạng lịch
                                    </Button>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table responsive hover className="mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th width="25%">Mentor</th>
                                            <th width="15%">Ngày</th>
                                            <th width="20%">Khung giờ</th>
                                            <th width="15%">Trạng thái</th>
                                            <th width="25%">Thông tin đặt lịch</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedules.map((schedule) => {
                                            const scheduleStatus = getScheduleStatus(schedule);
                                            return (
                                                <tr key={schedule.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <FaUser className="me-2 text-muted" />
                                                            <span className="fw-medium">{schedule.mentorName}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="fw-medium">{schedule.date}</span>
                                                    </td>
                                                    <td>
                                                        <span>{schedule.timeSlotText}</span>
                                                    </td>
                                                    <td>
                                                        <Badge bg={scheduleStatus.isBooked ? 'danger' : 'success'}>
                                                            {scheduleStatus.isBooked ? 'Đã có người đặt' : 'Trống'}
                                                        </Badge>
                                                        {scheduleStatus.isCompleted && (
                                                            <Badge bg="dark" className="ms-2">
                                                                Đã hoàn thành
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {scheduleStatus.isBooked ? (
                                                            <div>
                                                                <small className="text-muted">
                                                                    Booking ID: #{scheduleStatus.bookingId}
                                                                </small>
                                                                <br />
                                                                <Button variant="outline-info" size="sm">
                                                                    Xem chi tiết
                                                                </Button>
                                                                {scheduleStatus.isCompleted && (
                                                                    <div className="mt-2">
                                                                        <Alert variant="success" className="mb-0 p-2">
                                                                            <small>Buổi này đã hoàn thành - không thể đặt lại</small>
                                                                        </Alert>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted">Chưa có đặt lịch</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

            {/* Booking Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết đặt lịch</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedBooking && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <h6>Thông tin mentor</h6>
                                    <p><strong>Tên:</strong> {selectedBooking.mentorName}</p>
                                    <p><strong>ID:</strong> {selectedBooking.mentorId}</p>
                                </Col>
                                <Col md={6}>
                                    <h6>Thông tin khách hàng</h6>
                                    <p><strong>Tên:</strong> {selectedBooking.customerName}</p>
                                    <p><strong>Email:</strong> {selectedBooking.customerEmail}</p>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <h6>Thông tin buổi hẹn</h6>
                                    <p><strong>Ngày:</strong> {selectedBooking.date}</p>
                                    <p><strong>Giờ:</strong> {selectedBooking.timeSlotText}</p>
                                    <p><strong>Dịch vụ:</strong> {selectedBooking.service}</p>
                                    <p><strong>Phí:</strong> {formatCurrency(selectedBooking.amount)}</p>
                                </Col>
                                <Col md={6}>
                                    <h6>Trạng thái</h6>
                                    <p><strong>Đặt lịch:</strong>
                                        <Badge bg={getStatusBadgeVariant(selectedBooking.status)} className="ms-2">
                                            {getStatusText(selectedBooking.status)}
                                        </Badge>
                                    </p>
                                    <p><strong>Thanh toán:</strong>
                                        <Badge bg={getPaymentStatusBadgeVariant(selectedBooking.paymentStatus)} className="ms-2">
                                            {getPaymentStatusText(selectedBooking.paymentStatus)}
                                        </Badge>
                                    </p>
                                    <p><strong>Ngày tạo:</strong> {selectedBooking.createdAt}</p>
                                    {selectedBooking.completedAt && (
                                        <p><strong>Ngày hoàn thành:</strong> {selectedBooking.completedAt}</p>
                                    )}
                                </Col>
                            </Row>

                            {selectedBooking.notes && (
                                <div className="mb-3">
                                    <h6>Ghi chú của khách hàng:</h6>
                                    <div className="p-3 bg-light rounded">
                                        {selectedBooking.notes}
                                    </div>
                                </div>
                            )}

                            {selectedBooking.cancelReason && (
                                <Alert variant="warning">
                                    <strong>Lý do hủy:</strong> {selectedBooking.cancelReason}
                                    <br />
                                    <strong>Ngày hủy:</strong> {selectedBooking.cancelledAt}
                                </Alert>
                            )}

                            {selectedBooking.review && (
                                <div className="mb-3">
                                    <h6>Đánh giá của khách hàng:</h6>
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="me-2">Điểm:</span>
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < selectedBooking.rating ? 'text-warning' : 'text-muted'}>
                                                ★
                                            </span>
                                        ))}
                                        <span className="ms-2">({selectedBooking.rating}/5)</span>
                                    </div>
                                    <div className="p-3 bg-light rounded">
                                        {selectedBooking.review}
                                    </div>
                                </div>
                            )}

                            {selectedBooking.status === 'PENDING' && (
                                <Alert variant="info">
                                    <strong>Cần xác nhận</strong>
                                    <div className="mt-2">
                                        <Button variant="success" className="me-2">
                                            <FaCheckCircle className="me-1" />
                                            Xác nhận
                                        </Button>
                                        <Button variant="danger">
                                            <FaTimesCircle className="me-1" />
                                            Hủy
                                        </Button>
                                    </div>
                                </Alert>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BookingManagement;