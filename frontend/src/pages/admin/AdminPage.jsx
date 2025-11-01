import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Nav, Tab, Badge, Alert, Button } from 'react-bootstrap';
import {
    FaUsers, FaBlog, FaUserCog, FaChartBar,
    FaCalendarAlt, FaHistory, FaCommentDots,
    FaBullhorn, FaCog, FaKey, FaShieldAlt, FaGlobeAmericas
} from 'react-icons/fa';
import { CountryManagement } from '../../components/admin';
import { getAllUsers, getUserStatistics } from '../../services/user/userManagementService';
import { getAllBlogs } from '../../services/blog';
import MentorService from '../../services/mentor/MentorService';
import CountryService from '../../services/country/CountryService';

import '../../styles/components/AdminPage.css';

// Admin component containers
const AdminComponentWrapper = ({ icon, title, children, badge = null }) => (
    <Card className="admin-content-card">
        <Card.Header className="bg-light">
            <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                    <span className="me-2">{icon}</span>
                    {title}
                </h5>
                {badge && <Badge bg="primary">{badge}</Badge>}
            </div>
        </Card.Header>
        <Card.Body>
            {children}
        </Card.Body>
    </Card>
);


// Components với data từ API
const UserManagement = ({ users, stats, loading, onSearch, onPageChange, currentPage, totalPages, totalElements }) => {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchDebounce, setSearchDebounce] = useState(null);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchKeyword(value);

        // Clear previous timeout
        if (searchDebounce) {
            clearTimeout(searchDebounce);
        }

        // Set new timeout for debounce (500ms)
        const timeout = setTimeout(() => {
            onSearch(value);
        }, 500);

        setSearchDebounce(timeout);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchDebounce) {
            clearTimeout(searchDebounce);
        }
        onSearch(searchKeyword);
    };

    return (
        <AdminComponentWrapper icon="👥" title="Quản lý người dùng">
            <Row className="mb-3">
                <Col md={4}>
                    <Card className="text-center border-0 bg-light">
                        <Card.Body>
                            <h3 className="text-primary">{stats?.totalUsers?.toLocaleString() || 0}</h3>
                            <small className="text-muted">Tổng người dùng</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center border-0 bg-light">
                        <Card.Body>
                            <h3 className="text-success">{stats?.totalMentors || 0}</h3>
                            <small className="text-muted">Tổng mentor</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center border-0 bg-light">
                        <Card.Body>
                            <h3 className="text-warning">{stats?.pendingMentors || 0}</h3>
                            <small className="text-muted">Chờ duyệt</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Người dùng gần đây</h6>
                <form onSubmit={handleSearchSubmit} className="d-flex gap-2" style={{ maxWidth: '400px' }}>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Tìm kiếm "
                        value={searchKeyword}
                        onChange={handleSearchChange}
                        disabled={loading}
                    />
                    <Button size="sm" variant="primary" type="submit" disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                        Tìm
                    </Button>
                </form>
            </div>

            <div className="position-relative">
                {loading && (
                    <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" 
                         style={{ background: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}
                
                <div className="table-responsive">
                    <table className="table table-sm table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Tên</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th>Ngày tham gia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users && users.length > 0 ? (
                                users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.fullName || user.name || 'N/A'}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <Badge bg={user.role?.roleName === 'MENTOR' ? 'success' : 'primary'}>
                                                {user.role?.roleName || 'CUSTOMER'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg={(user.status === 1 || (typeof user.status === 'string' && /active/i.test(user.status))) ? 'success' : 'warning'}>
                                                {typeof user.status === 'string' ? user.status : (user.status === 1 ? 'active' : 'inactive')}
                                            </Badge>
                                        </td>
                                        <td>{user.createTime ? new Date(user.createTime).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">
                                        {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages >= 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="text-muted small">
                        Hiển thị {users?.length || 0} / {totalElements?.toLocaleString() || 0} người dùng
                    </div>
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => onPageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                >
                                    ‹ Trước
                                </button>
                            </li>
                            
                            {/* Page numbers */}
                            {[...Array(totalPages)].map((_, index) => {
                                const pageNum = index + 1;
                                // Show first page, last page, current page, and pages around current
                                if (
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                ) {
                                    return (
                                        <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => onPageChange(pageNum)}
                                                disabled={loading}
                                            >
                                                {pageNum}
                                            </button>
                                        </li>
                                    );
                                } else if (
                                    pageNum === currentPage - 2 ||
                                    pageNum === currentPage + 2
                                ) {
                                    return <li key={pageNum} className="page-item disabled"><span className="page-link">...</span></li>;
                                }
                                return null;
                            })}

                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => onPageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || loading}
                                >
                                    Sau ›
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </AdminComponentWrapper>
    );
};


const ContentManagement = ({ blogs, loading, onRefresh }) => {
    const totalBlogs = blogs?.length || 0;
    const pendingBlogs = blogs?.filter(blog => blog.statusName === 'PENDING')?.length || 0;
    const navigate = useNavigate();

    const handleApproveBlog = async (blogId) => {
        try {
            const { moderateBlog } = await import('../../services/blog');
            // Backend expects decisionId (Long): 3=PENDING, 4=APPROVED, 5=REJECTED
            const response = await moderateBlog(blogId, { 
                decisionId: 4, // APPROVED
                comment: 'Đã duyệt bởi admin'
            });
            console.log('Approve response:', response.data);
            if (response.data.respCode === "0") {
                alert('Đã duyệt bài viết thành công!');
                if (onRefresh) onRefresh();
            } else {
                alert('Lỗi: ' + (response.data.description || 'Không thể duyệt bài viết'));
            }
        } catch (error) {
            console.error('Error approving blog:', error);
            console.error('Error response:', error.response?.data);
            alert('Không thể duyệt bài viết: ' + (error.response?.data?.description || 'Lỗi không xác định'));
        }
    };

    const handleViewBlog = (blogId) => {
        // Navigate to content management tab or open modal
        console.log('View blog:', blogId);
    };

    return (
        <AdminComponentWrapper icon="📝" title="Quản lý nội dung" >
            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Card className="text-center border-0 bg-light">
                                <Card.Body>
                                    <h4 className="text-info">{totalBlogs}</h4>
                                    <small className="text-muted">Tổng bài viết</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="text-center border-0 bg-light">
                                <Card.Body>
                                    <h4 className="text-warning">{pendingBlogs}</h4>
                                    <small className="text-muted">Chờ duyệt</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <h6>Bài viết gần đây</h6>
                    <div className="table-responsive">
                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th>Tiêu đề</th>
                                    <th>Tác giả</th>
                                    <th>Trạng thái</th>
                                    <th>Lượt xem</th>
                                    <th>Ngày tạo</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blogs && blogs.length > 0 ? (
                                    blogs.slice(0, 5).map(blog => (
                                        <tr key={blog.id}>
                                            <td>{blog.title}</td>
                                            <td>{blog.author || 'Unknown'}</td>
                                            <td>
                                                <Badge bg={
                                                    blog.statusName === 'APPROVED' ? 'success' :
                                                        blog.statusName === 'PENDING' ? 'warning' : 'secondary'
                                                }>
                                                    {blog.statusName}
                                                </Badge>
                                            </td>
                                            <td>{blog.viewCount?.toLocaleString() || 0}</td>
                                            <td>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                            <td>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline-primary" 
                                                    className="me-1"
                                                    onClick={() => handleViewBlog(blog.id)}
                                                >
                                                    Xem
                                                </Button>
                                                {blog.statusName === 'PENDING' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="success"
                                                        onClick={() => handleApproveBlog(blog.id)}
                                                    >
                                                        Duyệt
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">Không có bài viết nào</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </AdminComponentWrapper>
    );
};


const Analytics = ({ stats, mentors }) => {
    const totalMentors = mentors?.length || stats?.totalMentors || 0;
    const totalUsers = stats?.totalUsers || 0;

    return (
        <AdminComponentWrapper icon="📊" title="Báo cáo & thống kê">
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center border-0 bg-gradient-primary text-white">
                        <Card.Body>
                            <h4>N/A</h4>
                            <small>Lượt truy cập hôm nay</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center border-0 bg-gradient-success text-white">
                        <Card.Body>
                            <h4>{stats?.totalBookings || 'N/A'}</h4>
                            <small>Tổng đặt lịch</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center border-0 bg-gradient-info text-white">
                        <Card.Body>
                            <h4>{totalMentors}</h4>
                            <small>Tổng mentor</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center border-0 bg-gradient-warning text-white">
                        <Card.Body>
                            <h4>N/A</h4>
                            <small>Doanh thu tháng</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Card>
                        <Card.Header>📈 Xu hướng đăng ký</Card.Header>
                        <Card.Body>
                            <div className="text-center p-4">
                                <h5 className="text-muted">📊 Biểu đồ sẽ hiển thị tại đây</h5>
                                <p className="small text-muted">Chart.js hoặc Recharts integration</p>
                                <div className="bg-light p-3 rounded">
                                    <div className="d-flex justify-content-between">
                                        <span>Tổng users: {totalUsers}</span>
                                    </div>
                                    <div className="progress mt-2">
                                        <div className="progress-bar bg-success" style={{ width: '70%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Header>💰 Doanh thu theo tháng</Card.Header>
                        <Card.Body>
                            <div className="text-center p-4">
                                <h5 className="text-muted">💹 Biểu đồ doanh thu</h5>
                                <p className="small text-muted">Revenue charts & trends</p>
                                <div className="bg-light p-3 rounded">
                                    <div className="d-flex justify-content-between">
                                        <span>Tính năng đang phát triển</span>
                                    </div>
                                    <div className="progress mt-2">
                                        <div className="progress-bar bg-warning" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </AdminComponentWrapper>
    );
};

const MentorApproval = ({ stats }) => (
    <AdminComponentWrapper icon="✅" title="Duyệt mentor" badge={stats?.pendingMentors || 0}>
        <Alert variant="warning">
            <strong>{stats?.pendingMentors || 0} mentor</strong> đang chờ duyệt hồ sơ
        </Alert>
        <Alert variant="info">
            <strong>Tính năng đang phát triển:</strong> Duyệt hồ sơ mentor, xác thực chuyên môn.
        </Alert>
    </AdminComponentWrapper>
);


const FeedbackManagement = () => {
    const totalFeedbacks = 0; // Chưa có API
    const urgentFeedbacks = 0; // Chưa có API

    return (
        <AdminComponentWrapper icon="💬" title="Quản lý phản hồi" badge={urgentFeedbacks}>
            <Row className="mb-3">
                <Col md={6}>
                    <Card className="text-center border-0 bg-light">
                        <Card.Body>
                            <h4 className="text-primary">{totalFeedbacks}</h4>
                            <small className="text-muted">Tổng phản hồi</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="text-center border-0 bg-light">
                        <Card.Body>
                            <h4 className="text-danger">{urgentFeedbacks}</h4>
                            <small className="text-muted">Cần xử lý khẩn</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Alert variant="info">
                <strong>Tính năng đang phát triển:</strong> API quản lý feedback chưa được implement.
            </Alert>
        </AdminComponentWrapper>
    );
};


const BookingManagement = () => {
    const totalBookings = 0; // Chưa có API admin
    const todayBookings = 0;

    return (
        <AdminComponentWrapper icon="📅" title="Quản lý đặt lịch" badge={todayBookings}>
            <Row className="mb-3">
                <Col md={6}>
                    <Card className="text-center border-0 bg-light">
                        <Card.Body>
                            <h4 className="text-success">{totalBookings}</h4>
                            <small className="text-muted">Tổng đặt lịch</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="text-center border-0 bg-light">
                        <Card.Body>
                            <h4 className="text-info">{todayBookings}</h4>
                            <small className="text-muted">Hôm nay</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Alert variant="info">
                <strong>Tính năng đang phát triển:</strong> API quản lý booking cho admin chưa được implement.
            </Alert>
        </AdminComponentWrapper>
    );
};


const PaymentHistory = () => {
    const monthRevenue = 0; // Chưa có API
    const todayRevenue = 0;

    return (
        <AdminComponentWrapper icon="💳" title="Lịch sử thanh toán">
            <Row className="mb-3">
                <Col md={4}>
                    <Card className="text-center border-0 bg-success text-white">
                        <Card.Body>
                            <h4>₫{monthRevenue.toLocaleString()}</h4>
                            <small>Doanh thu tháng</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center border-0 bg-info text-white">
                        <Card.Body>
                            <h4>₫{todayRevenue.toLocaleString()}</h4>
                            <small>Doanh thu hôm nay</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center border-0 bg-warning text-white">
                        <Card.Body>
                            <h4>4.2%</h4>
                            <small>Phí hoa hồng</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Alert variant="info" className="mt-3">
                <strong>💡 Tính năng đang phát triển:</strong>
                <ul className="mb-0 mt-2">
                    <li>API quản lý payment cho admin</li>
                    <li>Export báo cáo Excel/PDF</li>
                    <li>Lọc theo khoảng thời gian</li>
                    <li>Thống kê doanh thu theo mentor</li>
                    <li>Quản lý refund/hoàn tiền</li>
                </ul>
            </Alert>
        </AdminComponentWrapper>
    );
};

const ReviewManagement = () => (
    <AdminComponentWrapper icon="⭐" title="Quản lý đánh giá" badge="3">
        <Alert variant="warning">
            <strong>3 đánh giá</strong> cần kiểm duyệt
        </Alert>
        <Alert variant="info">
            <strong>Tính năng đang phát triển:</strong> Quản lý review, rating, và feedback.
        </Alert>
    </AdminComponentWrapper>
);

const BannerManagement = () => (
    <AdminComponentWrapper icon="🖼️" title="Quản lý banner">
        <Alert variant="info">
            <strong>Tính năng đang phát triển:</strong> Quản lý banner, quảng cáo, và nội dung trang chủ.
        </Alert>
    </AdminComponentWrapper>
);

const SystemSettings = () => (
    <AdminComponentWrapper icon="⚙️" title="Cấu hình hệ thống">
        <Alert variant="info">
            <strong>Tính năng đang phát triển:</strong> Cài đặt hệ thống, cấu hình ứng dụng.
        </Alert>
    </AdminComponentWrapper>
);

const RolePermissions = () => (
    <AdminComponentWrapper icon="🔐" title="Quản lý quyền">
        <Alert variant="info">
            <strong>Tính năng đang phát triển:</strong> Phân quyền người dùng, quản lý roles.
        </Alert>
    </AdminComponentWrapper>
);

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('users');
    
    // State cho data từ API
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [error, setError] = useState(null);

    // State cho pagination và search
    const [userPage, setUserPage] = useState(1);
    const [userSize] = useState(10);
    const [userSearch, setUserSearch] = useState('');
    const [userTotalPages, setUserTotalPages] = useState(0);
    const [userTotalElements, setUserTotalElements] = useState(0);

    // Fetch users với pagination và search
    const fetchUsers = async (page = 1, search = '') => {
        try {
            setUsersLoading(true);
            const response = await getAllUsers({ 
                page, 
                size: userSize,
                keySearch: search 
            });

            if (response?.respCode === '000' || response?.respCode === '0') {
                const rawUsers = response.data?.content || response.data?.data || [];

                const normalized = (rawUsers || []).map(u => {
                    const fullName = (u.fullName || u.name || '').toString().trim();
                    let status = u.status;

                    if (typeof status === 'string') {
                        const s = status.toLowerCase();
                        if (s === '1' || s === 'true' || /active/.test(s)) status = 1;
                        else if (s === '0' || s === 'false' || /inactive/.test(s)) status = 0;
                    }

                    const role = u.role || (u.roleName ? { roleName: u.roleName } : undefined);

                    return { ...u, fullName: fullName || null, status, role };
                });

                setUsers(normalized);
                setUserTotalPages(response.data?.totalPages || 0);
                setUserTotalElements(response.data?.totalElements || 0);
                console.log('Users loaded:', normalized);
                console.log('Total pages:', response.data?.totalPages);
                console.log('Total elements:', response.data?.totalElements);
            } else {
                console.error('Error loading users:', response);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Có lỗi xảy ra khi tải dữ liệu người dùng');
        } finally {
            setUsersLoading(false);
        }
    };

    // Handler cho search
    const handleUserSearch = (searchKeyword) => {
        setUserSearch(searchKeyword);
        setUserPage(1); // Reset về trang 1 khi search
        fetchUsers(1, searchKeyword);
    };

    // Handler cho page change
    const handleUserPageChange = (page) => {
        setUserPage(page);
        fetchUsers(page, userSearch);
    };

    // Handler refresh blogs
    const handleRefreshBlogs = async () => {
        try {
            setLoading(true);
            const blogsResponse = await getAllBlogs({ page: 0, size: 10 });
            if (blogsResponse?.respCode === "0" || blogsResponse?.success) {
                const blogsData = blogsResponse.data?.blogs || [];
                setBlogs(blogsData);
                console.log('Blogs refreshed:', blogsData.length, 'items');
            }
        } catch (error) {
            console.error('Error refreshing blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data khi component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch tất cả data song song
                const [usersResponse, statsResponse, blogsResponse, mentorsResponse] = await Promise.allSettled([
                    getAllUsers({ page: userPage, size: userSize, keySearch: userSearch }),
                    getUserStatistics(),
                    getAllBlogs({ page: 0, size: 10 }),
                    MentorService.getMentors({ page: 0, size: 50 })
                ]);

                // Process users
                if (usersResponse.status === 'fulfilled' && (usersResponse.value?.respCode === '000' || usersResponse.value?.respCode === '0')) {
                    const rawUsers = usersResponse.value.data?.content || usersResponse.value.data?.data || [];
                    const normalized = (rawUsers || []).map(u => {
                        const fullName = (u.fullName || u.name || '').toString().trim();
                        let status = u.status;

                        if (typeof status === 'string') {
                            const s = status.toLowerCase();
                            if (s === '1' || s === 'true' || /active/.test(s)) status = 1;
                            else if (s === '0' || s === 'false' || /inactive/.test(s)) status = 0;
                        }

                        const role = u.role || (u.roleName ? { roleName: u.roleName } : undefined);
                        return { ...u, fullName: fullName || null, status, role };
                    });

                    setUsers(normalized);
                    setUserTotalPages(usersResponse.value.data?.totalPages || 0);
                    setUserTotalElements(usersResponse.value.data?.totalElements || 0);
                    console.log('Users loaded:', normalized);
                    console.log('Total pages:', usersResponse.value.data?.totalPages);
                }

                if (statsResponse.status === 'fulfilled') {
                    setStats(statsResponse.value.data);
                    console.log('Stats loaded:', statsResponse.value.data);
                }

                // Process blogs - Cấu trúc: blogsResponse.value = {respCode, data: {blogs, pageNumber, ...}}
                if (blogsResponse.status === 'fulfilled') {
                    // respCode nằm ở blogsResponse.value.respCode
                    if (blogsResponse.value?.respCode === "0" || blogsResponse.value?.success) {
                        // blogs nằm ở blogsResponse.value.data.blogs
                        const blogsData = blogsResponse.value.data?.blogs || [];
                        setBlogs(blogsData);
                        console.log('Blogs loaded successfully:', blogsData.length, 'items');
                    } else {
                        console.warn('Blogs response not successful:', blogsResponse.value);
                        setBlogs([]);
                    }
                } else {
                    console.error('Failed to load blogs:', blogsResponse.reason);
                    setBlogs([]);
                }
                
                if (mentorsResponse.status === 'fulfilled') {
                    setMentors(mentorsResponse.value.data?.content || []);
                    console.log('Mentors loaded:', mentorsResponse.value.data?.content);
                }

            } catch (err) {
                console.error('Error fetching admin data:', err);
                setError('Có lỗi xảy ra khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const menuItems = [
        {
            key: 'users',
            icon: <FaUsers />,
            title: 'Quản lý người dùng',
            badge: stats?.totalUsers || '0',
            component: <UserManagement 
                users={users} 
                stats={stats} 
                loading={usersLoading}
                onSearch={handleUserSearch}
                onPageChange={handleUserPageChange}
                currentPage={userPage}
                totalPages={userTotalPages}
                totalElements={userTotalElements}
            />
        },
        {
            key: 'content',
            icon: <FaBlog />,
            title: 'Quản lý nội dung',
            badge: blogs?.filter(b => b.statusName === 'PENDING' || b.status === 'PENDING')?.length || '0',
            component: <ContentManagement blogs={blogs} loading={loading} onRefresh={handleRefreshBlogs} />
        },
        {
            key: 'mentor-approval',
            icon: <FaUserCog />,
            title: 'Duyệt/xác thực mentor',
            badge: stats?.pendingMentors || '0',
            component: <MentorApproval stats={stats} />
        },
        {
            key: 'countries',
            icon: <FaGlobeAmericas />,
            title: 'Quản lý các nước du học',
            badge: null,
            component: <CountryManagement />
        },
        {
            key: 'feedback',
            icon: <FaCommentDots />,
            title: 'Quản lý phản hồi & báo cáo',
            badge: '0',
            component: <FeedbackManagement />
        },
        {
            key: 'booking',
            icon: <FaCalendarAlt />,
            title: 'Quản lý đặt lịch & lịch hẹn',
            badge: null,
            component: <BookingManagement />
        },
        {
            key: 'payment',
            icon: <FaHistory />,
            title: 'Quản lý lịch sử thanh toán/giao dịch',
            badge: null,
            component: <PaymentHistory />
        },
        {
            key: 'reviews',
            icon: <FaCommentDots />,
            title: 'Quản lý quyền & vai trò',
            badge: null,
            component: <ReviewManagement />
        },
        {
            key: 'banners',
            icon: <FaBullhorn />,
            title: 'Cấu hình hệ thống',
            badge: null,
            component: <BannerManagement />
        },
        {
            key: 'analytics',
            icon: <FaChartBar />,
            title: 'Báo cáo & thống kê',
            badge: null,
            component: <Analytics stats={stats} mentors={mentors} />
        },
        {
            key: 'roles',
            icon: <FaShieldAlt />,
            title: 'Quản lý quyền & vai trò',
            badge: null,
            component: <RolePermissions />
        },
        {
            key: 'settings',
            icon: <FaCog />,
            title: 'Cấu hình hệ thống',
            badge: null,
            component: <SystemSettings />
        }
    ];

    return (
        <Container fluid className="admin-page py-4">
            {error && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            <h5 className="alert-heading mb-2">⚠️ Lỗi</h5>
                            <p className="mb-0">{error}</p>
                        </Alert>
                    </Col>
                </Row>
            )}

            <Row className="mb-4">
                <Col>
                    <Alert variant="success" className="mb-4">
                        <h5 className="alert-heading mb-2">🎉 Chào mừng Admin!</h5>
                        <p className="mb-0">
                            Bạn đã đăng nhập thành công với quyền Admin.
                            Trang admin đang tải dữ liệu từ database...
                        </p>
                    </Alert>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="page-title mb-1">Quản trị hệ thống</h2>
                            <p className="text-muted mb-0">Tổng quan và quản lý toàn bộ hệ thống MentorLink</p>
                        </div>
                        <div className="admin-stats d-flex gap-3">
                            {loading ? (
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="stat-item text-center">
                                        <div className="stat-number text-primary">{stats?.totalUsers?.toLocaleString() || 0}</div>
                                        <div className="stat-label">Người dùng</div>
                                    </div>
                                    <div className="stat-item text-center">
                                        <div className="stat-number text-success">{stats?.totalMentors || 0}</div>
                                        <div className="stat-label">Mentor</div>
                                    </div>
                                    <div className="stat-item text-center">
                                        <div className="stat-number text-warning">{stats?.totalBookings || 0}</div>
                                        <div className="stat-label">Đặt lịch</div>
                                    </div>
                                    <div className="stat-item text-center">
                                        <div className="stat-number text-info">{stats?.pendingMentors || 0}</div>
                                        <div className="stat-label">Chờ duyệt</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Row>
                    <Col lg={3} md={4} className="mb-4">
                        <Card className="admin-sidebar">
                            <Card.Body className="p-0">
                                <div className="sidebar-header">
                                    <h6 className="mb-0">
                                        <FaCog className="me-2" />
                                        MENU QUẢN TRỊ
                                    </h6>
                                </div>
                                <Nav variant="pills" className="flex-column admin-nav">
                                    {menuItems.map((item) => (
                                        <Nav.Item key={item.key}>
                                            <Nav.Link
                                                eventKey={item.key}
                                                className="d-flex align-items-center justify-content-between py-3 px-3"
                                            >
                                                <div className="d-flex align-items-center">
                                                    <span className="nav-icon me-3">{item.icon}</span>
                                                    <span className="nav-text">{item.title}</span>
                                                </div>
                                                {item.badge && (
                                                    <span className="nav-badge">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Nav.Link>
                                        </Nav.Item>
                                    ))}
                                </Nav>
                            </Card.Body>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="mt-3 quick-actions">
                            <Card.Body>
                                <h6 className="text-muted mb-3">THAO TÁC NHANH</h6>
                                <div className="d-grid gap-2">
                                    <button className="btn btn-outline-primary btn-sm">
                                        <FaUsers className="me-2" />
                                        Thêm người dùng mới
                                    </button>
                                    <button className="btn btn-outline-success btn-sm">
                                        <FaUserCog className="me-2" />
                                        Duyệt mentor
                                    </button>
                                    <button className="btn btn-outline-warning btn-sm">
                                        <FaBlog className="me-2" />
                                        Kiểm duyệt blog
                                    </button>
                                    <button className="btn btn-outline-info btn-sm">
                                        <FaBullhorn className="me-2" />
                                        Tạo banner mới
                                    </button>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* System Status */}
                        <Card className="mt-3 system-status">
                            <Card.Body>
                                <h6 className="text-muted mb-3">TRẠNG THÁI HỆ THỐNG</h6>
                                <div className="status-item d-flex justify-content-between mb-2">
                                    <span>Máy chủ</span>
                                    <span className="badge bg-success">Hoạt động</span>
                                </div>
                                <div className="status-item d-flex justify-content-between mb-2">
                                    <span>Cơ sở dữ liệu</span>
                                    <span className="badge bg-success">Bình thường</span>
                                </div>
                                <div className="status-item d-flex justify-content-between mb-2">
                                    <span>Email Service</span>
                                    <span className="badge bg-warning">Chậm</span>
                                </div>
                                <div className="status-item d-flex justify-content-between">
                                    <span>Payment Gateway</span>
                                    <span className="badge bg-success">Hoạt động</span>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={9} md={8}>
                        <Tab.Content>
                            {menuItems.map((item) => (
                                <Tab.Pane key={item.key} eventKey={item.key}>
                                    {item.component}
                                </Tab.Pane>
                            ))}
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </Container>
    );
};

export default AdminPage;