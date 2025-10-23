import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Button, Badge, Alert } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../../styles/components/MentorDashboard.css';

// Import components
import {
    MentorOverview,
    ScheduleManagement,
    BookingManagement,
    ReviewManagement,
    ServiceManagement,
    ContentManagement
} from '../../../components/mentor/dashboard';

const MentorDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Mock data cho mentor
    const mentorData = {
        fullname: "Nguyễn Văn Minh",
        title: "Senior Software Engineer tại Google",
        avatar_url: "/api/placeholder/150/150",
        rating: 4.8,
        number_of_booking: 156,
        totalEarnings: 45600000,
        pendingBookings: 5,
        completedBookings: 151,
        upcomingSessions: 3
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <MentorOverview mentorData={mentorData} />;
            case 'schedule':
                return <ScheduleManagement />;
            case 'bookings':
                return <BookingManagement />;
            case 'reviews':
                return <ReviewManagement />;
            case 'services':
                return <ServiceManagement />;
            case 'content':
                return <ContentManagement />;
            default:
                return <MentorOverview mentorData={mentorData} />;
        }
    };

    return (
        <div className="mentor-dashboard">
            <Container fluid>
                <Row>
                    {/* Sidebar Navigation */}
                    <Col lg={3} md={4} className="sidebar-col">
                        <Card className="mentor-sidebar">
                            <Card.Body>
                                {/* Mentor Profile Summary */}
                                <div className="mentor-profile-summary text-center mb-4">
                                    <div className="avatar-container mb-3">
                                        <img
                                            src={mentorData.avatar_url}
                                            alt={mentorData.fullname}
                                            className="mentor-avatar"
                                        />
                                        <div className="status-indicator online"></div>
                                    </div>
                                    <h5 className="mentor-name">{mentorData.fullname}</h5>
                                    <p className="mentor-title text-muted">{mentorData.title}</p>
                                    <div className="rating-info">
                                        <span className="rating-score">
                                            <i className="bi bi-star-fill text-warning"></i>
                                            {mentorData.rating}
                                        </span>
                                        <span className="text-muted ms-2">
                                            ({mentorData.number_of_booking} đánh giá)
                                        </span>
                                    </div>
                                </div>

                                {/* Navigation Menu */}
                                <Nav variant="pills" className="flex-column mentor-nav">
                                    <Nav.Item>
                                        <Nav.Link
                                            active={activeTab === 'overview'}
                                            onClick={() => setActiveTab('overview')}
                                            className="mentor-nav-link"
                                        >
                                            <i className="bi bi-speedometer2 me-2"></i>
                                            Tổng quan
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            active={activeTab === 'schedule'}
                                            onClick={() => setActiveTab('schedule')}
                                            className="mentor-nav-link"
                                        >
                                            <i className="bi bi-calendar-check me-2"></i>
                                            Lịch làm việc
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            active={activeTab === 'bookings'}
                                            onClick={() => setActiveTab('bookings')}
                                            className="mentor-nav-link"
                                        >
                                            <i className="bi bi-journal-bookmark me-2"></i>
                                            Đặt lịch
                                            {mentorData.pendingBookings > 0 && (
                                                <Badge bg="danger" className="ms-2">
                                                    {mentorData.pendingBookings}
                                                </Badge>
                                            )}
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            active={activeTab === 'reviews'}
                                            onClick={() => setActiveTab('reviews')}
                                            className="mentor-nav-link"
                                        >
                                            <i className="bi bi-star me-2"></i>
                                            Đánh giá
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            active={activeTab === 'services'}
                                            onClick={() => setActiveTab('services')}
                                            className="mentor-nav-link"
                                        >
                                            <i className="bi bi-gear me-2"></i>
                                            Dịch vụ
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            active={activeTab === 'content'}
                                            onClick={() => setActiveTab('content')}
                                            className="mentor-nav-link"
                                        >
                                            <i className="bi bi-pencil-square me-2"></i>
                                            Nội dung
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>

                                {/* Quick Actions */}
                                <div className="quick-actions mt-4">
                                    <h6 className="text-muted mb-3">Thao tác nhanh</h6>
                                    <div className="d-grid gap-2">
                                        <Button variant="outline-primary" size="sm">
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Tạo lịch mới
                                        </Button>
                                        <Button variant="outline-success" size="sm">
                                            <i className="bi bi-chat-dots me-2"></i>
                                            Tin nhắn
                                        </Button>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Main Content */}
                    <Col lg={9} md={8}>
                        <div className="dashboard-header mb-4">
                            <Row className="align-items-center">
                                <Col>
                                    <h2 className="dashboard-title mb-0">
                                        Dashboard Mentor
                                    </h2>
                                    <p className="text-muted">
                                        Chào mừng trở lại, {mentorData.fullname}!
                                    </p>
                                </Col>
                                <Col xs="auto">
                                    <Button variant="primary">
                                        <i className="bi bi-bell me-2"></i>
                                        Thông báo
                                        <Badge bg="danger" className="ms-2">3</Badge>
                                    </Button>
                                </Col>
                            </Row>
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {renderTabContent()}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default MentorDashboard;