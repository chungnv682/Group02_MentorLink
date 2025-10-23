import React, { useState } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form,
    InputGroup, Modal, Alert
} from 'react-bootstrap';
import {
    FaSearch, FaEye, FaTrash, FaCheck, FaTimes,
    FaStar, FaCommentDots, FaFlag, FaUser
} from 'react-icons/fa';

const ReviewManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Mock data - thay thế bằng API call thực tế
    const reviews = [
        {
            id: 1,
            bookingId: 101,
            customerId: 456,
            customerName: 'Trần Thị Bình',
            customerEmail: 'thibinh@email.com',
            mentorId: 123,
            mentorName: 'Nguyễn Văn An',
            rating: 5,
            comment: 'Mentor rất nhiệt tình và chuyên nghiệp. Buổi tư vấn giúp tôi định hướng được career path rõ ràng hơn. Tôi sẽ book thêm các buổi tư vấn khác.',
            isPublished: true,
            createdAt: '2024-01-15',
            service: 'Tư vấn career path',
            isReported: false
        },
        {
            id: 2,
            bookingId: 102,
            customerId: 789,
            customerName: 'Vũ Minh Tâm',
            customerEmail: 'minhtam@email.com',
            mentorId: 456,
            mentorName: 'Hoàng Thị Lan',
            rating: 4,
            comment: 'Buổi mock interview rất hữu ích, mentor đưa ra nhiều feedback chi tiết. Tuy nhiên thời gian hơi ngắn, mong có thể kéo dài hơn.',
            isPublished: false,
            createdAt: '2024-01-14',
            service: 'Phỏng vấn mock',
            isReported: false,
            moderationNote: 'Đang chờ duyệt'
        },
        {
            id: 3,
            bookingId: 103,
            customerId: 321,
            customerName: 'Lê Văn Cường',
            customerEmail: 'vancuong@email.com',
            mentorId: 789,
            mentorName: 'Lê Minh Hoàng',
            rating: 2,
            comment: 'Mentor thường xuyên đi muộn và không chuẩn bị kỹ cho buổi tư vấn. Nội dung tư vấn không đúng như mong đợi.',
            isPublished: false,
            createdAt: '2024-01-13',
            service: 'Code review',
            isReported: true,
            reportReason: 'Đánh giá tiêu cực có thể không chính xác',
            moderationNote: 'Cần xem xét kỹ'
        },
        {
            id: 4,
            bookingId: 104,
            customerId: 654,
            customerName: 'Phạm Thị Hoa',
            customerEmail: 'thihoa@email.com',
            mentorId: 123,
            mentorName: 'Nguyễn Văn An',
            rating: 5,
            comment: 'Excellent mentor! Very knowledgeable and patient. Highly recommend!',
            isPublished: true,
            createdAt: '2024-01-12',
            service: 'Technical consultation',
            isReported: false
        }
    ];

    const getStatusBadgeVariant = (isPublished, isReported) => {
        if (isReported) return 'danger';
        if (isPublished) return 'success';
        return 'warning';
    };

    const getStatusText = (isPublished, isReported) => {
        if (isReported) return 'Bị báo cáo';
        if (isPublished) return 'Đã xuất bản';
        return 'Chờ duyệt';
    };

    const getRatingStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FaStar
                key={i}
                className={i < rating ? 'text-warning' : 'text-muted'}
            />
        ));
    };

    const handleViewReview = (review) => {
        setSelectedReview(review);
        setShowModal(true);
    };

    const filteredReviews = reviews.filter(review => {
        const matchesSearch = review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.mentorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.comment.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating;

        let matchesStatus = true;
        if (filterStatus === 'published') matchesStatus = review.isPublished && !review.isReported;
        else if (filterStatus === 'pending') matchesStatus = !review.isPublished && !review.isReported;
        else if (filterStatus === 'reported') matchesStatus = review.isReported;

        return matchesSearch && matchesRating && matchesStatus;
    });

    // Calculate statistics
    const totalReviews = reviews.length;
    const publishedReviews = reviews.filter(r => r.isPublished && !r.isReported).length;
    const pendingReviews = reviews.filter(r => !r.isPublished && !r.isReported).length;
    const reportedReviews = reviews.filter(r => r.isReported).length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return (
        <div className="review-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Quản lý đánh giá & review</h4>
                    <p className="text-muted mb-0">Quản lý và kiểm duyệt đánh giá từ khách hàng</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-success" size="sm">
                        <FaCheck className="me-1" />
                        Duyệt hàng loạt
                    </Button>
                    <Button variant="primary" size="sm">
                        <FaCommentDots className="me-1" />
                        Báo cáo đánh giá
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="stats-card border-start border-primary border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Tổng đánh giá</h6>
                                    <h3 className="mb-0 text-primary">{totalReviews}</h3>
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
                                    <h6 className="text-muted mb-1">Đã xuất bản</h6>
                                    <h3 className="mb-0 text-success">{publishedReviews}</h3>
                                </div>
                                <div className="stats-icon bg-success">
                                    <FaCheck />
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
                                    <h6 className="text-muted mb-1">Chờ duyệt</h6>
                                    <h3 className="mb-0 text-warning">{pendingReviews}</h3>
                                </div>
                                <div className="stats-icon bg-warning">
                                    <FaCommentDots />
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
                                    <h6 className="text-muted mb-1">Bị báo cáo</h6>
                                    <h3 className="mb-0 text-danger">{reportedReviews}</h3>
                                </div>
                                <div className="stats-icon bg-danger">
                                    <FaFlag />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Average Rating Card */}
            <Card className="mb-4">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={3}>
                            <div className="text-center">
                                <h2 className="mb-0">{averageRating.toFixed(1)}</h2>
                                <div className="mb-2">
                                    {getRatingStars(Math.round(averageRating))}
                                </div>
                                <p className="text-muted mb-0">Điểm trung bình</p>
                            </div>
                        </Col>
                        <Col md={9}>
                            {[5, 4, 3, 2, 1].map(rating => {
                                const count = reviews.filter(r => r.rating === rating).length;
                                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                                return (
                                    <Row key={rating} className="align-items-center mb-2">
                                        <Col xs={2}>
                                            <span>{rating} <FaStar className="text-warning" /></span>
                                        </Col>
                                        <Col xs={8}>
                                            <div className="progress" style={{ height: '8px' }}>
                                                <div
                                                    className="progress-bar"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </Col>
                                        <Col xs={2}>
                                            <span className="text-muted">{count}</span>
                                        </Col>
                                    </Row>
                                );
                            })}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

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
                                    placeholder="Tìm theo tên hoặc nội dung..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Form.Label>Số sao</Form.Label>
                            <Form.Select
                                value={filterRating}
                                onChange={(e) => setFilterRating(e.target.value)}
                            >
                                <option value="all">Tất cả đánh giá</option>
                                <option value="5">5 sao</option>
                                <option value="4">4 sao</option>
                                <option value="3">3 sao</option>
                                <option value="2">2 sao</option>
                                <option value="1">1 sao</option>
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Label>Trạng thái</Form.Label>
                            <Form.Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="published">Đã xuất bản</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="reported">Bị báo cáo</option>
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

            {/* Reviews Table */}
            <Card>
                <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Danh sách đánh giá ({filteredReviews.length})</h6>
                        <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm">Chọn tất cả</Button>
                            <Button variant="outline-success" size="sm">Duyệt đã chọn</Button>
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
                                <th width="15%">Khách hàng</th>
                                <th width="15%">Mentor</th>
                                <th width="10%">Đánh giá</th>
                                <th width="35%">Nội dung</th>
                                <th width="10%">Trạng thái</th>
                                <th width="10%">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReviews.map((review) => (
                                <tr key={review.id}>
                                    <td>
                                        <Form.Check type="checkbox" />
                                    </td>
                                    <td>
                                        <div>
                                            <div className="fw-medium">{review.customerName}</div>
                                            <small className="text-muted">{review.customerEmail}</small>
                                            <br />
                                            <small className="text-muted">{review.createdAt}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <div className="fw-medium">{review.mentorName}</div>
                                            <small className="text-muted">{review.service}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-center">
                                            <div className="mb-1">
                                                {getRatingStars(review.rating)}
                                            </div>
                                            <span className="fw-medium">{review.rating}/5</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="review-preview">
                                            {review.comment.length > 100
                                                ? `${review.comment.substring(0, 100)}...`
                                                : review.comment
                                            }
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg={getStatusBadgeVariant(review.isPublished, review.isReported)}>
                                            {getStatusText(review.isPublished, review.isReported)}
                                        </Badge>
                                        {review.isReported && (
                                            <div className="mt-1">
                                                <Badge bg="danger" className="d-block">
                                                    <FaFlag className="me-1" />
                                                    Báo cáo
                                                </Badge>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                onClick={() => handleViewReview(review)}
                                            >
                                                <FaEye />
                                            </Button>
                                            {!review.isPublished && !review.isReported && (
                                                <Button variant="outline-success" size="sm">
                                                    <FaCheck />
                                                </Button>
                                            )}
                                            {review.isPublished && (
                                                <Button variant="outline-warning" size="sm">
                                                    <FaTimes />
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

            {/* Review Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết đánh giá</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReview && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <h6>Thông tin khách hàng</h6>
                                    <p><strong>Tên:</strong> {selectedReview.customerName}</p>
                                    <p><strong>Email:</strong> {selectedReview.customerEmail}</p>
                                    <p><strong>Booking ID:</strong> #{selectedReview.bookingId}</p>
                                </Col>
                                <Col md={6}>
                                    <h6>Thông tin mentor & dịch vụ</h6>
                                    <p><strong>Mentor:</strong> {selectedReview.mentorName}</p>
                                    <p><strong>Dịch vụ:</strong> {selectedReview.service}</p>
                                    <p><strong>Ngày đánh giá:</strong> {selectedReview.createdAt}</p>
                                </Col>
                            </Row>

                            <div className="mb-3">
                                <h6>Đánh giá</h6>
                                <div className="d-flex align-items-center mb-2">
                                    <div className="me-3">
                                        {getRatingStars(selectedReview.rating)}
                                    </div>
                                    <span className="fw-medium">{selectedReview.rating}/5 sao</span>
                                </div>
                            </div>

                            <div className="mb-3">
                                <h6>Nội dung đánh giá</h6>
                                <div className="p-3 bg-light rounded">
                                    {selectedReview.comment}
                                </div>
                            </div>

                            <div className="mb-3">
                                <h6>Trạng thái</h6>
                                <Badge bg={getStatusBadgeVariant(selectedReview.isPublished, selectedReview.isReported)} className="me-2">
                                    {getStatusText(selectedReview.isPublished, selectedReview.isReported)}
                                </Badge>
                                {selectedReview.moderationNote && (
                                    <div className="mt-2">
                                        <small className="text-muted">
                                            <strong>Ghi chú kiểm duyệt:</strong> {selectedReview.moderationNote}
                                        </small>
                                    </div>
                                )}
                            </div>

                            {selectedReview.isReported && (
                                <Alert variant="danger">
                                    <h6><FaFlag className="me-2" />Đánh giá bị báo cáo</h6>
                                    <p><strong>Lý do:</strong> {selectedReview.reportReason}</p>
                                    <div className="mt-2">
                                        <Button variant="success" size="sm" className="me-2">
                                            <FaCheck className="me-1" />
                                            Chấp nhận đánh giá
                                        </Button>
                                        <Button variant="danger" size="sm">
                                            <FaTimes className="me-1" />
                                            Xóa đánh giá
                                        </Button>
                                    </div>
                                </Alert>
                            )}

                            {!selectedReview.isPublished && !selectedReview.isReported && (
                                <Alert variant="warning">
                                    <strong>Đánh giá chờ duyệt</strong>
                                    <div className="mt-2">
                                        <Button variant="success" size="sm" className="me-2">
                                            <FaCheck className="me-1" />
                                            Phê duyệt & Xuất bản
                                        </Button>
                                        <Button variant="danger" size="sm">
                                            <FaTimes className="me-1" />
                                            Từ chối
                                        </Button>
                                    </div>
                                </Alert>
                            )}

                            {selectedReview.isPublished && !selectedReview.isReported && (
                                <Alert variant="success">
                                    <strong>Đánh giá đã được xuất bản</strong>
                                    <div className="mt-2">
                                        <Button variant="warning" size="sm">
                                            <FaTimes className="me-1" />
                                            Ẩn đánh giá
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

export default ReviewManagement;