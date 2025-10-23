import React, { useState } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form,
    InputGroup, Modal, Alert, Nav, Tab
} from 'react-bootstrap';
import {
    FaSearch, FaEye, FaReply, FaTrash,
    FaExclamationTriangle, FaCommentDots, FaFlag
} from 'react-icons/fa';

const FeedbackManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Mock data - thay thế bằng API call thực tế
    const feedbackReports = [
        {
            id: 1,
            reporterId: 123,
            reporterName: 'Nguyễn Minh An',
            reporterEmail: 'minhan@email.com',
            type: 'FEEDBACK',
            targetId: null,
            targetTable: null,
            content: 'Tôi muốn góp ý về giao diện của ứng dụng. Các nút bấm khá nhỏ và khó sử dụng trên điện thoại.',
            status: 'PENDING',
            createdAt: '2024-01-15',
            priority: 'MEDIUM'
        },
        {
            id: 2,
            reporterId: 456,
            reporterName: 'Trần Thị Bình',
            reporterEmail: 'thibinh@email.com',
            type: 'REPORT',
            targetId: 789,
            targetTable: 'users',
            targetInfo: 'Mentor: John Doe',
            content: 'Mentor này thường xuyên hủy lịch hẹn vào phút chót và không thông báo trước. Điều này gây khó khăn cho việc sắp xếp thời gian của tôi.',
            status: 'IN_PROGRESS',
            createdAt: '2024-01-14',
            priority: 'HIGH'
        },
        {
            id: 3,
            reporterId: 789,
            reporterName: 'Lê Văn Cường',
            reporterEmail: 'vancuong@email.com',
            type: 'COMPLAINT',
            targetId: 101,
            targetTable: 'booking',
            targetInfo: 'Booking ID: #BK101',
            content: 'Tôi đã thanh toán nhưng buổi tư vấn bị hủy mà chưa được hoàn tiền. Mong admin hỗ trợ.',
            status: 'RESOLVED',
            createdAt: '2024-01-12',
            priority: 'HIGH',
            response: 'Chúng tôi đã xử lý và hoàn tiền cho bạn. Xin lỗi vì sự bất tiện này.'
        }
    ];

    const getTypeBadgeVariant = (type) => {
        switch (type) {
            case 'FEEDBACK': return 'info';
            case 'REPORT': return 'warning';
            case 'COMPLAINT': return 'danger';
            default: return 'secondary';
        }
    };

    const getTypeText = (type) => {
        switch (type) {
            case 'FEEDBACK': return 'Góp ý';
            case 'REPORT': return 'Báo cáo';
            case 'COMPLAINT': return 'Khiếu nại';
            default: return type;
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'IN_PROGRESS': return 'primary';
            case 'RESOLVED': return 'success';
            case 'REJECTED': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ xử lý';
            case 'IN_PROGRESS': return 'Đang xử lý';
            case 'RESOLVED': return 'Đã giải quyết';
            case 'REJECTED': return 'Từ chối';
            default: return status;
        }
    };

    const getPriorityBadgeVariant = (priority) => {
        switch (priority) {
            case 'LOW': return 'success';
            case 'MEDIUM': return 'warning';
            case 'HIGH': return 'danger';
            default: return 'secondary';
        }
    };

    const handleViewFeedback = (feedback) => {
        setSelectedFeedback(feedback);
        setShowModal(true);
    };

    const filteredFeedbacks = feedbackReports.filter(feedback => {
        const matchesSearch = feedback.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feedback.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || feedback.type === filterType;
        const matchesStatus = filterStatus === 'all' || feedback.status === filterStatus;

        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <div className="feedback-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Quản lý phản hồi & báo cáo</h4>
                    <p className="text-muted mb-0">Xử lý feedback, báo cáo và khiếu nại từ người dùng</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                        <FaReply className="me-1" />
                        Phản hồi hàng loạt
                    </Button>
                    <Button variant="primary" size="sm">
                        <FaCommentDots className="me-1" />
                        Tạo thông báo
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
                                    <h6 className="text-muted mb-1">Chờ xử lý</h6>
                                    <h3 className="mb-0 text-warning">15</h3>
                                </div>
                                <div className="stats-icon bg-warning">
                                    <FaExclamationTriangle />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="stats-card border-start border-primary border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Đang xử lý</h6>
                                    <h3 className="mb-0 text-primary">8</h3>
                                </div>
                                <div className="stats-icon bg-primary">
                                    <FaCommentDots />
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
                                    <h6 className="text-muted mb-1">Đã giải quyết</h6>
                                    <h3 className="mb-0 text-success">127</h3>
                                </div>
                                <div className="stats-icon bg-success">
                                    <FaReply />
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
                                    <h6 className="text-muted mb-1">Ưu tiên cao</h6>
                                    <h3 className="mb-0 text-danger">5</h3>
                                </div>
                                <div className="stats-icon bg-danger">
                                    <FaFlag />
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
                        <Col md={4}>
                            <Form.Label>Tìm kiếm</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Tìm theo người gửi hoặc nội dung..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Form.Label>Loại</Form.Label>
                            <Form.Select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">Tất cả loại</option>
                                <option value="FEEDBACK">Góp ý</option>
                                <option value="REPORT">Báo cáo</option>
                                <option value="COMPLAINT">Khiếu nại</option>
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Label>Trạng thái</Form.Label>
                            <Form.Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="PENDING">Chờ xử lý</option>
                                <option value="IN_PROGRESS">Đang xử lý</option>
                                <option value="RESOLVED">Đã giải quyết</option>
                                <option value="REJECTED">Từ chối</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Button variant="outline-secondary" className="w-100">
                                Lọc
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Feedback Table */}
            <Card>
                <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Danh sách phản hồi & báo cáo ({filteredFeedbacks.length})</h6>
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
                                <th width="20%">Người gửi</th>
                                <th width="15%">Loại</th>
                                <th width="30%">Nội dung</th>
                                <th width="10%">Mức độ</th>
                                <th width="10%">Trạng thái</th>
                                <th width="10%">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFeedbacks.map((feedback) => (
                                <tr key={feedback.id}>
                                    <td>
                                        <Form.Check type="checkbox" />
                                    </td>
                                    <td>
                                        <div>
                                            <div className="fw-medium">{feedback.reporterName}</div>
                                            <small className="text-muted">{feedback.reporterEmail}</small>
                                            <br />
                                            <small className="text-muted">{feedback.createdAt}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg={getTypeBadgeVariant(feedback.type)}>
                                            {getTypeText(feedback.type)}
                                        </Badge>
                                        {feedback.targetInfo && (
                                            <div>
                                                <small className="text-muted">{feedback.targetInfo}</small>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="content-preview">
                                            {feedback.content.length > 100
                                                ? `${feedback.content.substring(0, 100)}...`
                                                : feedback.content
                                            }
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg={getPriorityBadgeVariant(feedback.priority)}>
                                            {feedback.priority}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg={getStatusBadgeVariant(feedback.status)}>
                                            {getStatusText(feedback.status)}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                onClick={() => handleViewFeedback(feedback)}
                                            >
                                                <FaEye />
                                            </Button>
                                            {feedback.status !== 'RESOLVED' && (
                                                <Button variant="outline-primary" size="sm">
                                                    <FaReply />
                                                </Button>
                                            )}
                                            <Button variant="outline-danger" size="sm">
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Feedback Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết phản hồi & báo cáo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedFeedback && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <p><strong>Người gửi:</strong> {selectedFeedback.reporterName}</p>
                                    <p><strong>Email:</strong> {selectedFeedback.reporterEmail}</p>
                                    <p><strong>Ngày gửi:</strong> {selectedFeedback.createdAt}</p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Loại:</strong>
                                        <Badge bg={getTypeBadgeVariant(selectedFeedback.type)} className="ms-2">
                                            {getTypeText(selectedFeedback.type)}
                                        </Badge>
                                    </p>
                                    <p><strong>Mức độ:</strong>
                                        <Badge bg={getPriorityBadgeVariant(selectedFeedback.priority)} className="ms-2">
                                            {selectedFeedback.priority}
                                        </Badge>
                                    </p>
                                    <p><strong>Trạng thái:</strong>
                                        <Badge bg={getStatusBadgeVariant(selectedFeedback.status)} className="ms-2">
                                            {getStatusText(selectedFeedback.status)}
                                        </Badge>
                                    </p>
                                </Col>
                            </Row>

                            {selectedFeedback.targetInfo && (
                                <Alert variant="info">
                                    <strong>Đối tượng báo cáo:</strong> {selectedFeedback.targetInfo}
                                </Alert>
                            )}

                            <div className="mb-3">
                                <h6>Nội dung:</h6>
                                <div className="p-3 bg-light rounded">
                                    {selectedFeedback.content}
                                </div>
                            </div>

                            {selectedFeedback.response && (
                                <div className="mb-3">
                                    <h6>Phản hồi của admin:</h6>
                                    <div className="p-3 bg-success bg-opacity-10 rounded">
                                        {selectedFeedback.response}
                                    </div>
                                </div>
                            )}

                            {selectedFeedback.status === 'PENDING' && (
                                <div>
                                    <h6>Phản hồi:</h6>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Nhập phản hồi của bạn..."
                                        className="mb-3"
                                    />
                                    <div className="d-flex gap-2">
                                        <Button variant="success">
                                            <FaReply className="me-1" />
                                            Gửi phản hồi & Đánh dấu đã giải quyết
                                        </Button>
                                        <Button variant="warning">
                                            Đánh dấu đang xử lý
                                        </Button>
                                        <Button variant="danger">
                                            Từ chối
                                        </Button>
                                    </div>
                                </div>
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

export default FeedbackManagement;