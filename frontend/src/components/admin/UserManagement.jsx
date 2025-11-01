import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form,
    InputGroup, Dropdown, Modal, Nav, Tab, Spinner, Alert, Pagination
} from 'react-bootstrap';
import {
    FaSearch, FaFilter, FaPlus, FaEdit, FaTrash,
    FaBan, FaCheck, FaEye, FaDownload, FaUserShield
} from 'react-icons/fa';
import { getAllUsers, getUserById, deleteUser, getUserStatistics } from '../../services/user';

const UserManagement = () => {
    // State management
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    
    // Data states
    const [users, setUsers] = useState([]);
    const [statistics, setStatistics] = useState({
        totalUsers: 0,
        totalMentors: 0,
        totalMentorPending: 0,
        totalUserBlocked: 0
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0
    });
    
    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // Fetch statistics on component mount
    useEffect(() => {
        fetchStatistics();
    }, []);

    // Fetch users when filters or pagination change
    useEffect(() => {
        fetchUsers();
    }, [pagination.currentPage, pagination.pageSize, filterRole, filterStatus, searchTerm]);

    const fetchStatistics = async () => {
        try {
            setStatsLoading(true);
            const response = await getUserStatistics();
            console.log('Statistics response:', response); // Debug log
            if (response && response.data) {
                setStatistics(response.data);
            }
        } catch (err) {
            console.error('Error fetching statistics:', err);
            // Set default values on error
            setStatistics({
                totalUsers: 0,
                totalMentors: 0,
                totalMentorPending: 0,
                totalUserBlocked: 0
            });
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {
                page: pagination.currentPage,
                size: pagination.pageSize,
                keySearch: searchTerm || null,
                roleId: filterRole !== 'all' ? getRoleId(filterRole) : null,
                status: filterStatus !== 'all' ? getStatusValue(filterStatus) : null
            };

            console.log('Fetching users with params:', params); // Debug log
            const response = await getAllUsers(params);
            console.log('Response:', response); // Debug log
            
            if (response && response.data) {
                const pageData = response.data;
                console.log('Page data:', pageData); // Debug log
                setUsers(pageData.content || []);
                setPagination(prev => ({
                    ...prev,
                    totalPages: pageData.totalPages || 0,
                    totalElements: pageData.totalElements || 0,
                    currentPage: pageData.currentPage || pagination.currentPage
                }));
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.description || err.message || 'Không thể tải danh sách người dùng');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const getRoleId = (role) => {
        const roleMap = {
            'ADMIN': 1,
            'MODERATOR': 2,
            'MENTOR': 3,
            'CUSTOMER': 4
        };
        return roleMap[role] || null;
    };

    const getStatusValue = (status) => {
        const statusMap = {
            'ACTIVE': 1,
            'INACTIVE': 0,
            'PENDING': 2,
            'BLOCKED': 3
        };
        return statusMap[status];
    };

    const handleViewUser = async (user) => {
        try {
            const response = await getUserById(user.id);
            console.log('User detail response:', response); // Debug log
            if (response && response.data) {
                setSelectedUser(response.data);
                setShowModal(true);
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
            alert('Không thể tải thông tin người dùng');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            return;
        }

        try {
            const response = await deleteUser(userId);
            console.log('Delete user response:', response); // Debug log
            if (response && response.respCode === '0') {
                alert('Xóa người dùng thành công');
                fetchUsers();
                fetchStatistics();
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(err.description || 'Không thể xóa người dùng');
        }
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        fetchUsers();
    };

    const handlePageChange = (pageNumber) => {
        setPagination(prev => ({ ...prev, currentPage: pageNumber }));
    };

    const roles = [
        { value: 'all', label: 'Tất cả vai trò' },
        { value: 'ADMIN', label: 'Quản trị viên' },
        { value: 'MODERATOR', label: 'Điều hành viên' },
        { value: 'MENTOR', label: 'Cố vấn' },
        { value: 'CUSTOMER', label: 'Khách hàng' }
    ];

    const statuses = [
        { value: 'all', label: 'Tất cả trạng thái' },
        { value: 'ACTIVE', label: 'Hoạt động' },
        { value: 'INACTIVE', label: 'Không hoạt động' },
        { value: 'PENDING', label: 'Chờ duyệt' },
        { value: 'BLOCKED', label: 'Bị khóa' }
    ];

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case 'ADMIN': return 'danger';
            case 'MODERATOR': return 'warning';
            case 'MENTOR': return 'success';
            case 'CUSTOMER': return 'primary';
            default: return 'secondary';
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'ACTIVE': return 'success';
            case 'INACTIVE': return 'secondary';
            case 'PENDING': return 'warning';
            case 'BLOCKED': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'ACTIVE': return 'Hoạt động';
            case 'INACTIVE': return 'Không hoạt động';
            case 'PENDING': return 'Chờ duyệt';
            case 'BLOCKED': return 'Bị khóa';
            default: return status;
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'ADMIN': return 'Quản trị viên';
            case 'MODERATOR': return 'Điều hành viên';
            case 'MENTOR': return 'Cố vấn';
            case 'CUSTOMER': return 'Khách hàng';
            default: return role;
        }
    };

    return (
        <div className="user-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Quản lý người dùng</h4>
                    <p className="text-muted mb-0">Quản lý tài khoản mentor và user trong hệ thống</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-success" size="sm">
                        <FaDownload className="me-1" />
                        Xuất Excel
                    </Button>
                    <Button variant="primary" size="sm">
                        <FaPlus className="me-1" />
                        Thêm người dùng
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="stats-card border-start border-primary border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Tổng người dùng</h6>
                                    <h3 className="mb-0 text-primary">
                                        {statsLoading ? <Spinner animation="border" size="sm" /> : statistics.totalUsers}
                                    </h3>
                                </div>
                                <div className="stats-icon bg-primary">
                                    <FaUserShield />
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
                                    <h6 className="text-muted mb-1">Mentor</h6>
                                    <h3 className="mb-0 text-success">
                                        {statsLoading ? <Spinner animation="border" size="sm" /> : statistics.totalMentors}
                                    </h3>
                                </div>
                                <div className="stats-icon bg-success">
                                    <FaUserShield />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="stats-card border-start border-warning border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Chờ duyệt</h6>
                                    <h3 className="mb-0 text-warning">
                                        {statsLoading ? <Spinner animation="border" size="sm" /> : statistics.totalMentorPending}
                                    </h3>
                                </div>
                                <div className="stats-icon bg-warning">
                                    <FaUserShield />
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
                                    <h6 className="text-muted mb-1">Bị khóa</h6>
                                    <h3 className="mb-0 text-danger">
                                        {statsLoading ? <Spinner animation="border" size="sm" /> : statistics.totalUserBlocked}
                                    </h3>
                                </div>
                                <div className="stats-icon bg-danger">
                                    <FaBan />
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
                        <Col md={4}>
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
                        <Col md={3}>
                            <Form.Label>Vai trò</Form.Label>
                            <Form.Select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                            >
                                {roles.map(role => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Label>Trạng thái</Form.Label>
                            <Form.Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                {statuses.map(status => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Button 
                                variant="outline-secondary" 
                                className="w-100"
                                onClick={handleSearch}
                            >
                                <FaFilter className="me-1" />
                                Lọc
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Users Table */}
            <Card>
                <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Danh sách người dùng ({pagination.totalElements})</h6>
                        <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm">Chọn tất cả</Button>
                            <Button variant="outline-danger" size="sm">Xóa đã chọn</Button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {error && (
                        <Alert variant="danger" className="m-3">
                            {error}
                        </Alert>
                    )}
                    
                    {loading ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </Spinner>
                            <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center p-5">
                            <p className="text-muted">Không tìm thấy người dùng nào</p>
                        </div>
                    ) : (
                        <Table responsive hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th width="5%">
                                        <Form.Check type="checkbox" />
                                    </th>
                                    <th width="20%">Thông tin</th>
                                    <th width="15%">Vai trò</th>
                                    <th width="12%">Trạng thái</th>
                                    <th width="15%">Email</th>
                                    <th width="15%">ID</th>
                                    <th width="18%">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <Form.Check type="checkbox" />
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="user-avatar me-3">
                                                    <div className="avatar-placeholder">
                                                        {user.fullName?.charAt(0) || 'U'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="fw-medium">{user.fullName || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg={getRoleBadgeVariant(user.role)}>
                                                {getRoleLabel(user.role)}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg={getStatusBadgeVariant(user.status)}>
                                                {getStatusLabel(user.status)}
                                            </Badge>
                                        </td>
                                        <td>
                                            <small className="text-muted">{user.email}</small>
                                        </td>
                                        <td>
                                            <span className="text-muted">#{user.id}</span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    onClick={() => handleViewUser(user)}
                                                >
                                                    <FaEye />
                                                </Button>
                                                <Button variant="outline-primary" size="sm">
                                                    <FaEdit />
                                                </Button>
                                                <Button variant="outline-warning" size="sm">
                                                    <FaBan />
                                                </Button>
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
                
                {/* Pagination */}
                {!loading && users.length > 0 && (
                    <Card.Footer className="bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-muted">
                                Hiển thị {((pagination.currentPage - 1) * pagination.pageSize) + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalElements)} 
                                {' '}trong tổng số {pagination.totalElements} người dùng
                            </div>
                            <Pagination className="mb-0">
                                <Pagination.First 
                                    onClick={() => handlePageChange(1)}
                                    disabled={pagination.currentPage === 1}
                                />
                                <Pagination.Prev 
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                />
                                {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = idx + 1;
                                    } else if (pagination.currentPage <= 3) {
                                        pageNum = idx + 1;
                                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + idx;
                                    } else {
                                        pageNum = pagination.currentPage - 2 + idx;
                                    }
                                    return (
                                        <Pagination.Item
                                            key={pageNum}
                                            active={pageNum === pagination.currentPage}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </Pagination.Item>
                                    );
                                })}
                                <Pagination.Next 
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                />
                                <Pagination.Last 
                                    onClick={() => handlePageChange(pagination.totalPages)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                />
                            </Pagination>
                        </div>
                    </Card.Footer>
                )}
            </Card>

            {/* User Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết người dùng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <Tab.Container defaultActiveKey="info">
                            <Nav variant="tabs" className="mb-3">
                                <Nav.Item>
                                    <Nav.Link eventKey="info">Thông tin cơ bản</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="activity">Hoạt động</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="settings">Cài đặt</Nav.Link>
                                </Nav.Item>
                            </Nav>
                            <Tab.Content>
                                <Tab.Pane eventKey="info">
                                    <Row>
                                        <Col md={6}>
                                            <p><strong>Email:</strong> {selectedUser.email}</p>
                                            <p><strong>Họ tên:</strong> {selectedUser.fullName || 'N/A'}</p>
                                            <p><strong>ID:</strong> #{selectedUser.id}</p>
                                        </Col>
                                        <Col md={6}>
                                            <p><strong>Trạng thái:</strong>
                                                <Badge bg={getStatusBadgeVariant(selectedUser.status)} className="ms-2">
                                                    {getStatusLabel(selectedUser.status)}
                                                </Badge>
                                            </p>
                                        </Col>
                                    </Row>
                                </Tab.Pane>
                                <Tab.Pane eventKey="activity">
                                    <p className="text-muted">Lịch sử hoạt động của người dùng sẽ hiển thị ở đây...</p>
                                </Tab.Pane>
                                <Tab.Pane eventKey="settings">
                                    <p className="text-muted">Cài đặt tài khoản sẽ hiển thị ở đây...</p>
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Đóng
                    </Button>
                    <Button variant="primary">
                        Chỉnh sửa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserManagement;