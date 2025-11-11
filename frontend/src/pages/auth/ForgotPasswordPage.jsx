import { Container, Row, Col, Form, Button, Card, InputGroup, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ForgotPasswordService from '../../services/auth/ForgotPasswordService';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../styles/components/Auth.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!email || !email.trim()) {
            setError('Vui lòng nhập địa chỉ email');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Định dạng email không hợp lệ');
            return;
        }

        try {
            setLoading(true);
            const result = await ForgotPasswordService.forgotPassword(email);

            if (result.success) {
                setSuccess(result.message);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login', {
                        state: { message: 'Vui lòng kiểm tra email để đặt lại mật khẩu' }
                    });
                }, 3000);
            } else {
                setError(result.error);
            }
        } catch (err) {
            console.error('Submit error:', err);
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
                                        <i className="bi bi-key-fill text-primary" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                    <h3 className="text-secondary fw-normal">Quên mật khẩu?</h3>
                                    <p className="text-muted small">
                                        Nhập email của bạn, chúng tôi sẽ gửi liên kết đặt lại mật khẩu
                                    </p>
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
                                        <p className="mb-0 mt-2 small">Đang chuyển hướng đến trang đăng nhập...</p>
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-secondary small">Địa chỉ Email</Form.Label>
                                        <InputGroup className="auth-input-group">
                                            <InputGroup.Text className="bg-light border-0">
                                                <i className="bi bi-envelope text-secondary"></i>
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="email"
                                                placeholder="example@email.com"
                                                className="auth-input"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={loading || success}
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100 py-2 mb-3 fw-medium login-btn"
                                        disabled={loading || success}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Đang xử lý...
                                            </>
                                        ) : success ? (
                                            <>
                                                <i className="bi bi-check-circle me-2"></i>
                                                Đã gửi thành công
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-send me-2"></i>
                                                GỬI LINK ĐẶT LẠI
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

export default ForgotPasswordPage;
