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
        </div>
    );
};

export default MentorOverview;