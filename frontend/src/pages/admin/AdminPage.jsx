import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Badge, Alert, Button } from 'react-bootstrap';
import {
    FaUsers, FaBlog, FaUserCog, FaChartBar,
    FaCalendarAlt, FaHistory, FaCommentDots,
    FaBullhorn, FaCog, FaKey, FaShieldAlt, FaGlobeAmericas
} from 'react-icons/fa';
import { CountryManagement } from '../../components/admin';

import '../../styles/components/AdminPage.css';

// Mock data để làm admin page realistic hơn
const mockUsers = [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', role: 'CUSTOMER', status: 'active', joinDate: '2024-01-15' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@gmail.com', role: 'MENTOR', status: 'pending', joinDate: '2024-02-20' },
    { id: 3, name: 'Lê Minh C', email: 'leminhc@gmail.com', role: 'CUSTOMER', status: 'active', joinDate: '2024-03-10' },
    { id: 4, name: 'Phạm Thu D', email: 'phamthud@gmail.com', role: 'MENTOR', status: 'active', joinDate: '2024-01-25' },
];

const mockBookings = [
    { id: 1, mentorName: 'Trần Thị B', customerName: 'Nguyễn Văn A', date: '2024-10-20', time: '14:00', status: 'confirmed', amount: '500,000₫' },
    { id: 2, mentorName: 'Phạm Thu D', customerName: 'Lê Minh C', date: '2024-10-18', time: '10:00', status: 'pending', amount: '350,000₫' },
    { id: 3, mentorName: 'Trần Thị B', customerName: 'Nguyễn Văn A', date: '2024-10-22', time: '16:00', status: 'completed', amount: '500,000₫' },
];

const mockBlogs = [
    { id: 1, title: 'Tips học lập trình hiệu quả', author: 'Trần Thị B', status: 'published', views: 1250, date: '2024-10-10' },
    { id: 2, title: 'Cách phát triển soft skills', author: 'Phạm Thu D', status: 'pending', views: 0, date: '2024-10-15' },
    { id: 3, title: 'Xu hướng công nghệ 2024', author: 'Lê Minh C', status: 'draft', views: 0, date: '2024-10-12' },
];

const mockFeedbacks = [
    { id: 1, user: 'Nguyễn Văn A', mentor: 'Trần Thị B', rating: 5, comment: 'Mentor rất nhiệt tình và chuyên nghiệp', date: '2024-10-16', status: 'approved' },
    { id: 2, user: 'Lê Minh C', mentor: 'Phạm Thu D', rating: 4, comment: 'Hữu ích nhưng cần cải thiện thời gian', date: '2024-10-14', status: 'pending' },
    { id: 3, user: 'Anonymous', type: 'complaint', comment: 'Hệ thống đôi khi bị lag', date: '2024-10-13', status: 'investigating' },
];

const mockStats = {
    totalUsers: 1234,
    activeUsers: 89,
    totalMentors: 156,
    pendingMentors: 8,
    totalBookings: 445,
    todayBookings: 23,
    monthRevenue: 45000000,
    todayRevenue: 1200000,
    totalBlogs: 45,
    pendingBlogs: 12,
    totalFeedbacks: 156,
    urgentFeedbacks: 5,
};

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

// Components với fake data realistic
const UserManagement = () => (
    <AdminComponentWrapper icon="👥" title="Quản lý người dùng" badge={mockStats.totalUsers}>
        <Row className="mb-3">
            <Col md={4}>
                <Card className="text-center border-0 bg-light">
                    <Card.Body>
                        <h3 className="text-primary">{mockStats.totalUsers.toLocaleString()}</h3>
                        <small className="text-muted">Tổng người dùng</small>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={4}>
                <Card className="text-center border-0 bg-light">
                    <Card.Body>
                        <h3 className="text-success">{mockStats.activeUsers}</h3>
                        <small className="text-muted">Hoạt động hôm nay</small>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={4}>
                <Card className="text-center border-0 bg-light">
                    <Card.Body>
                        <h3 className="text-warning">{mockStats.pendingMentors}</h3>
                        <small className="text-muted">Chờ duyệt</small>
                    </Card.Body>
                </Card>
            </Col>
        </Row>

        <h6>Người dùng gần đây</h6>
        <div className="table-responsive">
            <table className="table table-sm">
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Ngày tham gia</th>
                    </tr>
                </thead>
                <tbody>
                    {mockUsers.map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <Badge bg={user.role === 'MENTOR' ? 'success' : 'primary'}>
                                    {user.role}
                                </Badge>
                            </td>
                            <td>
                                <Badge bg={user.status === 'active' ? 'success' : 'warning'}>
                                    {user.status}
                                </Badge>
                            </td>
                            <td>{user.joinDate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </AdminComponentWrapper>
);

const ContentManagement = () => (
    <AdminComponentWrapper icon="📝" title="Quản lý nội dung" badge={mockStats.pendingBlogs}>
        <Row className="mb-3">
            <Col md={6}>
                <Card className="text-center border-0 bg-light">
                    <Card.Body>
                        <h4 className="text-info">{mockStats.totalBlogs}</h4>
                        <small className="text-muted">Tổng bài viết</small>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <Card className="text-center border-0 bg-light">
                    <Card.Body>
                        <h4 className="text-warning">{mockStats.pendingBlogs}</h4>
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
                    {mockBlogs.map(blog => (
                        <tr key={blog.id}>
                            <td>{blog.title}</td>
                            <td>{blog.author}</td>
                            <td>
                                <Badge bg={
                                    blog.status === 'published' ? 'success' :
                                        blog.status === 'pending' ? 'warning' : 'secondary'
                                }>
                                    {blog.status}
                                </Badge>
                            </td>
                            <td>{blog.views.toLocaleString()}</td>
                            <td>{blog.date}</td>
                            <td>
                                <Button size="sm" variant="outline-primary" className="me-1">
                                    Xem
                                </Button>
                                {blog.status === 'pending' && (
                                    <Button size="sm" variant="outline-success">
                                        Duyệt
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </AdminComponentWrapper>
);

const Analytics = () => (
    <AdminComponentWrapper icon="📊" title="Báo cáo & thống kê">
        <Row className="mb-4">
            <Col md={3}>
                <Card className="text-center border-0 bg-gradient-primary text-white">
                    <Card.Body>
                        <h4>2,456</h4>
                        <small>Lượt truy cập hôm nay</small>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={3}>
                <Card className="text-center border-0 bg-gradient-success text-white">
                    <Card.Body>
                        <h4>{mockStats.totalBookings}</h4>
                        <small>Tổng đặt lịch</small>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={3}>
                <Card className="text-center border-0 bg-gradient-info text-white">
                    <Card.Body>
                        <h4>{mockStats.totalMentors}</h4>
                        <small>Tổng mentor</small>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={3}>
                <Card className="text-center border-0 bg-gradient-warning text-white">
                    <Card.Body>
                        <h4>₫{(mockStats.monthRevenue / 1000000).toFixed(0)}M</h4>
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
                                    <span>T1: 45 users</span>
                                    <span>T2: 52 users</span>
                                    <span>T3: 38 users</span>
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
                                    <span>T8: ₫38M</span>
                                    <span>T9: ₫42M</span>
                                    <span>T10: ₫45M</span>
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

const MentorApproval = () => (
    <AdminComponentWrapper icon="✅" title="Duyệt mentor" badge="8">
        <Alert variant="warning">
            <strong>8 mentor</strong> đang chờ duyệt hồ sơ
        </Alert>
        <Alert variant="info">
            <strong>Tính năng đang phát triển:</strong> Duyệt hồ sơ mentor, xác thực chuyên môn.
        </Alert>
    </AdminComponentWrapper>
);

const FeedbackManagement = () => (
    <AdminComponentWrapper icon="💬" title="Quản lý phản hồi" badge={mockStats.urgentFeedbacks}>
        <Row className="mb-3">
            <Col md={6}>
                <Card className="text-center border-0 bg-light">
                    <Card.Body>
                        <h4 className="text-primary">{mockStats.totalFeedbacks}</h4>
                        <small className="text-muted">Tổng phản hồi</small>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <Card className="text-center border-0 bg-light">
                    <Card.Body>
                        <h4 className="text-danger">{mockStats.urgentFeedbacks}</h4>
                        <small className="text-muted">Cần xử lý khẩn</small>
                    </Card.Body>
                </Card>
            </Col>
        </Row>

        <h6>Phản hồi gần đây</h6>
        <div className="table-responsive">
            <table className="table table-sm">
                <thead>
                    <tr>
                        <th>Người gửi</th>
                        <th>Loại</th>
                        <th>Nội dung</th>
                        <th>Đánh giá</th>
                        <th>Trạng thái</th>
                        <th>Ngày</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {mockFeedbacks.map(feedback => (
                        <tr key={feedback.id}>
                            <td>{feedback.user}</td>
                            <td>{feedback.mentor || feedback.type}</td>
                            <td className="text-truncate" style={{ maxWidth: '200px' }}>
                                {feedback.comment}
                            </td>
                            <td>
                                {feedback.rating && (
                                    <span>
                                        {'⭐'.repeat(feedback.rating)} ({feedback.rating})
                                    </span>
                                )}
                            </td>
                            <td>
                                <Badge bg={
                                    feedback.status === 'approved' ? 'success' :
                                        feedback.status === 'pending' ? 'warning' : 'danger'
                                }>
                                    {feedback.status}
                                </Badge>
                            </td>
                            <td>{feedback.date}</td>
                            <td>
                                <Button size="sm" variant="outline-primary" className="me-1">
                                    Xem
                                </Button>
                                {feedback.status === 'pending' && (
                                    <Button size="sm" variant="outline-success">
                                        Duyệt
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </AdminComponentWrapper>
);

const BookingManagement = () => (
    <AdminComponentWrapper icon="📅" title="Quản lý đặt lịch" badge={mockStats.todayBookings}>
        <Row className="mb-3">
            <Col md={6}>
                <Card className="text-center border-0 bg-light">
                    <Card.Body>
                        <h4 className="text-success">{mockStats.totalBookings}</h4>
                        <small className="text-muted">Tổng đặt lịch</small>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <Card className="text-center border-0 bg-light">
                    <Card.Body>
                        <h4 className="text-info">{mockStats.todayBookings}</h4>
                        <small className="text-muted">Hôm nay</small>
                    </Card.Body>
                </Card>
            </Col>
        </Row>

        <h6>Đặt lịch gần đây</h6>
        <div className="table-responsive">
            <table className="table table-sm">
                <thead>
                    <tr>
                        <th>Mentor</th>
                        <th>Khách hàng</th>
                        <th>Ngày</th>
                        <th>Giờ</th>
                        <th>Trạng thái</th>
                        <th>Số tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {mockBookings.map(booking => (
                        <tr key={booking.id}>
                            <td>{booking.mentorName}</td>
                            <td>{booking.customerName}</td>
                            <td>{booking.date}</td>
                            <td>{booking.time}</td>
                            <td>
                                <Badge bg={
                                    booking.status === 'confirmed' ? 'success' :
                                        booking.status === 'pending' ? 'warning' : 'primary'
                                }>
                                    {booking.status}
                                </Badge>
                            </td>
                            <td>{booking.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </AdminComponentWrapper>
);

const PaymentHistory = () => (
    <AdminComponentWrapper icon="💳" title="Lịch sử thanh toán">
        <Row className="mb-3">
            <Col md={4}>
                <Card className="text-center border-0 bg-success text-white">
                    <Card.Body>
                        <h4>₫{(mockStats.monthRevenue / 1000000).toFixed(0)}M</h4>
                        <small>Doanh thu tháng</small>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={4}>
                <Card className="text-center border-0 bg-info text-white">
                    <Card.Body>
                        <h4>₫{(mockStats.todayRevenue / 1000).toFixed(0)}K</h4>
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

        <h6>Giao dịch gần đây</h6>
        <div className="table-responsive">
            <table className="table table-sm">
                <thead>
                    <tr>
                        <th>Mã GD</th>
                        <th>Khách hàng</th>
                        <th>Mentor</th>
                        <th>Số tiền</th>
                        <th>Phí</th>
                        <th>Trạng thái</th>
                        <th>Ngày</th>
                    </tr>
                </thead>
                <tbody>
                    {mockBookings.map(booking => (
                        <tr key={booking.id}>
                            <td>TXN{booking.id.toString().padStart(6, '0')}</td>
                            <td>{booking.customerName}</td>
                            <td>{booking.mentorName}</td>
                            <td>{booking.amount}</td>
                            <td>₫{(parseInt(booking.amount.replace(/[₫,]/g, '')) * 0.042).toLocaleString()}₫</td>
                            <td>
                                <Badge bg={booking.status === 'completed' ? 'success' : 'warning'}>
                                    {booking.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                                </Badge>
                            </td>
                            <td>{booking.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <Alert variant="info" className="mt-3">
            <strong>💡 Tính năng có thể phát triển:</strong>
            <ul className="mb-0 mt-2">
                <li>Export báo cáo Excel/PDF</li>
                <li>Lọc theo khoảng thời gian</li>
                <li>Thống kê doanh thu theo mentor</li>
                <li>Quản lý refund/hoàn tiền</li>
            </ul>
        </Alert>
    </AdminComponentWrapper>
);

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

    const menuItems = [
        {
            key: 'users',
            icon: <FaUsers />,
            title: 'Quản lý người dùng',
            badge: '156',
            component: <UserManagement />
        },
        {
            key: 'content',
            icon: <FaBlog />,
            title: 'Quản lý nội dung',
            badge: '12',
            component: <ContentManagement />
        },
        {
            key: 'mentor-approval',
            icon: <FaUserCog />,
            title: 'Duyệt/xác thực mentor',
            badge: '8',
            component: <MentorApproval />
        },
        {
            key: 'countries',
            icon: <FaGlobeAmericas />,
            title: 'Quản lý các nước du học',
            badge: '3',
            component: <CountryManagement />
        },
        {
            key: 'feedback',
            icon: <FaCommentDots />,
            title: 'Quản lý phản hồi & báo cáo',
            badge: '5',
            component: <FeedbackManagement />
        },
        {
            key: 'booking',
            icon: <FaCalendarAlt />,
            title: 'Quản lý đặt lịch & lịch hẹn',
            badge: '23',
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
            badge: '3',
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
            component: <Analytics />
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
            <Row className="mb-4">
                <Col>
                    <Alert variant="success" className="mb-4">
                        <h5 className="alert-heading mb-2">🎉 Chào mừng Admin!</h5>
                        <p className="mb-0">
                            Bạn đã đăng nhập thành công với quyền Admin.
                            Trang admin hiện đang hoạt động bình thường.
                        </p>
                    </Alert>
                </Col>
            </Row>            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="page-title mb-1">Quản trị hệ thống</h2>
                            <p className="text-muted mb-0">Tổng quan và quản lý toàn bộ hệ thống MentorLink</p>
                        </div>
                        <div className="admin-stats d-flex gap-3">
                            <div className="stat-item text-center">
                                <div className="stat-number text-primary">{mockStats.totalUsers.toLocaleString()}</div>
                                <div className="stat-label">Người dùng</div>
                            </div>
                            <div className="stat-item text-center">
                                <div className="stat-number text-success">{mockStats.totalMentors}</div>
                                <div className="stat-label">Mentor</div>
                            </div>
                            <div className="stat-item text-center">
                                <div className="stat-number text-warning">{mockStats.totalBookings}</div>
                                <div className="stat-label">Đặt lịch</div>
                            </div>
                            <div className="stat-item text-center">
                                <div className="stat-number text-info">{mockStats.pendingMentors}</div>
                                <div className="stat-label">Chờ duyệt</div>
                            </div>
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