import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Badge,
  Form,
  InputGroup,
  Dropdown,
  Modal,
  Nav,
  Tab,
  Spinner,
  Alert,
  Pagination,
} from "react-bootstrap";
import {
  FaSearch,
  FaFilter,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBan,
  FaCheck,
  FaEye,
  FaDownload,
  FaUserShield,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  getAllUsers,
  getAdminUserDetailById,
  deleteUser,
  getUserStatistics,
  toggleUserStatus,
  rejectMentor,
  createUser,
} from "../../services/user";

const UserManagement = () => {
  // State management
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [userToReject, setUserToReject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Add user modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    fullName: "",
    roleId: 1,
    phone: "",
    gender: "",
  });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Data states
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalMentors: 0,
    totalMentorPending: 0,
    totalUserBlocked: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0,
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState(new Set());
  const headerCheckboxRef = useRef(null);

  // Fetch statistics on component mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  // Fetch users when filters or pagination change
  useEffect(() => {
    fetchUsers();
  }, [
    pagination.currentPage,
    pagination.pageSize,
    filterRole,
    filterStatus,
    searchTerm,
  ]);

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await getUserStatistics();
      console.log("Statistics response:", response); // Debug log
      if (response && response.data) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error("Error fetching statistics:", err);
      // Set default values on error
      setStatistics({
        totalUsers: 0,
        totalMentors: 0,
        totalMentorPending: 0,
        totalUserBlocked: 0,
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
        roleId: filterRole !== "all" ? getRoleId(filterRole) : null,
        status: filterStatus !== "all" ? getStatusValue(filterStatus) : null,
      };

      console.log("Fetching users with params:", params); // Debug log
      const response = await getAllUsers(params);
      console.log("Response:", response); // Debug log

      if (response && response.data) {
        const pageData = response.data;
        console.log("Page data:", pageData); // Debug log
        setUsers(pageData.content || []);
        // Ensure selection set doesn't include users that no longer exist (e.g., after filtering)
        setSelectedIds((prev) => {
          if (!prev || prev.size === 0) return prev;
          const valid = new Set(prev);
          const currentIds = new Set((pageData.content || []).map((u) => u.id));
          // Keep selection across pages; do not prune unless the user is totally gone from dataset
          // We can't know global dataset, so keep as-is
          return valid;
        });
        setPagination((prev) => ({
          ...prev,
          totalPages: pageData.totalPages || 0,
          totalElements: pageData.totalElements || 0,
          currentPage: pageData.currentPage || pagination.currentPage,
        }));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(
        err.description || err.message || "Không thể tải danh sách người dùng"
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Helpers for roles/status mapping remain unchanged

  const getRoleId = (role) => {
    const roleMap = {
      ADMIN: 1,
      MODERATOR: 2,
      MENTOR: 3,
      CUSTOMER: 4,
    };
    return roleMap[role] || null;
  };

  const getStatusValue = (status) => {
    const statusMap = {
      ACTIVE: 1,
      INACTIVE: 0,
      PENDING: 2,
      BLOCKED: 3,
    };
    return statusMap[status];
  };

  const handleViewUser = async (user) => {
    try {
      const response = await getAdminUserDetailById(user.id);
      console.log("Admin user detail response:", response); // Debug log
      if (response && response.data) {
        setSelectedUser(response.data);
        setShowModal(true);
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      alert("Không thể tải thông tin người dùng");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      return;
    }

    try {
      const response = await deleteUser(userId);
      console.log("Delete user response:", response); // Debug log
      if (response && response.respCode === "0") {
        alert("Xóa người dùng thành công");
        fetchUsers();
        fetchStatistics();
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(err.description || "Không thể xóa người dùng");
    }
  };

  const handleToggleUserStatus = async (user) => {
    // Không cho phép toggle nếu user đang ở trạng thái PENDING
    if (user.status === "PENDING") {
      alert("Không thể thay đổi trạng thái của người dùng đang chờ duyệt. Vui lòng duyệt hoặc từ chối trước.");
      return;
    }

    const isActive = user.status === "ACTIVE";
    const action = isActive ? "vô hiệu hóa" : "kích hoạt";
    const newStatus = isActive ? "INACTIVE" : "ACTIVE";
    
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} người dùng này?`)) {
      return;
    }

    try {
      const response = await toggleUserStatus(user.id);
      console.log("Toggle user status response:", response); // Debug log
      if (response && response.respCode === "0") {
        alert(response.description || `${action.charAt(0).toUpperCase() + action.slice(1)} người dùng thành công`);
        fetchUsers();
        fetchStatistics();
      }
    } catch (err) {
      console.error("Error toggling user status:", err);
      alert(err.description || `Không thể ${action} người dùng`);
    }
  };

  const handleOpenRejectModal = (user) => {
    setUserToReject(user);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setUserToReject(null);
    setRejectionReason("");
  };

  const handleRejectMentor = async () => {
    if (!rejectionReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      const response = await rejectMentor(userToReject.id, rejectionReason);
      console.log("Reject mentor response:", response);
      if (response && response.respCode === "0") {
        alert("Đã từ chối mentor và gửi email thông báo thành công");
        handleCloseRejectModal();
        fetchUsers();
        fetchStatistics();
      }
    } catch (err) {
      console.error("Error rejecting mentor:", err);
      alert(err.description || "Không thể từ chối mentor");
    }
  };

  const handleOpenAddUserModal = () => {
    setNewUserData({
      email: "",
      password: "",
      fullName: "",
      roleId: 4,
      phone: "",
      gender: "",
    });
    setShowPassword(false);
    setShowAddUserModal(true);
  };

  const handleCloseAddUserModal = () => {
    setShowAddUserModal(false);
    setNewUserData({
      email: "",
      password: "",
      fullName: "",
      roleId: 4,
      phone: "",
      gender: "",
    });
    setShowPassword(false);
  };

  const handleAddUser = async () => {
    // Validation
    if (!newUserData.email || !newUserData.password || !newUserData.fullName) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc (Email, Mật khẩu, Họ tên)");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserData.email)) {
      alert("Email không hợp lệ");
      return;
    }

    // Password validation
    if (newUserData.password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setAddUserLoading(true);
      const userData = {
        email: newUserData.email.trim(),
        password: newUserData.password,
        fullName: newUserData.fullName.trim(),
        roleId: parseInt(newUserData.roleId),
      };

      // Add optional fields
      if (newUserData.phone && newUserData.phone.trim()) {
        userData.phone = newUserData.phone.trim();
      }
      if (newUserData.gender && newUserData.gender !== "") {
        userData.gender = newUserData.gender;
      }

      const response = await createUser(userData);
      console.log("Create user response:", response);
      
      if (response && response.respCode === "0") {
        alert("Tạo người dùng thành công!");
        handleCloseAddUserModal();
        fetchUsers();
        fetchStatistics();
      }
    } catch (err) {
      console.error("Error creating user:", err);
      alert(err.description || err.message || "Không thể tạo người dùng");
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchUsers();
  };

  const handlePageChange = (pageNumber) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }));
  };

  const roles = [
    { value: "all", label: "Tất cả vai trò" },
    { value: "ADMIN", label: "Quản trị viên" },
    { value: "MODERATOR", label: "Điều hành viên" },
    { value: "MENTOR", label: "Cố vấn" },
    { value: "CUSTOMER", label: "Khách hàng" },
  ];

  const statuses = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "ACTIVE", label: "Hoạt động" },
    { value: "INACTIVE", label: "Không hoạt động" },
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "BLOCKED", label: "Bị khóa" },
  ];

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "ADMIN":
        return "danger";
      case "MODERATOR":
        return "warning";
      case "MENTOR":
        return "success";
      case "CUSTOMER":
        return "primary";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "danger";
      case "PENDING":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Hoạt động";
      case "INACTIVE":
        return "Không hoạt động";
      case "PENDING":
        return "Chờ duyệt";
      default:
        return status;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "MODERATOR":
        return "Điều hành viên";
      case "MENTOR":
        return "Cố vấn";
      case "CUSTOMER":
        return "Khách hàng";
      default:
        return role;
    }
  };

  // ===== Bulk selection helpers =====
  const currentPageIds = users.map((u) => u.id);
  const allSelectedOnPage =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedIds.has(id));
  const someSelectedOnPage =
    currentPageIds.some((id) => selectedIds.has(id)) && !allSelectedOnPage;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelectedOnPage;
    }
  }, [someSelectedOnPage]);

  const toggleSelectUser = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllCurrentPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelectedOnPage) {
        // Unselect all on current page
        currentPageIds.forEach((id) => next.delete(id));
      } else {
        // Select all on current page
        currentPageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (
      !window.confirm(`Bạn có chắc chắn muốn xóa ${count} người dùng đã chọn?`)
    )
      return;
    try {
      const ids = Array.from(selectedIds);
      const results = await Promise.allSettled(ids.map((id) => deleteUser(id)));
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        alert(
          `Một số người dùng không thể xóa (${failed.length}/${ids.length}).`
        );
      } else {
        alert("Xóa người dùng đã chọn thành công");
      }
      setSelectedIds(new Set());
      await fetchUsers();
      await fetchStatistics();
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert("Có lỗi xảy ra khi xóa nhiều người dùng");
    }
  };

  return (
    <div className="user-management">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Quản lý người dùng</h4>
        </div>
        <div className="d-flex gap-2">
          {/* <Button variant="outline-success" size="sm">
            <FaDownload className="me-1" />
            Xuất Excel
          </Button> */}
          <Button variant="primary" size="sm" onClick={handleOpenAddUserModal}>
            <FaPlus className="me-1" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      {/* Stats Cards - simple version */}
      <Row className="mb-3 g-3">
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-1">Tổng người dùng</h6>
              <h4 className="fw-semibold mb-0">
                {statsLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  statistics.totalUsers
                )}
              </h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-1">Mentor</h6>
              <h4 className="fw-semibold mb-0">
                {statsLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  statistics.totalMentors
                )}
              </h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-1">Chờ duyệt</h6>
              <h4 className="fw-semibold mb-0">
                {statsLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  statistics.totalMentorPending
                )}
              </h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-1">Bị khóa</h6>
              <h4 className="fw-semibold mb-0">
                {statsLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  statistics.totalUserBlocked
                )}
              </h4>
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
                {roles.map((role) => (
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
                {statuses.map((status) => (
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
            <h6 className="mb-0">
              Danh sách người dùng ({pagination.totalElements})
            </h6>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleSelectAllCurrentPage}
                disabled={users.length === 0}
              >
                Chọn tất cả
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0}
              >
                Xóa đã chọn{" "}
                {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
              </Button>
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
                  <th width="4%">
                    <Form.Check
                      type="checkbox"
                      checked={allSelectedOnPage}
                      onChange={handleSelectAllCurrentPage}
                      ref={headerCheckboxRef}
                    />
                  </th>
                  <th width="28%">Thông tin</th>
                  <th width="14%">Vai trò</th>
                  <th width="14%">Trạng thái</th>
                  <th width="30%">Email</th>
                  <th width="10%">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="user-avatar me-3">
                          <div className="avatar-placeholder">
                            {user.fullName?.charAt(0) || "U"}
                          </div>
                        </div>
                        <div>
                          <div className="fw-medium">
                            {user.fullName || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleLabel(user.roleName)}</td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(user.status)}>
                        {getStatusLabel(user.status)}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">{user.email}</small>
                    </td>
                    <td>
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          variant="light"
                          size="sm"
                          aria-label="Thao tác"
                          className="no-caret"
                        >
                          <BsThreeDotsVertical />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleViewUser(user)}>
                            <FaEye className="me-2" />
                            Xem
                          </Dropdown.Item>
                          
                          {user.status === "PENDING" ? (
                            // Mentor đang chờ duyệt - hiển thị Duyệt/Từ chối
                            <>
                              <Dropdown.Item 
                                onClick={() => alert("Chức năng duyệt mentor đang được phát triển")}
                                className="text-success"
                              >
                                <FaCheck className="me-2" />
                                Duyệt
                              </Dropdown.Item>
                              <Dropdown.Item 
                                onClick={() => handleOpenRejectModal(user)}
                                className="text-warning"
                              >
                                <FaBan className="me-2" />
                                Từ chối
                              </Dropdown.Item>
                            </>
                          ) : user.status === "ACTIVE" ? (
                            // User đang hoạt động - hiển thị Vô hiệu hóa
                            <Dropdown.Item 
                              onClick={() => handleToggleUserStatus(user)}
                              className="text-warning"
                            >
                              <FaBan className="me-2" />
                              Vô hiệu hóa
                            </Dropdown.Item>
                          ) : (
                            // User không hoạt động - hiển thị Kích hoạt
                            <Dropdown.Item 
                              onClick={() => handleToggleUserStatus(user)}
                              className="text-success"
                            >
                              <FaCheck className="me-2" />
                              Kích hoạt
                            </Dropdown.Item>
                          )}
                          
                          <Dropdown.Divider />
                          <Dropdown.Item
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-danger"
                          >
                            <FaTrash className="me-2" />
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

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <Card.Footer className="bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted">
                Hiển thị{" "}
                {(pagination.currentPage - 1) * pagination.pageSize + 1} -{" "}
                {Math.min(
                  pagination.currentPage * pagination.pageSize,
                  pagination.totalElements
                )}{" "}
                trong tổng số {pagination.totalElements} người dùng
              </div>
              <Pagination className="mb-0">
                <Pagination.Prev
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                />
                {[...Array(Math.min(5, pagination.totalPages))].map(
                  (_, idx) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (
                      pagination.currentPage >=
                      pagination.totalPages - 2
                    ) {
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
                  }
                )}
                <Pagination.Next
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
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
                      <p>
                        <strong>Email:</strong> {selectedUser.email || "N/A"}
                      </p>
                      <p>
                        <strong>Họ tên:</strong>{" "}
                        {selectedUser.fullName || "N/A"}
                      </p>
                      <p>
                        <strong>ID:</strong> #{selectedUser.id}
                      </p>
                      {selectedUser.phone && (
                        <p>
                          <strong>Số điện thoại:</strong> {selectedUser.phone}
                        </p>
                      )}
                      {selectedUser.dob && (
                        <p>
                          <strong>Ngày sinh:</strong> {new Date(selectedUser.dob).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                      {selectedUser.gender && (
                        <p>
                          <strong>Giới tính:</strong> {selectedUser.gender === "MALE" ? "Nam" : selectedUser.gender === "FEMALE" ? "Nữ" : selectedUser.gender}
                        </p>
                      )}
                    </Col>
                    <Col md={6}>
                      <p>
                        <strong>Vai trò:</strong>
                        <Badge bg={getRoleBadgeVariant(selectedUser.roleName)} className="ms-2">
                          {getRoleLabel(selectedUser.roleName)}
                        </Badge>
                      </p>
                      <p>
                        <strong>Trạng thái:</strong>
                        <Badge
                          bg={getStatusBadgeVariant(selectedUser.status)}
                          className="ms-2"
                        >
                          {getStatusLabel(selectedUser.status)}
                        </Badge>
                      </p>
                      {selectedUser.address && (
                        <p>
                          <strong>Địa chỉ:</strong> {selectedUser.address}
                        </p>
                      )}
                      {selectedUser.currentLocation && (
                        <p>
                          <strong>Vị trí hiện tại:</strong> {selectedUser.currentLocation}
                        </p>
                      )}
                      {selectedUser.createTime && (
                        <p>
                          <strong>Ngày tạo:</strong> {new Date(selectedUser.createTime).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                    </Col>
                  </Row>
                  
                  {/* Thông tin bổ sung */}
                  {(selectedUser.title || selectedUser.linkedinUrl || selectedUser.avatarUrl) && (
                    <Row className="mt-3">
                      <Col>
                        <hr />
                        <h6>Thông tin bổ sung</h6>
                        {selectedUser.title && (
                          <p>
                            <strong>Chức danh:</strong> {selectedUser.title}
                          </p>
                        )}
                        {selectedUser.linkedinUrl && (
                          <p>
                            <strong>LinkedIn:</strong>{" "}
                            <a href={selectedUser.linkedinUrl} target="_blank" rel="noopener noreferrer">
                              {selectedUser.linkedinUrl}
                            </a>
                          </p>
                        )}
                        {selectedUser.avatarUrl && (
                          <div>
                            <strong>Avatar:</strong>
                            <div className="mt-2">
                              <img 
                                src={selectedUser.avatarUrl} 
                                alt="Avatar" 
                                style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }}
                              />
                            </div>
                          </div>
                        )}
                      </Col>
                    </Row>
                  )}
                  
                  {selectedUser.intro && (
                    <Row className="mt-3">
                      <Col>
                        <hr />
                        <h6>Giới thiệu</h6>
                        <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{selectedUser.intro}</p>
                      </Col>
                    </Row>
                  )}
                  
                  {/* Thông tin mentor (nếu có) */}
                  {selectedUser.roleName === "MENTOR" && (selectedUser.rating !== undefined || selectedUser.numberOfBooking !== undefined) && (
                    <Row className="mt-3">
                      <Col>
                        <hr />
                        <h6>Thông tin Mentor</h6>
                        {selectedUser.rating !== undefined && (
                          <p>
                            <strong>Đánh giá:</strong> ⭐ {selectedUser.rating ? selectedUser.rating.toFixed(1) : '0.0'}/5
                          </p>
                        )}
                        {selectedUser.numberOfBooking !== undefined && (
                          <p>
                            <strong>Số lượng booking:</strong> {selectedUser.numberOfBooking || 0}
                          </p>
                        )}
                      </Col>
                    </Row>
                  )}
                  
                  {/* Thông tin tài khoản ngân hàng (nếu có) */}
                  {(selectedUser.bankName || selectedUser.bankAccountNumber) && (
                    <Row className="mt-3">
                      <Col>
                        <hr />
                        <h6>Thông tin thanh toán</h6>
                        {selectedUser.bankName && (
                          <p>
                            <strong>Ngân hàng:</strong> {selectedUser.bankName}
                          </p>
                        )}
                        {selectedUser.bankAccountNumber && (
                          <p>
                            <strong>Số tài khoản:</strong> {selectedUser.bankAccountNumber}
                          </p>
                        )}
                      </Col>
                    </Row>
                  )}
                </Tab.Pane>
                <Tab.Pane eventKey="activity">
                  <p className="text-muted">
                    Lịch sử hoạt động của người dùng sẽ hiển thị ở đây...
                  </p>
                </Tab.Pane>
                <Tab.Pane eventKey="settings">
                  <p className="text-muted">
                    Cài đặt tài khoản sẽ hiển thị ở đây...
                  </p>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          {/* <Button variant="primary">
                        Chỉnh sửa
                    </Button> */}
        </Modal.Footer>
      </Modal>

      {/* Add User Modal */}
      <Modal show={showAddUserModal} onHide={handleCloseAddUserModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2 text-primary" />
            Thêm người dùng mới
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong className="text-danger">* Email:</strong>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="user@example.com"
                    value={newUserData.email}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, email: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong className="text-danger">* Họ tên:</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={newUserData.fullName}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, fullName: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong className="text-danger">* Mật khẩu:</strong>
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Tối thiểu 6 ký tự"
                      value={newUserData.password}
                      onChange={(e) =>
                        setNewUserData({ ...newUserData, password: e.target.value })
                      }
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaBan /> : <FaEye />}
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Mật khẩu phải có ít nhất 6 ký tự
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong className="text-danger">* Vai trò:</strong>
                  </Form.Label>
                  <Form.Select
                    value={newUserData.roleId}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, roleId: parseInt(e.target.value) })
                    }
                    required
                  >
                    <option value={1}>Quản trị viên (Admin)</option>
                    <option value={2}>Điều hành viên (Moderator)</option>
                    <option value={3}>Cố vấn (Mentor)</option>
                    <option value={4}>Khách hàng (Customer)</option>
                  </Form.Select>
                  {newUserData.roleId === 1 && (
                    <Form.Text className="text-warning">
                      <FaUserShield className="me-1" />
                      Bạn đang tạo tài khoản Quản trị viên với đầy đủ quyền hạn
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại:</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="0123456789"
                    value={newUserData.phone}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, phone: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giới tính:</Form.Label>
                  <Form.Select
                    value={newUserData.gender}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, gender: e.target.value })
                    }
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="info" className="mb-0">
              <strong>📌 Lưu ý:</strong>
              <ul className="mb-0 mt-2">
                <li>Các trường có dấu <span className="text-danger">*</span> là bắt buộc</li>
                <li>Email phải là duy nhất trong hệ thống</li>
                <li>Tài khoản mới sẽ được tạo với trạng thái ACTIVE</li>
                {newUserData.roleId === 1 && (
                  <li className="text-warning">
                    <strong>Tài khoản Admin sẽ có toàn quyền quản trị hệ thống</strong>
                  </li>
                )}
              </ul>
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddUserModal} disabled={addUserLoading}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddUser}
            disabled={addUserLoading}
          >
            {addUserLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang tạo...
              </>
            ) : (
              <>
                <FaPlus className="me-2" />
                Tạo người dùng
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Mentor Modal */}
      <Modal show={showRejectModal} onHide={handleCloseRejectModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBan className="me-2 text-warning" />
            Từ chối đăng ký Mentor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToReject && (
            <>
              <Alert variant="warning">
                <strong>⚠️ Lưu ý:</strong> Sau khi từ chối, tài khoản sẽ bị xóa khỏi hệ thống và email thông báo sẽ được gửi đến mentor.
              </Alert>
              <div className="mb-3">
                <strong>Mentor:</strong> {userToReject.fullName || "N/A"}
                <br />
                <strong>Email:</strong> {userToReject.email}
              </div>
              <Form.Group>
                <Form.Label>
                  <strong className="text-danger">* Lý do từ chối:</strong>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Nhập lý do từ chối đăng ký mentor (ví dụ: thiếu kinh nghiệm, chứng chỉ không phù hợp...)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  maxLength={1000}
                />
                <Form.Text className="text-muted">
                  {rejectionReason.length}/1000 ký tự
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseRejectModal}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleRejectMentor}
            disabled={!rejectionReason.trim()}
          >
            <FaBan className="me-2" />
            Xác nhận từ chối
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
