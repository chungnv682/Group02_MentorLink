import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form,
    InputGroup, Modal, Nav, Tab, Alert, Spinner
} from 'react-bootstrap';
import {
    FaSearch, FaEye, FaCheck, FaTimes, FaEdit,
    FaBlog, FaUser, FaClock, FaChartLine, FaTrash, FaEyeSlash, FaToggleOn, FaToggleOff
} from 'react-icons/fa';
import { getAllBlogs, moderateBlog, deleteBlog, togglePublishStatus } from '../../services/blog';
import { useToast } from '../../contexts/ToastContext';

const ContentManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showFAQModal, setShowFAQModal] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [blogs, setBlogs] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        views: 0
    });
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0
    });
    const { showToast } = useToast();

    // Fetch blogs from API
    useEffect(() => {
        fetchBlogs();
    }, [filterStatus, pagination.page]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                size: pagination.size,
                keyword: searchTerm || undefined,
                status: filterStatus !== 'all' ? filterStatus : undefined
            };
            
            const response = await getAllBlogs(params);
            console.log('ContentManagement - API Response:', response.data); // Debug log
            
            if (response.data.respCode === "0" || response.data.success) {
                const data = response.data.data;
                // API trả về data.blogs thay vì data.content
                const blogsList = data.blogs || [];
                setBlogs(blogsList);
                setPagination(prev => ({
                    ...prev,
                    totalPages: data.totalPages || 0,
                    totalElements: data.totalElements || 0
                }));

                // Nếu không có filter, tính stats từ data có sẵn
                if (filterStatus === 'all' && pagination.page === 0) {
                    calculateStats(blogsList, data.totalElements || 0);
                }
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            showToast('Không thể tải danh sách bài viết', 'error');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (blogsList, total) => {
        const pending = blogsList.filter(b => (b.statusName || b.status) === 'PENDING').length;
        const approved = blogsList.filter(b => (b.statusName || b.status) === 'APPROVED').length;
        const totalViews = blogsList.reduce((sum, b) => sum + (b.viewCount || 0), 0);
        
        setStats({
            total: total,
            pending: pending,
            approved: approved,
            views: totalViews
        });
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 0 }));
        fetchBlogs();
    };

    const faqReports = [
        {
            id: 1,
            question: 'Làm thế nào để trở thành mentor?',
            answer: 'Để trở thành mentor, bạn cần đăng ký tài khoản...',
            category: 'Mentor',
            status: 'PUBLISHED',
            createdAt: '2024-01-10'
        },
        {
            id: 2,
            question: 'Cách đặt lịch hẹn với mentor?',
            answer: 'Bạn có thể đặt lịch hẹn bằng cách...',
            category: 'Booking',
            status: 'DRAFT',
            createdAt: '2024-01-12'
        }
    ];

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'danger';
            case 'PUBLISHED': return 'primary';
            case 'DRAFT': return 'secondary';
            default: return 'secondary';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ duyệt';
            case 'APPROVED': return 'Đã duyệt';
            case 'REJECTED': return 'Từ chối';
            case 'PUBLISHED': return 'Đã xuất bản';
            case 'DRAFT': return 'Bản nháp';
            default: return status;
        }
    };

    const handleViewBlog = (blog) => {
        setSelectedBlog(blog);
        setShowModal(true);
    };

    const handleApproveBlog = async (blogId) => {
        try {
            console.log('Approving blog:', blogId);
            // Backend expects decisionId (Long): 3=PENDING, 4=APPROVED, 5=REJECTED
            const response = await moderateBlog(blogId, { 
                decisionId: 4, // APPROVED
                comment: 'Đã duyệt bởi admin'
            });
            console.log('Approve response:', response.data);
            
            if (response.data.respCode === "0" || response.data.success) {
                showToast('Đã duyệt bài viết thành công', 'success');
                fetchBlogs();
                if (selectedBlog?.id === blogId) {
                    setShowModal(false);
                }
            } else {
                showToast('Không thể duyệt bài viết: ' + (response.data.description || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Error approving blog:', error);
            console.error('Error response:', error.response);
            showToast(error.response?.data?.description || error.response?.data?.message || 'Không thể duyệt bài viết', 'error');
        }
    };

    const handleRejectBlog = async (blogId, reason = 'Không đáp ứng tiêu chuẩn') => {
        try {
            console.log('Rejecting blog:', blogId, 'reason:', reason);
            // Backend expects decisionId (Long): 3=PENDING, 4=APPROVED, 5=REJECTED
            const response = await moderateBlog(blogId, { 
                decisionId: 5, // REJECTED
                comment: reason
            });
            console.log('Reject response:', response.data);
            
            if (response.data.respCode === "0" || response.data.success) {
                showToast('Đã từ chối bài viết', 'success');
                fetchBlogs();
                if (selectedBlog?.id === blogId) {
                    setShowModal(false);
                }
            } else {
                showToast('Không thể từ chối bài viết: ' + (response.data.description || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Error rejecting blog:', error);
            console.error('Error response:', error.response);
            showToast(error.response?.data?.description || error.response?.data?.message || 'Không thể từ chối bài viết', 'error');
        }
    };

    const handleTogglePublish = async (blogId) => {
        try {
            console.log('Toggling publish status for blog:', blogId);
            const response = await togglePublishStatus(blogId);
            console.log('Toggle response:', response.data);
            
            if (response.data.respCode === "0" || response.data.success) {
                showToast('Đã thay đổi trạng thái xuất bản', 'success');
                fetchBlogs();
            } else {
                showToast('Không thể thay đổi trạng thái: ' + (response.data.description || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Error toggling publish status:', error);
            console.error('Error response:', error.response);
            showToast(error.response?.data?.description || error.response?.data?.message || 'Không thể thay đổi trạng thái', 'error');
        }
    };

    const handleDeleteBlog = async (blogId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            return;
        }
        
        try {
            const response = await deleteBlog(blogId);
            if (response.data.respCode === "0" || response.data.success) {
                showToast('Đã xóa bài viết', 'success');
                fetchBlogs();
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            showToast(error.response?.data?.description || error.response?.data?.message || 'Không thể xóa bài viết', 'error');
        }
    };

    return (
        <div className="content-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Quản lý nội dung</h4>
                    <p className="text-muted mb-0">Quản lý FAQ, bài viết hướng dẫn và nội dung blog</p>
                </div>
                <div className="d-flex gap-2">
                    <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setShowFAQModal(true)}
                    >
                        <FaBlog className="me-1" />
                        Tạo FAQ mới
                    </Button>
                    <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <FaEdit className="me-1" />
                        Tạo bài viết
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
                                    <h6 className="text-muted mb-1">Tổng bài viết</h6>
                                    <h3 className="mb-0 text-primary">{stats.total || 0}</h3>
                                </div>
                                <div className="stats-icon bg-primary">
                                    <FaBlog />
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
                                    <h3 className="mb-0 text-warning">{stats.pending || 0}</h3>
                                </div>
                                <div className="stats-icon bg-warning">
                                    <FaClock />
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
                                    <h3 className="mb-0 text-success">{stats.approved || 0}</h3>
                                </div>
                                <div className="stats-icon bg-success">
                                    <FaCheck />
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
                                    <h6 className="text-muted mb-1">Lượt xem</h6>
                                    <h3 className="mb-0 text-info">{stats.views ? (stats.views >= 1000 ? `${(stats.views / 1000).toFixed(1)}K` : stats.views) : 0}</h3>
                                </div>
                                <div className="stats-icon bg-info">
                                    <FaChartLine />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Tab.Container defaultActiveKey="blogs">
                <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                        <Nav.Link eventKey="blogs">Bài viết Blog</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="faq">FAQ & Hướng dẫn</Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    {/* Blog Management Tab */}
                    <Tab.Pane eventKey="blogs">
                        {/* Filters */}
                        <Card className="mb-4">
                            <Card.Body>
                                <Row className="align-items-end">
                                    <Col md={6}>
                                        <Form.Label>Tìm kiếm bài viết</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>
                                                <FaSearch />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Tìm theo tiêu đề hoặc tác giả..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label>Trạng thái</Form.Label>
                                        <Form.Select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                        >
                                            <option value="all">Tất cả trạng thái</option>
                                            <option value="PENDING">Chờ duyệt</option>
                                            <option value="APPROVED">Đã duyệt</option>
                                            <option value="REJECTED">Từ chối</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={2}>
                                        <Button 
                                            variant="outline-secondary" 
                                            className="w-100"
                                            onClick={handleSearch}
                                            disabled={loading}
                                        >
                                            {loading ? <Spinner size="sm" /> : 'Lọc'}
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Blogs Table */}
                        <Card>
                            <Card.Header className="bg-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">Danh sách bài viết ({pagination.totalElements})</h6>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                                    </div>
                                ) : blogs.length === 0 ? (
                                    <div className="text-center py-5">
                                        <FaBlog size={48} className="text-muted mb-3" />
                                        <p className="text-muted">Không có bài viết nào</p>
                                    </div>
                                ) : (
                                    <Table responsive hover className="mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th width="4%">
                                                    <Form.Check type="checkbox" />
                                                </th>
                                                <th width="30%">Tiêu đề</th>
                                                <th width="13%">Tác giả</th>
                                                <th width="10%">Trạng thái</th>
                                                <th width="8%">Xuất bản</th>
                                                <th width="8%">Lượt xem</th>
                                                <th width="12%">Ngày tạo</th>
                                                <th width="15%">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {blogs.map((blog) => (
                                                <tr key={blog.id}>
                                                    <td>
                                                        <Form.Check type="checkbox" />
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div className="fw-medium">{blog.title}</div>
                                                            <small className="text-muted">
                                                                {blog.content ? blog.content.substring(0, 60) + '...' : ''}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <FaUser className="me-2 text-muted" />
                                                            <span>{blog.authorName || blog.author || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge bg={getStatusBadgeVariant(blog.statusName || blog.status)}>
                                                            {getStatusText(blog.statusName || blog.status)}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        {blog.isPublished ? (
                                                            <Badge bg="success" className="d-flex align-items-center justify-content-center gap-1" style={{width: 'fit-content'}}>
                                                                <FaEye size={10} /> Hiện
                                                            </Badge>
                                                        ) : (
                                                            <Badge bg="secondary" className="d-flex align-items-center justify-content-center gap-1" style={{width: 'fit-content'}}>
                                                                <FaEyeSlash size={10} /> Ẩn
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="text-muted">{(blog.viewCount || 0).toLocaleString()}</span>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted">
                                                            {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-1 flex-wrap">
                                                            <Button
                                                                variant="outline-info"
                                                                size="sm"
                                                                onClick={() => handleViewBlog(blog)}
                                                                title="Xem chi tiết"
                                                            >
                                                                <FaEye />
                                                            </Button>
                                                            {(blog.statusName === 'PENDING' || blog.status === 'PENDING') && (
                                                                <>
                                                                    <Button 
                                                                        variant="success" 
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            console.log('Approve button clicked for blog:', blog.id);
                                                                            handleApproveBlog(blog.id);
                                                                        }}
                                                                        className="d-flex align-items-center gap-1"
                                                                    >
                                                                        <FaCheck /> Duyệt
                                                                    </Button>
                                                                    <Button 
                                                                        variant="danger" 
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            console.log('Reject button clicked for blog:', blog.id);
                                                                            handleRejectBlog(blog.id);
                                                                        }}
                                                                        className="d-flex align-items-center gap-1"
                                                                    >
                                                                        <FaTimes /> Từ chối
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {(blog.statusName === 'APPROVED' || blog.status === 'APPROVED') && (
                                                                <Button 
                                                                    variant={blog.isPublished ? "outline-warning" : "outline-primary"}
                                                                    size="sm"
                                                                    onClick={() => handleTogglePublish(blog.id)}
                                                                    title={blog.isPublished ? "Ẩn bài viết" : "Hiển thị bài viết"}
                                                                >
                                                                    {blog.isPublished ? <FaEyeSlash /> : <FaEye />}
                                                                </Button>
                                                            )}
                                                            <Button 
                                                                variant="outline-danger" 
                                                                size="sm"
                                                                onClick={() => handleDeleteBlog(blog.id)}
                                                                title="Xóa"
                                                            >
                                                                <FaTrash />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                            {!loading && blogs.length > 0 && (
                                <Card.Footer className="bg-light">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted">
                                            Hiển thị {pagination.page * pagination.size + 1} - {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} trong tổng số {pagination.totalElements} bài viết
                                        </span>
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                disabled={pagination.page === 0}
                                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                            >
                                                Trước
                                            </Button>
                                            <span className="px-3 py-1">
                                                Trang {pagination.page + 1} / {pagination.totalPages || 1}
                                            </span>
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                disabled={pagination.page >= pagination.totalPages - 1}
                                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                            >
                                                Sau
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Footer>
                            )}
                        </Card>
                    </Tab.Pane>

                    {/* FAQ Management Tab */}
                    <Tab.Pane eventKey="faq">
                        <Card>
                            <Card.Header className="bg-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">Danh sách FAQ ({faqReports.length})</h6>
                                    <Button variant="primary" size="sm">
                                        <FaEdit className="me-1" />
                                        Thêm FAQ mới
                                    </Button>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table responsive hover className="mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th width="5%">
                                                <Form.Check type="checkbox" />
                                            </th>
                                            <th width="40%">Câu hỏi</th>
                                            <th width="15%">Danh mục</th>
                                            <th width="15%">Trạng thái</th>
                                            <th width="15%">Ngày tạo</th>
                                            <th width="10%">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {faqReports.map((faq) => (
                                            <tr key={faq.id}>
                                                <td>
                                                    <Form.Check type="checkbox" />
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="fw-medium">{faq.question}</div>
                                                        <small className="text-muted">
                                                            {faq.answer.substring(0, 50)}...
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg="info">{faq.category}</Badge>
                                                </td>
                                                <td>
                                                    <Badge bg={getStatusBadgeVariant(faq.status)}>
                                                        {getStatusText(faq.status)}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <span className="text-muted">{faq.createdAt}</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Button variant="outline-info" size="sm">
                                                            <FaEye />
                                                        </Button>
                                                        <Button variant="outline-primary" size="sm">
                                                            <FaEdit />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

            {/* Blog Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết bài viết</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedBlog && (
                        <div>
                            <Row className="mb-3">
                                <Col>
                                    <h5>{selectedBlog.title}</h5>
                                    <div className="d-flex gap-3 text-muted mb-3">
                                        <span><FaUser className="me-1" />{selectedBlog.author}</span>
                                        <span><FaClock className="me-1" />{selectedBlog.createdAt}</span>
                                        <span><FaChartLine className="me-1" />{selectedBlog.viewCount} lượt xem</span>
                                    </div>
                                    <Badge bg={getStatusBadgeVariant(selectedBlog.statusName || selectedBlog.status)} className="mb-3">
                                        {getStatusText(selectedBlog.statusName || selectedBlog.status)}
                                    </Badge>
                                </Col>
                            </Row>

                            <div className="blog-content">
                                <h6>Nội dung:</h6>
                                <div className="p-3 bg-light rounded">
                                    {selectedBlog.content}
                                </div>
                            </div>

                            {(selectedBlog.statusName === 'PENDING' || selectedBlog.status === 'PENDING') && (
                                <Alert variant="warning" className="mt-3">
                                    <strong>Bài viết đang chờ duyệt</strong>
                                    <div className="mt-2">
                                        <Button 
                                            variant="success" 
                                            size="sm" 
                                            className="me-2"
                                            onClick={() => handleApproveBlog(selectedBlog.id)}
                                        >
                                            <FaCheck className="me-1" />
                                            Duyệt bài viết
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => handleRejectBlog(selectedBlog.id)}
                                        >
                                            <FaTimes className="me-1" />
                                            Từ chối
                                        </Button>
                                    </div>
                                </Alert>
                            )}
                            {(selectedBlog.statusName === 'REJECTED' || selectedBlog.status === 'REJECTED') && (
                                <Alert variant="danger" className="mt-3">
                                    <strong>Bài viết đã bị từ chối</strong>
                                </Alert>
                            )}
                            {(selectedBlog.statusName === 'APPROVED' || selectedBlog.status === 'APPROVED') && (
                                <Alert variant="success" className="mt-3">
                                    <strong>Bài viết đã được duyệt</strong>
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
                        Chỉnh sửa
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Create Blog Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Tạo bài viết mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info">
                        <strong>Lưu ý:</strong> Chức năng tạo bài viết sẽ được phát triển trong phiên bản tiếp theo. 
                        Hiện tại, bài viết được tạo bởi Mentor và Admin chỉ có thể duyệt/từ chối.
                    </Alert>
                    <p className="text-muted">
                        Để tạo bài viết mới, vui lòng sử dụng trang Mentor hoặc liên hệ với bộ phận phát triển để thêm tính năng này.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Create FAQ Modal */}
            <Modal show={showFAQModal} onHide={() => setShowFAQModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Tạo FAQ mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info">
                        <strong>Lưu ý:</strong> Chức năng quản lý FAQ sẽ được phát triển trong phiên bản tiếp theo.
                    </Alert>
                    <p className="text-muted">
                        Hiện tại trang này chỉ tập trung vào quản lý bài viết blog. Chức năng FAQ sẽ được bổ sung sau.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFAQModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ContentManagement;