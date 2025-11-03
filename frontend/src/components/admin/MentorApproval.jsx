import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form, Dropdown,
    InputGroup, Modal, Nav, Tab, Alert, ProgressBar, Spinner
} from 'react-bootstrap';
import {
    FaSearch, FaEye, FaCheck, FaTimes, FaDownload,
    FaGraduationCap, FaBriefcase, FaCertificate, FaUser
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import {
    getAllMentors,
    getMentorById,
    approveMentor,
    rejectMentor,
    bulkApproveMentors,
    bulkRejectMentors,
    getMentorStatistics
} from '../../services/admin/mentorManagementService';
import { useToast } from '../../contexts/ToastContext';

const MentorApproval = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [mentorApplications, setMentorApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMentorIds, setSelectedMentorIds] = useState([]);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
    });
    const [pagination, setPagination] = useState({
        page: 1,
        size: 10,
        totalPages: 0,
        totalElements: 0
    });
    const { showToast } = useToast();
    const headerCheckboxRef = useRef(null);

    // Fetch mentors when component mounts or filters change
    useEffect(() => {
        fetchMentors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus, pagination.page]);

    // Fetch statistics
    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchMentors = async () => {
        try {
            setLoading(true);
            const params = {
                keySearch: searchTerm || '',
                status: filterStatus !== 'all' ? getStatusIdFromFilter(filterStatus) : null,
                page: pagination.page,
                size: pagination.size
            };

            const response = await getAllMentors(params);
            
            if (response.respCode === "0" || response.success) {
                const data = response.data;
                const mentorsList = data.content || [];
                setMentorApplications(mentorsList);
                
                setPagination(prev => ({
                    ...prev,
                    page: data.currentPage || 1,
                    totalPages: data.totalPages || 0,
                    totalElements: data.totalElements || 0
                }));
            } else {
                showToast(response.description || 'Không thể tải danh sách mentor', 'error');
            }
        } catch (error) {
            console.error('Error fetching mentors:', error);
            showToast('Không thể tải danh sách mentor', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await getMentorStatistics();
            
            if (response.respCode === "0" || response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const getStatusIdFromFilter = (filterValue) => {
        // Map filter values to status IDs (adjust based on your backend status table)
        const statusMap = {
            'PENDING': 1,
            'APPROVED': 2,
            'REJECTED': 3
        };
        return statusMap[filterValue] || null;
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchMentors();
    };

    const getStatusBadgeVariant = (statusName) => {
        if (!statusName) return 'secondary';
        const status = statusName.toUpperCase();
        if (status.includes('PENDING') || status.includes('CHỜ')) return 'warning';
        if (status.includes('ACTIVE') || status.includes('APPROVED') || status.includes('HOẠT ĐỘNG')) return 'success';
        if (status.includes('INACTIVE') || status.includes('REJECTED') || status.includes('TỪ CHỐI')) return 'danger';
        return 'secondary';
    };

    const getStatusText = (statusName) => {
        if (!statusName) return 'Không xác định';
        return statusName;
    };

    const handleViewMentor = async (mentor) => {
        try {
            setLoading(true);
            const response = await getMentorById(mentor.id);
            
            if (response.respCode === "0" || response.success) {
                setSelectedMentor(response.data);
                setShowModal(true);
            } else {
                showToast('Không thể tải thông tin mentor', 'error');
            }
        } catch (error) {
            console.error('Error fetching mentor details:', error);
            showToast('Không thể tải thông tin mentor', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveMentor = async (mentorId) => {
        try {
            const response = await approveMentor(mentorId);
            
            if (response.respCode === "0" || response.success) {
                showToast('Đã duyệt mentor thành công', 'success');
                fetchMentors();
                fetchStatistics();
                setShowModal(false);
            } else {
                showToast(response.description || 'Không thể duyệt mentor', 'error');
            }
        } catch (error) {
            console.error('Error approving mentor:', error);
            showToast('Không thể duyệt mentor', 'error');
        }
    };

    const handleRejectMentor = async (mentorId) => {
        try {
            const response = await rejectMentor(mentorId);
            
            if (response.respCode === "0" || response.success) {
                showToast('Đã từ chối mentor', 'success');
                fetchMentors();
                fetchStatistics();
                setShowModal(false);
            } else {
                showToast(response.description || 'Không thể từ chối mentor', 'error');
            }
        } catch (error) {
            console.error('Error rejecting mentor:', error);
            showToast('Không thể từ chối mentor', 'error');
        }
    };

    const handleBulkApprove = async () => {
        if (selectedMentorIds.length === 0) {
            showToast('Vui lòng chọn ít nhất một mentor', 'warning');
            return;
        }

        try {
            const response = await bulkApproveMentors(selectedMentorIds);
            
            if (response.respCode === "0" || response.success) {
                showToast(`Đã duyệt ${selectedMentorIds.length} mentor thành công`, 'success');
                setSelectedMentorIds([]);
                fetchMentors();
                fetchStatistics();
            } else {
                showToast(response.description || 'Không thể duyệt mentor', 'error');
            }
        } catch (error) {
            console.error('Error bulk approving mentors:', error);
            showToast('Không thể duyệt mentor', 'error');
        }
    };

    const handleBulkReject = async () => {
        if (selectedMentorIds.length === 0) {
            showToast('Vui lòng chọn ít nhất một mentor', 'warning');
            return;
        }

        try {
            const response = await bulkRejectMentors(selectedMentorIds);
            
            if (response.respCode === "0" || response.success) {
                showToast(`Đã từ chối ${selectedMentorIds.length} mentor`, 'success');
                setSelectedMentorIds([]);
                fetchMentors();
                fetchStatistics();
            } else {
                showToast(response.description || 'Không thể từ chối mentor', 'error');
            }
        } catch (error) {
            console.error('Error bulk rejecting mentors:', error);
            showToast('Không thể từ chối mentor', 'error');
        }
    };

    const handleSelectMentor = (mentorId) => {
        setSelectedMentorIds(prev => {
            if (prev.includes(mentorId)) {
                return prev.filter(id => id !== mentorId);
            } else {
                return [...prev, mentorId];
            }
        });
    };

    const handleSelectAll = () => {
        const allIdsOnPage = mentorApplications.map(m => m.id);
        const allSelected = allIdsOnPage.length > 0 && allIdsOnPage.every(id => selectedMentorIds.includes(id));
        if (allSelected) {
            setSelectedMentorIds(prev => prev.filter(id => !allIdsOnPage.includes(id)));
        } else {
            setSelectedMentorIds(prev => Array.from(new Set([...prev, ...allIdsOnPage])));
        }
    };

    // Indeterminate state for header checkbox
    useEffect(() => {
        if (!headerCheckboxRef.current) return;
        const allIdsOnPage = mentorApplications.map(m => m.id);
        const selectedOnPage = allIdsOnPage.filter(id => selectedMentorIds.includes(id));
        const allSelectedOnPage = selectedOnPage.length === allIdsOnPage.length && allIdsOnPage.length > 0;
        const someSelectedOnPage = selectedOnPage.length > 0 && !allSelectedOnPage;
        headerCheckboxRef.current.indeterminate = someSelectedOnPage;
    }, [mentorApplications, selectedMentorIds]);

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

            {/* Stats Cards - simple version */}
            <Row className="mb-3 g-3">
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
                            <h6 className="text-muted mb-1">Đã duyệt</h6>
                            <h4 className="fw-semibold mb-0">{stats.approved || 0}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Từ chối</h6>
                            <h4 className="fw-semibold mb-0">{stats.rejected || 0}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Tổng đơn</h6>
                            <h4 className="fw-semibold mb-0">{stats.total || 0}</h4>
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
                            <Button 
                                variant="outline-secondary" 
                                className="w-100"
                                onClick={handleSearch}
                                disabled={loading}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : 'Lọc'}
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Applications Table */}
            <Card>
                <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Đơn đăng ký mentor ({pagination.totalElements || 0})</h6>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={handleSelectAll}
                                disabled={mentorApplications.length === 0}
                            >
                                {selectedMentorIds.length === mentorApplications.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                            </Button>
                            <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={handleBulkApprove}
                                disabled={selectedMentorIds.length === 0}
                            >
                                Duyệt đã chọn ({selectedMentorIds.length})
                            </Button>
                            <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={handleBulkReject}
                                disabled={selectedMentorIds.length === 0}
                            >
                                Từ chối đã chọn ({selectedMentorIds.length})
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
                    ) : mentorApplications.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted">Không có dữ liệu</p>
                        </div>
                    ) : (
                        <Table responsive hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th width="5%">
                                        <Form.Check 
                                            type="checkbox"
                                            ref={headerCheckboxRef}
                                            checked={mentorApplications.length > 0 && mentorApplications.every(m => selectedMentorIds.includes(m.id))}
                                            onChange={handleSelectAll}
                                        />
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
                                {mentorApplications.map((mentor) => {
                                    const completeness = mentor.completionPercent || 0;
                                    const isPending = mentor.statusName && mentor.statusName.toUpperCase().includes('PENDING');
                                    return (
                                        <tr key={mentor.id}>
                                            <td>
                                                <Form.Check 
                                                    type="checkbox"
                                                    checked={selectedMentorIds.includes(mentor.id)}
                                                    onChange={() => handleSelectMentor(mentor.id)}
                                                />
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="fw-medium">{mentor.fullname || 'N/A'}</div>
                                                    <small className="text-muted">{mentor.email || 'N/A'}</small>
                                                    <br />
                                                    <small className="text-muted">{mentor.phone || 'N/A'}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="fw-medium">{mentor.title || 'N/A'}</div>
                                                    {mentor.highestDegreeName && (
                                                        <Badge bg="secondary" className="me-1">
                                                            {mentor.highestDegreeName}
                                                        </Badge>
                                                    )}
                                                    <small className="text-muted d-block">
                                                        {mentor.serviceCount || 0} dịch vụ
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
                                                <Badge bg={getStatusBadgeVariant(mentor.statusName)}>
                                                    {getStatusText(mentor.statusName)}
                                                </Badge>
                                            </td>
                                            <td>
                                                <span className="text-muted">
                                                    {mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <Dropdown align="end">
                                                    <Dropdown.Toggle variant="light" size="sm" className="no-caret p-1">
                                                        <BsThreeDotsVertical />
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item onClick={() => handleViewMentor(mentor)}>
                                                            Xem
                                                        </Dropdown.Item>
                                                        {isPending && (
                                                            <>
                                                                <Dropdown.Item onClick={() => handleApproveMentor(mentor.id)}>
                                                                    Duyệt
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => handleRejectMentor(mentor.id)}>
                                                                    Từ chối
                                                                </Dropdown.Item>
                                                            </>
                                                        )}
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
                {!loading && pagination.totalPages > 1 && (
                    <Card.Footer>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-muted">
                                Hiển thị {mentorApplications.length} / {pagination.totalElements} kết quả
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    disabled={pagination.page <= 1}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    Trước
                                </Button>
                                <span className="align-self-center">
                                    Trang {pagination.page} / {pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    Sau
                                </Button>
                            </div>
                        </div>
                    </Card.Footer>
                )}
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
                                            <p><strong>Họ tên:</strong> {selectedMentor.fullname || 'N/A'}</p>
                                            <p><strong>Email:</strong> {selectedMentor.email || 'N/A'}</p>
                                            <p><strong>Điện thoại:</strong> {selectedMentor.phone || 'N/A'}</p>
                                            <p><strong>Chức danh:</strong> {selectedMentor.title || 'N/A'}</p>
                                        </Col>
                                        <Col md={6}>
                                            <p><strong>Bằng cấp cao nhất:</strong> {selectedMentor.highestDegreeName || 'N/A'}</p>
                                            {selectedMentor.linkedinUrl && (
                                                <p><strong>LinkedIn:</strong>
                                                    <a href={selectedMentor.linkedinUrl} target="_blank" rel="noopener noreferrer" className="ms-2">
                                                        {selectedMentor.linkedinUrl}
                                                    </a>
                                                </p>
                                            )}
                                            <p><strong>Trạng thái:</strong>
                                                <Badge bg={getStatusBadgeVariant(selectedMentor.statusName)} className="ms-2">
                                                    {getStatusText(selectedMentor.statusName)}
                                                </Badge>
                                            </p>
                                            <p><strong>Độ hoàn thiện:</strong> {selectedMentor.completionPercent || 0}%</p>
                                        </Col>
                                    </Row>
                                    {selectedMentor.intro && (
                                        <div>
                                            <strong>Giới thiệu bản thân:</strong>
                                            <div className="p-3 bg-light rounded mt-2">
                                                {selectedMentor.intro}
                                            </div>
                                        </div>
                                    )}
                                </Tab.Pane>

                                <Tab.Pane eventKey="services">
                                    <Alert variant="info">
                                        <strong>Số lượng dịch vụ:</strong> {selectedMentor.serviceCount || 0}
                                    </Alert>
                                    <Alert variant="secondary">
                                        Chi tiết dịch vụ cần được tải từ API riêng (đang phát triển)
                                    </Alert>
                                </Tab.Pane>

                                <Tab.Pane eventKey="education">
                                    <Alert variant="secondary">
                                        Thông tin học vấn cần được tải từ API riêng (đang phát triển)
                                    </Alert>
                                </Tab.Pane>

                                <Tab.Pane eventKey="experience">
                                    <Alert variant="secondary">
                                        Thông tin kinh nghiệm cần được tải từ API riêng (đang phát triển)
                                    </Alert>
                                </Tab.Pane>

                                <Tab.Pane eventKey="tests">
                                    <Alert variant="secondary">
                                        Thông tin chứng chỉ cần được tải từ API riêng (đang phát triển)
                                    </Alert>
                                </Tab.Pane>
                            </Tab.Content>

                            {selectedMentor.statusName && selectedMentor.statusName.toUpperCase().includes('PENDING') && (
                                <Alert variant="warning" className="mt-3">
                                    <strong>Đơn đăng ký đang chờ duyệt</strong>
                                    <div className="mt-2">
                                        <Button 
                                            variant="success" 
                                            className="me-2"
                                            onClick={() => handleApproveMentor(selectedMentor.id)}
                                        >
                                            <FaCheck className="me-1" />
                                            Phê duyệt
                                        </Button>
                                        <Button 
                                            variant="danger"
                                            onClick={() => handleRejectMentor(selectedMentor.id)}
                                        >
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