import React, { useState } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form,
    InputGroup, Modal, Alert
} from 'react-bootstrap';
import {
    FaSearch, FaEye, FaDownload, FaMoneyBillWave,
    FaCreditCard, FaHistory, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';

const PaymentHistory = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterMethod, setFilterMethod] = useState('all');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    // Mock data - thay thế bằng API call thực tế
    const paymentHistory = [
        {
            id: 1,
            bookingId: 101,
            transactionCode: 'TXN2024011501',
            amount: 500000,
            paymentMethod: 'VNPAY',
            status: 'COMPLETED',
            createdAt: '2024-01-15 10:30:00',
            mentorName: 'Nguyễn Văn An',
            customerName: 'Trần Thị Bình',
            customerEmail: 'thibinh@email.com',
            service: 'Tư vấn career path',
            gatewayResponse: 'Payment successful',
            refundAmount: 0,
            commission: 50000
        },
        {
            id: 2,
            bookingId: 102,
            transactionCode: 'TXN2024011502',
            amount: 300000,
            paymentMethod: 'MOMO',
            status: 'PENDING',
            createdAt: '2024-01-15 14:20:00',
            mentorName: 'Lê Minh Hoàng',
            customerName: 'Phạm Văn Đức',
            customerEmail: 'vanduc@email.com',
            service: 'Code review',
            gatewayResponse: 'Processing',
            refundAmount: 0,
            commission: 30000
        },
        {
            id: 3,
            bookingId: 103,
            transactionCode: 'TXN2024011403',
            amount: 400000,
            paymentMethod: 'BANK_TRANSFER',
            status: 'FAILED',
            createdAt: '2024-01-14 09:15:00',
            failedAt: '2024-01-14 09:18:00',
            mentorName: 'Nguyễn Văn An',
            customerName: 'Ngô Thị Mai',
            customerEmail: 'thimai@email.com',
            service: 'Tư vấn kỹ thuật',
            gatewayResponse: 'Insufficient funds',
            refundAmount: 0,
            commission: 0
        },
        {
            id: 4,
            bookingId: 104,
            transactionCode: 'TXN2024011004',
            amount: 600000,
            paymentMethod: 'VNPAY',
            status: 'REFUNDED',
            createdAt: '2024-01-10 16:45:00',
            refundedAt: '2024-01-12 10:00:00',
            mentorName: 'Hoàng Thị Lan',
            customerName: 'Vũ Minh Tâm',
            customerEmail: 'minhtam@email.com',
            service: 'Phỏng vấn mock',
            gatewayResponse: 'Refund processed',
            refundAmount: 600000,
            commission: 0,
            refundReason: 'Mentor không thể tham gia'
        }
    ];

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

    const handleViewPayment = (payment) => {
        setSelectedPayment(payment);
        setShowModal(true);
    };

    const filteredPayments = paymentHistory.filter(payment => {
        const matchesSearch = payment.transactionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.mentorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
        const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod;

        // Date range filter
        let matchesDate = true;
        if (dateRange.from || dateRange.to) {
            const paymentDate = new Date(payment.createdAt).toISOString().split('T')[0];
            if (dateRange.from && paymentDate < dateRange.from) matchesDate = false;
            if (dateRange.to && paymentDate > dateRange.to) matchesDate = false;
        }

        return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('vi-VN');
    };

    // Calculate statistics
    const totalRevenue = paymentHistory
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0);

    const totalCommission = paymentHistory
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.commission, 0);

    const totalRefunded = paymentHistory
        .filter(p => p.status === 'REFUNDED')
        .reduce((sum, p) => sum + p.refundAmount, 0);

    const pendingCount = paymentHistory.filter(p => p.status === 'PENDING').length;

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

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="stats-card border-start border-success border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Tổng doanh thu</h6>
                                    <h5 className="mb-0 text-success">{formatCurrency(totalRevenue)}</h5>
                                </div>
                                <div className="stats-icon bg-success">
                                    <FaMoneyBillWave />
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
                                    <h6 className="text-muted mb-1">Hoa hồng</h6>
                                    <h5 className="mb-0 text-info">{formatCurrency(totalCommission)}</h5>
                                </div>
                                <div className="stats-icon bg-info">
                                    <FaCreditCard />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="stats-card border-start border-warning border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Chờ xử lý</h6>
                                    <h3 className="mb-0 text-warning">{pendingCount}</h3>
                                </div>
                                <div className="stats-icon bg-warning">
                                    <FaTimesCircle />
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
                                    <h6 className="text-muted mb-1">Đã hoàn tiền</h6>
                                    <h5 className="mb-0 text-danger">{formatCurrency(totalRefunded)}</h5>
                                </div>
                                <div className="stats-icon bg-danger">
                                    <FaHistory />
                                </div>
                            </div>
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
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Tất cả</option>
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
                                onChange={(e) => setFilterMethod(e.target.value)}
                            >
                                <option value="all">Tất cả</option>
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
                                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                            />
                        </Col>
                        <Col md={2}>
                            <Form.Label>Đến ngày</Form.Label>
                            <Form.Control
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                            />
                        </Col>
                        <Col md={1}>
                            <Button variant="outline-secondary" className="w-100">
                                Lọc
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Payment History Table */}
            <Card>
                <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Lịch sử giao dịch ({filteredPayments.length})</h6>
                        <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm">Chọn tất cả</Button>
                            <Button variant="outline-success" size="sm">Xử lý đã chọn</Button>
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
                                <th width="15%">Mã giao dịch</th>
                                <th width="15%">Booking</th>
                                <th width="15%">Người dùng</th>
                                <th width="12%">Số tiền</th>
                                <th width="10%">Phương thức</th>
                                <th width="10%">Trạng thái</th>
                                <th width="13%">Thời gian</th>
                                <th width="5%">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map((payment) => (
                                <tr key={payment.id}>
                                    <td>
                                        <Form.Check type="checkbox" />
                                    </td>
                                    <td>
                                        <div>
                                            <div className="fw-medium">{payment.transactionCode}</div>
                                            <small className="text-muted">ID: {payment.id}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <div className="fw-medium">#{payment.bookingId}</div>
                                            <small className="text-muted">{payment.service}</small>
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
                                        <Badge bg={getStatusBadgeVariant(payment.status)}>
                                            {getStatusText(payment.status)}
                                        </Badge>
                                    </td>
                                    <td>
                                        <span className="text-muted">
                                            {formatDateTime(payment.createdAt)}
                                        </span>
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-info"
                                            size="sm"
                                            onClick={() => handleViewPayment(payment)}
                                        >
                                            <FaEye />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
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
                                        <Badge bg={getStatusBadgeVariant(selectedPayment.status)} className="ms-2">
                                            {getStatusText(selectedPayment.status)}
                                        </Badge>
                                    </p>
                                    <p><strong>Thời gian tạo:</strong> {formatDateTime(selectedPayment.createdAt)}</p>
                                    {selectedPayment.refundedAt && (
                                        <p><strong>Thời gian hoàn tiền:</strong> {formatDateTime(selectedPayment.refundedAt)}</p>
                                    )}
                                    {selectedPayment.failedAt && (
                                        <p><strong>Thời gian thất bại:</strong> {formatDateTime(selectedPayment.failedAt)}</p>
                                    )}
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <h6>Thông tin khách hàng</h6>
                                    <p><strong>Tên:</strong> {selectedPayment.customerName}</p>
                                    <p><strong>Email:</strong> {selectedPayment.customerEmail}</p>
                                </Col>
                                <Col md={6}>
                                    <h6>Thông tin mentor</h6>
                                    <p><strong>Tên:</strong> {selectedPayment.mentorName}</p>
                                    <p><strong>Dịch vụ:</strong> {selectedPayment.service}</p>
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
                                                <p><strong>Tiền mentor nhận:</strong> {formatCurrency(selectedPayment.amount - selectedPayment.commission)}</p>
                                                {selectedPayment.refundAmount > 0 && (
                                                    <p><strong>Số tiền hoàn:</strong> {formatCurrency(selectedPayment.refundAmount)}</p>
                                                )}
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>

                            <div className="mb-3">
                                <h6>Phản hồi từ cổng thanh toán</h6>
                                <div className="p-3 bg-light rounded">
                                    {selectedPayment.gatewayResponse}
                                </div>
                            </div>

                            {selectedPayment.refundReason && (
                                <Alert variant="info">
                                    <strong>Lý do hoàn tiền:</strong> {selectedPayment.refundReason}
                                </Alert>
                            )}

                            {selectedPayment.status === 'FAILED' && (
                                <Alert variant="danger">
                                    <strong>Giao dịch thất bại</strong>
                                    <div className="mt-2">
                                        <Button variant="primary" size="sm">
                                            <FaHistory className="me-1" />
                                            Thử lại giao dịch
                                        </Button>
                                    </div>
                                </Alert>
                            )}

                            {selectedPayment.status === 'PENDING' && (
                                <Alert variant="warning">
                                    <strong>Giao dịch đang chờ xử lý</strong>
                                    <div className="mt-2">
                                        <Button variant="success" size="sm" className="me-2">
                                            <FaCheckCircle className="me-1" />
                                            Xác nhận thành công
                                        </Button>
                                        <Button variant="danger" size="sm">
                                            <FaTimesCircle className="me-1" />
                                            Đánh dấu thất bại
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
                    <Button variant="primary">
                        <FaDownload className="me-1" />
                        Xuất hóa đơn
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PaymentHistory;