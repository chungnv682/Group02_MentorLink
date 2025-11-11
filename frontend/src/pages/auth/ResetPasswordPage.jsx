import { Container, Row, Col, Form, Button, Card, InputGroup, Alert } from 'react-bootstrap';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ResetPasswordService from '../../services/auth/ResetPasswordService';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../styles/components/Auth.css';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Liên kết không hợp lệ hoặc đã hết hạn.');
    }
  }, [token]);

  const validatePassword = (pwd) => {
    // Basic strong password: at least 8 chars
    return typeof pwd === 'string' && pwd.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Liên kết không hợp lệ hoặc đã hết hạn.');
      return;
    }

    if (!validatePassword(password)) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setLoading(true);
      const result = await ResetPasswordService.changePassword(token, password, confirmPassword);
      if (result.success) {
        setSuccess(result.message || 'Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.');
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setError(result.error || 'Không thể đổi mật khẩu.');
      }
    } catch (err) {
      console.error('Reset submit error:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #a0e7e5 0%, #b4f8c8 50%, #a0e7e5 100%)',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'Inter, sans-serif',
        padding: '20px 0'
      }}
    >
      <Container fluid className="p-0 m-0">
        <Row className="g-0 justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <Col lg={5} md={7} sm={10}>
            <Card className="border-0 shadow-lg rounded-4">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="bi bi-shield-lock-fill text-primary" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h3 className="text-secondary fw-normal">Đặt lại mật khẩu</h3>
                  <p className="text-muted small">Nhập mật khẩu mới cho tài khoản của bạn</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-3">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" className="mb-3">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {success}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-secondary small">Mật khẩu mới</Form.Label>
                    <InputGroup className="auth-input-group">
                      <InputGroup.Text className="bg-light border-0">
                        <i className="bi bi-lock"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="password"
                        placeholder="Nhập mật khẩu mới (>= 8 ký tự)"
                        className="auth-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading || !!success}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="text-secondary small">Xác nhận mật khẩu</Form.Label>
                    <InputGroup className="auth-input-group">
                      <InputGroup.Text className="bg-light border-0">
                        <i className="bi bi-lock-fill"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        className="auth-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading || !!success}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2 mb-3 fw-medium login-btn"
                    disabled={loading || !!success || !token}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-repeat me-2"></i>
                        ĐỔI MẬT KHẨU
                      </>
                    )}
                  </Button>

                  <div className="text-center text-secondary small mt-3">
                    <Link to="/login" className="text-primary text-decoration-none">
                      <i className="bi bi-arrow-left me-1"></i>
                      Quay lại đăng nhập
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPasswordPage;
