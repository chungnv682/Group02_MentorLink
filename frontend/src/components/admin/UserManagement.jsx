import React, { useState } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form,
    InputGroup, Dropdown, Modal, Nav, Tab
} from 'react-bootstrap';
import {
    FaSearch, FaFilter, FaPlus, FaEdit, FaTrash,
    FaBan, FaCheck, FaEye, FaDownload, FaUserShield
} from 'react-icons/fa';

const UserManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Mock data - thay thế bằng API call thực tế
    const users = [
        {
            id: 1,
            email: 'john.doe@example.com',
            fullname: 'John Doe',
            role: 'CUSTOMER',
            status: 'ACTIVE',
            phone: '0901234567',
            lastLogin: '2024-01-15',
            joinDate: '2023-06-10',
            avatar: null,
            isBlocked: false
        },
        {
            id: 2,
            email: 'jane.mentor@example.com',
            fullname: 'Jane Smith',
            role: 'MENTOR',
            status: 'ACTIVE',
            phone: '0907654321',
            lastLogin: '2024-01-14',
            joinDate: '2023-05-20',
            avatar: null,
            isBlocked: false
        },
        {
            id: 3,
            email: 'admin@mentorlink.com',
            fullname: 'Admin User',
            role: 'ADMIN',
            status: 'ACTIVE',
            phone: '0901111111',
            lastLogin: '2024-01-15',
            joinDate: '2023-01-01',
            avatar: null,
            isBlocked: false
        }
    ];

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

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

        return matchesSearch && matchesRole && matchesStatus;
    });

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
                                    <h3 className="mb-0 text-primary">1,234</h3>
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
                                    <h3 className="mb-0 text-success">89</h3>
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
                                    <h3 className="mb-0 text-warning">12</h3>
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
                                    <h3 className="mb-0 text-danger">5</h3>
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
                            <Button variant="outline-secondary" className="w-100">
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
                        <h6 className="mb-0">Danh sách người dùng ({filteredUsers.length})</h6>
                        <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm">Chọn tất cả</Button>
                            <Button variant="outline-danger" size="sm">Xóa đã chọn</Button>
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
                                <th width="20%">Thông tin</th>
                                <th width="15%">Vai trò</th>
                                <th width="12%">Trạng thái</th>
                                <th width="15%">Điện thoại</th>
                                <th width="15%">Đăng nhập cuối</th>
                                <th width="18%">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <Form.Check type="checkbox" />
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="user-avatar me-3">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.fullname}
                                                        className="rounded-circle"
                                                        width="40"
                                                        height="40"
                                                    />
                                                ) : (
                                                    <div className="avatar-placeholder">
                                                        {user.fullname?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="fw-medium">{user.fullname}</div>
                                                <small className="text-muted">{user.email}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg={getRoleBadgeVariant(user.role)}>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg={getStatusBadgeVariant(user.status)}>
                                            {user.status}
                                        </Badge>
                                        {user.isBlocked && (
                                            <Badge bg="danger" className="ms-1">
                                                <FaBan className="me-1" />
                                                Khóa
                                            </Badge>
                                        )}
                                    </td>
                                    <td>
                                        <span className="text-muted">{user.phone || 'Chưa cập nhật'}</span>
                                    </td>
                                    <td>
                                        <span className="text-muted">{user.lastLogin}</span>
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
                                            <Button variant="outline-danger" size="sm">
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
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
                                            <p><strong>Họ tên:</strong> {selectedUser.fullname}</p>
                                            <p><strong>Điện thoại:</strong> {selectedUser.phone || 'Chưa cập nhật'}</p>
                                            <p><strong>Vai trò:</strong>
                                                <Badge bg={getRoleBadgeVariant(selectedUser.role)} className="ms-2">
                                                    {selectedUser.role}
                                                </Badge>
                                            </p>
                                        </Col>
                                        <Col md={6}>
                                            <p><strong>Trạng thái:</strong>
                                                <Badge bg={getStatusBadgeVariant(selectedUser.status)} className="ms-2">
                                                    {selectedUser.status}
                                                </Badge>
                                            </p>
                                            <p><strong>Ngày tham gia:</strong> {selectedUser.joinDate}</p>
                                            <p><strong>Đăng nhập cuối:</strong> {selectedUser.lastLogin}</p>
                                            <p><strong>Trạng thái khóa:</strong>
                                                <span className={selectedUser.isBlocked ? 'text-danger' : 'text-success'}>
                                                    {selectedUser.isBlocked ? ' Đã khóa' : ' Bình thường'}
                                                </span>
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