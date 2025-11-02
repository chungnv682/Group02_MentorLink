import React from "react";
import { Card, Nav, Button } from "react-bootstrap";
import {
  FaUsers,
  FaBlog,
  FaUserCog,
  FaBullhorn,
  FaCog,
} from "react-icons/fa";

const AdminSidebar = ({ menuItems, activeTab }) => {
  return (
    <>
      {/* Main Menu */}
      <Card className="admin-sidebar">
        <Card.Body className="p-0">
          <div className="sidebar-header">
            <h6 className="mb-0">
              <FaCog className="me-2" />
              MENU QUẢN TRỊ
            </h6>
          </div>
          <Nav variant="pills" className="flex-column admin-nav">
            {menuItems.map((item) => (
              <Nav.Item key={item.key}>
                <Nav.Link
                  eventKey={item.key}
                  className="d-flex align-items-center justify-content-between py-3 px-3"
                >
                  <div className="d-flex align-items-center">
                    <span className="nav-icon me-3">{item.icon}</span>
                    <span className="nav-text">{item.title}</span>
                  </div>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-3 quick-actions">
        <Card.Body>
          <h6 className="text-muted mb-3">THAO TÁC NHANH</h6>
          <div className="d-grid gap-2">
            <Button variant="outline-primary" size="sm">
              <FaUsers className="me-2" />
              Thêm người dùng mới
            </Button>
            <Button variant="outline-success" size="sm">
              <FaUserCog className="me-2" />
              Duyệt mentor
            </Button>
            <Button variant="outline-warning" size="sm">
              <FaBlog className="me-2" />
              Kiểm duyệt blog
            </Button>
            <Button variant="outline-info" size="sm">
              <FaBullhorn className="me-2" />
              Tạo banner mới
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* System Status */}
      <Card className="mt-3 system-status">
        <Card.Body>
          <h6 className="text-muted mb-3">TRẠNG THÁI HỆ THỐNG</h6>
          <div className="status-item d-flex justify-content-between mb-2">
            <span>Máy chủ</span>
            <span className="badge bg-success">Hoạt động</span>
          </div>
          <div className="status-item d-flex justify-content-between mb-2">
            <span>Cơ sở dữ liệu</span>
            <span className="badge bg-success">Bình thường</span>
          </div>
          <div className="status-item d-flex justify-content-between mb-2">
            <span>Email Service</span>
            <span className="badge bg-warning">Chậm</span>
          </div>
          <div className="status-item d-flex justify-content-between">
            <span>Payment Gateway</span>
            <span className="badge bg-success">Hoạt động</span>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default AdminSidebar;
