import React from 'react';
import { Row, Col, Card, Button, Table, Badge, ProgressBar } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const MentorOverview = ({ mentorData }) => {
    // Mock data cho biểu đồ
    const monthlyEarningsData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Thu nhập (VNĐ)',
                data: [5200000, 6800000, 7200000, 8100000, 7500000, 9200000],
                backgroundColor: 'rgba(113, 201, 206, 0.8)',
                borderColor: 'rgba(113, 201, 206, 1)',
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const bookingStatusData = {
        labels: ['Đã hoàn thành', 'Đang chờ', 'Đã hủy'],
        datasets: [
            {
                data: [151, 5, 8],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(220, 53, 69, 0.8)',
                ],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    // Mock data cho lịch sắp tới
    const upcomingSessions = [
        {
            id: 1,
            customerName: 'Nguyễn Thị Lan',
            service: 'Tư vấn du học',
            date: '2024-01-15',
            time: '14:00 - 15:00',
            status: 'confirmed'
        },
        {
            id: 2,
            customerName: 'Trần Văn Đức',
            service: 'Hướng nghiệp',
            date: '2024-01-16',
            time: '10:00 - 11:00',
            status: 'pending'
        },
        {
            id: 3,
            customerName: 'Lê Thị Mai',
            service: 'Luyện thi IELTS',
            date: '2024-01-17',
            time: '16:00 - 17:00',
            status: 'confirmed'
        }
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="mentor-overview">
            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon primary">
                                <i className="bi bi-currency-dollar"></i>
                            </div>
                            <div className="stat-value">
                                {formatCurrency(mentorData.totalEarnings || 0)}
                            </div>
                            <p className="stat-label">Tổng thu nhập</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon success">
                                <i className="bi bi-check-circle"></i>
                            </div>
                            <div className="stat-value">{mentorData.completedBookings || 0}</div>
                            <p className="stat-label">Buổi đã hoàn thành</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon warning">
                                <i className="bi bi-clock-history"></i>
                            </div>
                            <div className="stat-value">{mentorData.pendingBookings || 0}</div>
                            <p className="stat-label">Đang chờ xác nhận</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon info">
                                <i className="bi bi-star"></i>
                            </div>
                            <div className="stat-value">{mentorData.rating || 0}</div>
                            <p className="stat-label">Đánh giá trung bình</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row */}
            <Row className="mb-4">
                <Col lg={8} className="mb-3">
                    <Card className="dashboard-card">
                        <Card.Header className="bg-transparent border-0 pb-0">
                            <h5 className="mb-0">Thu nhập theo tháng</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="chart-container">
                                <Bar data={monthlyEarningsData} options={chartOptions} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4} className="mb-3">
                    <Card className="dashboard-card">
                        <Card.Header className="bg-transparent border-0 pb-0">
                            <h5 className="mb-0">Trạng thái đặt lịch</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="chart-container">
                                <Doughnut data={bookingStatusData} options={doughnutOptions} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Upcoming Sessions and Quick Actions */}
            <Row>
                <Col lg={8} className="mb-3">
                    <Card className="dashboard-card">
                        <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Lịch sắp tới</h5>
                            <Button variant="outline-primary" size="sm">
                                Xem tất cả
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table className="custom-table mb-0">
                                <thead>
                                    <tr>
                                        <th>Học viên</th>
                                        <th>Dịch vụ</th>
                                        <th>Thời gian</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingSessions.map((session) => (
                                        <tr key={session.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm me-2">
                                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                                            <span className="text-white small fw-bold">
                                                                {session.customerName.charAt(0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="fw-medium">{session.customerName}</span>
                                                </div>
                                            </td>
                                            <td>{session.service}</td>
                                            <td>
                                                <div>
                                                    <div className="fw-medium">{session.date}</div>
                                                    <small className="text-muted">{session.time}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <Badge
                                                    className={`status-badge ${session.status}`}
                                                >
                                                    {session.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <Button variant="outline-primary" size="sm">
                                                        <i className="bi bi-eye"></i>
                                                    </Button>
                                                    <Button variant="outline-success" size="sm">
                                                        <i className="bi bi-chat-dots"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4} className="mb-3">
                    <Card className="dashboard-card">
                        <Card.Header className="bg-transparent border-0">
                            <h5 className="mb-0">Hoạt động gần đây</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="recent-activities">
                                <div className="activity-item mb-3 pb-3 border-bottom">
                                    <div className="d-flex">
                                        <div className="activity-icon me-3">
                                            <div className="bg-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                                                <i className="bi bi-check text-white small"></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <p className="mb-1 small">
                                                Hoàn thành buổi tư vấn với <strong>Nguyễn Văn A</strong>
                                            </p>
                                            <small className="text-muted">2 giờ trước</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="activity-item mb-3 pb-3 border-bottom">
                                    <div className="d-flex">
                                        <div className="activity-icon me-3">
                                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                                                <i className="bi bi-star text-white small"></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <p className="mb-1 small">
                                                Nhận đánh giá 5 sao từ <strong>Trần Thị B</strong>
                                            </p>
                                            <small className="text-muted">1 ngày trước</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="activity-item mb-3">
                                    <div className="d-flex">
                                        <div className="activity-icon me-3">
                                            <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                                                <i className="bi bi-calendar text-white small"></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <p className="mb-1 small">
                                                Có lịch đặt mới từ <strong>Lê Văn C</strong>
                                            </p>
                                            <small className="text-muted">2 ngày trước</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="dashboard-card mt-3">
                        <Card.Header className="bg-transparent border-0">
                            <h5 className="mb-0">Mục tiêu tháng này</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="goal-item mb-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small fw-medium">Số buổi tư vấn</span>
                                    <span className="small text-muted">18/25</span>
                                </div>
                                <ProgressBar variant="primary" now={72} className="mb-2" style={{ height: '6px' }} />
                            </div>
                            <div className="goal-item mb-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small fw-medium">Thu nhập</span>
                                    <span className="small text-muted">85%</span>
                                </div>
                                <ProgressBar variant="success" now={85} className="mb-2" style={{ height: '6px' }} />
                            </div>
                            <div className="goal-item">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small fw-medium">Đánh giá tích cực</span>
                                    <span className="small text-muted">95%</span>
                                </div>
                                <ProgressBar variant="info" now={95} style={{ height: '6px' }} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default MentorOverview;