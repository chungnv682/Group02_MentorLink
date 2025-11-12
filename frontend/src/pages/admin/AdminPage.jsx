import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Nav, Tab, Alert } from "react-bootstrap";
import {
  FaUsers,
  FaBlog,
  FaUserCog,
  FaChartBar,
  FaCalendarAlt,
  FaHistory,
  FaCommentDots,
  FaBullhorn,
  FaCog,
  FaShieldAlt,
  FaGlobeAmericas,
  FaFileAlt,
} from "react-icons/fa";
import {
  UserManagement,
  ContentManagement,
  Analytics,
  MentorApproval,
  FeedbackManagement,
  BookingManagement,
  PaymentHistory,
  ReviewManagement,
  BannerManagement,
  SystemSettings,
  RolePermissions,
  CountryManagement,
  AdminSidebar,
  PolicyManagement,
} from "../../components/admin";
import {
  getAllUsers,
  getUserStatistics,
} from "../../services/user/userManagementService";
import { getAllBlogs } from "../../services/blog";
import MentorService from "../../services/mentor/MentorService";

import "../../styles/components/AdminPage.css";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("users");

  // State cho data từ API
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState(null);

  // State cho pagination và search
  const [userPage, setUserPage] = useState(1);
  const [userSize] = useState(10);
  const [userSearch, setUserSearch] = useState("");
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [userTotalElements, setUserTotalElements] = useState(0);

  // Fetch users với pagination và search
  const fetchUsers = async (page = 1, search = "") => {
    try {
      setUsersLoading(true);
      const response = await getAllUsers({
        page,
        size: userSize,
        keySearch: search,
      });

      if (response?.respCode === "000" || response?.respCode === "0") {
        const rawUsers = response.data?.content || response.data?.data || [];

        const normalized = (rawUsers || []).map((u) => {
          const fullName = (u.fullName || u.name || "").toString().trim();
          let status = u.status;

          if (typeof status === "string") {
            const s = status.toLowerCase();
            if (s === "1" || s === "true" || /active/.test(s)) status = 1;
            else if (s === "0" || s === "false" || /inactive/.test(s))
              status = 0;
          }

          const role =
            u.role || (u.roleName ? { roleName: u.roleName } : undefined);

          return { ...u, fullName: fullName || null, status, role };
        });

        setUsers(normalized);
        setUserTotalPages(response.data?.totalPages || 0);
        setUserTotalElements(response.data?.totalElements || 0);
        console.log("Users loaded:", normalized);
        console.log("Total pages:", response.data?.totalPages);
        console.log("Total elements:", response.data?.totalElements);
      } else {
        console.error("Error loading users:", response);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu người dùng");
    } finally {
      setUsersLoading(false);
    }
  };

  // Handler cho search
  const handleUserSearch = (searchKeyword) => {
    setUserSearch(searchKeyword);
    setUserPage(1); // Reset về trang 1 khi search
    fetchUsers(1, searchKeyword);
  };

  // Handler cho page change
  const handleUserPageChange = (page) => {
    setUserPage(page);
    fetchUsers(page, userSearch);
  };

  // Handler refresh blogs
  const handleRefreshBlogs = async () => {
    try {
      setLoading(true);
      const blogsResponse = await getAllBlogs({ page: 0, size: 10 });
      if (blogsResponse?.respCode === "0" || blogsResponse?.success) {
        const blogsData = blogsResponse.data?.blogs || [];
        setBlogs(blogsData);
        console.log("Blogs refreshed:", blogsData.length, "items");
      }
    } catch (error) {
      console.error("Error refreshing blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tất cả data song song
        const [usersResponse, statsResponse, blogsResponse, mentorsResponse] =
          await Promise.allSettled([
            getAllUsers({
              page: userPage,
              size: userSize,
              keySearch: userSearch,
            }),
            getUserStatistics(),
            getAllBlogs({ page: 0, size: 10 }),
            MentorService.getMentors({ page: 0, size: 50 }),
          ]);

        // Process users
        if (
          usersResponse.status === "fulfilled" &&
          (usersResponse.value?.respCode === "000" ||
            usersResponse.value?.respCode === "0")
        ) {
          const rawUsers =
            usersResponse.value.data?.content ||
            usersResponse.value.data?.data ||
            [];
          const normalized = (rawUsers || []).map((u) => {
            const fullName = (u.fullName || u.name || "").toString().trim();
            let status = u.status;

            if (typeof status === "string") {
              const s = status.toLowerCase();
              if (s === "1" || s === "true" || /active/.test(s)) status = 1;
              else if (s === "0" || s === "false" || /inactive/.test(s))
                status = 0;
            }

            const role =
              u.role || (u.roleName ? { roleName: u.roleName } : undefined);
            return { ...u, fullName: fullName || null, status, role };
          });

          setUsers(normalized);
          setUserTotalPages(usersResponse.value.data?.totalPages || 0);
          setUserTotalElements(usersResponse.value.data?.totalElements || 0);
          console.log("Users loaded:", normalized);
          console.log("Total pages:", usersResponse.value.data?.totalPages);
        }

        if (statsResponse.status === "fulfilled") {
          setStats(statsResponse.value.data);
          console.log("Stats loaded:", statsResponse.value.data);
        }

        // Process blogs - Cấu trúc: blogsResponse.value = {respCode, data: {blogs, pageNumber, ...}}
        if (blogsResponse.status === "fulfilled") {
          // respCode nằm ở blogsResponse.value.respCode
          if (
            blogsResponse.value?.respCode === "0" ||
            blogsResponse.value?.success
          ) {
            // blogs nằm ở blogsResponse.value.data.blogs
            const blogsData = blogsResponse.value.data?.blogs || [];
            setBlogs(blogsData);
            console.log(
              "Blogs loaded successfully:",
              blogsData.length,
              "items"
            );
          } else {
            console.warn("Blogs response not successful:", blogsResponse.value);
            setBlogs([]);
          }
        } else {
          console.error("Failed to load blogs:", blogsResponse.reason);
          setBlogs([]);
        }

        if (mentorsResponse.status === "fulfilled") {
          setMentors(mentorsResponse.value.data?.content || []);
          console.log("Mentors loaded:", mentorsResponse.value.data?.content);
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const menuItems = [
    {
      key: "users",
      icon: <FaUsers />,
      title: "Quản lý người dùng",
      badge: null,
      component: (
        <UserManagement
          users={users}
          stats={stats}
          loading={usersLoading}
          onSearch={handleUserSearch}
          onPageChange={handleUserPageChange}
          currentPage={userPage}
          totalPages={userTotalPages}
          totalElements={userTotalElements}
        />
      ),
    },
    {
      key: "content",
      icon: <FaBlog />,
      title: "Quản lý nội dung",
      badge: null,
      component: (
        <ContentManagement
          blogs={blogs}
          loading={loading}
          onRefresh={handleRefreshBlogs}
        />
      ),
    },
    {
      key: "mentor-approval",
      icon: <FaUserCog />,
      title: "Duyệt/xác thực mentor",
      badge: null,
      component: <MentorApproval stats={stats} />,
    },
    {
      key: "countries",
      icon: <FaGlobeAmericas />,
      title: "Quản lý các nước du học",
      badge: null,
      component: <CountryManagement />,
    },
    {
      key: "feedback",
      icon: <FaCommentDots />,
      title: "Quản lý phản hồi & báo cáo",
      badge: null,
      component: <FeedbackManagement />,
    },
    {
      key: "booking",
      icon: <FaCalendarAlt />,
      title: "Quản lý đặt lịch & lịch hẹn",
      badge: null,
      component: <BookingManagement />,
    },
    {
      key: "payment",
      icon: <FaHistory />,
      title: "Quản lý lịch sử thanh toán/giao dịch",
      badge: null,
      component: <PaymentHistory />,
    },
    {
      key: "reviews",
      icon: <FaCommentDots />,
      title: "Quản lý đánh giá & review",
      badge: null,
      component: <ReviewManagement />,
    },
    {
      key: "banners",
      icon: <FaBullhorn />,
      title: "Quản lý Banner & Quảng cáo",
      badge: null,
      component: <BannerManagement />,
    },
    {
      key: "analytics",
      icon: <FaChartBar />,
      title: "Báo cáo & thống kê",
      badge: null,
      component: <Analytics stats={stats} mentors={mentors} />,
    },
    {
      key: "policies",
      icon: <FaFileAlt />,
      title: "Quản lý chính sách",
      badge: null,
      component: <PolicyManagement />,
    },
    {
      key: "roles",
      icon: <FaShieldAlt />,
      title: "Quản lý quyền & vai trò",
      badge: null,
      component: <RolePermissions />,
    },
    {
      key: "settings",
      icon: <FaCog />,
      title: "Cấu hình hệ thống",
      badge: null,
      component: <SystemSettings />,
    },
  ];

  return (
    <Container fluid className="admin-page py-4">
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <h5 className="alert-heading mb-2">⚠️ Lỗi</h5>
              <p className="mb-0">{error}</p>
            </Alert>
          </Col>
        </Row>
      )}

      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Row>
          <Col lg={3} md={4} className="mb-4">
            <AdminSidebar menuItems={menuItems} activeTab={activeTab} />
          </Col>

          <Col lg={9} md={8}>
            <Tab.Content>
              {menuItems.map((item) => (
                <Tab.Pane key={item.key} eventKey={item.key}>
                  {item.component}
                </Tab.Pane>
              ))}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default AdminPage;
