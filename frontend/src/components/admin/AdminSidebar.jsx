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
    </>
  );
};

export default AdminSidebar;
