import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form,
    InputGroup, Modal, Nav, Tab, Alert, Spinner, Dropdown
} from 'react-bootstrap';
import {
    FaSearch, FaEye, FaCheck, FaTimes, FaEdit,
    FaBlog, FaUser, FaClock, FaChartLine, FaTrash, FaEyeSlash, FaToggleOn, FaToggleOff
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { Editor } from '@tinymce/tinymce-react';
import { getAllBlogs, moderateBlog, deleteBlog, togglePublishStatus } from '../../services/blog';
import { getAllFaqsForAdmin, togglePublishFaq, deleteFaq, updateFaq } from '../../services/faq';
import { useToast } from '../../contexts/ToastContext';
import { extractTextFromHtml, sanitizeHtml } from '../../utils/htmlUtils';
import '../../styles/components/quill-editor.css';
import '../../styles/components/tinymce-content.css';

const ContentManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showFAQModal, setShowFAQModal] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [selectedFaq, setSelectedFaq] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [blogs, setBlogs] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        views: 0
    });
    const [faqStats, setFaqStats] = useState({
        total: 0,
        published: 0
    });
    const [loading, setLoading] = useState(false);
    const [faqLoading, setFaqLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0
    });
    const [faqPagination, setFaqPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0
    });
    const { showToast } = useToast();

    // Selection state for bulk actions (Blogs & FAQs)
    const [selectedBlogIds, setSelectedBlogIds] = useState(new Set());
    const [selectedFaqIds, setSelectedFaqIds] = useState(new Set());
    const blogHeaderCheckboxRef = useRef(null);
    const faqHeaderCheckboxRef = useRef(null);

    // Fetch blogs from API
    useEffect(() => {
        console.log('Fetching blogs - page:', pagination.page, 'filter:', filterStatus);
        fetchBlogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus, pagination.page]);

    // Fetch FAQs from API  
    useEffect(() => {
        console.log('Fetching FAQs - page:', faqPagination.page);
        fetchFaqs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [faqPagination.page]);

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
            console.log('ContentManagement - API Response:', response); // Debug log
            
            // Axios interceptor đã unwrap response.data, vậy response = { respCode, description, data }
            if (response.respCode === "0" || response.success) {
                const data = response.data;
                // API trả về data.blogs
                const blogsList = data.blogs || [];
                console.log('Blogs list:', blogsList); // Debug log
                setBlogs(blogsList);
                // Keep selection across page changes (no pruning here)
                
                // API trả về pageNumber, pageSize, totalPages, totalElements
                setPagination(prev => ({
                    ...prev,
                    page: data.pageNumber || 0,
                    size: data.pageSize || 10,
                    totalPages: data.totalPages || 0,
                    totalElements: data.totalElements || 0
                }));

                // Tính stats từ data có sẵn
                calculateStats(blogsList, data.totalElements || 0);
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

    const fetchFaqs = async () => {
        try {
            setFaqLoading(true);
            const params = {
                page: faqPagination.page, // Backend page bắt đầu từ 0
                size: faqPagination.size,
                sort: 'createdAt,desc' // Sắp xếp theo ngày tạo mới nhất
            };
            
            console.log('Fetching FAQs with params:', params);
            const response = await getAllFaqsForAdmin(params);
            console.log('ContentManagement - FAQ API Response:', response);
            
            if (response.respCode === "0" || response.success) {
                const data = response.data;
                // Backend trả về Page<FaqResponse>, cần access .content
                const faqsList = data.content || [];
                console.log('FAQs list:', faqsList);
                setFaqs(faqsList);
                setFaqPagination(prev => ({
                    ...prev,
                    totalPages: data.totalPages || 0,
                    totalElements: data.totalElements || 0
                }));

                // Calculate FAQ stats
                setFaqStats({
                    total: data.totalElements || 0,
                    published: faqsList.filter(f => f.published).length
                });
            }
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            console.error('Error details:', error.response?.data);
            // Nếu không có dữ liệu FAQ, không hiển thị lỗi
            if (error.response?.status !== 404) {
                showToast('Không thể tải danh sách FAQ', 'error');
            } else {
                console.log('No FAQs found or endpoint not available');
            }
            // Set empty data
            setFaqs([]);
            setFaqStats({ total: 0, published: 0 });
        } finally {
            setFaqLoading(false);
        }
    };

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
            console.log('Approve response:', response);
            
            if (response.respCode === "0" || response.success) {
                showToast('Đã duyệt bài viết thành công', 'success');
                fetchBlogs();
                if (selectedBlog?.id === blogId) {
                    setShowModal(false);
                }
            } else {
                showToast('Không thể duyệt bài viết: ' + (response.description || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Error approving blog:', error);
            console.error('Error response:', error.response);
            showToast(error.description || error.message || 'Không thể duyệt bài viết', 'error');
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
            console.log('Reject response:', response);
            
            if (response.respCode === "0" || response.success) {
                showToast('Đã từ chối bài viết', 'success');
                fetchBlogs();
                if (selectedBlog?.id === blogId) {
                    setShowModal(false);
                }
            } else {
                showToast('Không thể từ chối bài viết: ' + (response.description || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Error rejecting blog:', error);
            console.error('Error response:', error.response);
            showToast(error.description || error.message || 'Không thể từ chối bài viết', 'error');
        }
    };

    const handleTogglePublish = async (blogId) => {
        try {
            console.log('Toggling publish status for blog:', blogId);
            const response = await togglePublishStatus(blogId);
            console.log('Toggle response:', response);
            
            if (response.respCode === "0" || response.success) {
                showToast('Đã thay đổi trạng thái xuất bản', 'success');
                fetchBlogs();
            } else {
                showToast('Không thể thay đổi trạng thái: ' + (response.description || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Error toggling publish status:', error);
            console.error('Error response:', error.response);
            showToast(error.description || error.message || 'Không thể thay đổi trạng thái', 'error');
        }
    };

    const handleDeleteBlog = async (blogId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            return;
        }
        
        try {
            const response = await deleteBlog(blogId);
            if (response.respCode === "0" || response.success) {
                showToast('Đã xóa bài viết', 'success');
                fetchBlogs();
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            showToast(error.description || error.message || 'Không thể xóa bài viết', 'error');
        }
    };

    // ===== Bulk selection helpers for Blogs =====
    const blogIdsOnPage = blogs.map(b => b.id);
    const allBlogsSelectedOnPage = blogIdsOnPage.length > 0 && blogIdsOnPage.every(id => selectedBlogIds.has(id));
    const someBlogsSelectedOnPage = blogIdsOnPage.some(id => selectedBlogIds.has(id)) && !allBlogsSelectedOnPage;

    useEffect(() => {
        if (blogHeaderCheckboxRef.current) {
            blogHeaderCheckboxRef.current.indeterminate = someBlogsSelectedOnPage;
        }
    }, [someBlogsSelectedOnPage]);

    const toggleSelectBlog = (id) => {
        setSelectedBlogIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleSelectAllBlogsCurrentPage = () => {
        setSelectedBlogIds(prev => {
            const next = new Set(prev);
            if (allBlogsSelectedOnPage) {
                blogIdsOnPage.forEach(id => next.delete(id));
            } else {
                blogIdsOnPage.forEach(id => next.add(id));
            }
            return next;
        });
    };

    const handleDeleteSelectedBlogs = async () => {
        const count = selectedBlogIds.size;
        if (count === 0) return;
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${count} bài viết đã chọn?`)) return;
        try {
            const ids = Array.from(selectedBlogIds);
            const results = await Promise.allSettled(ids.map(id => deleteBlog(id)));
            const failed = results.filter(r => r.status === 'rejected');
            if (failed.length > 0) {
                showToast(`Một số bài viết không thể xóa (${failed.length}/${ids.length}).`, 'warning');
            } else {
                showToast('Đã xóa các bài viết đã chọn', 'success');
            }
            setSelectedBlogIds(new Set());
            await fetchBlogs();
        } catch (err) {
            console.error('Bulk delete blogs error:', err);
            showToast('Có lỗi khi xóa nhiều bài viết', 'error');
        }
    };

    const handleViewFaq = (faq) => {
        setSelectedFaq(faq);
        setShowFAQModal(true);
    };

    const handleTogglePublishFaq = async (faqId, currentStatus) => {
        try {
            const response = await togglePublishFaq(faqId, !currentStatus);
            if (response.respCode === "0" || response.success) {
                showToast(
                    !currentStatus ? 'Đã xuất bản FAQ' : 'Đã ẩn FAQ', 
                    'success'
                );
                fetchFaqs();
            }
        } catch (error) {
            console.error('Error toggling FAQ publish status:', error);
            showToast(error.description || 'Không thể thay đổi trạng thái', 'error');
        }
    };

    const handleDeleteFaq = async (faqId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa FAQ này?')) {
            return;
        }
        
        try {
            const response = await deleteFaq(faqId);
            if (response.respCode === "0" || response.success) {
                showToast('Đã xóa FAQ', 'success');
                fetchFaqs();
            }
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            showToast(error.description || 'Không thể xóa FAQ', 'error');
        }
    };

    // ===== Bulk selection helpers for FAQs =====
    const faqIdsOnPage = faqs.map(f => f.id);
    const allFaqsSelectedOnPage = faqIdsOnPage.length > 0 && faqIdsOnPage.every(id => selectedFaqIds.has(id));
    const someFaqsSelectedOnPage = faqIdsOnPage.some(id => selectedFaqIds.has(id)) && !allFaqsSelectedOnPage;

    useEffect(() => {
        if (faqHeaderCheckboxRef.current) {
            faqHeaderCheckboxRef.current.indeterminate = someFaqsSelectedOnPage;
        }
    }, [someFaqsSelectedOnPage]);

    const toggleSelectFaq = (id) => {
        setSelectedFaqIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleSelectAllFaqsCurrentPage = () => {
        setSelectedFaqIds(prev => {
            const next = new Set(prev);
            if (allFaqsSelectedOnPage) {
                faqIdsOnPage.forEach(id => next.delete(id));
            } else {
                faqIdsOnPage.forEach(id => next.add(id));
            }
            return next;
        });
    };

    const handleDeleteSelectedFaqs = async () => {
        const count = selectedFaqIds.size;
        if (count === 0) return;
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${count} FAQ đã chọn?`)) return;
        try {
            const ids = Array.from(selectedFaqIds);
            const results = await Promise.allSettled(ids.map(id => deleteFaq(id)));
            const failed = results.filter(r => r.status === 'rejected');
            if (failed.length > 0) {
                showToast(`Một số FAQ không thể xóa (${failed.length}/${ids.length}).`, 'warning');
            } else {
                showToast('Đã xóa các FAQ đã chọn', 'success');
            }
            setSelectedFaqIds(new Set());
            await fetchFaqs();
        } catch (err) {
            console.error('Bulk delete FAQs error:', err);
            showToast('Có lỗi khi xóa nhiều FAQ', 'error');
        }
    };

    return (
        <div className="content-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Quản lý nội dung</h4>
                </div>
                {/* <div className="d-flex gap-2">
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
                </div> */}
            </div>

            {/* Stats Cards - simple version */}
            <Row className="mb-3 g-3">
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Tổng bài viết</h6>
                            <h4 className="fw-semibold mb-0">{stats.total || 0}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Chờ duyệt</h6>
                            <h4 className="fw-semibold mb-0">{stats.pending || 0}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Đã xuất bản</h6>
                            <h4 className="fw-semibold mb-0">{stats.approved || 0}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Lượt xem</h6>
                            <h4 className="fw-semibold mb-0">{stats.views ? (stats.views >= 1000 ? `${(stats.views / 1000).toFixed(1)}K` : stats.views) : 0}</h4>
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
                                    <div className="d-flex gap-2">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={handleSelectAllBlogsCurrentPage}
                                            disabled={blogs.length === 0}
                                        >
                                            Chọn tất cả
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={handleDeleteSelectedBlogs}
                                            disabled={selectedBlogIds.size === 0}
                                        >
                                            Xóa đã chọn {selectedBlogIds.size > 0 ? `(${selectedBlogIds.size})` : ''}
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
                                                    <Form.Check 
                                                        type="checkbox"
                                                        checked={allBlogsSelectedOnPage}
                                                        onChange={handleSelectAllBlogsCurrentPage}
                                                        ref={blogHeaderCheckboxRef}
                                                    />
                                                </th>
                                                <th width="30%">Tiêu đề</th>
                                                <th width="20%">Tác giả</th>
                                                <th width="12%">Trạng thái</th>
                                                <th width="8%">Xuất bản</th>
                                                <th width="8%">Lượt xem</th>
                                                <th width="13%">Ngày tạo</th>
                                                <th width="5%">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {blogs.map((blog) => (
                                                <tr key={blog.id}>
                                                    <td>
                                                        <Form.Check 
                                                            type="checkbox"
                                                            checked={selectedBlogIds.has(blog.id)}
                                                            onChange={() => toggleSelectBlog(blog.id)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div className="fw-medium">{blog.title}</div>
                                                            {/* <small className="text-muted">
                                                                {blog.content ? blog.content.substring(0, 60) + '...' : ''}
                                                            </small> */}
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
                                                        <Dropdown align="end">
                                                            <Dropdown.Toggle variant="light" size="sm" aria-label="Thao tác" className="no-caret">
                                                                <BsThreeDotsVertical />
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item onClick={() => handleViewBlog(blog)}>Xem</Dropdown.Item>
                                                                {(blog.statusName === 'PENDING' || blog.status === 'PENDING') && (
                                                                    <>
                                                                        <Dropdown.Item onClick={() => handleApproveBlog(blog.id)}>Duyệt</Dropdown.Item>
                                                                        <Dropdown.Item onClick={() => handleRejectBlog(blog.id)}>Từ chối</Dropdown.Item>
                                                                    </>
                                                                )}
                                                                {(blog.statusName === 'APPROVED' || blog.status === 'APPROVED') && (
                                                                    <Dropdown.Item onClick={() => handleTogglePublish(blog.id)}>
                                                                        {blog.isPublished ? 'Ẩn bài viết' : 'Hiển thị bài viết'}
                                                                    </Dropdown.Item>
                                                                )}
                                                                <Dropdown.Item onClick={() => handleDeleteBlog(blog.id)} className="text-danger">Xóa</Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
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
                                    <h6 className="mb-0">Danh sách FAQ</h6>
                                    <div className="d-flex gap-2">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={handleSelectAllFaqsCurrentPage}
                                            disabled={faqs.length === 0}
                                        >
                                            Chọn tất cả
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={handleDeleteSelectedFaqs}
                                            disabled={selectedFaqIds.size === 0}
                                        >
                                            Xóa đã chọn {selectedFaqIds.size > 0 ? `(${selectedFaqIds.size})` : ''}
                                        </Button>
                                        {/* <Button variant="primary" size="sm" disabled>
                                            <FaEdit className="me-1" />
                                            Thêm FAQ mới
                                        </Button> */}
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {faqLoading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                                    </div>
                                ) : faqs.length === 0 ? (
                                    <div className="text-center py-5">
                                        <FaBlog size={48} className="text-muted mb-3" />
                                        <p className="text-muted">Không có FAQ nào</p>
                                    </div>
                                ) : (
                                    <Table responsive hover className="mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th width="4%">
                                                    <Form.Check 
                                                        type="checkbox"
                                                        checked={allFaqsSelectedOnPage}
                                                        onChange={handleSelectAllFaqsCurrentPage}
                                                        ref={faqHeaderCheckboxRef}
                                                    />
                                                </th>
                                                <th width="42%">Câu hỏi</th>
                                                <th width="14%">Mức độ</th>
                                                <th width="10%">Trạng thái</th>
                                                <th width="10%">Lượt xem</th>
                                                <th width="10%">Ngày tạo</th>
                                                <th width="8%">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {faqs.map((faq) => (
                                                <tr key={faq.id}>
                                                    <td>
                                                        <Form.Check 
                                                            type="checkbox"
                                                            checked={selectedFaqIds.has(faq.id)}
                                                            onChange={() => toggleSelectFaq(faq.id)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div className="fw-medium">{faq.question}</div>
                                                            {/* {faq.answer && (
                                                                <small className="text-muted">
                                                                    {faq.answer.substring(0, 50)}...
                                                                </small>
                                                            )} */}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge bg={faq.urgency === 'HIGH' ? 'danger' : faq.urgency === 'MEDIUM' ? 'warning' : 'info'}>
                                                            {faq.urgency === 'HIGH' ? 'Cao' : faq.urgency === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        {faq.published ? (
                                                            <Badge bg="success" className="d-flex align-items-center justify-content-center gap-1" style={{width: 'fit-content'}}>
                                                                <FaEye size={10} /> Hiện
                                                            </Badge>
                                                        ) : (
                                                            <Badge bg="secondary" className="d-flex align-items-center justify-content-center gap-1" style={{width: 'fit-content'}}>
                                                                <FaEyeSlash size={10} /> Ẩn
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="text-muted">{(faq.viewCount || 0).toLocaleString()}</span>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted">
                                                            {faq.createdAt ? new Date(faq.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <Dropdown align="end">
                                                            <Dropdown.Toggle variant="light" size="sm" aria-label="Thao tác" className="no-caret">
                                                                <BsThreeDotsVertical />
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item onClick={() => handleViewFaq(faq)}>Xem</Dropdown.Item>
                                                                <Dropdown.Item onClick={() => handleTogglePublishFaq(faq.id, faq.published)}>
                                                                    {faq.published ? 'Ẩn FAQ' : 'Hiển thị FAQ'}
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => handleDeleteFaq(faq.id)} className="text-danger">Xóa</Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                            {!faqLoading && faqs.length > 0 && (
                                <Card.Footer className="bg-light">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted">
                                            Hiển thị {faqPagination.page * faqPagination.size + 1} - {Math.min((faqPagination.page + 1) * faqPagination.size, faqPagination.totalElements)} trong tổng số {faqPagination.totalElements} FAQ
                                        </span>
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                disabled={faqPagination.page === 0}
                                                onClick={() => setFaqPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                            >
                                                Trước
                                            </Button>
                                            <span className="px-3 py-1">
                                                Trang {faqPagination.page + 1} / {faqPagination.totalPages || 1}
                                            </span>
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                disabled={faqPagination.page >= faqPagination.totalPages - 1}
                                                onClick={() => setFaqPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                            >
                                                Sau
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Footer>
                            )}
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
                                <div className="border rounded">
                                    <Editor
                                        value={selectedBlog.content}
                                        init={{
                                            height: 400,
                                            menubar: false,
                                            toolbar: false,
                                            statusbar: false,
                                            readonly: true,
                                            inline: false,
                                            content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; padding: 10px; }',
                                        }}
                                        disabled={true}
                                    />
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

            <Modal show={showFAQModal} onHide={() => { setShowFAQModal(false); setSelectedFaq(null); }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết FAQ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedFaq ? (
                        <div>
                            <Row className="mb-3">
                                <Col>
                                    <h5>{selectedFaq.question}</h5>
                                    <div className="d-flex gap-3 text-muted mb-3">
                                        <span>
                                            <FaClock className="me-1" />
                                            {selectedFaq.createdAt ? new Date(selectedFaq.createdAt).toLocaleString('vi-VN') : 'N/A'}
                                        </span>
                                        <span>
                                            <FaChartLine className="me-1" />
                                            {(selectedFaq.viewCount || 0).toLocaleString()} lượt xem
                                        </span>
                                    </div>
                                    <div className="d-flex gap-2 mb-3">
                                        <Badge bg={selectedFaq.urgency === 'HIGH' ? 'danger' : selectedFaq.urgency === 'MEDIUM' ? 'warning' : 'info'}>
                                            Mức độ: {selectedFaq.urgency === 'HIGH' ? 'Cao' : selectedFaq.urgency === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
                                        </Badge>
                                        {/* <Badge bg={selectedFaq.isPublished ? 'success' : 'secondary'}>
                                            {selectedFaq.isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
                                        </Badge> */}
                                    </div>
                                </Col>
                            </Row>

                            {selectedFaq.answer ? (
                                <div className="faq-answer">
                                    <h6>Câu trả lời:</h6>
                                    <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedFaq.answer}
                                    </div>
                                </div>
                            ) : (
                                <Alert variant="warning">
                                    <strong>Chưa có câu trả lời</strong>
                                    <p className="mb-0 mt-2">FAQ này chưa được trả lời. Vui lòng thêm câu trả lời.</p>
                                </Alert>
                            )}
                        </div>
                    ) : (
                        <Alert variant="info">
                            <strong>Lưu ý:</strong> Chức năng quản lý FAQ đang trong quá trình phát triển.
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShowFAQModal(false); setSelectedFaq(null); }}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ContentManagement;