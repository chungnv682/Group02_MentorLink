import React, { useState } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert } from 'react-bootstrap';

const ServiceManagement = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [formData, setFormData] = useState({
        service_name: '',
        description: '',
        price: '',
        duration: ''
    });

    // Mock data cho services
    const services = [
        {
            id: 1,
            service_name: 'Tư vấn du học Mỹ',
            description: 'Tư vấn toàn diện về quá trình xin học bổng, visa và chuẩn bị hồ sơ du học Mỹ. Bao gồm hướng dẫn viết essay, chuẩn bị phỏng vấn và định hướng ngành học phù hợp.',
            created_at: '2024-01-01T10:00:00',
            updated_at: '2024-01-10T15:30:00',
            bookingCount: 25,
            avgRating: 4.8,
            isActive: true
        },
        {
            id: 2,
            service_name: 'Hướng nghiệp IT',
            description: 'Tư vấn về lộ trình phát triển sự nghiệp trong lĩnh vực công nghệ thông tin. Hướng dẫn kỹ năng cần thiết, cách viết CV và chuẩn bị phỏng vấn cho các vị trí IT.',
            created_at: '2024-01-05T14:20:00',
            updated_at: '2024-01-12T09:45:00',
            bookingCount: 18,
            avgRating: 4.6,
            isActive: true
        },
        {
            id: 3,
            service_name: 'Luyện thi IELTS Speaking',
            description: 'Khóa luyện thi IELTS Speaking 1-on-1, tập trung vào phát âm, từ vựng và kỹ năng trả lời các dạng câu hỏi. Phù hợp cho mục tiêu 6.5-8.0.',
            created_at: '2024-01-08T11:15:00',
            updated_at: '2024-01-15T16:20:00',
            bookingCount: 32,
            avgRating: 4.9,
            isActive: true
        },
        {
            id: 4,
            service_name: 'Tư vấn học thuật',
            description: 'Hỗ trợ về phương pháp học tập hiệu quả, quản lý thời gian và kỹ thuật nghiên cứu khoa học cho sinh viên đại học và sau đại học.',
            created_at: '2024-01-10T08:30:00',
            updated_at: '2024-01-10T08:30:00',
            bookingCount: 8,
            avgRating: 4.3,
            isActive: false
        }
    ];

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const handleCreateService = () => {
        console.log('Creating service:', formData);
        // Logic tạo service mới
        setShowCreateModal(false);
        resetForm();
    };

    const handleEditService = (service) => {
        setSelectedService(service);
        setFormData({
            service_name: service.service_name,
            description: service.description,
            price: '',
            duration: ''
        });
        setShowEditModal(true);
    };

    const handleUpdateService = () => {
        console.log('Updating service:', selectedService.id, formData);
        // Logic cập nhật service
        setShowEditModal(false);
        resetForm();
    };

    const handleDeleteService = (serviceId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
            console.log('Deleting service:', serviceId);
            // Logic xóa service
        }
    };

    const handleToggleStatus = (serviceId, currentStatus) => {
        console.log('Toggle service status:', serviceId, !currentStatus);
        // Logic toggle trạng thái
    };

    const resetForm = () => {
        setFormData({
            service_name: '',
            description: '',
            price: '',
            duration: ''
        });
        setSelectedService(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <i
                key={index}
                className={`bi bi-star${index < Math.floor(rating) ? '-fill' : ''} text-warning`}
            />
        ));
    };

    return (
        <div className="service-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-1">Quản lý dịch vụ</h3>
                    <p className="text-muted mb-0">Tạo và quản lý các dịch vụ tư vấn của bạn</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    className="btn-mentor"
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Tạo dịch vụ mới
                </Button>
            </div>

            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon primary">
                                <i className="bi bi-briefcase"></i>
                            </div>
                            <div className="stat-value">{services.length}</div>
                            <p className="stat-label">Tổng dịch vụ</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon success">
                                <i className="bi bi-check-circle"></i>
                            </div>
                            <div className="stat-value">{services.filter(s => s.isActive).length}</div>
                            <p className="stat-label">Đang hoạt động</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon info">
                                <i className="bi bi-calendar-check"></i>
                            </div>
                            <div className="stat-value">
                                {services.reduce((sum, s) => sum + s.bookingCount, 0)}
                            </div>
                            <p className="stat-label">Tổng lượt đặt</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon warning">
                                <i className="bi bi-star"></i>
                            </div>
                            <div className="stat-value">
                                {(services.reduce((sum, s) => sum + s.avgRating, 0) / services.length).toFixed(1)}
                            </div>
                            <p className="stat-label">Đánh giá TB</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Services Grid */}
            <Row>
                {services.map((service) => (
                    <Col lg={6} className="mb-4" key={service.id}>
                        <Card className="dashboard-card service-card h-100">
                            <Card.Header className="bg-transparent border-0">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h5 className="mb-1">{service.service_name}</h5>
                                        <div className="d-flex align-items-center">
                                            {renderStars(service.avgRating)}
                                            <span className="ms-2 text-muted">
                                                {service.avgRating} ({service.bookingCount} lượt đặt)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="service-status">
                                        <span className={`badge ${service.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                            {service.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                        </span>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <p className="text-muted mb-3">{service.description}</p>

                                <div className="service-stats mb-3">
                                    <Row className="text-center">
                                        <Col xs={4}>
                                            <div className="stat-mini">
                                                <div className="stat-mini-value">{service.bookingCount}</div>
                                                <div className="stat-mini-label">Lượt đặt</div>
                                            </div>
                                        </Col>
                                        <Col xs={4}>
                                            <div className="stat-mini">
                                                <div className="stat-mini-value">{service.avgRating}</div>
                                                <div className="stat-mini-label">Đánh giá</div>
                                            </div>
                                        </Col>
                                        <Col xs={4}>
                                            <div className="stat-mini">
                                                <div className="stat-mini-value">
                                                    {service.isActive ? 'ON' : 'OFF'}
                                                </div>
                                                <div className="stat-mini-label">Trạng thái</div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>

                                <div className="service-meta mb-3">
                                    <small className="text-muted d-block">
                                        <i className="bi bi-calendar me-1"></i>
                                        Tạo: {formatDateTime(service.created_at)}
                                    </small>
                                    {service.updated_at !== service.created_at && (
                                        <small className="text-muted d-block">
                                            <i className="bi bi-pencil me-1"></i>
                                            Cập nhật: {formatDateTime(service.updated_at)}
                                        </small>
                                    )}
                                </div>
                            </Card.Body>
                            <Card.Footer className="bg-transparent border-0">
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleEditService(service)}
                                    >
                                        <i className="bi bi-pencil me-1"></i>
                                        Sửa
                                    </Button>
                                    <Button
                                        variant={service.isActive ? 'outline-warning' : 'outline-success'}
                                        size="sm"
                                        onClick={() => handleToggleStatus(service.id, service.isActive)}
                                    >
                                        <i className={`bi bi-${service.isActive ? 'pause' : 'play'} me-1`}></i>
                                        {service.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteService(service.id)}
                                    >
                                        <i className="bi bi-trash me-1"></i>
                                        Xóa
                                    </Button>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Create Service Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Tạo dịch vụ mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên dịch vụ <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="service_name"
                                placeholder="Nhập tên dịch vụ"
                                value={formData.service_name}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả dịch vụ <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="description"
                                placeholder="Mô tả chi tiết về dịch vụ của bạn"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Giá dịch vụ (VNĐ)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="price"
                                        placeholder="0"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Thời lượng (phút)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="duration"
                                        placeholder="60"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Alert variant="info">
                            <i className="bi bi-info-circle me-2"></i>
                            Sau khi tạo dịch vụ, bạn có thể chỉnh sửa thông tin bất kỳ lúc nào. Dịch vụ sẽ được kích hoạt ngay sau khi tạo.
                        </Alert>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateService}
                        disabled={!formData.service_name || !formData.description}
                    >
                        <i className="bi bi-plus me-2"></i>
                        Tạo dịch vụ
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Service Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa dịch vụ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên dịch vụ <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="service_name"
                                placeholder="Nhập tên dịch vụ"
                                value={formData.service_name}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả dịch vụ <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="description"
                                placeholder="Mô tả chi tiết về dịch vụ của bạn"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Giá dịch vụ (VNĐ)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="price"
                                        placeholder="0"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Thời lượng (phút)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="duration"
                                        placeholder="60"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpdateService}
                        disabled={!formData.service_name || !formData.description}
                    >
                        <i className="bi bi-save me-2"></i>
                        Cập nhật
                    </Button>
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                .service-card {
                    transition: all 0.3s ease;
                }
                
                .service-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
                }
                
                .stat-mini {
                    padding: 0.5rem;
                }
                
                .stat-mini-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--primary-color);
                }
                
                .stat-mini-label {
                    font-size: 0.75rem;
                    color: var(--text-color);
                    opacity: 0.7;
                }
                
                .service-meta {
                    border-top: 1px solid var(--border-color);
                    padding-top: 0.75rem;
                }
            `}</style>
        </div>
    );
};

export default ServiceManagement;