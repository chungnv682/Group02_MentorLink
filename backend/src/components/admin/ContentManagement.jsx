import React, { useState } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form,
    InputGroup, Modal, Nav, Tab, Alert
} from 'react-bootstrap';
import {
    FaSearch, FaEye, FaCheck, FaTimes, FaEdit,
    FaBlog, FaUser, FaClock, FaChartLine
} from 'react-icons/fa';

const ContentManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Mock data - thay thế bằng API call thực tế
    const blogs = [
        {
            id: 1,
            title: 'Hướng dẫn chọn career path phù hợp',
            content: 'Nội dung bài viết về career path...',
            author: 'John Mentor',
            authorId: 123,
            status: 'PENDING',
            viewCount: 0,
            isPublished: false,
            createdAt: '2024-01-15',
            updatedAt: '2024-01-15'
        },
        {
            id: 2,
            title: '10 kỹ năng cần thiết cho lập trình viên',
            content: 'Nội dung bài viết về kỹ năng lập trình...',
            author: 'Jane Developer',
            authorId: 456,
            status: 'APPROVED',
            viewCount: 1250,
            isPublished: true,
            createdAt: '2024-01-10',
            updatedAt: '2024-01-14'
        },
        {
            id: 3,
            title: 'Cách chuẩn bị cho cuộc phỏng vấn',
            content: 'Nội dung bài viết về phỏng vấn...',
            author: 'Mike HR',
            authorId: 789,
            status: 'REJECTED',
            viewCount: 0,
            isPublished: false,
            createdAt: '2024-01-12',
            updatedAt: '2024-01-13'
        }
    ];

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

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="content-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Quản lý nội dung</h4>
                    <p className="text-muted mb-0">Quản lý FAQ, bài viết hướng dẫn và nội dung blog</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                        <FaBlog className="me-1" />
                        Tạo FAQ mới
                    </Button>
                    <Button variant="primary" size="sm">
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
                                    <h3 className="mb-0 text-primary">156</h3>
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
                    <Card className="stats-card border-start border-success border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Đã xuất bản</h6>
                                    <h3 className="mb-0 text-success">89</h3>
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
                                    <h3 className="mb-0 text-info">15.2K</h3>
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
                                        <Button variant="outline-secondary" className="w-100">
                                            Lọc
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Blogs Table */}
                        <Card>
                            <Card.Header className="bg-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">Danh sách bài viết ({filteredBlogs.length})</h6>
                                    <div className="d-flex gap-2">
                                        <Button variant="outline-success" size="sm">Duyệt hàng loạt</Button>
                                        <Button variant="outline-danger" size="sm">Từ chối hàng loạt</Button>
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
                                            <th width="35%">Tiêu đề</th>
                                            <th width="15%">Tác giả</th>
                                            <th width="12%">Trạng thái</th>
                                            <th width="10%">Lượt xem</th>
                                            <th width="13%">Ngày tạo</th>
                                            <th width="10%">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBlogs.map((blog) => (
                                            <tr key={blog.id}>
                                                <td>
                                                    <Form.Check type="checkbox" />
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="fw-medium">{blog.title}</div>
                                                        <small className="text-muted">
                                                            {blog.content.substring(0, 60)}...
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <FaUser className="me-2 text-muted" />
                                                        <span>{blog.author}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg={getStatusBadgeVariant(blog.status)}>
                                                        {getStatusText(blog.status)}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <span className="text-muted">{blog.viewCount.toLocaleString()}</span>
                                                </td>
                                                <td>
                                                    <span className="text-muted">{blog.createdAt}</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            onClick={() => handleViewBlog(blog)}
                                                        >
                                                            <FaEye />
                                                        </Button>
                                                        {blog.status === 'PENDING' && (
                                                            <>
                                                                <Button variant="outline-success" size="sm">
                                                                    <FaCheck />
                                                                </Button>
                                                                <Button variant="outline-danger" size="sm">
                                                                    <FaTimes />
                                                                </Button>
                                                            </>
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
                                    <Badge bg={getStatusBadgeVariant(selectedBlog.status)} className="mb-3">
                                        {getStatusText(selectedBlog.status)}
                                    </Badge>
                                </Col>
                            </Row>

                            <div className="blog-content">
                                <h6>Nội dung:</h6>
                                <div className="p-3 bg-light rounded">
                                    {selectedBlog.content}
                                </div>
                            </div>

                            {selectedBlog.status === 'PENDING' && (
                                <Alert variant="warning" className="mt-3">
                                    <strong>Bài viết đang chờ duyệt</strong>
                                    <div className="mt-2">
                                        <Button variant="success" size="sm" className="me-2">
                                            <FaCheck className="me-1" />
                                            Duyệt bài viết
                                        </Button>
                                        <Button variant="danger" size="sm">
                                            <FaTimes className="me-1" />
                                            Từ chối
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
                        Chỉnh sửa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ContentManagement;