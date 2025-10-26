import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Image } from 'react-bootstrap';
import { instance } from '../../api/axios';
import { API_ENDPOINTS, USER_ROLES } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const allowedFieldsForCustomer = [
    'username', 'email', 'fullname', 'dob', 'phone', 'gender', 'address', 'avatarUrl', 'bankAccountNumber', 'bankName'
];

const ProfilePage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await instance.get(API_ENDPOINTS.USERS.PROFILE);
                // res may contain wrapper (data) or direct object depending on interceptors
                const data = res?.data || res;
                setProfile(data);
                // Initialize form with allowed fields (for customer) or all fields
                const initial = {};
                if ((user?.role || '').toUpperCase() === USER_ROLES.CUSTOMER) {
                    allowedFieldsForCustomer.forEach(k => { initial[k] = data[k] ?? ''; });
                } else {
                    // non-customer: show all returned fields
                    Object.keys(data || {}).forEach(k => { initial[k] = data[k] ?? ''; });
                }
                setForm(initial);
            } catch (error) {
                console.error('Fetch profile error', error);
                showToast('Không thể tải thông tin hồ sơ', { variant: 'danger' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, showToast]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            // Prepare payload: include only editable fields (email excluded)
            const payload = { ...form };
            delete payload.email; // email must not be updated

            const res = await instance.put(API_ENDPOINTS.USERS.UPDATE, payload);
            const data = res?.data || res;
            showToast('Cập nhật hồ sơ thành công', { variant: 'success' });
            // Refresh local profile state
            setProfile(prev => ({ ...prev, ...payload }));
        } catch (error) {
            console.error('Update profile error', error);
            const message = error?.description || error?.message || 'Cập nhật thất bại';
            showToast(message, { variant: 'danger' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-5">
                <Row>
                    <Col className="text-center">
                        <Spinner animation="border" />
                    </Col>
                </Row>
            </Container>
        );
    }

    if (!profile) {
        return (
            <Container className="py-5">
                <Row>
                    <Col md={8} className="mx-auto">
                        <Card>
                            <Card.Header>
                                <h4>Hồ sơ cá nhân</h4>
                            </Card.Header>
                            <Card.Body>
                                <p>Không có dữ liệu hồ sơ.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    const isCustomer = (user?.role || '').toUpperCase() === USER_ROLES.CUSTOMER;

    return (
        <Container className="py-5">
            <Row>
                <Col md={8} className="mx-auto">
                    <Card>
                        <Card.Header>
                            <h4>Hồ sơ cá nhân</h4>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                {/* Avatar preview */}
                                {form.avatarUrl && (
                                    <div className="mb-3 text-center">
                                        <Image src={form.avatarUrl} roundedCircle width={120} height={120} alt="avatar" />
                                    </div>
                                )}

                                <Form.Group className="mb-3" controlId="username">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control name="username" value={form.username || ''} onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="email">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control name="email" value={form.email || ''} disabled />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="fullname">
                                    <Form.Label>Họ và tên</Form.Label>
                                    <Form.Control name="fullname" value={form.fullname || ''} onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="dob">
                                    <Form.Label>Ngày sinh</Form.Label>
                                    <Form.Control type="date" name="dob" value={form.dob ? form.dob.split('T')?.[0] : ''} onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="phone">
                                    <Form.Label>Điện thoại</Form.Label>
                                    <Form.Control name="phone" value={form.phone || ''} onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="gender">
                                    <Form.Label>Giới tính</Form.Label>
                                    <Form.Select name="gender" value={form.gender || ''} onChange={handleChange}>
                                        <option value="">-- Chọn --</option>
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                        <option value="OTHER">Khác</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="address">
                                    <Form.Label>Địa chỉ</Form.Label>
                                    <Form.Control name="address" value={form.address || ''} onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="avatarUrl">
                                    <Form.Label>Avatar URL</Form.Label>
                                    <Form.Control name="avatarUrl" value={form.avatarUrl || ''} onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="bankAccountNumber">
                                    <Form.Label>Số tài khoản</Form.Label>
                                    <Form.Control name="bankAccountNumber" value={form.bankAccountNumber || ''} onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="bankName">
                                    <Form.Label>Ngân hàng</Form.Label>
                                    <Form.Control name="bankName" value={form.bankName || ''} onChange={handleChange} />
                                </Form.Group>

                                <div className="d-flex justify-content-end">
                                    <Button variant="primary" type="submit" disabled={saving}>
                                        {saving ? (<><Spinner animation="border" size="sm" />{' '}Đang lưu</>) : 'Lưu thay đổi'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;
