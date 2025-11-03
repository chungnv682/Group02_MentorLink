import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form, Dropdown,
    InputGroup, Modal, Alert, Spinner
} from 'react-bootstrap';
import {
    FaSearch, FaEye, FaDownload, FaMoneyBillWave,
    FaCreditCard, FaHistory, FaCheckCircle, FaTimesCircle, FaUndo
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useToast } from '../../contexts/ToastContext';
import {
    getAllPayments,
    getPaymentById,
    markPaymentAsCompleted,
    markPaymentAsFailed,
    processRefund,
    getPaymentStatistics
} from '../../services/admin';

const PaymentHistory = () => {
    // State for payments
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [statistics, setStatistics] = useState({
        totalRevenue: 0,
        totalCommission: 0,
        totalRefunded: 0,
        pending: 0
    });
    
    // UI State
    const [showModal, setShowModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterMethod, setFilterMethod] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);
    
    // Loading states
    const [loading, setLoading] = useState(false);
    const [loadingStatistics, setLoadingStatistics] = useState(false);
    
    // Action modals
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState(''); // 'fail' or 'refund'
    const [actionReason, setActionReason] = useState('');
    const [paymentToAction, setPaymentToAction] = useState(null);
    
    const { showToast } = useToast();

    // Fetch payments from API
    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await getAllPayments({
                keySearch: searchTerm || null,
                status: filterStatus || null,
                paymentMethod: filterMethod || null,
                dateFrom: dateRange.from || null,
                dateTo: dateRange.to || null,
                page: currentPage,
                size: pageSize
            });
            
            if (response.respCode === '0') {
                setPaymentHistory(response.data.content || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalElements(response.data.totalElements || 0);
            } else {
                showToast('error', response.description || 'Không thể tải danh sách thanh toán');
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            showToast('error', 'Có lỗi xảy ra khi tải danh sách thanh toán');
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStatistics = async () => {
        setLoadingStatistics(true);
        try {
            const response = await getPaymentStatistics();
            if (response.respCode === '0') {
                setStatistics(response.data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setLoadingStatistics(false);
        }
    };

    // Load data on mount and when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPayments();
            fetchStatistics();
        }, searchTerm ? 500 : 0);

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, filterStatus, filterMethod, dateRange]);

    // Handlers
    const handleViewPaymentById = async (paymentId) => {
        try {
            const response = await getPaymentById(paymentId);
            if (response.respCode === '0') {
                setSelectedPayment(response.data);
                setShowModal(true);
            } else {
                showToast('error', response.description || 'Không thể tải thông tin thanh toán');
            }
        } catch (error) {
            console.error('Error fetching payment details:', error);
            showToast('error', 'Có lỗi xảy ra khi tải thông tin thanh toán');
        }
    };

    const handleMarkCompleted = async (paymentId) => {
        try {
            const response = await markPaymentAsCompleted(paymentId);
            if (response.respCode === '0') {
                showToast('success', 'Đánh dấu thanh toán thành công');
                fetchPayments();
                fetchStatistics();
            } else {
                showToast('error', response.description || 'Không thể đánh dấu thanh toán');
            }
        } catch (error) {
            console.error('Error marking payment as completed:', error);
            showToast('error', 'Có lỗi xảy ra khi đánh dấu thanh toán');
        }
    };

    const openActionModal = (paymentId, type) => {
        setPaymentToAction(paymentId);
        setActionType(type);
        setShowActionModal(true);
    };

    const handleActionSubmit = async () => {
        if (!paymentToAction) return;
        
        try {
            let response;
            if (actionType === 'fail') {
                response = await markPaymentAsFailed(paymentToAction, actionReason);
            } else if (actionType === 'refund') {
                response = await processRefund(paymentToAction, actionReason);
            }
            
            if (response.respCode === '0') {
                showToast('success', actionType === 'fail' ? 'Đánh dấu thất bại thành công' : 'Xử lý hoàn tiền thành công');
                setShowActionModal(false);
                setPaymentToAction(null);
                setActionReason('');
                setActionType('');
                fetchPayments();
                fetchStatistics();
            } else {
                showToast('error', response.description || 'Không thể thực hiện thao tác');
            }
        } catch (error) {
            console.error('Error processing action:', error);
            showToast('error', 'Có lỗi xảy ra khi thực hiện thao tác');
        }
    };

    // Helper functions
    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'COMPLETED': return 'success';
            case 'FAILED': return 'danger';
            case 'REFUNDED': return 'info';
            default: return 'secondary';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'Đang xử lý';
            case 'COMPLETED': return 'Thành công';
            case 'FAILED': return 'Thất bại';
            case 'REFUNDED': return 'Đã hoàn tiền';
            default: return status;
        }
    };

    const getMethodBadgeVariant = (method) => {
        switch (method) {
            case 'VNPAY': return 'primary';
            case 'MOMO': return 'danger';
            case 'BANK_TRANSFER': return 'info';
            case 'CREDIT_CARD': return 'success';
            default: return 'secondary';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('vi-VN');
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="payment-history">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Quản lý lịch sử thanh toán/giao dịch</h4>
                    <p className="text-muted mb-0">Theo dõi và quản lý tất cả giao dịch thanh toán</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-success" size="sm">
                        <FaDownload className="me-1" />
                        Xuất báo cáo
                    </Button>
                    <Button variant="primary" size="sm">
                        <FaHistory className="me-1" />
                        Lịch sử chi tiết
                    </Button>
                </div>
            </div>

            {/* Stats Cards - simple version */}
            <Row className="mb-3 g-3">
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Tổng doanh thu</h6>
                            <h4 className="fw-semibold mb-0">
                                {loadingStatistics ? <Spinner animation="border" size="sm" /> : formatCurrency(statistics.totalRevenue || 0)}
                            </h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Hoa hồng</h6>
                            <h4 className="fw-semibold mb-0">
                                {loadingStatistics ? <Spinner animation="border" size="sm" /> : formatCurrency(statistics.totalCommission || 0)}
                            </h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Chờ xử lý</h6>
                            <h4 className="fw-semibold mb-0">
                                {loadingStatistics ? <Spinner animation="border" size="sm" /> : (statistics.pendingCount || 0)}
                            </h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Đã hoàn tiền</h6>
                            <h4 className="fw-semibold mb-0">
                                {loadingStatistics ? <Spinner animation="border" size="sm" /> : formatCurrency(statistics.totalRefunded || 0)}
                            </h4>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="mb-4">
                <Card.Body>
                    <Row className="align-items-end">
                        <Col md={3}>
                            <Form.Label>Tìm kiếm</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Mã giao dịch, tên..."
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
                                <option value="PENDING">Đang xử lý</option>
                                <option value="COMPLETED">Thành công</option>
                                <option value="FAILED">Thất bại</option>
                                <option value="REFUNDED">Đã hoàn tiền</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Label>Phương thức</Form.Label>
                            <Form.Select
                                value={filterMethod}
                                onChange={(e) => {
                                    setFilterMethod(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">Tất cả</option>
                                <option value="VNPAY">VNPay</option>
                                <option value="MOMO">MoMo</option>
                                <option value="BANK_TRANSFER">Chuyển khoản</option>
                                <option value="CREDIT_CARD">Thẻ tín dụng</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Label>Từ ngày</Form.Label>
                            <Form.Control
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => {
                                    setDateRange({ ...dateRange, from: e.target.value });
                                    setCurrentPage(1);
                                }}
                            />
                        </Col>
                        <Col md={2}>
                            <Form.Label>Đến ngày</Form.Label>
                            <Form.Control
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => {
                                    setDateRange({ ...dateRange, to: e.target.value });
                                    setCurrentPage(1);
                                }}
                            />
                        </Col>
                        <Col md={1}>
                            <Button 
                                variant="outline-secondary" 
                                className="w-100"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus('');
                                    setFilterMethod('');
                                    setDateRange({ from: '', to: '' });
                                    setCurrentPage(1);
                                }}
                            >
                                Xóa
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Payment History Table */}
            <Card>
                <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Lịch sử giao dịch ({totalElements})</h6>
                        <div className="d-flex gap-2">
                            <span className="text-muted">Trang {currentPage}/{totalPages}</span>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" />
                            <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                        </div>
                    ) : paymentHistory.length === 0 ? (
                        <div className="text-center py-5">
                            <FaTimesCircle size={48} className="text-muted mb-3" />
                            <p className="text-muted">Không có giao dịch nào</p>
                        </div>
                    ) : (
                        <Table responsive hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th width="15%">Mã giao dịch</th>
                                    <th width="15%">Booking</th>
                                    <th width="15%">Người dùng</th>
                                    <th width="12%">Số tiền</th>
                                    <th width="10%">Phương thức</th>
                                    <th width="10%">Trạng thái</th>
                                    <th width="13%">Thời gian</th>
                                    <th width="10%">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentHistory.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>
                                            <div>
                                                <div className="fw-medium">{payment.transactionCode}</div>
                                                <small className="text-muted">ID: {payment.id}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div className="fw-medium">#{payment.bookingId}</div>
                                                <small className="text-muted">{payment.scheduleName || 'N/A'}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div className="fw-medium">{payment.customerName}</div>
                                                <small className="text-muted">với {payment.mentorName}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div className="fw-medium">{formatCurrency(payment.amount)}</div>
                                                {payment.commission > 0 && (
                                                    <small className="text-success">
                                                        HH: {formatCurrency(payment.commission)}
                                                    </small>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg={getMethodBadgeVariant(payment.paymentMethod)}>
                                                {payment.paymentMethod}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg={getStatusBadgeVariant(payment.statusCode)}>
                                                {payment.statusName || getStatusText(payment.statusCode)}
                                            </Badge>
                                        </td>
                                        <td>
                                            <span className="text-muted">
                                                {formatDateTime(payment.createdAt)}
                                            </span>
                                        </td>
                                        <td>
                                            <Dropdown align="end">
                                                <Dropdown.Toggle variant="light" size="sm" className="no-caret p-1">
                                                    <BsThreeDotsVertical />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={() => handleViewPaymentById(payment.id)}>
                                                        Xem
                                                    </Dropdown.Item>
                                                    {payment.statusCode === 'PENDING' && (
                                                        <>
                                                            <Dropdown.Item onClick={() => handleMarkCompleted(payment.id)}>
                                                                Đánh dấu thành công
                                                            </Dropdown.Item>
                                                            <Dropdown.Item onClick={() => openActionModal(payment.id, 'fail')}>
                                                                Đánh dấu thất bại
                                                            </Dropdown.Item>
                                                        </>
                                                    )}
                                                    {payment.statusCode === 'COMPLETED' && (
                                                        <Dropdown.Item onClick={() => openActionModal(payment.id, 'refund')}>
                                                            Hoàn tiền
                                                        </Dropdown.Item>
                                                    )}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
                {!loading && paymentHistory.length > 0 && (
                    <Card.Footer className="bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-muted">
                                Hiển thị {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalElements)} trong số {totalElements} giao dịch
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                >
                                    Trước
                                </Button>
                                <Button variant="light" size="sm" disabled>
                                    Trang {currentPage}/{totalPages}
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                >
                                    Sau
                                </Button>
                            </div>
                        </div>
                    </Card.Footer>
                )}
            </Card>

            {/* Payment Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết giao dịch</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPayment && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <h6>Thông tin giao dịch</h6>
                                    <p><strong>Mã giao dịch:</strong> {selectedPayment.transactionCode}</p>
                                    <p><strong>Booking ID:</strong> #{selectedPayment.bookingId}</p>
                                    <p><strong>Số tiền:</strong> {formatCurrency(selectedPayment.amount)}</p>
                                    <p><strong>Phương thức:</strong>
                                        <Badge bg={getMethodBadgeVariant(selectedPayment.paymentMethod)} className="ms-2">
                                            {selectedPayment.paymentMethod}
                                        </Badge>
                                    </p>
                                </Col>
                                <Col md={6}>
                                    <h6>Trạng thái & Thời gian</h6>
                                    <p><strong>Trạng thái:</strong>
                                        <Badge bg={getStatusBadgeVariant(selectedPayment.statusCode)} className="ms-2">
                                            {selectedPayment.statusName || getStatusText(selectedPayment.statusCode)}
                                        </Badge>
                                    </p>
                                    <p><strong>Thời gian tạo:</strong> {formatDateTime(selectedPayment.createdAt)}</p>
                                    {selectedPayment.completedAt && (
                                        <p><strong>Thời gian hoàn thành:</strong> {formatDateTime(selectedPayment.completedAt)}</p>
                                    )}
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <h6>Thông tin khách hàng</h6>
                                    <p><strong>Tên:</strong> {selectedPayment.customerName}</p>
                                    <p><strong>Email:</strong> {selectedPayment.customerEmail || 'N/A'}</p>
                                </Col>
                                <Col md={6}>
                                    <h6>Thông tin mentor</h6>
                                    <p><strong>Tên:</strong> {selectedPayment.mentorName}</p>
                                    <p><strong>Email:</strong> {selectedPayment.mentorEmail || 'N/A'}</p>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col>
                                    <h6>Chi tiết tài chính</h6>
                                    <div className="bg-light p-3 rounded">
                                        <Row>
                                            <Col md={6}>
                                                <p><strong>Tổng tiền:</strong> {formatCurrency(selectedPayment.amount)}</p>
                                                <p><strong>Hoa hồng hệ thống:</strong> {formatCurrency(selectedPayment.commission)}</p>
                                            </Col>
                                            <Col md={6}>
                                                <p><strong>Tiền mentor nhận:</strong> {formatCurrency(selectedPayment.mentorAmount)}</p>
                                                {selectedPayment.refundAmount > 0 && (
                                                    <p className="text-danger"><strong>Số tiền hoàn:</strong> {formatCurrency(selectedPayment.refundAmount)}</p>
                                                )}
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>

                            {selectedPayment.gatewayResponse && (
                                <div className="mb-3">
                                    <h6>Phản hồi từ cổng thanh toán</h6>
                                    <div className="p-3 bg-light rounded">
                                        {selectedPayment.gatewayResponse}
                                    </div>
                                </div>
                            )}

                            {selectedPayment.notes && (
                                <Alert variant="info">
                                    <strong>Ghi chú:</strong> {selectedPayment.notes}
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

            {/* Action Modal (Fail/Refund) */}
            <Modal show={showActionModal} onHide={() => setShowActionModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {actionType === 'fail' ? 'Đánh dấu thanh toán thất bại' : 'Xử lý hoàn tiền'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Lý do {actionType === 'fail' ? 'thất bại' : 'hoàn tiền'}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder={`Nhập lý do ${actionType === 'fail' ? 'thất bại' : 'hoàn tiền'}...`}
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                        />
                    </Form.Group>
                    {actionType === 'fail' && (
                        <Alert variant="warning" className="mt-3">
                            <small>Thanh toán sẽ được đánh dấu là thất bại và không thể khôi phục.</small>
                        </Alert>
                    )}
                    {actionType === 'refund' && (
                        <Alert variant="info" className="mt-3">
                            <small>Tiền sẽ được hoàn lại cho khách hàng theo quy định.</small>
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowActionModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant={actionType === 'fail' ? 'danger' : 'warning'}
                        onClick={handleActionSubmit}
                    >
                        {actionType === 'fail' ? 'Xác nhận thất bại' : 'Xác nhận hoàn tiền'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PaymentHistory;