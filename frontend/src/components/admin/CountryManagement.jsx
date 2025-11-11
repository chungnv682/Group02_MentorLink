import React, { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Button,
    Badge,
    Modal,
    Form,
    Alert,
    Spinner,
    InputGroup,
    Dropdown,
    Pagination,
    Nav
} from 'react-bootstrap';
import {
    FaCheck,
    FaTimes,
    FaEye,
    FaGlobeAmericas,
    FaSearch,
    FaFlag,
    FaUser,
    FaCalendar,
    FaExclamationTriangle,
    FaEdit,
    FaTrash,
    FaUndo
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import CountryService from '../../services/country/CountryService';

const CountryManagement = () => {
    const [countries, setCountries] = useState([]);
    const [pendingCountries, setPendingCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalData, setApprovalData] = useState({
        flagUrl: '',
        description: ''
    });
    
    // Pagination and Tab states
    const [activeTab, setActiveTab] = useState('approved'); // 'pending' or 'approved'
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [countriesResponse, pendingResponse] = await Promise.all([
                CountryService.getApprovedCountries(),
                CountryService.getPendingCountries()
            ]);

            if (countriesResponse.respCode === "0") {
                setCountries(countriesResponse.data);
            }

            if (pendingResponse.respCode === "0") {
                setPendingCountries(pendingResponse.data);
            }
        } catch (err) {
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
            console.error('Error fetching country data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (country) => {
        setSelectedCountry(country);
        setApprovalData({
            flagUrl: country.flagUrl || '',
            description: country.description || ''
        });
        setShowApprovalModal(true);
    };

    const submitApproval = async () => {
        try {
            await CountryService.approveCountry(selectedCountry.id, approvalData);
            alert('Đã duyệt thành công!');
            await fetchData();
            setShowApprovalModal(false);
        } catch (err) {
            alert('Có lỗi xảy ra khi duyệt. Vui lòng thử lại.');
        }
    };

    const handleReject = async (country) => {
        const reason = prompt('Nhập lý do từ chối:');
        if (!reason) return;

        try {
            await CountryService.rejectCountry(country.id, reason);
            alert('Đã từ chối thành công!');
            await fetchData();
        } catch (err) {
            alert('Có lỗi xảy ra khi từ chối. Vui lòng thử lại.');
        }
    };

    const viewDetails = (country) => {
        setSelectedCountry(country);
        setShowDetailModal(true);
    };

    const handleUnapprove = async (country) => {
        if (!window.confirm(`Bạn có chắc muốn chuyển "${country.name}" về trạng thái chờ duyệt?`)) {
            return;
        }

        try {
            await CountryService.unapproveCountry(country.id);
            alert('Đã chuyển về trạng thái chờ duyệt!');
            await fetchData();
        } catch (err) {
            alert('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    const handleDelete = async (country) => {
        if (!window.confirm(`Bạn có chắc muốn xóa nước "${country.name}"? Hành động này không thể hoàn tác!`)) {
            return;
        }

        try {
            await CountryService.deleteCountry(country.id);
            alert('Đã xóa thành công!');
            await fetchData();
        } catch (err) {
            alert('Có lỗi xảy ra khi xóa. Vui lòng thử lại.');
        }
    };

    // Filter and pagination logic
    const filteredData = useMemo(() => {
        const dataToFilter = activeTab === 'pending' ? pendingCountries : countries;
        
        if (!searchTerm) return dataToFilter;
        
        return dataToFilter.filter(country => {
            const nameMatch = country.name.toLowerCase().includes(searchTerm.toLowerCase());
            const codeMatch = country.code?.toLowerCase().includes(searchTerm.toLowerCase());
            const mentorMatch = country.suggestedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            
            return nameMatch || codeMatch || mentorMatch;
        });
    }, [activeTab, pendingCountries, countries, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage, itemsPerPage]);

    // Reset to first page when changing tabs or search term
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const items = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        items.push(
            <Pagination.First 
                key="first" 
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1} 
            />
        );
        items.push(
            <Pagination.Prev 
                key="prev" 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1} 
            />
        );

        if (startPage > 1) {
            items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
        }

        for (let page = startPage; page <= endPage; page++) {
            items.push(
                <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                >
                    {page}
                </Pagination.Item>
            );
        }

        if (endPage < totalPages) {
            items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
        }

        items.push(
            <Pagination.Next 
                key="next" 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages} 
            />
        );
        items.push(
            <Pagination.Last 
                key="last" 
                onClick={() => handlePageChange(totalPages)} 
                disabled={currentPage === totalPages} 
            />
        );

        return <Pagination className="justify-content-center mb-0">{items}</Pagination>;
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải dữ liệu...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={fetchData}>
                        Thử lại
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-0">
                                <FaGlobeAmericas className="me-2 text-primary" />
                                Quản lý các nước du học
                            </h2>
                            <p className="text-muted mb-0">
                                Quản lý danh sách các nước và duyệt đề xuất từ mentor
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <Badge bg="success" className="fs-6">
                                {countries.length} nước đã duyệt
                            </Badge>
                            <Badge bg="warning" className="fs-6">
                                {pendingCountries.length} đề xuất chờ duyệt
                            </Badge>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Search Bar */}
            <Row className="mb-3">
                <Col md={6}>
                    <InputGroup>
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm theo tên nước, mã nước hoặc người đề xuất..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => setSearchTerm('')}
                            >
                                <FaTimes />
                            </Button>
                        )}
                    </InputGroup>
                </Col>
                <Col md={6} className="text-end">
                    <small className="text-muted">
                        Hiển thị {paginatedData.length} / {filteredData.length} kết quả
                    </small>
                </Col>
            </Row>

            {/* Main Table Card */}
            <Card>
                <Card.Header className="bg-white">
                    <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                        <Nav.Item>
                            <Nav.Link eventKey="approved">
                                <FaFlag className="me-2" />
                                Đã duyệt
                                <Badge bg="success" className="ms-2">
                                    {countries.length}
                                </Badge>
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="pending">
                                <FaExclamationTriangle className="me-2" />
                                Chờ duyệt
                                <Badge bg="warning" className="ms-2">
                                    {pendingCountries.length}
                                </Badge>
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-0" style={{ overflow: 'visible' }}>
                    {paginatedData.length === 0 ? (
                        <div className="text-center py-5">
                            <FaSearch size={48} className="text-muted mb-3" />
                            <p className="text-muted mb-0">
                                {searchTerm 
                                    ? 'Không tìm thấy kết quả phù hợp' 
                                    : `Không có ${activeTab === 'pending' ? 'đề xuất chờ duyệt' : 'nước đã duyệt'}`
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            <Table responsive hover className="mb-0" style={{ overflow: 'visible' }}>
                                <thead className="table-light">
                                    <tr>
                                        <th>Tên nước</th>
                                        {activeTab === 'approved' && <th>Mã nước</th>}
                                        {activeTab === 'pending' && <th>Người đề xuất</th>}
                                        {activeTab === 'pending' && <th>Ngày đề xuất</th>}
                                        {activeTab === 'approved' && <th>Số mentor</th>}
                                        {activeTab === 'approved' && <th>Ngày thêm</th>}
                                        <th>Mô tả</th>
                                        <th>Trạng thái</th>
                                        <th className="text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeTab === 'pending' ? (
                                        // Pending Countries Rows
                                        paginatedData.map((country) => (
                                            <tr key={country.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2">🏳️</span>
                                                        <strong>{country.name}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <FaUser className="me-1 text-muted" />
                                                        <small>{country.suggestedBy?.name || 'N/A'}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <FaCalendar className="me-1 text-muted" />
                                                        <small>
                                                            {new Date(country.createdAt).toLocaleDateString('vi-VN')}
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <small className="text-muted">
                                                        {country.description?.substring(0, 50)}
                                                        {country.description?.length > 50 && '...'}
                                                    </small>
                                                </td>
                                                <td>
                                                    <Badge bg="warning" text="dark">
                                                        Chờ duyệt
                                                    </Badge>
                                                </td>
                                                <td className="text-center">
                                                    <Dropdown align="end" drop="up">
                                                        <Dropdown.Toggle 
                                                            variant="light" 
                                                            size="sm" 
                                                            className="no-caret p-1"
                                                        >
                                                            <BsThreeDotsVertical />
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu style={{ zIndex: 1050 }}>
                                                            <Dropdown.Item onClick={() => viewDetails(country)}>
                                                                <FaEye className="me-2" />
                                                                Xem chi tiết
                                                            </Dropdown.Item>
                                                            <Dropdown.Divider />
                                                            <Dropdown.Item 
                                                                className="text-success"
                                                                onClick={() => handleApprove(country)}
                                                            >
                                                                <FaCheck className="me-2" />
                                                                Duyệt
                                                            </Dropdown.Item>
                                                            <Dropdown.Item 
                                                                className="text-danger" 
                                                                onClick={() => handleReject(country)}
                                                            >
                                                                <FaTimes className="me-2" />
                                                                Từ chối
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        // Approved Countries Rows
                                        paginatedData.map((country) => (
                                            <tr key={country.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {country.flagUrl ? (
                                                            <img
                                                                src={country.flagUrl}
                                                                alt={`${country.name} flag`}
                                                                style={{
                                                                    width: '24px',
                                                                    height: '18px',
                                                                    marginRight: '8px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '2px'
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="me-2">🏳️</span>
                                                        )}
                                                        <strong>{country.name}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg="secondary">{country.code}</Badge>
                                                </td>
                                                <td>
                                                    <Badge bg="primary">
                                                        {country.mentorCount || 0} mentor(s)
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <small>
                                                        {new Date(country.createdAt).toLocaleDateString('vi-VN')}
                                                    </small>
                                                </td>
                                                <td>
                                                    <small className="text-muted">
                                                        {country.description?.substring(0, 50)}
                                                        {country.description?.length > 50 && '...'}
                                                    </small>
                                                </td>
                                                <td>
                                                    <Badge bg="success">Đã duyệt</Badge>
                                                </td>
                                                <td className="text-center">
                                                    <Dropdown align="end" drop="up">
                                                        <Dropdown.Toggle 
                                                            variant="light" 
                                                            size="sm" 
                                                            className="no-caret p-1"
                                                        >
                                                            <BsThreeDotsVertical />
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu style={{ zIndex: 1050 }}>
                                                            <Dropdown.Item onClick={() => viewDetails(country)}>
                                                                <FaEye className="me-2" />
                                                                Xem chi tiết
                                                            </Dropdown.Item>
                                                            <Dropdown.Divider />
                                                            <Dropdown.Item 
                                                                className="text-warning"
                                                                onClick={() => handleUnapprove(country)}
                                                            >
                                                                <FaUndo className="me-2" />
                                                                Chuyển về chờ duyệt
                                                            </Dropdown.Item>
                                                            <Dropdown.Item 
                                                                className="text-danger" 
                                                                onClick={() => handleDelete(country)}
                                                            >
                                                                <FaTrash className="me-2" />
                                                                Xóa
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Card.Body>
                {paginatedData.length > 0 && (
                    <Card.Footer className="bg-white">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                Trang {currentPage} / {totalPages}
                            </small>
                            {renderPagination()}
                            <small className="text-muted">
                                {itemsPerPage} mục/trang
                            </small>
                        </div>
                    </Card.Footer>
                )}
            </Card>

            {/* Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết đề xuất nước</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCountry && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Tên nước:</strong> {selectedCountry.name}
                                </Col>
                                <Col md={6}>
                                    <strong>Mã nước:</strong> {selectedCountry.code}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Người đề xuất:</strong> {selectedCountry.suggestedBy?.name || 'N/A'}
                                </Col>
                                <Col md={6}>
                                    <strong>Ngày đề xuất:</strong> {' '}
                                    {new Date(selectedCountry.createdAt).toLocaleDateString('vi-VN')}
                                </Col>
                            </Row>
                            <div className="mb-3">
                                <strong>Mô tả kinh nghiệm:</strong>
                                <p className="mt-2">{selectedCountry.description}</p>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Approval Modal */}
            <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Duyệt đề xuất nước</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCountry && (
                        <Form>
                            <Alert variant="info">
                                Duyệt đề xuất nước: <strong>{selectedCountry.name}</strong>
                            </Alert>
                            <Form.Group className="mb-3">
                                <Form.Label>URL cờ quốc gia</Form.Label>
                                <Form.Control
                                    type="url"
                                    placeholder="https://example.com/flag.png"
                                    value={approvalData.flagUrl}
                                    onChange={(e) => setApprovalData({
                                        ...approvalData,
                                        flagUrl: e.target.value
                                    })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Mô tả chính thức</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Mô tả chính thức về nước này..."
                                    value={approvalData.description}
                                    onChange={(e) => setApprovalData({
                                        ...approvalData,
                                        description: e.target.value
                                    })}
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="success" onClick={submitApproval}>
                        <FaCheck className="me-1" /> Duyệt
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CountryManagement;