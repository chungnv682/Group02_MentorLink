import React, { useState } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form,
    InputGroup, Modal, Nav, Tab, Alert, ProgressBar
} from 'react-bootstrap';
import {
    FaSearch, FaEye, FaCheck, FaTimes, FaDownload,
    FaGraduationCap, FaBriefcase, FaCertificate, FaUser
} from 'react-icons/fa';

const MentorApproval = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Mock data - thay thế bằng API call thực tế
    const mentorApplications = [
        {
            id: 1,
            userId: 123,
            fullname: 'Nguyễn Văn An',
            email: 'nguyenvanan@email.com',
            phone: '0901234567',
            title: 'Senior Software Engineer',
            highestDegree: 'MASTER',
            linkedinUrl: 'https://linkedin.com/in/nguyenvanan',
            intro: 'Tôi có 8 năm kinh nghiệm trong lĩnh vực phát triển phần mềm...',
            status: 'PENDING',
            submittedAt: '2024-01-15',
            services: [
                { name: 'Tư vấn career path', description: 'Hỗ trợ định hướng nghề nghiệp' },
                { name: 'Code review', description: 'Review và cải thiện code' }
            ],
            educations: [
                {
                    schoolName: 'Đại học Bách Khoa',
                    major: 'Khoa học máy tính',
                    startDate: '2012-09-01',
                    endDate: '2016-06-01',
                    certificateImage: 'cert1.jpg'
                }
            ],
            experiences: [
                {
                    companyName: 'FPT Software',
                    position: 'Senior Developer',
                    startDate: '2020-01-01',
                    endDate: null,
                    experienceImage: 'exp1.jpg'
                }
            ],
            tests: [
                {
                    testName: 'AWS Certified Developer',
                    score: '850/1000',
                    scoreImage: 'aws_cert.jpg'
                }
            ]
        },
        {
            id: 2,
            userId: 456,
            fullname: 'Trần Thị Bình',
            email: 'tranthibinh@email.com',
            phone: '0907654321',
            title: 'Product Manager',
            highestDegree: 'BACHELOR',
            linkedinUrl: 'https://linkedin.com/in/tranthibinh',
            intro: 'Tôi có 6 năm kinh nghiệm làm Product Manager...',
            status: 'APPROVED',
            submittedAt: '2024-01-10',
            approvedAt: '2024-01-14',
            services: [
                { name: 'Product Strategy', description: 'Tư vấn chiến lược sản phẩm' }
            ],
            educations: [],
            experiences: [],
            tests: []
        }
    ];

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ duyệt';
            case 'APPROVED': return 'Đã duyệt';
            case 'REJECTED': return 'Từ chối';
            default: return status;
        }
    };

    const handleViewMentor = (mentor) => {
        setSelectedMentor(mentor);
        setShowModal(true);
    };

    const calculateCompleteness = (mentor) => {
        let score = 0;
        if (mentor.fullname) score += 10;
        if (mentor.email) score += 10;
        if (mentor.phone) score += 10;
        if (mentor.title) score += 15;
        if (mentor.intro) score += 15;
        if (mentor.linkedinUrl) score += 10;
        if (mentor.services.length > 0) score += 20;
        if (mentor.educations.length > 0) score += 10;

        return score;
    };

    const filteredMentors = mentorApplications.filter(mentor => {
        const matchesSearch = mentor.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mentor.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || mentor.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="mentor-approval">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Duyệt/xác thực mentor</h4>
                    <p className="text-muted mb-0">Xem xét và phê duyệt đơn đăng ký mentor</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-success" size="sm">
                        <FaDownload className="me-1" />
                        Xuất báo cáo
                    </Button>
                    <Button variant="primary" size="sm">
                        <FaCheck className="me-1" />
                        Duyệt hàng loạt
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="stats-card border-start border-warning border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Chờ duyệt</h6>
                                    <h3 className="mb-0 text-warning">23</h3>
                                </div>
                                <div className="stats-icon bg-warning">
                                    <FaUser />
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
                                    <h6 className="text-muted mb-1">Đã duyệt</h6>
                                    <h3 className="mb-0 text-success">156</h3>
                                </div>
                                <div className="stats-icon bg-success">
                                    <FaCheck />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="stats-card border-start border-danger border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Từ chối</h6>
                                    <h3 className="mb-0 text-danger">12</h3>
                                </div>
                                <div className="stats-icon bg-danger">
                                    <FaTimes />
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
                                    <h6 className="text-muted mb-1">Tổng đơn</h6>
                                    <h3 className="mb-0 text-info">191</h3>
                                </div>
                                <div className="stats-icon bg-info">
                                    <FaGraduationCap />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="mb-4">
                <Card.Body>
                    <Row className="align-items-end">
                        <Col md={6}>
                            <Form.Label>Tìm kiếm</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Tìm theo tên hoặc email..."
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

            {/* Applications Table */}
            <Card>
                <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Đơn đăng ký mentor ({filteredMentors.length})</h6>
                        <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm">Chọn tất cả</Button>
                            <Button variant="outline-success" size="sm">Duyệt đã chọn</Button>
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
                                <th width="25%">Thông tin cá nhân</th>
                                <th width="20%">Chuyên môn</th>
                                <th width="15%">Độ hoàn thiện</th>
                                <th width="12%">Trạng thái</th>
                                <th width="13%">Ngày nộp</th>
                                <th width="10%">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMentors.map((mentor) => {
                                const completeness = calculateCompleteness(mentor);
                                return (
                                    <tr key={mentor.id}>
                                        <td>
                                            <Form.Check type="checkbox" />
                                        </td>
                                        <td>
                                            <div>
                                                <div className="fw-medium">{mentor.fullname}</div>
                                                <small className="text-muted">{mentor.email}</small>
                                                <br />
                                                <small className="text-muted">{mentor.phone}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div className="fw-medium">{mentor.title}</div>
                                                <Badge bg="secondary" className="me-1">
                                                    {mentor.highestDegree}
                                                </Badge>
                                                <small className="text-muted d-block">
                                                    {mentor.services.length} dịch vụ
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <ProgressBar
                                                    now={completeness}
                                                    variant={completeness > 80 ? 'success' : completeness > 60 ? 'warning' : 'danger'}
                                                    className="mb-1"
                                                    style={{ height: '6px' }}
                                                />
                                                <small className="text-muted">{completeness}%</small>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg={getStatusBadgeVariant(mentor.status)}>
                                                {getStatusText(mentor.status)}
                                            </Badge>
                                        </td>
                                        <td>
                                            <span className="text-muted">{mentor.submittedAt}</span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    onClick={() => handleViewMentor(mentor)}
                                                >
                                                    <FaEye />
                                                </Button>
                                                {mentor.status === 'PENDING' && (
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
                                );
                            })}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Mentor Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết đơn đăng ký mentor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedMentor && (
                        <Tab.Container defaultActiveKey="personal">
                            <Nav variant="tabs" className="mb-3">
                                <Nav.Item>
                                    <Nav.Link eventKey="personal">Thông tin cá nhân</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="services">Dịch vụ</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="education">Học vấn</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="experience">Kinh nghiệm</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="tests">Chứng chỉ</Nav.Link>
                                </Nav.Item>
                            </Nav>

                            <Tab.Content>
                                <Tab.Pane eventKey="personal">
                                    <Row>
                                        <Col md={6}>
                                            <p><strong>Họ tên:</strong> {selectedMentor.fullname}</p>
                                            <p><strong>Email:</strong> {selectedMentor.email}</p>
                                            <p><strong>Điện thoại:</strong> {selectedMentor.phone}</p>
                                            <p><strong>Chức danh:</strong> {selectedMentor.title}</p>
                                        </Col>
                                        <Col md={6}>
                                            <p><strong>Bằng cấp cao nhất:</strong> {selectedMentor.highestDegree}</p>
                                            <p><strong>LinkedIn:</strong>
                                                <a href={selectedMentor.linkedinUrl} target="_blank" rel="noopener noreferrer" className="ms-2">
                                                    {selectedMentor.linkedinUrl}
                                                </a>
                                            </p>
                                            <p><strong>Trạng thái:</strong>
                                                <Badge bg={getStatusBadgeVariant(selectedMentor.status)} className="ms-2">
                                                    {getStatusText(selectedMentor.status)}
                                                </Badge>
                                            </p>
                                        </Col>
                                    </Row>
                                    <div>
                                        <strong>Giới thiệu bản thân:</strong>
                                        <div className="p-3 bg-light rounded mt-2">
                                            {selectedMentor.intro}
                                        </div>
                                    </div>
                                </Tab.Pane>

                                <Tab.Pane eventKey="services">
                                    {selectedMentor.services.length > 0 ? (
                                        <Row>
                                            {selectedMentor.services.map((service, index) => (
                                                <Col md={6} key={index} className="mb-3">
                                                    <Card>
                                                        <Card.Body>
                                                            <h6>{service.name}</h6>
                                                            <p className="text-muted mb-0">{service.description}</p>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    ) : (
                                        <Alert variant="info">Chưa có thông tin dịch vụ</Alert>
                                    )}
                                </Tab.Pane>

                                <Tab.Pane eventKey="education">
                                    {selectedMentor.educations.length > 0 ? (
                                        <div>
                                            {selectedMentor.educations.map((edu, index) => (
                                                <Card key={index} className="mb-3">
                                                    <Card.Body>
                                                        <Row>
                                                            <Col>
                                                                <h6><FaGraduationCap className="me-2" />{edu.schoolName}</h6>
                                                                <p><strong>Chuyên ngành:</strong> {edu.major}</p>
                                                                <p><strong>Thời gian:</strong> {edu.startDate} - {edu.endDate || 'Hiện tại'}</p>
                                                            </Col>
                                                            {edu.certificateImage && (
                                                                <Col md={3}>
                                                                    <Button variant="outline-primary" size="sm">
                                                                        <FaDownload className="me-1" />
                                                                        Xem bằng cấp
                                                                    </Button>
                                                                </Col>
                                                            )}
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Alert variant="info">Chưa có thông tin học vấn</Alert>
                                    )}
                                </Tab.Pane>

                                <Tab.Pane eventKey="experience">
                                    {selectedMentor.experiences.length > 0 ? (
                                        <div>
                                            {selectedMentor.experiences.map((exp, index) => (
                                                <Card key={index} className="mb-3">
                                                    <Card.Body>
                                                        <Row>
                                                            <Col>
                                                                <h6><FaBriefcase className="me-2" />{exp.companyName}</h6>
                                                                <p><strong>Vị trí:</strong> {exp.position}</p>
                                                                <p><strong>Thời gian:</strong> {exp.startDate} - {exp.endDate || 'Hiện tại'}</p>
                                                            </Col>
                                                            {exp.experienceImage && (
                                                                <Col md={3}>
                                                                    <Button variant="outline-primary" size="sm">
                                                                        <FaDownload className="me-1" />
                                                                        Xem minh chứng
                                                                    </Button>
                                                                </Col>
                                                            )}
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Alert variant="info">Chưa có thông tin kinh nghiệm</Alert>
                                    )}
                                </Tab.Pane>

                                <Tab.Pane eventKey="tests">
                                    {selectedMentor.tests.length > 0 ? (
                                        <div>
                                            {selectedMentor.tests.map((test, index) => (
                                                <Card key={index} className="mb-3">
                                                    <Card.Body>
                                                        <Row>
                                                            <Col>
                                                                <h6><FaCertificate className="me-2" />{test.testName}</h6>
                                                                <p><strong>Điểm số:</strong> {test.score}</p>
                                                            </Col>
                                                            {test.scoreImage && (
                                                                <Col md={3}>
                                                                    <Button variant="outline-primary" size="sm">
                                                                        <FaDownload className="me-1" />
                                                                        Xem chứng chỉ
                                                                    </Button>
                                                                </Col>
                                                            )}
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Alert variant="info">Chưa có thông tin chứng chỉ</Alert>
                                    )}
                                </Tab.Pane>
                            </Tab.Content>

                            {selectedMentor.status === 'PENDING' && (
                                <Alert variant="warning" className="mt-3">
                                    <strong>Đơn đăng ký đang chờ duyệt</strong>
                                    <div className="mt-2">
                                        <Button variant="success" className="me-2">
                                            <FaCheck className="me-1" />
                                            Phê duyệt
                                        </Button>
                                        <Button variant="danger">
                                            <FaTimes className="me-1" />
                                            Từ chối
                                        </Button>
                                    </div>
                                </Alert>
                            )}
                        </Tab.Container>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MentorApproval;