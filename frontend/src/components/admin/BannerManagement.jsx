import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form, Dropdown,
    InputGroup, Modal, Alert, Image, Spinner
} from 'react-bootstrap';
import {
    FaSearch, FaEye, FaEdit, FaTrash, FaPlus,
    FaBullhorn, FaImage, FaCalendarAlt, FaToggleOn, FaToggleOff, FaUndo
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useToast } from '../../contexts/ToastContext';
import {
    getAllBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    publishBanner,
    unpublishBanner,
    updateBannerStatus,
    bulkDeleteBanners,
    getBannerStatistics
} from '../../services/admin';

const BannerManagement = () => {
    const { showToast } = useToast();
    
    // State management
    const [banners, setBanners] = useState([]);
    const [statistics, setStatistics] = useState({
        totalBanners: 0,
        activeBanners: 0,
        inactiveBanners: 0,
        pendingBanners: 0,
        expiredBanners: 0,
        totalViews: 0,
        totalClicks: 0,
        averageCTR: 0
    });
    
    const [showModal, setShowModal] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [modalType, setModalType] = useState('view'); // 'view', 'create', 'edit'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPublished, setFilterPublished] = useState(null);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    
    // Loading states
    const [loading, setLoading] = useState(false);
    const [loadingStatistics, setLoadingStatistics] = useState(false);
    
    // Selection state
    const [selectedBannerIds, setSelectedBannerIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const headerCheckboxRef = useRef(null);

    // Fetch banners from API
    const fetchBanners = async () => {
        setLoading(true);
        try {
            const response = await getAllBanners({
                keySearch: searchTerm || null,
                status: filterStatus || null,
                isPublished: filterPublished,
                page: currentPage,
                size: pageSize
            });
            
            if (response.respCode === '0') {
                setBanners(response.data.content || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalElements(response.data.totalElements || 0);
            } else {
                showToast('error', response.description || 'Không thể tải danh sách banner');
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
            showToast('error', 'Có lỗi xảy ra khi tải danh sách banner');
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStatistics = async () => {
        setLoadingStatistics(true);
        try {
            const response = await getBannerStatistics();
            if (response.respCode === '0') {
                setStatistics(response.data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setLoadingStatistics(false);
        }
    };

    // useEffect hooks
    useEffect(() => {
        fetchStatistics();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBanners();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, filterStatus, filterPublished, currentPage]);

    // Mock data removed - using API data
    const oldBanners = [
        {
            id: 1,
            title: 'Khuyến mãi tháng 1 - Giảm 30% tất cả dịch vụ',
            imageUrl: 'https://via.placeholder.com/800x300/007bff/ffffff?text=Banner+1',
            linkUrl: '/promotions/january',
            status: 'ACTIVE',
            position: 1,
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            isPublished: true,
            createdAt: '2023-12-28',
            createdBy: 'Admin',
            viewCount: 15420,
            clickCount: 890
        },
        {
            id: 2,
            title: 'Tìm mentor chuyên nghiệp cho career path của bạn',
            imageUrl: 'https://via.placeholder.com/800x300/28a745/ffffff?text=Banner+2',
            linkUrl: '/find-mentor',
            status: 'ACTIVE',
            position: 2,
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            isPublished: true,
            createdAt: '2023-12-20',
            createdBy: 'Admin',
            viewCount: 8750,
            clickCount: 456
        },
        {
            id: 3,
            title: 'Đăng ký trở thành mentor - Chia sẻ kiến thức, nhận thu nhập',
            imageUrl: 'https://via.placeholder.com/800x300/ffc107/000000?text=Banner+3',
            linkUrl: '/become-mentor',
            status: 'INACTIVE',
            position: 3,
            startDate: '2024-01-15',
            endDate: '2024-02-15',
            isPublished: false,
            createdAt: '2024-01-10',
            createdBy: 'Marketing Team',
            viewCount: 0,
            clickCount: 0
        },
        {
            id: 4,
            title: 'Sự kiện webinar: "Xu hướng công nghệ 2024"',
            imageUrl: 'https://via.placeholder.com/800x300/dc3545/ffffff?text=Banner+4',
            linkUrl: '/events/webinar-2024',
            status: 'PENDING',
            position: 4,
            startDate: '2024-02-01',
            endDate: '2024-02-28',
            isPublished: false,
            createdAt: '2024-01-14',
            createdBy: 'Event Team',
            viewCount: 0,
            clickCount: 0
        }
    ];

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'ACTIVE': return 'success';
            case 'INACTIVE': return 'secondary';
            case 'PENDING': return 'warning';
            case 'EXPIRED': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'ACTIVE': return 'Đang hoạt động';
            case 'INACTIVE': return 'Không hoạt động';
            case 'PENDING': return 'Chờ duyệt';
            case 'EXPIRED': return 'Hết hạn';
            default: return status;
        }
    };

    const handleViewBanner = async (bannerId) => {
        try {
            const response = await getBannerById(bannerId);
            if (response.respCode === '0') {
                setSelectedBanner(response.data);
                setModalType('view');
                setShowModal(true);
            }
        } catch (error) {
            showToast('error', 'Không thể tải thông tin banner');
        }
    };

    const handleCreateBanner = () => {
        setSelectedBanner(null);
        setModalType('create');
        setShowModal(true);
    };

    const handleEditBanner = (banner) => {
        setSelectedBanner(banner);
        setModalType('edit');
        setShowModal(true);
    };

    const handlePublishBanner = async (bannerId) => {
        try {
            const response = await publishBanner(bannerId);
            if (response.respCode === '0') {
                showToast('success', 'Xuất bản banner thành công');
                fetchBanners();
                fetchStatistics();
                setShowModal(false);
            } else {
                showToast('error', response.description);
            }
        } catch (error) {
            showToast('error', 'Có lỗi xảy ra khi xuất bản banner');
        }
    };

    const handleUnpublishBanner = async (bannerId) => {
        try {
            const response = await unpublishBanner(bannerId);
            if (response.respCode === '0') {
                showToast('success', 'Hủy xuất bản banner thành công');
                fetchBanners();
                fetchStatistics();
                setShowModal(false);
            } else {
                showToast('error', response.description);
            }
        } catch (error) {
            showToast('error', 'Có lỗi xảy ra khi hủy xuất bản banner');
        }
    };

    const handleDeleteBanner = async (bannerId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa banner này?')) return;
        
        try {
            const response = await deleteBanner(bannerId);
            if (response.respCode === '0') {
                showToast('success', 'Xóa banner thành công');
                fetchBanners();
                fetchStatistics();
                setShowModal(false);
            } else {
                showToast('error', response.description);
            }
        } catch (error) {
            showToast('error', 'Có lỗi xảy ra khi xóa banner');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedBannerIds.length === 0) {
            showToast('warning', 'Vui lòng chọn ít nhất một banner');
            return;
        }
        
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedBannerIds.length} banner đã chọn?`)) return;
        
        try {
            const response = await bulkDeleteBanners(selectedBannerIds);
            if (response.respCode === '0') {
                showToast('success', 'Xóa banner thành công');
                setSelectedBannerIds([]);
                setSelectAll(false);
                fetchBanners();
                fetchStatistics();
            } else {
                showToast('error', response.description);
            }
        } catch (error) {
            showToast('error', 'Có lỗi xảy ra khi xóa banner');
        }
    };

    const handleSelectAll = () => {
        const allIdsOnPage = banners.map(b => b.id);
        const allSelected = allIdsOnPage.length > 0 && allIdsOnPage.every(id => selectedBannerIds.includes(id));
        if (allSelected) {
            setSelectedBannerIds(prev => prev.filter(id => !allIdsOnPage.includes(id)));
            setSelectAll(false);
        } else {
            setSelectedBannerIds(prev => Array.from(new Set([...prev, ...allIdsOnPage])));
            setSelectAll(true);
        }
    };

    // Indeterminate state for header checkbox
    useEffect(() => {
        if (!headerCheckboxRef.current) return;
        const allIdsOnPage = banners.map(b => b.id);
        const selectedOnPage = allIdsOnPage.filter(id => selectedBannerIds.includes(id));
        const allSelectedOnPage = selectedOnPage.length === allIdsOnPage.length && allIdsOnPage.length > 0;
        const someSelectedOnPage = selectedOnPage.length > 0 && !allSelectedOnPage;
        headerCheckboxRef.current.indeterminate = someSelectedOnPage;
    }, [banners, selectedBannerIds]);

    const handleSelectBanner = (bannerId) => {
        setSelectedBannerIds(prev => {
            if (prev.includes(bannerId)) {
                return prev.filter(id => id !== bannerId);
            } else {
                return [...prev, bannerId];
            }
        });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilterStatus('');
        setFilterPublished(null);
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        return new Date(dateTimeString).toLocaleString('vi-VN');
    };

    return (
        <div className="banner-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Quản lý Banner & Quảng cáo</h4>
                    <p className="text-muted mb-0">Quản lý banner hiển thị trên trang chủ và các trang khác</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                        <FaCalendarAlt className="me-1" />
                        Lên lịch banner
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleCreateBanner}>
                        <FaPlus className="me-1" />
                        Tạo banner mới
                    </Button>
                </div>
            </div>

            {/* Stats Cards - simple version */}
            <Row className="mb-3 g-3">
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Tổng banner</h6>
                            <h4 className="fw-semibold mb-0">
                                {loadingStatistics ? <Spinner animation="border" size="sm" /> : statistics.totalBanners}
                            </h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Đang hoạt động</h6>
                            <h4 className="fw-semibold mb-0">
                                {loadingStatistics ? <Spinner animation="border" size="sm" /> : statistics.activeBanners}
                            </h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">Lượt xem</h6>
                            <h4 className="fw-semibold mb-0">
                                {loadingStatistics ? <Spinner animation="border" size="sm" /> : (statistics.totalViews || 0).toLocaleString()}
                            </h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="text-center">
                            <h6 className="text-muted mb-1">CTR trung bình</h6>
                            <h4 className="fw-semibold mb-0">
                                {loadingStatistics ? <Spinner animation="border" size="sm" /> : `${(statistics.averageCTR || 0).toFixed(2)}%`}
                            </h4>
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
                                    placeholder="Tìm theo tiêu đề hoặc người tạo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Form.Label>Trạng thái</Form.Label>
                            <Form.Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="ACTIVE">Đang hoạt động</option>
                                <option value="INACTIVE">Không hoạt động</option>
                                <option value="PENDING">Chờ duyệt</option>
                                <option value="EXPIRED">Hết hạn</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Label>Xuất bản</Form.Label>
                            <Form.Select
                                value={filterPublished === null ? '' : filterPublished}
                                onChange={(e) => setFilterPublished(e.target.value === '' ? null : e.target.value === 'true')}
                            >
                                <option value="">Tất cả</option>
                                <option value="true">Đã xuất bản</option>
                                <option value="false">Chưa xuất bản</option>
                            </Form.Select>
                        </Col>
                        <Col md={1}>
                            <Button 
                                variant="outline-secondary" 
                                className="w-100"
                                onClick={handleResetFilters}
                                title="Đặt lại bộ lọc"
                            >
                                <FaUndo />
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Banner Preview Cards */}
            <Row className="mb-4">
                {banners.slice(0, 2).map((banner) => (
                    <Col md={6} key={`preview-${banner.id}`}>
                        <Card className="mb-3">
                            <div className="position-relative">
                                <Image
                                    src={banner.imageUrl}
                                    alt={banner.title}
                                    className="w-100"
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <div className="position-absolute top-0 end-0 m-2">
                                    <Badge bg={getStatusBadgeVariant(banner.status)}>
                                        {getStatusText(banner.status)}
                                    </Badge>
                                </div>
                                <div className="position-absolute bottom-0 start-0 m-2">
                                    <Badge bg="dark" className="bg-opacity-75">
                                        Vị trí: {banner.position}
                                    </Badge>
                                </div>
                            </div>
                            <Card.Body>
                                <h6 className="card-title">{banner.title}</h6>
                                <div className="d-flex justify-content-between text-muted small">
                                    <span>👁 {banner.viewCount.toLocaleString()}</span>
                                    <span>🖱 {banner.clickCount.toLocaleString()}</span>
                                    <span>{formatDate(banner.startDate)} - {formatDate(banner.endDate)}</span>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Banners Table */}
            <Card>
                <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">
                            Danh sách banner ({totalElements})
                            {loading && <Spinner animation="border" size="sm" className="ms-2" />}
                        </h6>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={handleBulkDelete}
                                disabled={selectedBannerIds.length === 0}
                            >
                                <FaTrash className="me-1" />
                                Xóa đã chọn ({selectedBannerIds.length})
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
                    ) : banners.length === 0 ? (
                        <div className="text-center py-5">
                            <FaBullhorn size={48} className="text-muted mb-3" />
                            <p className="text-muted">Không có banner nào</p>
                        </div>
                    ) : (
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th width="5%">
                                    <Form.Check 
                                        type="checkbox"
                                        ref={headerCheckboxRef}
                                        checked={banners.length > 0 && banners.every(b => selectedBannerIds.includes(b.id))}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th width="10%">Hình ảnh</th>
                                <th width="25%">Tiêu đề</th>
                                <th width="10%">Vị trí</th>
                                <th width="12%">Trạng thái</th>
                                <th width="15%">Thời gian</th>
                                <th width="13%">Hiệu suất</th>
                                <th width="10%">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {banners.map((banner) => (
                                <tr key={banner.id}>
                                    <td>
                                        <Form.Check 
                                            type="checkbox"
                                            checked={selectedBannerIds.includes(banner.id)}
                                            onChange={() => handleSelectBanner(banner.id)}
                                        />
                                    </td>
                                    <td>
                                        <Image
                                            src={banner.imageUrl}
                                            alt={banner.title}
                                            thumbnail
                                            style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                                        />
                                    </td>
                                    <td>
                                        <div>
                                            <div className="fw-medium">{banner.title}</div>
                                            <small className="text-muted">
                                                Tạo bởi: {banner.createdBy}
                                            </small>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg="info" className="fs-6">
                                            #{banner.position}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg={getStatusBadgeVariant(banner.status)}>
                                            {getStatusText(banner.status)}
                                        </Badge>
                                        {banner.isPublished && (
                                            <div className="mt-1">
                                                <Badge bg="success" className="d-block">
                                                    <FaToggleOn className="me-1" />
                                                    Xuất bản
                                                </Badge>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div>
                                            <small className="text-muted d-block">
                                                <strong>Bắt đầu:</strong> {formatDate(banner.startDate)}
                                            </small>
                                            <small className="text-muted d-block">
                                                <strong>Kết thúc:</strong> {formatDate(banner.endDate)}
                                            </small>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <small className="text-info d-block">
                                                👁 {banner.viewCount.toLocaleString()}
                                            </small>
                                            <small className="text-success d-block">
                                                🖱 {banner.clickCount.toLocaleString()}
                                            </small>
                                            <small className="text-warning d-block">
                                                CTR: {banner.viewCount > 0 ? ((banner.clickCount / banner.viewCount) * 100).toFixed(1) : 0}%
                                            </small>
                                        </div>
                                    </td>
                                    <td>
                                        <Dropdown align="end">
                                            <Dropdown.Toggle variant="light" size="sm" className="no-caret p-1">
                                                <BsThreeDotsVertical />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => handleViewBanner(banner.id)}>
                                                    Xem
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleEditBanner(banner)}>
                                                    Chỉnh sửa
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item className="text-danger" onClick={() => handleDeleteBanner(banner.id)}>
                                                    Xóa
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Pagination */}
            {!loading && banners.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="text-muted">
                        Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalElements)} trong tổng số {totalElements} banner
                    </div>
                    <div className="d-flex gap-2">
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Trang trước
                        </Button>
                        <div className="d-flex align-items-center">
                            <span className="text-muted">Trang {currentPage} / {totalPages}</span>
                        </div>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Trang sau
                        </Button>
                    </div>
                </div>
            )}

            {/* Banner Detail/Create/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalType === 'view' && 'Chi tiết banner'}
                        {modalType === 'create' && 'Tạo banner mới'}
                        {modalType === 'edit' && 'Chỉnh sửa banner'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalType === 'view' && selectedBanner && (
                        <div>
                            <Row className="mb-3">
                                <Col>
                                    <Image
                                        src={selectedBanner.imageUrl}
                                        alt={selectedBanner.title}
                                        className="w-100 rounded"
                                        style={{ maxHeight: '300px', objectFit: 'cover' }}
                                    />
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <p><strong>Tiêu đề:</strong> {selectedBanner.title}</p>
                                    <p><strong>Link:</strong>
                                        <a href={selectedBanner.linkUrl} target="_blank" rel="noopener noreferrer" className="ms-2">
                                            {selectedBanner.linkUrl}
                                        </a>
                                    </p>
                                    <p><strong>Vị trí:</strong> {selectedBanner.position}</p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Trạng thái:</strong>
                                        <Badge bg={getStatusBadgeVariant(selectedBanner.status)} className="ms-2">
                                            {getStatusText(selectedBanner.status)}
                                        </Badge>
                                    </p>
                                    <p><strong>Xuất bản:</strong>
                                        <span className={selectedBanner.isPublished ? 'text-success' : 'text-danger'}>
                                            {selectedBanner.isPublished ? ' Có' : ' Không'}
                                        </span>
                                    </p>
                                    <p><strong>Người tạo:</strong> {selectedBanner.createdBy}</p>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <p><strong>Ngày bắt đầu:</strong> {formatDate(selectedBanner.startDate)}</p>
                                    <p><strong>Ngày kết thúc:</strong> {formatDate(selectedBanner.endDate)}</p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Ngày tạo:</strong> {formatDate(selectedBanner.createdAt)}</p>
                                </Col>
                            </Row>

                            <Card className="bg-light">
                                <Card.Body>
                                    <h6>Thống kê hiệu suất</h6>
                                    <Row>
                                        <Col md={4}>
                                            <div className="text-center">
                                                <h4 className="text-info">{selectedBanner.viewCount.toLocaleString()}</h4>
                                                <small className="text-muted">Lượt xem</small>
                                            </div>
                                        </Col>
                                        <Col md={4}>
                                            <div className="text-center">
                                                <h4 className="text-success">{selectedBanner.clickCount.toLocaleString()}</h4>
                                                <small className="text-muted">Lượt click</small>
                                            </div>
                                        </Col>
                                        <Col md={4}>
                                            <div className="text-center">
                                                <h4 className="text-warning">
                                                    {selectedBanner.viewCount > 0 ? ((selectedBanner.clickCount / selectedBanner.viewCount) * 100).toFixed(2) : 0}%
                                                </h4>
                                                <small className="text-muted">CTR</small>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </div>
                    )}

                    {(modalType === 'create' || modalType === 'edit') && (
                        <Form>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tiêu đề banner</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Nhập tiêu đề banner..."
                                            defaultValue={selectedBanner?.title || ''}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Vị trí hiển thị</Form.Label>
                                        <Form.Select defaultValue={selectedBanner?.position || 1}>
                                            <option value={1}>Vị trí 1 (Cao nhất)</option>
                                            <option value={2}>Vị trí 2</option>
                                            <option value={3}>Vị trí 3</option>
                                            <option value={4}>Vị trí 4</option>
                                            <option value={5}>Vị trí 5</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>URL hình ảnh</Form.Label>
                                <Form.Control
                                    type="url"
                                    placeholder="https://example.com/banner-image.jpg"
                                    defaultValue={selectedBanner?.imageUrl || ''}
                                />
                                <Form.Text className="text-muted">
                                    Kích thước khuyến nghị: 800x300px
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Link điều hướng</Form.Label>
                                <Form.Control
                                    type="url"
                                    placeholder="/promotions/january hoặc https://external-link.com"
                                    defaultValue={selectedBanner?.linkUrl || ''}
                                />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ngày bắt đầu</Form.Label>
                                        <Form.Control
                                            type="date"
                                            defaultValue={selectedBanner?.startDate || ''}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ngày kết thúc</Form.Label>
                                        <Form.Control
                                            type="date"
                                            defaultValue={selectedBanner?.endDate || ''}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Trạng thái</Form.Label>
                                        <Form.Select defaultValue={selectedBanner?.status || 'PENDING'}>
                                            <option value="ACTIVE">Hoạt động</option>
                                            <option value="INACTIVE">Không hoạt động</option>
                                            <option value="PENDING">Chờ duyệt</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Xuất bản</Form.Label>
                                        <Form.Check
                                            type="switch"
                                            label="Xuất bản ngay khi tạo"
                                            defaultChecked={selectedBanner?.isPublished || false}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Đóng
                    </Button>
                    {modalType === 'view' && selectedBanner && (
                        <>
                            {selectedBanner.isPublished ? (
                                <Button 
                                    variant="warning" 
                                    onClick={() => handleUnpublishBanner(selectedBanner.id)}
                                >
                                    <FaToggleOff className="me-1" />
                                    Hủy xuất bản
                                </Button>
                            ) : (
                                <Button 
                                    variant="success" 
                                    onClick={() => handlePublishBanner(selectedBanner.id)}
                                >
                                    <FaToggleOn className="me-1" />
                                    Xuất bản
                                </Button>
                            )}
                            <Button variant="primary" onClick={() => handleEditBanner(selectedBanner)}>
                                <FaEdit className="me-1" />
                                Chỉnh sửa
                            </Button>
                            <Button 
                                variant="danger" 
                                onClick={() => handleDeleteBanner(selectedBanner.id)}
                            >
                                <FaTrash className="me-1" />
                                Xóa
                            </Button>
                        </>
                    )}
                    {(modalType === 'create' || modalType === 'edit') && (
                        <Button variant="primary">
                            {modalType === 'create' ? 'Tạo banner' : 'Cập nhật'}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BannerManagement;