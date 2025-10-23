import React, { useState, useEffect } from 'react';
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
    InputGroup
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
    FaExclamationTriangle
} from 'react-icons/fa';
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

    const filteredPending = pendingCountries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.suggestedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <Row className="mb-4">
                <Col md={6}>
                    <InputGroup>
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm theo tên nước hoặc người đề xuất..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
            </Row>

            {/* Pending Countries Section */}
            <Card className="mb-4">
                <Card.Header className="bg-warning text-dark">
                    <h5 className="mb-0">
                        <FaExclamationTriangle className="me-2" />
                        Đề xuất chờ duyệt ({filteredPending.length})
                    </h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {filteredPending.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted mb-0">Không có đề xuất nào chờ duyệt</p>
                        </div>
                    ) : (
                        <Table responsive striped hover className="mb-0">
                            <thead>
                                <tr>
                                    <th>Tên nước</th>
                                    <th>Người đề xuất</th>
                                    <th>Ngày đề xuất</th>
                                    <th>Mô tả</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPending.map((country) => (
                                    <tr key={country.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">🏳️</span>
                                                <strong>{country.name}</strong>
                                                <Badge bg="warning" className="ms-2" size="sm">
                                                    Chờ duyệt
                                                </Badge>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <FaUser className="me-1 text-muted" />
                                                {country.suggestedBy?.name || 'N/A'}
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
                                            <div className="d-flex gap-1">
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    onClick={() => viewDetails(country)}
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </Button>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => handleApprove(country)}
                                                    title="Duyệt"
                                                >
                                                    <FaCheck />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleReject(country)}
                                                    title="Từ chối"
                                                >
                                                    <FaTimes />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Approved Countries Section */}
            <Card>
                <Card.Header className="bg-success text-white">
                    <h5 className="mb-0">
                        <FaFlag className="me-2" />
                        Các nước đã duyệt ({countries.length})
                    </h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive striped hover className="mb-0">
                        <thead>
                            <tr>
                                <th>Tên nước</th>
                                <th>Mã nước</th>
                                <th>Số mentor</th>
                                <th>Ngày thêm</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {countries.map((country) => (
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
                                        <Badge bg="success">Đã duyệt</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
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