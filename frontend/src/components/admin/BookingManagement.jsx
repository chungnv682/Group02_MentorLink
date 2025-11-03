import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form, Dropdown,
    InputGroup, Modal, Nav, Tab, Alert, Spinner
} from 'react-bootstrap';
import {
    FaSearch, FaEye, FaCalendarAlt, FaClock,
    FaUser, FaCheckCircle, FaTimesCircle, FaHistory
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useToast } from '../../contexts/ToastContext';
import {
    getAllBookings,
    getBookingById,
    confirmBooking,
    cancelBooking,
    completeBooking,
    bulkConfirmBookings,
    bulkCancelBookings,
    getBookingStatistics,
    getAllSchedules
} from '../../services/admin';

const BookingManagement = () => {
    // State for bookings
    const [bookings, setBookings] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [statistics, setStatistics] = useState({
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0
    });
    
    // UI State
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);
    
    // Loading states
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [schedulesLoading, setSchedulesLoading] = useState(false);
    
    // Selection
    const [selectedBookingIds, setSelectedBookingIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const headerCheckboxRef = useRef(null);
    
    // Cancel reason
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    
    const { showToast } = useToast();

    // Fetch bookings from API
    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await getAllBookings({
                keySearch: searchTerm || null,
                status: filterStatus || null,
                paymentStatus: filterPaymentStatus || null,
                date: filterDate || null,
                page: currentPage,
                size: pageSize
            });
            
            if (response.respCode === '0') {
                setBookings(response.data.content || []);
                setTotalPages(response.data.totalPages || 1);
            } else {
                showToast('error', response.description || 'Không thể tải danh sách đặt lịch');
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            showToast('error', 'Có lỗi xảy ra khi tải danh sách đặt lịch');
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStatistics = async () => {
        setStatsLoading(true);
        try {
            const response = await getBookingStatistics();
            if (response.respCode === '0') {
                setStatistics(response.data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    // Fetch schedules
    const fetchSchedules = async () => {
        setSchedulesLoading(true);
        try {
            const response = await getAllSchedules({
                page: 1,
                size: 20
            });
            
            if (response.respCode === '0') {
                setSchedules(response.data.content || []);
            } else {
                showToast('error', response.description || 'Không thể tải danh sách lịch');
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            showToast('error', 'Có lỗi xảy ra khi tải danh sách lịch');
        } finally {
            setSchedulesLoading(false);
        }
    };

    // Load data on mount and when filters change (with debounce for search)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBookings();
            fetchStatistics();
        }, searchTerm ? 500 : 0); // Debounce search by 500ms

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, filterStatus, filterPaymentStatus, filterDate]);

    useEffect(() => {
        fetchSchedules();
    }, []);

    // Handlers
    const handleViewBooking = async (bookingId) => {
        try {
            const response = await getBookingById(bookingId);
            if (response.respCode === '0') {
                setSelectedBooking(response.data);
                setShowModal(true);
            } else {
                showToast('error', response.description || 'Không thể tải thông tin đặt lịch');
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
            showToast('error', 'Có lỗi xảy ra khi tải thông tin đặt lịch');
        }
    };

    const handleConfirmBooking = async (bookingId) => {
        try {
            const response = await confirmBooking(bookingId);
            if (response.respCode === '0') {
                showToast('success', 'Xác nhận đặt lịch thành công');
                fetchBookings();
                fetchStatistics();
            } else {
                showToast('error', response.description || 'Không thể xác nhận đặt lịch');
            }
        } catch (error) {
            console.error('Error confirming booking:', error);
            showToast('error', 'Có lỗi xảy ra khi xác nhận đặt lịch');
        }
    };

    const handleCancelBooking = async () => {
        if (!bookingToCancel) return;
        
        try {
            const response = await cancelBooking(bookingToCancel, cancelReason);
            if (response.respCode === '0') {
                showToast('success', 'Hủy đặt lịch thành công');
                setShowCancelModal(false);
                setBookingToCancel(null);
                setCancelReason('');
                fetchBookings();
                fetchStatistics();
            } else {
                showToast('error', response.description || 'Không thể hủy đặt lịch');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            showToast('error', 'Có lỗi xảy ra khi hủy đặt lịch');
        }
    };

    const handleCompleteBooking = async (bookingId) => {
        try {
            const response = await completeBooking(bookingId);
            if (response.respCode === '0') {
                showToast('success', 'Đánh dấu hoàn thành thành công');
                fetchBookings();
                fetchStatistics();
            } else {
                showToast('error', response.description || 'Không thể hoàn thành đặt lịch');
            }
        } catch (error) {
            console.error('Error completing booking:', error);
            showToast('error', 'Có lỗi xảy ra khi hoàn thành đặt lịch');
        }
    };

    const handleBulkConfirm = async () => {
        if (selectedBookingIds.length === 0) {
            showToast('warning', 'Vui lòng chọn ít nhất một đặt lịch');
            return;
        }

        try {
            const response = await bulkConfirmBookings(selectedBookingIds);
            if (response.respCode === '0') {
                showToast('success', 'Xác nhận hàng loạt thành công');
                setSelectedBookingIds([]);
                setSelectAll(false);
                fetchBookings();
                fetchStatistics();
            } else {
                showToast('error', response.description || 'Không thể xác nhận hàng loạt');
            }
        } catch (error) {
            console.error('Error bulk confirming:', error);
            showToast('error', 'Có lỗi xảy ra khi xác nhận hàng loạt');
        }
    };

    const handleBulkCancel = async () => {
        if (selectedBookingIds.length === 0) {
            showToast('warning', 'Vui lòng chọn ít nhất một đặt lịch');
            return;
        }

        try {
            const response = await bulkCancelBookings(selectedBookingIds, cancelReason);
            if (response.respCode === '0') {
                showToast('success', 'Hủy hàng loạt thành công');
                setSelectedBookingIds([]);
                setSelectAll(false);
                setCancelReason('');
                fetchBookings();
                fetchStatistics();
            } else {
                showToast('error', response.description || 'Không thể hủy hàng loạt');
            }
        } catch (error) {
            console.error('Error bulk cancelling:', error);
            showToast('error', 'Có lỗi xảy ra khi hủy hàng loạt');
        }
    };

    const handleSelectBooking = (bookingId) => {
        setSelectedBookingIds(prev => {
            if (prev.includes(bookingId)) {
                return prev.filter(id => id !== bookingId);
            } else {
                return [...prev, bookingId];
            }
        });
    };

    const handleSelectAll = () => {
        const allIdsOnPage = bookings.map(b => b.id);
        const allSelected = allIdsOnPage.length > 0 && allIdsOnPage.every(id => selectedBookingIds.includes(id));
        if (allSelected) {
            setSelectedBookingIds(prev => prev.filter(id => !allIdsOnPage.includes(id)));
            setSelectAll(false);
        } else {
            setSelectedBookingIds(prev => Array.from(new Set([...prev, ...allIdsOnPage])));
            setSelectAll(true);
        }
    };

    // Indeterminate state for header checkbox
    useEffect(() => {
        if (!headerCheckboxRef.current) return;
        const allIdsOnPage = bookings.map(b => b.id);
        const selectedOnPage = allIdsOnPage.filter(id => selectedBookingIds.includes(id));
        const allSelectedOnPage = selectedOnPage.length === allIdsOnPage.length && allIdsOnPage.length > 0;
        const someSelectedOnPage = selectedOnPage.length > 0 && !allSelectedOnPage;
        headerCheckboxRef.current.indeterminate = someSelectedOnPage;
    }, [bookings, selectedBookingIds]);

    const openCancelModal = (bookingId) => {
        setBookingToCancel(bookingId);
        setShowCancelModal(true);
    };

    // Helper functions
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
            case 'COMPLETED': return 'success';
            case 'REFUNDED': return 'info';
            case 'FAILED': return 'danger';
            default: return 'secondary';
        }
    };

    const getPaymentStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ thanh toán';
            case 'COMPLETED': return 'Đã thanh toán';
            case 'REFUNDED': return 'Đã hoàn tiền';
            case 'FAILED': return 'Thất bại';
            default: return status;
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        try {
            return new Date(dateTimeString).toLocaleString('vi-VN');
        } catch {
            return dateTimeString;
        }
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

            {/* Stats Cards - simple version */}
            <Row className="mb-3 g-3">
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Chờ xác nhận</h6>
                            <h4 className="fw-semibold mb-0">
                                {statsLoading ? <Spinner animation="border" size="sm" /> : (statistics.pending || 0)}
                            </h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Đã xác nhận</h6>
                            <h4 className="fw-semibold mb-0">
                                {statsLoading ? <Spinner animation="border" size="sm" /> : (statistics.confirmed || 0)}
                            </h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Hoàn thành</h6>
                            <h4 className="fw-semibold mb-0">
                                {statsLoading ? <Spinner animation="border" size="sm" /> : (statistics.completed || 0)}
                            </h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Đã hủy</h6>
                            <h4 className="fw-semibold mb-0">
                                {statsLoading ? <Spinner animation="border" size="sm" /> : (statistics.cancelled || 0)}
                            </h4>
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
                                    <Col md={2}>
                                        <Form.Label>Trạng thái</Form.Label>
                                        <Form.Select
                                            value={filterStatus}
                                            onChange={(e) => {
                                                setFilterStatus(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="">Tất cả</option>
                                            <option value="PENDING">Chờ xác nhận</option>
                                            <option value="CONFIRMED">Đã xác nhận</option>
                                            <option value="COMPLETED">Hoàn thành</option>
                                            <option value="CANCELLED">Đã hủy</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Label>Thanh toán</Form.Label>
                                        <Form.Select
                                            value={filterPaymentStatus}
                                            onChange={(e) => {
                                                setFilterPaymentStatus(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="">Tất cả</option>
                                            <option value="PENDING">Chờ thanh toán</option>
                                            <option value="COMPLETED">Đã thanh toán</option>
                                            <option value="REFUNDED">Đã hoàn tiền</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Label>Ngày hẹn</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={filterDate}
                                            onChange={(e) => {
                                                setFilterDate(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </Col>
                                    <Col md={2}>
                                        <Button 
                                            variant="outline-secondary" 
                                            className="w-100"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setFilterStatus('');
                                                setFilterPaymentStatus('');
                                                setFilterDate('');
                                                setCurrentPage(1);
                                            }}
                                        >
                                            Xóa bộ lọc
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Bookings Table */}
                        <Card>
                            <Card.Header className="bg-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">
                                        Danh sách đặt lịch ({bookings.length})
                                        {selectedBookingIds.length > 0 && ` - Đã chọn: ${selectedBookingIds.length}`}
                                    </h6>
                                    <div className="d-flex gap-2">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={handleSelectAll}
                                        >
                                            {selectAll ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                        </Button>
                                        <Button 
                                            variant="outline-success" 
                                            size="sm"
                                            onClick={handleBulkConfirm}
                                            disabled={selectedBookingIds.length === 0}
                                        >
                                            Xác nhận đã chọn
                                        </Button>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                                    </div>
                                ) : bookings.length === 0 ? (
                                    <div className="text-center py-5">
                                        <p className="text-muted">Không có đặt lịch nào</p>
                                    </div>
                                ) : (
                                    <>
                                        <Table responsive hover className="mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th width="5%">
                                                        <Form.Check 
                                                            type="checkbox"
                                                            ref={headerCheckboxRef}
                                                            checked={bookings.length > 0 && bookings.every(b => selectedBookingIds.includes(b.id))}
                                                            onChange={handleSelectAll}
                                                        />
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
                                                {bookings.map((booking) => (
                                                    <tr key={booking.id}>
                                                        <td>
                                                            <Form.Check 
                                                                type="checkbox"
                                                                checked={selectedBookingIds.includes(booking.id)}
                                                                onChange={() => handleSelectBooking(booking.id)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <div className="fw-medium">{booking.mentorName || 'N/A'}</div>
                                                                <small className="text-muted">ID: {booking.mentorId}</small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <div className="fw-medium">{booking.customerName || 'N/A'}</div>
                                                                <small className="text-muted">{booking.customerEmail}</small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <div className="fw-medium">{formatDate(booking.date)}</div>
                                                                <small className="text-muted">{booking.timeSlotText || booking.timeSlot}</small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <div className="fw-medium">{booking.service || 'N/A'}</div>
                                                                <small className="text-muted">{formatCurrency(booking.amount)}</small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Badge bg={getStatusBadgeVariant(booking.status)}>
                                                                {getStatusText(booking.status)}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Badge bg={getPaymentStatusBadgeVariant(booking.paymentProcess)}>
                                                                {getPaymentStatusText(booking.paymentProcess)}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Dropdown align="end">
                                                                <Dropdown.Toggle variant="light" size="sm" className="no-caret p-1">
                                                                    <BsThreeDotsVertical />
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu>
                                                                    <Dropdown.Item onClick={() => handleViewBooking(booking.id)}>
                                                                        Xem
                                                                    </Dropdown.Item>
                                                                    {booking.status === 'PENDING' && (
                                                                        <Dropdown.Item onClick={() => handleConfirmBooking(booking.id)}>
                                                                            Xác nhận
                                                                        </Dropdown.Item>
                                                                    )}
                                                                    {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                                                                        <Dropdown.Item onClick={() => openCancelModal(booking.id)}>
                                                                            Hủy
                                                                        </Dropdown.Item>
                                                                    )}
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                        
                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="d-flex justify-content-between align-items-center p-3 border-top">
                                                <div>
                                                    Trang {currentPage} / {totalPages}
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                        disabled={currentPage === 1}
                                                    >
                                                        Trước
                                                    </Button>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        Sau
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
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
                                {schedulesLoading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                                    </div>
                                ) : schedules.length === 0 ? (
                                    <div className="text-center py-5">
                                        <p className="text-muted">Không có lịch nào</p>
                                    </div>
                                ) : (
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
                                            {schedules.map((schedule) => (
                                                <tr key={schedule.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <FaUser className="me-2 text-muted" />
                                                            <span className="fw-medium">{schedule.mentorName || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="fw-medium">{formatDate(schedule.date)}</span>
                                                    </td>
                                                    <td>
                                                        <span>{schedule.timeSlotText}</span>
                                                    </td>
                                                    <td>
                                                        <Badge bg={schedule.isBooked ? 'danger' : 'success'}>
                                                            {schedule.isBooked ? 'Đã có người đặt' : 'Trống'}
                                                        </Badge>
                                                        {schedule.isCompleted && (
                                                            <Badge bg="dark" className="ms-2">
                                                                Đã hoàn thành
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {schedule.isBooked ? (
                                                            <div>
                                                                <small className="text-muted">
                                                                    Booking ID: #{schedule.bookingId}
                                                                </small>
                                                                {schedule.customerName && (
                                                                    <>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            Khách: {schedule.customerName}
                                                                        </small>
                                                                    </>
                                                                )}
                                                                <br />
                                                                <Button 
                                                                    variant="outline-info" 
                                                                    size="sm"
                                                                    onClick={() => handleViewBooking(schedule.bookingId)}
                                                                    className="mt-1"
                                                                >
                                                                    Xem chi tiết
                                                                </Button>
                                                                {schedule.isCompleted && (
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
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
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
                    {selectedBooking ? (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <h6>Thông tin mentor</h6>
                                    <p><strong>Tên:</strong> {selectedBooking.mentorName || 'N/A'}</p>
                                    <p><strong>Email:</strong> {selectedBooking.mentorEmail || 'N/A'}</p>
                                    <p><strong>ID:</strong> {selectedBooking.mentorId}</p>
                                </Col>
                                <Col md={6}>
                                    <h6>Thông tin khách hàng</h6>
                                    <p><strong>Tên:</strong> {selectedBooking.customerName || 'N/A'}</p>
                                    <p><strong>Email:</strong> {selectedBooking.customerEmail || 'N/A'}</p>
                                    <p><strong>ID:</strong> {selectedBooking.customerId}</p>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <h6>Thông tin buổi hẹn</h6>
                                    <p><strong>Ngày:</strong> {formatDate(selectedBooking.date)}</p>
                                    <p><strong>Giờ:</strong> {selectedBooking.timeSlotText || selectedBooking.timeSlot}</p>
                                    <p><strong>Dịch vụ:</strong> {selectedBooking.service || 'N/A'}</p>
                                    <p><strong>Phí:</strong> {formatCurrency(selectedBooking.amount)}</p>
                                    {selectedBooking.linkMeeting && (
                                        <p><strong>Link meeting:</strong> <a href={selectedBooking.linkMeeting} target="_blank" rel="noopener noreferrer">{selectedBooking.linkMeeting}</a></p>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <h6>Trạng thái</h6>
                                    <p><strong>Đặt lịch:</strong>
                                        <Badge bg={getStatusBadgeVariant(selectedBooking.status)} className="ms-2">
                                            {getStatusText(selectedBooking.status)}
                                        </Badge>
                                    </p>
                                    <p><strong>Thanh toán:</strong>
                                        <Badge bg={getPaymentStatusBadgeVariant(selectedBooking.paymentProcess)} className="ms-2">
                                            {getPaymentStatusText(selectedBooking.paymentProcess)}
                                        </Badge>
                                    </p>
                                    <p><strong>Ngày tạo:</strong> {formatDateTime(selectedBooking.createdAt)}</p>
                                    {selectedBooking.completedAt && (
                                        <p><strong>Ngày hoàn thành:</strong> {formatDateTime(selectedBooking.completedAt)}</p>
                                    )}
                                </Col>
                            </Row>

                            {selectedBooking.description && (
                                <div className="mb-3">
                                    <h6>Mô tả:</h6>
                                    <div className="p-3 bg-light rounded">
                                        {selectedBooking.description}
                                    </div>
                                </div>
                            )}

                            {selectedBooking.comment && (
                                <div className="mb-3">
                                    <h6>Ghi chú:</h6>
                                    <div className="p-3 bg-light rounded">
                                        {selectedBooking.comment}
                                    </div>
                                </div>
                            )}

                            {selectedBooking.cancelReason && (
                                <Alert variant="warning">
                                    <strong>Lý do hủy:</strong> {selectedBooking.cancelReason}
                                    <br />
                                    <strong>Ngày hủy:</strong> {formatDateTime(selectedBooking.cancelledAt)}
                                </Alert>
                            )}

                            {selectedBooking.reviewComment && (
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
                                        {selectedBooking.reviewComment}
                                    </div>
                                    {selectedBooking.reviewedAt && (
                                        <small className="text-muted">Ngày đánh giá: {formatDateTime(selectedBooking.reviewedAt)}</small>
                                    )}
                                </div>
                            )}

                            {selectedBooking.status === 'PENDING' && (
                                <Alert variant="info">
                                    <strong>Cần xác nhận</strong>
                                    <div className="mt-2">
                                        <Button 
                                            variant="success" 
                                            className="me-2"
                                            onClick={() => {
                                                handleConfirmBooking(selectedBooking.id);
                                                setShowModal(false);
                                            }}
                                        >
                                            <FaCheckCircle className="me-1" />
                                            Xác nhận
                                        </Button>
                                        <Button 
                                            variant="danger"
                                            onClick={() => {
                                                setShowModal(false);
                                                openCancelModal(selectedBooking.id);
                                            }}
                                        >
                                            <FaTimesCircle className="me-1" />
                                            Hủy
                                        </Button>
                                    </div>
                                </Alert>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-3">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Cancel Booking Modal */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Hủy đặt lịch</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Lý do hủy</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Nhập lý do hủy đặt lịch..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                        Đóng
                    </Button>
                    <Button variant="danger" onClick={handleCancelBooking}>
                        Xác nhận hủy
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BookingManagement;