import { Container, Row, Col, Form, Button, Card, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import CountrySelector from '../../components/mentor/CountrySelector';
import { MentorPolicyModal } from '../../components/common';
import { AuthService } from '../../services';
import '../../styles/components/MentorRegister.css';

const RegisterMentorPage = () => {
    const navigate = useNavigate();
    
    // State for form data
    const [formData, setFormData] = useState({
        personalInfo: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            birthDate: '',
            location: '',
            phone: '',
            title: '',
            education: '',
            linkedinUrl: '',
            bio: ''
        }
    });

    // State for approved countries
    const [selectedCountries, setSelectedCountries] = useState([]);

    // State for avatar
    const [avatar, setAvatar] = useState(null);

    // State for policy modal
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [hasPolicyAccepted, setHasPolicyAccepted] = useState(false);
    
    // State for loading and error
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // State for form sections
    const [educations, setEducations] = useState([{
        school: '',
        major: '',
        startDate: '',
        endDate: '',
        certificate: null
    }]);
    const [experiences, setExperiences] = useState([{
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        proof: null
    }]);
    const [testScores, setTestScores] = useState([{
        testName: '',
        score: '',
        certificate: null
    }]);

    // Handlers for adding items
    const addEducation = () => {
        setEducations([...educations, {}]);
    };

    const addExperience = () => {
        setExperiences([...experiences, {}]);
    };

    const addTestScore = () => {
        setTestScores([...testScores, {}]);
    };

    // Handlers for removing items
    const removeEducation = (index) => {
        if (educations.length > 1) {
            const newEducations = [...educations];
            newEducations.splice(index, 1);
            setEducations(newEducations);
        }
    };

    const removeExperience = (index) => {
        if (experiences.length > 1) {
            const newExperiences = [...experiences];
            newExperiences.splice(index, 1);
            setExperiences(newExperiences);
        }
    };

    const removeTestScore = (index) => {
        if (testScores.length > 1) {
            const newTestScores = [...testScores];
            newTestScores.splice(index, 1);
            setTestScores(newTestScores);
        }
    };

    // Handle personal info changes
    const handlePersonalInfoChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            personalInfo: {
                ...formData.personalInfo,
                [name]: value
            }
        });
    };

    // Handle education changes
    const handleEducationChange = (index, field, value) => {
        const updatedEducations = [...educations];
        updatedEducations[index] = {
            ...updatedEducations[index],
            [field]: value
        };
        setEducations(updatedEducations);
    };

    // Handle experience changes
    const handleExperienceChange = (index, field, value) => {
        const updatedExperiences = [...experiences];
        updatedExperiences[index] = {
            ...updatedExperiences[index],
            [field]: value
        };
        setExperiences(updatedExperiences);
    };

    // Handle test score changes
    const handleTestScoreChange = (index, field, value) => {
        const updatedTestScores = [...testScores];
        updatedTestScores[index] = {
            ...updatedTestScores[index],
            [field]: value
        };
        setTestScores(updatedTestScores);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous messages
        setError(null);
        setSuccess(null);

        // Validate passwords match
        if (formData.personalInfo.password !== formData.personalInfo.confirmPassword) {
            setError('Mật khẩu không khớp. Vui lòng kiểm tra lại!');
            return;
        }

        // Validate password strength
        if (formData.personalInfo.password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự!');
            return;
        }

        // Validate selected countries
        if (selectedCountries.length === 0) {
            setError('Vui lòng chọn ít nhất một nước bạn có thể hỗ trợ du học!');
            return;
        }

        // Check if policy has been accepted
        if (!hasPolicyAccepted) {
            setError('Vui lòng đọc và chấp nhận chính sách mentor trước khi đăng ký!');
            setShowPolicyModal(true);
            return;
        }

        // Prepare FormData to send files to API
        const formDataToSend = new FormData();
        
        // Append personal info as JSON string or individual fields
        formDataToSend.append('personalInfo', JSON.stringify(formData.personalInfo));
        
        // Append avatar file
        if (avatar) {
            formDataToSend.append('avatar', avatar);
        }
        
        // Append educations with certificates
        educations.forEach((edu, index) => {
            formDataToSend.append(`educations[${index}][school]`, edu.school || '');
            formDataToSend.append(`educations[${index}][major]`, edu.major || '');
            formDataToSend.append(`educations[${index}][startDate]`, edu.startDate || '');
            formDataToSend.append(`educations[${index}][endDate]`, edu.endDate || '');
            if (edu.certificate) {
                formDataToSend.append(`educationCertificates[${index}]`, edu.certificate);
            }
        });
        
        // Append experiences with proofs
        experiences.forEach((exp, index) => {
            formDataToSend.append(`experiences[${index}][company]`, exp.company || '');
            formDataToSend.append(`experiences[${index}][position]`, exp.position || '');
            formDataToSend.append(`experiences[${index}][startDate]`, exp.startDate || '');
            formDataToSend.append(`experiences[${index}][endDate]`, exp.endDate || '');
            if (exp.proof) {
                formDataToSend.append(`experienceProofs[${index}]`, exp.proof);
            }
        });
        
        // Append test scores with certificates
        testScores.forEach((test, index) => {
            formDataToSend.append(`testScores[${index}][testName]`, test.testName || '');
            formDataToSend.append(`testScores[${index}][score]`, test.score || '');
            if (test.certificate) {
                formDataToSend.append(`testScoreCertificates[${index}]`, test.certificate);
            }
        });
        
        // Append approved countries
        selectedCountries.forEach((country, index) => {
            formDataToSend.append(`approvedCountries[${index}]`, country);
        });

        console.log('Form submitted with FormData');

        try {
            setIsSubmitting(true);
            
            // Call API to register mentor
            const result = await AuthService.registerMentor(formDataToSend);
            
            console.log('Registration result:', result);
            
            if (result.success) {
                setSuccess('Đăng ký thành công! Đang chuyển hướng...');
                
                // Redirect to appropriate page after 2 seconds
                setTimeout(() => {
                    const user = AuthService.getCurrentUser();
                    if (user) {
                        navigate(AuthService.getRouteByRole(user.role));
                    } else {
                        navigate('/login');
                    }
                }, 2000);
            } else {
                console.error('Registration failed:', result);
                setError(result.error || result.description || 'Đăng ký thất bại. Vui lòng thử lại!');
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Policy modal handlers
    const handlePolicyAccept = () => {
        setHasPolicyAccepted(true);
        setShowPolicyModal(false);
    };

    const handleShowPolicy = () => {
        setShowPolicyModal(true);
    };

    return (
        <div className="mentor-register-container">
            <Container>
                <Row className="justify-content-center">
                    <Col lg={10} md={11} sm={12}>
                        <div className="text-center mb-5">
                            <h1 className="fw-bold display-4 page-title">Đăng ký làm Cố vấn</h1>
                            <p className="lead page-subtitle">Hãy chia sẻ kinh nghiệm và kiến thức của bạn để giúp đỡ những người khác</p>
                        </div>

                        <Card className="card-mentor">
                            <div className="card-header-gradient-primary">
                                <h2 className="fs-4 fw-bold mb-0">Thông tin cá nhân</h2>
                            </div>
                            <Card.Body className="p-4 p-md-5">

                                <Form onSubmit={handleSubmit}>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Tên của bạn <span className="text-danger">*</span></Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text className="bg-light border-0">
                                                        <i className="bi bi-person text-secondary"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        name="name"
                                                        value={formData.personalInfo.name}
                                                        onChange={handlePersonalInfoChange}
                                                        placeholder="Họ và tên đầy đủ của bạn"
                                                        className="bg-light py-2 enhanced-input"
                                                        required
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text className="bg-light border-0">
                                                        <i className="bi bi-envelope text-secondary"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={formData.personalInfo.email}
                                                        onChange={handlePersonalInfoChange}
                                                        placeholder="you@yourdomain.com"
                                                        className="bg-light border-0 py-2"
                                                        required
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Mật khẩu <span className="text-danger">*</span></Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text className="bg-light border-0">
                                                        <i className="bi bi-lock text-secondary"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="password"
                                                        name="password"
                                                        value={formData.personalInfo.password}
                                                        onChange={handlePersonalInfoChange}
                                                        placeholder="Nhập mật khẩu của bạn"
                                                        className="bg-light border-0 py-2"
                                                        minLength="6"
                                                        required
                                                    />
                                                </InputGroup>
                                                <Form.Text className="text-muted">
                                                    Mật khẩu phải có ít nhất 6 ký tự
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Xác nhận mật khẩu <span className="text-danger">*</span></Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text className="bg-light border-0">
                                                        <i className="bi bi-lock-fill text-secondary"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={formData.personalInfo.confirmPassword}
                                                        onChange={handlePersonalInfoChange}
                                                        placeholder="Nhập lại mật khẩu"
                                                        className="bg-light border-0 py-2"
                                                        minLength="6"
                                                        required
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Ngày tháng năm sinh <span className="text-danger">*</span></Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text className="bg-light border-0">
                                                        <i className="bi bi-calendar text-secondary"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="date"
                                                        name="birthDate"
                                                        value={formData.personalInfo.birthDate}
                                                        onChange={handlePersonalInfoChange}
                                                        className="bg-light border-0 py-2"
                                                        required
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Nơi đang sinh sống <span className="text-danger">*</span></Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text className="bg-light border-0">
                                                        <i className="bi bi-geo-alt text-secondary"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        name="location"
                                                        value={formData.personalInfo.location}
                                                        onChange={handlePersonalInfoChange}
                                                        placeholder="Ví dụ như 'Hanoi, Vietnam,' 'New York, NY'"
                                                        className="bg-light border-0 py-2"
                                                        required
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text className="bg-light border-0">
                                                        <i className="bi bi-telephone text-secondary"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        name="phone"
                                                        value={formData.personalInfo.phone}
                                                        onChange={handlePersonalInfoChange}
                                                        placeholder="Số điện thoại liên lạc"
                                                        className="bg-light border-0 py-2"
                                                        required
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Chức danh <span className="text-danger">*</span></Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text className="bg-light border-0">
                                                        <i className="bi bi-briefcase text-secondary"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        name="title"
                                                        value={formData.personalInfo.title}
                                                        onChange={handlePersonalInfoChange}
                                                        placeholder="Ví dụ như 'Web Developer, Mara Technology'"
                                                        className="bg-light border-0 py-2"
                                                        required
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Trình độ học vấn cao nhất <span className="text-danger">*</span></Form.Label>
                                                <Form.Select 
                                                    name="education"
                                                    value={formData.personalInfo.education}
                                                    onChange={handlePersonalInfoChange}
                                                    className="bg-light border-0 py-2"
                                                    required
                                                >
                                                    <option value="">Chọn trình độ học vấn</option>
                                                    <option value="HIGH_SCHOOL">Phổ thông</option>
                                                    <option value="BACHELOR">Đại học</option>
                                                    <option value="MASTER">Thạc sĩ</option>
                                                    <option value="PHD">Tiến sĩ</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>LinkedIn URL</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text className="bg-light border-0">
                                                        <i className="bi bi-linkedin text-secondary"></i>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        name="linkedinUrl"
                                                        value={formData.personalInfo.linkedinUrl || ''}
                                                        onChange={handlePersonalInfoChange}
                                                        placeholder="URL trang LinkedIn của bạn"
                                                        className="bg-light border-0 py-2"
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Country Selection Component */}
                                    <CountrySelector
                                        selectedCountries={selectedCountries}
                                        onCountriesChange={setSelectedCountries}
                                    />

                                    <Form.Group className="mb-4">
                                        <Form.Label>Ảnh đại diện <span className="text-danger">*</span></Form.Label>
                                        <InputGroup>
                                            <Form.Control 
                                                type="file" 
                                                onChange={(e) => setAvatar(e.target.files[0])}
                                                className="bg-light border-0 py-2"
                                                accept="image/*"
                                                required
                                            />
                                        </InputGroup>
                                        <Form.Text className="text-muted">
                                            Hãy chọn ảnh đại diện chuyên nghiệp để tạo ấn tượng tốt với học viên
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Giới thiệu bản thân <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            name="bio"
                                            value={formData.personalInfo.bio}
                                            onChange={handlePersonalInfoChange}
                                            rows={5}
                                            placeholder="Viết giới thiệu ngắn gọn về bản thân, kinh nghiệm và lý do bạn muốn trở thành mentor..."
                                            className="bg-light border-0"
                                            required
                                        />
                                    </Form.Group>

                                    {/* Policy Agreement Section */}
                                    <div className="mb-4">
                                        <Alert variant={hasPolicyAccepted ? "success" : "warning"} className="p-3">
                                            <div className="d-flex align-items-start">
                                                <i className={`bi ${hasPolicyAccepted ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-warning'} me-2 mt-1`}></i>
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-2">
                                                        {hasPolicyAccepted ? 'Đã chấp nhận chính sách' : 'Chính sách và Điều khoản'}
                                                        <span className="text-danger"> *</span>
                                                    </h6>
                                                    <p className="mb-2 small">
                                                        {hasPolicyAccepted
                                                            ? 'Bạn đã đọc và đồng ý với các chính sách mentor. Cảm ơn bạn!'
                                                            : 'Trước khi đăng ký, vui lòng đọc và đồng ý với các chính sách dành cho mentor.'
                                                        }
                                                    </p>
                                                    <Button
                                                        variant={hasPolicyAccepted ? "outline-success" : "primary"}
                                                        size="sm"
                                                        onClick={handleShowPolicy}
                                                        className="d-flex align-items-center"
                                                    >
                                                        <i className="bi bi-file-text me-2"></i>
                                                        {hasPolicyAccepted ? 'Xem lại chính sách' : 'Đọc chính sách mentor'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Alert>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>

                        <Card className="card-mentor">
                            <div className="card-header-gradient-success">
                                <h2 className="fs-4 fw-bold mb-0">Bằng cấp <span className="text-white">*</span></h2>
                            </div>
                            <Card.Body className="p-4 p-md-5">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="d-flex align-items-center"
                                        onClick={addEducation}
                                    >
                                        <i className="bi bi-plus-circle me-2"></i> Thêm bằng cấp
                                    </Button>
                                </div>

                                <Form>
                                    {educations.map((edu, index) => (
                                        <div key={index} className="border rounded-3 p-3 mb-3 position-relative">
                                            <div className="position-absolute top-0 end-0 mt-2 me-2">
                                                <Button
                                                    variant="link"
                                                    className="text-secondary p-1"
                                                    onClick={() => removeEducation(index)}
                                                    disabled={educations.length <= 1}
                                                >
                                                    <i className="bi bi-x-circle"></i>
                                                </Button>
                                            </div>

                                            <Row className="mb-3">
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Trường <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={edu.school || ''}
                                                            onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                                                            placeholder="Tên trường học"
                                                            className="bg-light border-0 py-2"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Chuyên ngành <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={edu.major || ''}
                                                            onChange={(e) => handleEducationChange(index, 'major', e.target.value)}
                                                            placeholder="Chuyên ngành học"
                                                            className="bg-light border-0 py-2"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row className="mb-3">
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Ngày bắt đầu <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            value={edu.startDate || ''}
                                                            onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                                                            className="bg-light border-0 py-2"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Ngày kết thúc</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            value={edu.endDate || ''}
                                                            onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                                                            className="bg-light border-0 py-2"
                                                        />
                                                        <Form.Text className="text-muted">
                                                            Để trống nếu bạn đang học
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Ảnh bằng cấp</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    onChange={(e) => handleEducationChange(index, 'certificate', e.target.files[0])}
                                                    className="bg-light border-0 py-2"
                                                />
                                            </Form.Group>
                                        </div>
                                    ))}
                                </Form>
                            </Card.Body>
                        </Card>

                        <Card className="card-mentor">
                            <div className="card-header-gradient-info">
                                <h2 className="fs-4 fw-bold mb-0">Điểm bài thi chuẩn hóa</h2>
                            </div>
                            <Card.Body className="p-4 p-md-5">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="d-flex align-items-center"
                                        onClick={addTestScore}
                                    >
                                        <i className="bi bi-plus-circle me-2"></i> Thêm chứng chỉ
                                    </Button>
                                </div>

                                <Form>
                                    {testScores.map((test, index) => (
                                        <div key={index} className="border rounded-3 p-3 mb-3 position-relative">
                                            <div className="position-absolute top-0 end-0 mt-2 me-2">
                                                <Button
                                                    variant="link"
                                                    className="text-secondary p-1"
                                                    onClick={() => removeTestScore(index)}
                                                    disabled={testScores.length <= 1}
                                                >
                                                    <i className="bi bi-x-circle"></i>
                                                </Button>
                                            </div>

                                            <Row className="mb-3">
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Tên bài thi <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={test.testName || ''}
                                                            onChange={(e) => handleTestScoreChange(index, 'testName', e.target.value)}
                                                            placeholder="Ví dụ: IELTS, TOEFL, SAT, ACT, GRE, GMAT"
                                                            className="bg-light border-0 py-2"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Điểm số <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={test.score || ''}
                                                            onChange={(e) => handleTestScoreChange(index, 'score', e.target.value)}
                                                            placeholder="Điểm số của bạn"
                                                            className="bg-light border-0 py-2"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Ảnh chứng chỉ</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    onChange={(e) => handleTestScoreChange(index, 'certificate', e.target.files[0])}
                                                    className="bg-light border-0 py-2"
                                                />
                                            </Form.Group>
                                        </div>
                                    ))}
                                </Form>
                            </Card.Body>
                        </Card>

                        <Card className="card-mentor">
                            <div className="card-header-gradient-warning">
                                <h2 className="fs-4 fw-bold mb-0">Kinh nghiệm làm việc <span className="text-white">*</span></h2>
                            </div>
                            <Card.Body className="p-4 p-md-5">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="d-flex align-items-center"
                                        onClick={addExperience}
                                    >
                                        <i className="bi bi-plus-circle me-2"></i> Thêm kinh nghiệm
                                    </Button>
                                </div>

                                <Form>
                                    {experiences.map((exp, index) => (
                                        <div key={index} className="border rounded-3 p-3 mb-3 position-relative">
                                            <div className="position-absolute top-0 end-0 mt-2 me-2">
                                                <Button
                                                    variant="link"
                                                    className="text-secondary p-1"
                                                    onClick={() => removeExperience(index)}
                                                    disabled={experiences.length <= 1}
                                                >
                                                    <i className="bi bi-x-circle"></i>
                                                </Button>
                                            </div>

                                            <Row className="mb-3">
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Công ty <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={exp.company || ''}
                                                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                            placeholder="Tên công ty"
                                                            className="bg-light border-0 py-2"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Vị trí <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={exp.position || ''}
                                                            onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                                                            placeholder="Vị trí công việc"
                                                            className="bg-light border-0 py-2"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row className="mb-3">
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Ngày bắt đầu <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            value={exp.startDate || ''}
                                                            onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                                                            className="bg-light border-0 py-2"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Ngày kết thúc</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            value={exp.endDate || ''}
                                                            onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                                                            className="bg-light border-0 py-2"
                                                        />
                                                        <Form.Text className="text-muted">
                                                            Để trống nếu bạn vẫn đang làm việc
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Ảnh minh chứng kinh nghiệm</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    onChange={(e) => handleExperienceChange(index, 'proof', e.target.files[0])}
                                                    className="bg-light border-0 py-2"
                                                />
                                            </Form.Group>
                                        </div>
                                    ))}
                                </Form>
                            </Card.Body>
                        </Card>

                        {/* Error Alert */}
                        {error && (
                            <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {error}
                            </Alert>
                        )}

                        {/* Success Alert */}
                        {success && (
                            <Alert variant="success" className="mt-3">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                {success}
                            </Alert>
                        )}

                        <div className="action-buttons-container">
                            <div className="d-flex justify-content-between">
                                <Button 
                                    variant="light" 
                                    className="fw-bold shadow-sm"
                                    onClick={() => navigate(-1)}
                                    disabled={isSubmitting}
                                >
                                    <i className="bi bi-arrow-left me-2"></i> Quay lại
                                </Button>
                                <div>
                                    <Button
                                        type="submit"
                                        variant={hasPolicyAccepted ? "success" : "primary"}
                                        className="mentor-submit-btn"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Đang xử lý...
                                            </>
                                        ) : hasPolicyAccepted ? (
                                            <>
                                                <i className="bi bi-check-circle me-2"></i>
                                                Đăng ký <i className="bi bi-arrow-right ms-2"></i>
                                            </>
                                        ) : (
                                            <>
                                                Đọc chính sách và đăng ký <i className="bi bi-arrow-right ms-2"></i>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
            <MentorPolicyModal
                show={showPolicyModal}
                onHide={() => setShowPolicyModal(false)}
                onAccept={handlePolicyAccept}
            />
        </div>
    );
};

export default RegisterMentorPage;