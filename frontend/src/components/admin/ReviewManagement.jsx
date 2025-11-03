import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form, Dropdown,
    InputGroup, Modal, Alert, Spinner
} from 'react-bootstrap';
import {
    FaSearch, FaEye, FaTrash, FaCheck, FaTimes,
    FaStar, FaCommentDots, FaFlag, FaUser
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useToast } from '../../contexts/ToastContext';
import {
    getAllReviews,
    getReviewById,
    publishReview,
    unpublishReview,
    deleteReview,
    bulkPublishReviews,
    bulkDeleteReviews,
    getReviewStatistics
} from '../../services/admin';

const ReviewManagement = () => {
    // State for reviews
    const [reviews, setReviews] = useState([]);
    const [statistics, setStatistics] = useState({
        totalReviews: 0,
        publishedReviews: 0,
        pendingReviews: 0,
        reportedReviews: 0,
        averageRating: 0,
        fiveStarCount: 0,
        fourStarCount: 0,
        threeStarCount: 0,
        twoStarCount: 0,
        oneStarCount: 0
    });
    
    // UI State
    const [showModal, setShowModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);
    
    // Loading states
    const [loading, setLoading] = useState(false);
    const [loadingStatistics, setLoadingStatistics] = useState(false);
    
    // Selection for bulk operations
    const [selectedReviewIds, setSelectedReviewIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const headerCheckboxRef = useRef(null);
    
    const { showToast } = useToast();

    // Fetch reviews from API
    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await getAllReviews({
                keySearch: searchTerm || null,
                rating: filterRating,
                status: filterStatus || null,
                page: currentPage,
                size: pageSize
            });
            
            if (response.respCode === '0') {
                setReviews(response.data.content || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalElements(response.data.totalElements || 0);
            } else {
                showToast('error', response.description || 'Không thể tải danh sách đánh giá');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            showToast('error', 'Có lỗi xảy ra khi tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStatistics = async () => {
        setLoadingStatistics(true);
        try {
            const response = await getReviewStatistics();
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
            fetchReviews();
            fetchStatistics();
        }, searchTerm ? 500 : 0);

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, filterRating, filterStatus]);

    // Indeterminate state for header checkbox
    useEffect(() => {
        if (!headerCheckboxRef.current) return;
        const allIdsOnPage = reviews.map(r => r.id);
        const selectedOnPage = allIdsOnPage.filter(id => selectedReviewIds.includes(id));
        const allSelectedOnPage = selectedOnPage.length === allIdsOnPage.length && allIdsOnPage.length > 0;
        const someSelectedOnPage = selectedOnPage.length > 0 && !allSelectedOnPage;
        headerCheckboxRef.current.indeterminate = someSelectedOnPage;
    }, [reviews, selectedReviewIds]);

    // Handlers
    const handleViewReviewById = async (reviewId) => {
        try {
            const response = await getReviewById(reviewId);
            if (response.respCode === '0') {
                setSelectedReview(response.data);
                setShowModal(true);
            } else {
                showToast('error', response.description || 'Không thể tải thông tin đánh giá');
            }
        } catch (error) {
            console.error('Error fetching review details:', error);
            showToast('error', 'Có lỗi xảy ra khi tải thông tin đánh giá');
        }
    };

    const handlePublishReview = async (reviewId) => {
        try {
            const response = await publishReview(reviewId);
            if (response.respCode === '0') {
                showToast('success', 'Xuất bản đánh giá thành công');
                fetchReviews();
                fetchStatistics();
            } else {
                showToast('error', response.description || 'Không thể xuất bản đánh giá');
            }
        } catch (error) {
            console.error('Error publishing review:', error);
            showToast('error', 'Có lỗi xảy ra khi xuất bản đánh giá');
        }
    };

    const handleUnpublishReview = async (reviewId) => {
        try {
            const response = await unpublishReview(reviewId);
            if (response.respCode === '0') {
                showToast('success', 'Ẩn đánh giá thành công');
                fetchReviews();
                fetchStatistics();
            } else {
                showToast('error', response.description || 'Không thể ẩn đánh giá');
            }
        } catch (error) {
            console.error('Error unpublishing review:', error);
            showToast('error', 'Có lỗi xảy ra khi ẩn đánh giá');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
        
        try {
            const response = await deleteReview(reviewId);
            if (response.respCode === '0') {
                showToast('success', 'Xóa đánh giá thành công');
                fetchReviews();
                fetchStatistics();
                setShowModal(false);
            } else {
                showToast('error', response.description || 'Không thể xóa đánh giá');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            showToast('error', 'Có lỗi xảy ra khi xóa đánh giá');
        }
    };

    const handleBulkPublish = async () => {
        if (selectedReviewIds.length === 0) {
            showToast('warning', 'Vui lòng chọn ít nhất một đánh giá');
            return;
        }

        try {
            const response = await bulkPublishReviews(selectedReviewIds);
            if (response.respCode === '0') {
                showToast('success', `Đã xuất bản ${selectedReviewIds.length} đánh giá`);
                setSelectedReviewIds([]);
                setSelectAll(false);
                fetchReviews();
                fetchStatistics();
            } else {
                showToast('error', response.description || 'Không thể xuất bản đánh giá');
            }
        } catch (error) {
            console.error('Error bulk publishing:', error);
            showToast('error', 'Có lỗi xảy ra khi xuất bản hàng loạt');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedReviewIds.length === 0) {
            showToast('warning', 'Vui lòng chọn ít nhất một đánh giá');
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedReviewIds.length} đánh giá?`)) return;

        try {
            const response = await bulkDeleteReviews(selectedReviewIds);
            if (response.respCode === '0') {
                showToast('success', `Đã xóa ${selectedReviewIds.length} đánh giá`);
                setSelectedReviewIds([]);
                setSelectAll(false);
                fetchReviews();
                fetchStatistics();
            } else {
                showToast('error', response.description || 'Không thể xóa đánh giá');
            }
        } catch (error) {
            console.error('Error bulk deleting:', error);
            showToast('error', 'Có lỗi xảy ra khi xóa hàng loạt');
        }
    };

    const handleSelectAll = () => {
        const allIdsOnPage = reviews.map(r => r.id);
        const allSelected = allIdsOnPage.length > 0 && allIdsOnPage.every(id => selectedReviewIds.includes(id));
        if (allSelected) {
            setSelectedReviewIds(prev => prev.filter(id => !allIdsOnPage.includes(id)));
            setSelectAll(false);
        } else {
            setSelectedReviewIds(prev => Array.from(new Set([...prev, ...allIdsOnPage])));
            setSelectAll(true);
        }
    };

    const handleSelectReview = (reviewId) => {
        if (selectedReviewIds.includes(reviewId)) {
            setSelectedReviewIds(selectedReviewIds.filter(id => id !== reviewId));
        } else {
            setSelectedReviewIds([...selectedReviewIds, reviewId]);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Helper functions
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

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'N/A';
        return new Date(dateTime).toLocaleString('vi-VN');
    };

    return (
        <div className="review-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Quản lý đánh giá & review</h4>
                    <p className="text-muted mb-0">Quản lý và kiểm duyệt đánh giá từ khách hàng</p>
                </div>
                <div className="d-flex gap-2">
                    <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={handleBulkPublish}
                        disabled={selectedReviewIds.length === 0}
                    >
                        <FaCheck className="me-1" />
                        Duyệt đã chọn ({selectedReviewIds.length})
                    </Button>
                    <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={selectedReviewIds.length === 0}
                    >
                        <FaTrash className="me-1" />
                        Xóa đã chọn ({selectedReviewIds.length})
                    </Button>
                </div>
            </div>

            {/* Stats Cards - simple version */}
            <Row className="mb-3 g-3">
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Tổng đánh giá</h6>
                            <h4 className="fw-semibold mb-0">
                                {loadingStatistics ? <Spinner animation="border" size="sm" /> : (statistics.totalReviews || 0)}
                            </h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Đã xuất bản</h6>
                            <h4 className="fw-semibold mb-0">
                                {loadingStatistics ? <Spinner animation="border" size="sm" /> : (statistics.publishedReviews || 0)}
                            </h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Chờ duyệt</h6>
                            <h4 className="fw-semibold mb-0">
                                {loadingStatistics ? <Spinner animation="border" size="sm" /> : (statistics.pendingReviews || 0)}
                            </h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Bị báo cáo</h6>
                            <h4 className="fw-semibold mb-0">
                                {loadingStatistics ? <Spinner animation="border" size="sm" /> : (statistics.reportedReviews || 0)}
                            </h4>
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
                                <h2 className="mb-0">{(statistics.averageRating || 0).toFixed(1)}</h2>
                                <div className="mb-2">
                                    {getRatingStars(Math.round(statistics.averageRating || 0))}
                                </div>
                                <p className="text-muted mb-0">Điểm trung bình</p>
                            </div>
                        </Col>
                        <Col md={9}>
                            {[5, 4, 3, 2, 1].map(rating => {
                                const countField = rating === 5 ? 'fiveStarCount' :
                                                   rating === 4 ? 'fourStarCount' :
                                                   rating === 3 ? 'threeStarCount' :
                                                   rating === 2 ? 'twoStarCount' : 'oneStarCount';
                                const count = statistics[countField] || 0;
                                const percentage = statistics.totalReviews > 0 ? (count / statistics.totalReviews) * 100 : 0;

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
                                value={filterRating || ''}
                                onChange={(e) => {
                                    setFilterRating(e.target.value ? parseInt(e.target.value) : null);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">Tất cả đánh giá</option>
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
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="published">Đã xuất bản</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="reported">Bị báo cáo</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Button 
                                variant="outline-secondary" 
                                className="w-100"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterRating(null);
                                    setFilterStatus('');
                                    setCurrentPage(1);
                                }}
                            >
                                Xóa
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Reviews Table */}
            <Card>
                <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Danh sách đánh giá ({totalElements})</h6>
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
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-5">
                            <FaCommentDots size={48} className="text-muted mb-3" />
                            <p className="text-muted">Không có đánh giá nào</p>
                        </div>
                    ) : (
                        <Table responsive hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th width="5%">
                                        <Form.Check 
                                            type="checkbox" 
                                            ref={headerCheckboxRef}
                                            checked={reviews.length > 0 && reviews.every(r => selectedReviewIds.includes(r.id))}
                                            onChange={handleSelectAll}
                                        />
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
                                {reviews.map((review) => (
                                    <tr key={review.id}>
                                        <td>
                                            <Form.Check 
                                                type="checkbox"
                                                checked={selectedReviewIds.includes(review.id)}
                                                onChange={() => handleSelectReview(review.id)}
                                            />
                                        </td>
                                        <td>
                                            <div>
                                                <div className="fw-medium">{review.customerName}</div>
                                                <small className="text-muted">{review.customerEmail}</small>
                                                <br />
                                                <small className="text-muted">{formatDateTime(review.createdAt)}</small>
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
                                            <Dropdown align="end">
                                                <Dropdown.Toggle variant="light" size="sm" className="no-caret p-1">
                                                    <BsThreeDotsVertical />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={() => handleViewReviewById(review.id)}>
                                                        Xem
                                                    </Dropdown.Item>
                                                    {!review.isPublished && !review.isReported && (
                                                        <Dropdown.Item onClick={() => handlePublishReview(review.id)}>
                                                            Duyệt
                                                        </Dropdown.Item>
                                                    )}
                                                    {review.isPublished && (
                                                        <Dropdown.Item onClick={() => handleUnpublishReview(review.id)}>
                                                            Ẩn đánh giá
                                                        </Dropdown.Item>
                                                    )}
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item className="text-danger" onClick={() => handleDeleteReview(review.id)}>
                                                        Xóa
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
                {!loading && reviews.length > 0 && (
                    <Card.Footer className="bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-muted">
                                Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalElements)} trong số {totalElements} đánh giá
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
                                    <p><strong>Dịch vụ:</strong> {selectedReview.service || 'N/A'}</p>
                                    <p><strong>Ngày đánh giá:</strong> {formatDateTime(selectedReview.createdAt)}</p>
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
                                    <p><strong>Lý do:</strong> {selectedReview.reportReason || 'Không rõ'}</p>
                                    <div className="mt-2">
                                        <Button 
                                            variant="success" 
                                            size="sm" 
                                            className="me-2"
                                            onClick={() => {
                                                handlePublishReview(selectedReview.id);
                                                setShowModal(false);
                                            }}
                                        >
                                            <FaCheck className="me-1" />
                                            Chấp nhận đánh giá
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => handleDeleteReview(selectedReview.id)}
                                        >
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
                                        <Button 
                                            variant="success" 
                                            size="sm" 
                                            className="me-2"
                                            onClick={() => {
                                                handlePublishReview(selectedReview.id);
                                                setShowModal(false);
                                            }}
                                        >
                                            <FaCheck className="me-1" />
                                            Phê duyệt & Xuất bản
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => handleDeleteReview(selectedReview.id)}
                                        >
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
                                        <Button 
                                            variant="warning" 
                                            size="sm"
                                            onClick={() => {
                                                handleUnpublishReview(selectedReview.id);
                                                setShowModal(false);
                                            }}
                                        >
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