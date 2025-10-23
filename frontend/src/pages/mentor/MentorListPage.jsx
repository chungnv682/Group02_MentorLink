import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Card,
    Spinner,
    Alert,
    Pagination,
    Badge,
    InputGroup
} from 'react-bootstrap';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import useMentors from '../../hooks/useMentors';
import MentorCard from '../../components/mentor/MentorCard';
import '../../styles/components/MentorList.css';

const MentorListPage = () => {
    const { mentors, loading, error, pagination, fetchMentors } = useMentors();

    const [filters, setFilters] = useState({
        keyword: '',
        sort: 'numberOfBooking:desc',
        page: 0,
        size: 12,
        gender: '',
        minRating: '',
        location: '',
        approvedCountry: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    // Fetch mentors khi component mount hoặc filters thay đổi
    useEffect(() => {
        fetchMentors(filters);
    }, [filters]);

    // Cleanup timeout when component unmounts
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        setFilters(prev => ({
            ...prev,
            keyword: searchTerm,
            page: 0
        }));
    };

    // Handle real-time search with debounce
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setIsSearching(true);

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout for debounced search
        const newTimeout = setTimeout(() => {
            setFilters(prev => ({
                ...prev,
                keyword: value,
                page: 0
            }));
            setIsSearching(false);
        }, 500); // Debounce 500ms

        setSearchTimeout(newTimeout);
    };    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 0 // Reset to first page when filters change
        }));
    };

    // Handle pagination
    const handlePageChange = (pageNumber) => {
        setFilters(prev => ({
            ...prev,
            page: pageNumber
        }));
    };

    // Clear filters
    const clearFilters = () => {
        setSearchTerm('');
        setFilters({
            keyword: '',
            sort: 'numberOfBooking:desc',
            page: 0,
            size: 12,
            gender: '',
            minRating: '',
            location: '',
            approvedCountry: ''
        });
    };

    // Sort options
    const sortOptions = [
        { value: 'numberOfBooking:desc', label: 'Nhiều booking nhất' },
        { value: 'rating:desc', label: 'Đánh giá cao nhất' },
        { value: 'rating:asc', label: 'Đánh giá thấp nhất' },
        { value: 'fullname:asc', label: 'Tên A-Z' },
        { value: 'fullname:desc', label: 'Tên Z-A' }
    ];

    // Page size options
    const pageSizeOptions = [6, 12, 24, 48];

    // Generate pagination items
    const generatePaginationItems = () => {
        const items = [];
        const { pageNumber, totalPages } = pagination;

        // Previous button
        items.push(
            <Pagination.Prev
                key="prev"
                disabled={pageNumber === 0}
                onClick={() => handlePageChange(pageNumber - 1)}
            />
        );

        // Page numbers
        for (let i = 0; i < totalPages; i++) {
            if (
                i === 0 || // First page
                i === totalPages - 1 || // Last page
                (i >= pageNumber - 1 && i <= pageNumber + 1) // Current page ± 1
            ) {
                items.push(
                    <Pagination.Item
                        key={i}
                        active={i === pageNumber}
                        onClick={() => handlePageChange(i)}
                    >
                        {i + 1}
                    </Pagination.Item>
                );
            } else if (
                i === pageNumber - 2 ||
                i === pageNumber + 2
            ) {
                items.push(<Pagination.Ellipsis key={`ellipsis-${i}`} />);
            }
        }

        // Next button
        items.push(
            <Pagination.Next
                key="next"
                disabled={pageNumber >= totalPages - 1}
                onClick={() => handlePageChange(pageNumber + 1)}
            />
        );

        return items;
    };

    return (
        <Container fluid className="mentor-list-page py-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-0">Tìm Mentor</h2>
                            <p className="text-muted mb-0">
                                Khám phá và kết nối với các mentor phù hợp với bạn
                            </p>
                        </div>
                        <Badge bg="info" className="fs-6">
                            {pagination.totalElements} mentors
                        </Badge>
                    </div>
                </Col>
            </Row>

            {/* Search and Filter Bar */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body className="bg-light rounded">
                    <div>
                        <Row className="align-items-end">
                            <Col md={6} lg={4}>
                                <Form.Group className="mb-3 mb-md-0">
                                    <Form.Label>Tìm kiếm</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            placeholder="Gõ để tìm kiếm mentor..."
                                            value={searchTerm}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                        />
                                        <InputGroup.Text className="bg-primary text-white">
                                            {isSearching ? (
                                                <Spinner animation="border" size="sm" />
                                            ) : (
                                                <FaSearch />
                                            )}
                                        </InputGroup.Text>
                                    </InputGroup>
                                    {searchTerm && (
                                        <Form.Text className="text-muted">
                                            {isSearching ? 'Đang tìm kiếm...' : `Tìm thấy ${pagination.totalElements} mentor`}
                                        </Form.Text>
                                    )}
                                </Form.Group>
                            </Col>

                            <Col md={3} lg={2}>
                                <Form.Group className="mb-3 mb-md-0">
                                    <Form.Label>Sắp xếp</Form.Label>
                                    <Form.Select
                                        value={filters.sort}
                                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                                    >
                                        {sortOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={3} lg={2}>
                                <Form.Group className="mb-3 mb-md-0">
                                    <Form.Label>Hiển thị</Form.Label>
                                    <Form.Select
                                        value={filters.size}
                                        onChange={(e) => handleFilterChange('size', parseInt(e.target.value))}
                                    >
                                        {pageSizeOptions.map(size => (
                                            <option key={size} value={size}>
                                                {size} mentors
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={12} lg={4}>
                                <div className="d-flex gap-2 justify-content-md-end">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <FaFilter className="me-1" />
                                        Bộ lọc {showFilters && <FaTimes className="ms-1" />}
                                    </Button>

                                    {(filters.keyword || filters.sort !== 'numberOfBooking:desc' || filters.gender || filters.minRating || filters.location || filters.approvedCountry) && (
                                        <Button variant="outline-danger" onClick={clearFilters}>
                                            <FaTimes className="me-1" />
                                            Xóa bộ lọc
                                        </Button>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        {/* Extended Filters */}
                        {showFilters && (
                            <Row className="mt-3 pt-3 border-top">
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Giới tính</Form.Label>
                                        <Form.Select
                                            value={filters.gender}
                                            onChange={(e) => handleFilterChange('gender', e.target.value)}
                                        >
                                            <option value="">Tất cả</option>
                                            <option value="M">Nam</option>
                                            <option value="F">Nữ</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Đánh giá tối thiểu</Form.Label>
                                        <Form.Select
                                            value={filters.minRating}
                                            onChange={(e) => handleFilterChange('minRating', e.target.value)}
                                        >
                                            <option value="">Tất cả</option>
                                            <option value="4.5">4.5+ sao</option>
                                            <option value="4">4+ sao</option>
                                            <option value="3.5">3.5+ sao</option>
                                            <option value="3">3+ sao</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Địa điểm</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Thành phố..."
                                            value={filters.location}
                                            onChange={(e) => handleFilterChange('location', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Nước hỗ trợ du học</Form.Label>
                                        <Form.Select
                                            value={filters.approvedCountry}
                                            onChange={(e) => handleFilterChange('approvedCountry', e.target.value)}
                                        >
                                            <option value="">Tất cả các nước</option>
                                            <option value="Mỹ">Mỹ</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Úc">Úc</option>
                                            <option value="Anh">Anh</option>
                                            <option value="Nhật">Nhật Bản</option>
                                            <option value="Hàn">Hàn Quốc</option>
                                            <option value="Đức">Đức</option>
                                            <option value="Pháp">Pháp</option>
                                            <option value="Singapore">Singapore</option>
                                            <option value="Thụy Điển">Thụy Điển</option>
                                            <option value="Hà Lan">Hà Lan</option>
                                            <option value="New Zealand">New Zealand</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}
                    </div>
                </Card.Body>
            </Card>

            {/* Results */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Đang tải danh sách mentor...</p>
                </div>
            ) : error ? (
                <Alert variant="danger">
                    <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={() => fetchMentors(filters)}>
                        Thử lại
                    </Button>
                </Alert>
            ) : mentors.length === 0 ? (
                <Alert variant="info" className="text-center">
                    <h5>Không tìm thấy mentor nào</h5>
                    <p>Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                </Alert>
            ) : (
                <>
                    {/* Mentor Grid */}
                    <Row>
                        {mentors.map((mentor) => (
                            <Col key={mentor.id} lg={3} md={4} sm={6} className="mb-4">
                                <MentorCard mentor={mentor} />
                            </Col>
                        ))}
                    </Row>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <Row className="mt-4">
                            <Col>
                                <div className="d-flex justify-content-center">
                                    <Pagination>
                                        {generatePaginationItems()}
                                    </Pagination>
                                </div>

                                <div className="text-center text-muted mt-2">
                                    Hiển thị {pagination.pageNumber * pagination.pageSize + 1} - {' '}
                                    {Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)} {' '}
                                    trong tổng số {pagination.totalElements} mentors
                                </div>
                            </Col>
                        </Row>
                    )}
                </>
            )}
        </Container>
    );
};

export default MentorListPage;
