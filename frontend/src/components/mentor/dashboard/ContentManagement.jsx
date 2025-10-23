import React, { useState } from 'react';
import { Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Tab, Nav } from 'react-bootstrap';

const ContentManagement = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [activeTab, setActiveTab] = useState('blogs');
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        status: 'draft'
    });

    // Mock data cho blogs
    const blogs = [
        {
            id: 1,
            title: '10 Bí quyết để có một CV ấn tượng trong lĩnh vực IT',
            content: 'Trong thời đại số hóa ngày nay, việc sở hữu một CV ấn tượng là chìa khóa để mở ra cánh cửa cơ hội trong lĩnh vực công nghệ thông tin...',
            status: 'PUBLISHED',
            view_count: 1250,
            isPublished: true,
            created_at: '2024-01-10T14:30:00',
            updated_at: '2024-01-12T09:15:00',
            moderationStatus: 'APPROVED'
        },
        {
            id: 2,
            title: 'Hướng dẫn chuẩn bị hồ sơ du học Mỹ từ A đến Z',
            content: 'Du học Mỹ là ước mơ của nhiều sinh viên Việt Nam. Tuy nhiên, quá trình chuẩn bị hồ sơ đòi hỏi sự tỉ mỉ và hiểu biết sâu sắc...',
            status: 'PENDING',
            view_count: 0,
            isPublished: false,
            created_at: '2024-01-15T16:45:00',
            updated_at: '2024-01-15T16:45:00',
            moderationStatus: 'PENDING'
        },
        {
            id: 3,
            title: 'Top 5 kỹ năng mềm cần thiết cho sinh viên IT',
            content: 'Bên cạnh kiến thức chuyên môn vững chắc, các kỹ năng mềm đóng vai trò không kém phần quan trọng trong sự nghiệp của một lập trình viên...',
            status: 'DRAFT',
            view_count: 0,
            isPublished: false,
            created_at: '2024-01-08T11:20:00',
            updated_at: '2024-01-14T13:30:00',
            moderationStatus: null
        },
        {
            id: 4,
            title: 'Kinh nghiệm luyện thi IELTS Speaking đạt 8.0',
            content: 'Sau 6 tháng luyện tập không ngừng nghỉ, tôi đã đạt được band điểm 8.0 cho phần Speaking trong kỳ thi IELTS. Hôm nay tôi muốn chia sẻ...',
            status: 'PUBLISHED',
            view_count: 890,
            isPublished: true,
            created_at: '2024-01-05T10:15:00',
            updated_at: '2024-01-06T08:45:00',
            moderationStatus: 'APPROVED'
        }
    ];

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PUBLISHED': { bg: 'success', text: 'Đã xuất bản' },
            'PENDING': { bg: 'warning', text: 'Chờ duyệt' },
            'DRAFT': { bg: 'secondary', text: 'Bản nháp' },
            'REJECTED': { bg: 'danger', text: 'Bị từ chối' }
        };
        const statusInfo = statusMap[status] || { bg: 'secondary', text: status };
        return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
    };

    const getModerationBadge = (status) => {
        if (!status) return null;
        const statusMap = {
            'APPROVED': { bg: 'success', text: 'Đã duyệt' },
            'PENDING': { bg: 'warning', text: 'Chờ duyệt' },
            'REJECTED': { bg: 'danger', text: 'Từ chối' }
        };
        const statusInfo = statusMap[status] || { bg: 'secondary', text: status };
        return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
    };

    const handleCreateBlog = () => {
        console.log('Creating blog:', formData);
        // Logic tạo blog mới
        setShowCreateModal(false);
        resetForm();
    };

    const handleEditBlog = (blog) => {
        setSelectedBlog(blog);
        setFormData({
            title: blog.title,
            content: blog.content,
            status: blog.status.toLowerCase()
        });
        setShowEditModal(true);
    };

    const handleUpdateBlog = () => {
        console.log('Updating blog:', selectedBlog.id, formData);
        // Logic cập nhật blog
        setShowEditModal(false);
        resetForm();
    };

    const handleDeleteBlog = (blogId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            console.log('Deleting blog:', blogId);
            // Logic xóa blog
        }
    };

    const handlePublishBlog = (blogId) => {
        console.log('Publishing blog:', blogId);
        // Logic xuất bản blog
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            status: 'draft'
        });
        setSelectedBlog(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="content-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-1">Quản lý nội dung</h3>
                    <p className="text-muted mb-0">Tạo và chia sẻ các bài viết, blog để giúp đỡ cộng đồng</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    className="btn-mentor"
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Viết bài mới
                </Button>
            </div>

            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon primary">
                                <i className="bi bi-journal-text"></i>
                            </div>
                            <div className="stat-value">{blogs.length}</div>
                            <p className="stat-label">Tổng bài viết</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon success">
                                <i className="bi bi-check-circle"></i>
                            </div>
                            <div className="stat-value">{blogs.filter(b => b.status === 'PUBLISHED').length}</div>
                            <p className="stat-label">Đã xuất bản</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon info">
                                <i className="bi bi-eye"></i>
                            </div>
                            <div className="stat-value">
                                {blogs.reduce((sum, b) => sum + b.view_count, 0)}
                            </div>
                            <p className="stat-label">Lượt xem</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon warning">
                                <i className="bi bi-clock-history"></i>
                            </div>
                            <div className="stat-value">{blogs.filter(b => b.status === 'PENDING').length}</div>
                            <p className="stat-label">Chờ duyệt</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Content Tabs */}
            <Card className="dashboard-card">
                <Card.Header className="bg-transparent border-0">
                    <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                        <Nav variant="tabs" className="content-tabs">
                            <Nav.Item>
                                <Nav.Link eventKey="blogs">
                                    <i className="bi bi-journal-text me-2"></i>
                                    Bài viết Blog
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="guides">
                                    <i className="bi bi-book me-2"></i>
                                    Hướng dẫn
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Tab.Container>
                </Card.Header>
                <Card.Body className="p-0">
                    <Tab.Container activeKey={activeTab}>
                        <Tab.Content>
                            <Tab.Pane eventKey="blogs">
                                <Table className="custom-table">
                                    <thead>
                                        <tr>
                                            <th>Tiêu đề</th>
                                            <th>Trạng thái</th>
                                            <th>Kiểm duyệt</th>
                                            <th>Lượt xem</th>
                                            <th>Ngày tạo</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {blogs.map((blog) => (
                                            <tr key={blog.id}>
                                                <td>
                                                    <div>
                                                        <div className="fw-medium">{blog.title}</div>
                                                        <small className="text-muted">
                                                            {blog.content.substring(0, 100)}...
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>{getStatusBadge(blog.status)}</td>
                                                <td>{getModerationBadge(blog.moderationStatus)}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-eye me-1 text-muted"></i>
                                                        {blog.view_count.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <small>{formatDateTime(blog.created_at)}</small>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleEditBlog(blog)}
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </Button>
                                                        {blog.status === 'DRAFT' && (
                                                            <Button
                                                                variant="outline-success"
                                                                size="sm"
                                                                onClick={() => handlePublishBlog(blog.id)}
                                                            >
                                                                <i className="bi bi-upload"></i>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            title="Xem trước"
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteBlog(blog.id)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Tab.Pane>
                            <Tab.Pane eventKey="guides">
                                <div className="text-center py-5">
                                    <i className="bi bi-book display-1 text-muted"></i>
                                    <h5 className="mt-3 text-muted">Tính năng đang phát triển</h5>
                                    <p className="text-muted">Tính năng quản lý hướng dẫn sẽ được cập nhật trong phiên bản tiếp theo</p>
                                </div>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Card.Body>
            </Card>

            {/* Popular Posts */}
            <Row className="mt-4">
                <Col lg={6}>
                    <Card className="dashboard-card">
                        <Card.Header className="bg-transparent border-0">
                            <h5 className="mb-0">Bài viết phổ biến</h5>
                        </Card.Header>
                        <Card.Body>
                            {blogs
                                .filter(blog => blog.status === 'PUBLISHED')
                                .sort((a, b) => b.view_count - a.view_count)
                                .slice(0, 3)
                                .map((blog, index) => (
                                    <div key={blog.id} className="popular-post-item d-flex align-items-center mb-3">
                                        <div className="rank-number me-3">
                                            <div className={`rank-badge rank-${index + 1}`}>
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1">{blog.title}</h6>
                                            <div className="d-flex align-items-center text-muted small">
                                                <i className="bi bi-eye me-1"></i>
                                                {blog.view_count} lượt xem
                                                <span className="mx-2">•</span>
                                                <i className="bi bi-calendar me-1"></i>
                                                {formatDateTime(blog.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6}>
                    <Card className="dashboard-card">
                        <Card.Header className="bg-transparent border-0">
                            <h5 className="mb-0">Thống kê nội dung</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="content-stats">
                                <div className="stat-row d-flex justify-content-between align-items-center mb-3">
                                    <span>Bài viết đã xuất bản:</span>
                                    <span className="fw-bold text-success">
                                        {blogs.filter(b => b.status === 'PUBLISHED').length}
                                    </span>
                                </div>
                                <div className="stat-row d-flex justify-content-between align-items-center mb-3">
                                    <span>Đang chờ duyệt:</span>
                                    <span className="fw-bold text-warning">
                                        {blogs.filter(b => b.status === 'PENDING').length}
                                    </span>
                                </div>
                                <div className="stat-row d-flex justify-content-between align-items-center mb-3">
                                    <span>Bản nháp:</span>
                                    <span className="fw-bold text-secondary">
                                        {blogs.filter(b => b.status === 'DRAFT').length}
                                    </span>
                                </div>
                                <div className="stat-row d-flex justify-content-between align-items-center mb-3">
                                    <span>Tổng lượt xem:</span>
                                    <span className="fw-bold text-primary">
                                        {blogs.reduce((sum, b) => sum + b.view_count, 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="stat-row d-flex justify-content-between align-items-center">
                                    <span>Trung bình lượt xem/bài:</span>
                                    <span className="fw-bold text-info">
                                        {Math.round(blogs.reduce((sum, b) => sum + b.view_count, 0) / blogs.length)}
                                    </span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Create Blog Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Viết bài mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tiêu đề <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                placeholder="Nhập tiêu đề bài viết"
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nội dung <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={8}
                                name="content"
                                placeholder="Viết nội dung bài viết của bạn..."
                                value={formData.content}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Trạng thái</Form.Label>
                            <Form.Select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                            >
                                <option value="draft">Lưu nháp</option>
                                <option value="pending">Gửi duyệt</option>
                            </Form.Select>
                        </Form.Group>

                        <Alert variant="info">
                            <i className="bi bi-info-circle me-2"></i>
                            <strong>Lưu ý:</strong> Bài viết sẽ được kiểm duyệt trước khi xuất bản công khai.
                            Quá trình này có thể mất 1-2 ngày làm việc.
                        </Alert>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateBlog}
                        disabled={!formData.title || !formData.content}
                    >
                        <i className="bi bi-save me-2"></i>
                        {formData.status === 'draft' ? 'Lưu nháp' : 'Gửi duyệt'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Blog Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa bài viết</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tiêu đề <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                placeholder="Nhập tiêu đề bài viết"
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nội dung <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={8}
                                name="content"
                                placeholder="Viết nội dung bài viết của bạn..."
                                value={formData.content}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Trạng thái</Form.Label>
                            <Form.Select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                            >
                                <option value="draft">Lưu nháp</option>
                                <option value="pending">Gửi duyệt</option>
                                <option value="published">Xuất bản</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpdateBlog}
                        disabled={!formData.title || !formData.content}
                    >
                        <i className="bi bi-save me-2"></i>
                        Cập nhật
                    </Button>
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                .content-tabs .nav-link {
                    color: var(--text-color);
                    border-bottom: 2px solid transparent;
                }
                
                .content-tabs .nav-link.active {
                    color: var(--primary-color);
                    border-bottom-color: var(--primary-color);
                    background: none;
                }
                
                .content-tabs .nav-link:hover {
                    color: var(--primary-color);
                    border-bottom-color: rgba(113, 201, 206, 0.3);
                }
                
                .rank-badge {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 0.8rem;
                }
                
                .rank-1 {
                    background: linear-gradient(135deg, #ffd700, #ffed4e);
                }
                
                .rank-2 {
                    background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
                }
                
                .rank-3 {
                    background: linear-gradient(135deg, #cd7f32, #d4af37);
                }
                
                .popular-post-item {
                    padding: 0.75rem 0;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .popular-post-item:last-child {
                    border-bottom: none;
                }
                
                .content-stats {
                    background-color: rgba(113, 201, 206, 0.05);
                    border-radius: 10px;
                    padding: 1rem;
                }
                
                .stat-row {
                    padding: 0.5rem 0;
                    border-bottom: 1px solid rgba(113, 201, 206, 0.1);
                }
                
                .stat-row:last-child {
                    border-bottom: none;
                }
            `}</style>
        </div>
    );
};

export default ContentManagement;