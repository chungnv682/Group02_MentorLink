import { authInstance } from '../../api/axios';

// Danh sách các API không cần token (permit all)
export const PUBLIC_ENDPOINTS = [
    '/api/auth/access-token',
    '/api/auth/refresh-token',
    '/api/auth/register',
];

class AuthService {
    // Đăng nhập
    async login(email, password) {
        try {
            const response = await authInstance.post('/api/auth/access-token', {
                email,
                password
            });

            if (response.accessToken && response.refreshToken) {
                // Lưu tokens vào localStorage
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken);

                // Giải mã token để lấy thông tin user
                const userInfo = this.decodeToken(response.accessToken);

                return {
                    success: true,
                    user: userInfo,
                    tokens: {
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken
                    }
                };
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.description || 'Đăng nhập thất bại'
            };
        }
    }

    // Refresh token
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token found');
            }

            const response = await authInstance.post('/api/auth/refresh-token', {}, {
                headers: {
                    'Authorization': `Bearer ${refreshToken}`
                }
            });

            if (response.accessToken && response.refreshToken) {
                // Cập nhật tokens mới
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken);

                return {
                    success: true,
                    tokens: {
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken
                    }
                };
            } else {
                throw new Error('Invalid refresh response');
            }
        } catch (error) {
            console.error('Refresh token error:', error);
            this.logout(); // Clear tokens nếu refresh thất bại
            return {
                success: false,
                error: error.response?.data?.description || 'Refresh token thất bại'
            };
        }
    }

    // Giải mã JWT token
    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join('')
            );

            const payload = JSON.parse(jsonPayload);
            return {
                email: payload.sub, // email thường nằm trong 'sub' field
                role: payload.role || payload.authorities?.[0] || 'CUSTOMER', // role có thể nằm trong 'role' hoặc 'authorities'
                userId: payload.userId || payload.id,
                exp: payload.exp,
                iat: payload.iat
            };
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    // Kiểm tra token có hết hạn không
    isTokenExpired(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) return true;

            const currentTime = Date.now() / 1000;
            return decoded.exp < currentTime;
        } catch (error) {
            return true;
        }
    }

    getCurrentUser() {
        const token = localStorage.getItem('accessToken');
        if (!token || this.isTokenExpired(token)) {
            return null;
        }

        return this.decodeToken(token);
    }

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authState');
    }

    isAuthenticated() {
        const token = localStorage.getItem('accessToken');
        return token && !this.isTokenExpired(token);
    }

    getAccessToken() {
        return localStorage.getItem('accessToken');
    }

    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }

    getRouteByRole(role) {
        const routes = {
            'CUSTOMER': '/',
            'ADMIN': '/admin',
            'MENTOR': '/mentor/dashboard',
            'MODERATOR': '/moderator'
        };

        return routes[role.toUpperCase()] || '/';
    }

    // Đăng ký mentor
    async registerMentor(formDataFromPage) {
        try {
            // Check if data is FormData or regular object
            const isFormData = formDataFromPage instanceof FormData;
            
            const formData = new FormData();
            
            if (isFormData) {
                // Extract data from FormData
                const personalInfo = JSON.parse(formDataFromPage.get('personalInfo') || '{}');
                
                // Append personal info fields directly (for @ModelAttribute)
                formData.append('fullName', personalInfo.name || '');
                formData.append('email', personalInfo.email || '');
                formData.append('password', personalInfo.password || '');
                formData.append('confirmPassword', personalInfo.confirmPassword || '');
                formData.append('dob', personalInfo.birthDate || '');
                formData.append('address', personalInfo.location || '');
                formData.append('phone', personalInfo.phone || '');
                formData.append('title', personalInfo.title || '');
                formData.append('levelOfEducation', personalInfo.education || '');
                formData.append('linkedUrl', personalInfo.linkedinUrl || '');
                formData.append('introduceYourself', personalInfo.bio || '');
                
                // Append avatar file
                if (formDataFromPage.has('avatar')) {
                    formData.append('avatar', formDataFromPage.get('avatar'));
                }
                
                // Process educations
                let eduIndex = 0;
                while (formDataFromPage.has(`educations[${eduIndex}][school]`)) {
                    formData.append(`mentorEducations[${eduIndex}].schoolName`, formDataFromPage.get(`educations[${eduIndex}][school]`));
                    formData.append(`mentorEducations[${eduIndex}].major`, formDataFromPage.get(`educations[${eduIndex}][major]`));
                    formData.append(`mentorEducations[${eduIndex}].startDate`, formDataFromPage.get(`educations[${eduIndex}][startDate]`) || '');
                    formData.append(`mentorEducations[${eduIndex}].endDate`, formDataFromPage.get(`educations[${eduIndex}][endDate]`) || '');
                    
                    // Append certificate file if exists
                    if (formDataFromPage.has(`educationCertificates[${eduIndex}]`)) {
                        formData.append(`mentorEducations[${eduIndex}].degreesFile`, formDataFromPage.get(`educationCertificates[${eduIndex}]`));
                    }
                    eduIndex++;
                }
                
                // Process experiences
                let expIndex = 0;
                while (formDataFromPage.has(`experiences[${expIndex}][company]`)) {
                    formData.append(`experiences[${expIndex}].company`, formDataFromPage.get(`experiences[${expIndex}][company]`));
                    formData.append(`experiences[${expIndex}].position`, formDataFromPage.get(`experiences[${expIndex}][position]`));
                    formData.append(`experiences[${expIndex}].startDate`, formDataFromPage.get(`experiences[${expIndex}][startDate]`) || '');
                    formData.append(`experiences[${expIndex}].endDate`, formDataFromPage.get(`experiences[${expIndex}][endDate]`) || '');
                    
                    // Append proof file if exists
                    if (formDataFromPage.has(`experienceProofs[${expIndex}]`)) {
                        formData.append(`experiences[${expIndex}].experiencesFile`, formDataFromPage.get(`experienceProofs[${expIndex}]`));
                    }
                    expIndex++;
                }
                
                // Process test scores/certificates
                let testIndex = 0;
                while (formDataFromPage.has(`testScores[${testIndex}][testName]`)) {
                    formData.append(`certificates[${testIndex}].certificateName`, formDataFromPage.get(`testScores[${testIndex}][testName]`));
                    formData.append(`certificates[${testIndex}].score`, formDataFromPage.get(`testScores[${testIndex}][score]`));
                    
                    // Append certificate file if exists
                    if (formDataFromPage.has(`testScoreCertificates[${testIndex}]`)) {
                        formData.append(`certificates[${testIndex}].certificatesFile`, formDataFromPage.get(`testScoreCertificates[${testIndex}]`));
                    }
                    testIndex++;
                }
                
                // Process approved countries
                let countryIndex = 0;
                while (formDataFromPage.has(`approvedCountries[${countryIndex}]`)) {
                    const country = formDataFromPage.get(`approvedCountries[${countryIndex}]`);
                    try {
                        const countryObj = JSON.parse(country);
                        if (countryObj.id) {
                            formData.append(`mentorCountries[${countryIndex}].countryId`, countryObj.id);
                        } else {
                            formData.append(`mentorCountries[${countryIndex}].countryName`, countryObj.name || country);
                        }
                        formData.append(`mentorCountries[${countryIndex}].description`, countryObj.description || '');
                    } catch {
                        // If not JSON, treat as string
                        formData.append(`mentorCountries[${countryIndex}].countryName`, country);
                        formData.append(`mentorCountries[${countryIndex}].description`, '');
                    }
                    countryIndex++;
                }
                
                // Send as multipart/form-data
                const response = await authInstance.post('/api/auth/mentor-signup', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                console.log('Mentor signup response:', response);
                
                // Handle response
                return this.handleAuthResponse(response);
                
            } else {
                // Old format - regular object (fallback)
                requestData = {
                    fullName: formDataFromPage.personalInfo.name,
                    email: formDataFromPage.personalInfo.email,
                    password: formDataFromPage.personalInfo.password,
                    confirmPassword: formDataFromPage.personalInfo.confirmPassword,
                    dob: formDataFromPage.personalInfo.birthDate || null,
                    address: formDataFromPage.personalInfo.location || '',
                    phone: formDataFromPage.personalInfo.phone || '',
                    title: formDataFromPage.personalInfo.title || '',
                    levelOfEducation: formDataFromPage.personalInfo.education || '',
                    linkedUrl: formDataFromPage.personalInfo.linkedinUrl || '', 
                    introduceYourself: formDataFromPage.personalInfo.bio || '',
                    
                    mentorEducations: (formDataFromPage.educations || []).map(edu => ({
                        schoolName: edu.school,
                        major: edu.major,
                        startDate: edu.startDate || null,
                        endDate: edu.endDate || null
                    })),
                    
                    experiences: (formDataFromPage.experiences || []).map(exp => ({
                        company: exp.company,
                        position: exp.position,
                        startDate: exp.startDate || null,
                        endDate: exp.endDate || null
                    })),
                    
                    certificates: (formDataFromPage.testScores || []).map(test => ({
                        certificateName: test.testName,
                        score: test.score
                    })),
                    
                    mentorCountries: (formDataFromPage.approvedCountries || []).map(country => {
                        if (typeof country === 'object' && country.id) {
                            return {
                                countryId: country.id,
                                description: country.description || ''
                            };
                        } else {
                            const countryName = typeof country === 'string' ? country : country.name;
                            return {
                                countryName: countryName,
                                countryCode: country.code || null,
                                description: country.description || ''
                            };
                        }
                    })
                };
                
                const baseRequest = {
                    requestDateTime: new Date().toISOString(),
                    data: requestData
                };
                
                const response = await authInstance.post('/api/auth/mentor-signup', baseRequest, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                // Handle response for non-FormData
                return this.handleAuthResponse(response);
            }
        } catch (error) {
            console.error('Register mentor error:', error);
            return {
                success: false,
                error: error.response?.data?.description || error.message || 'Đăng ký thất bại'
            };
        }
    }
    
    // Helper method to handle authentication response
    handleAuthResponse(response) {
        // authInstance interceptor already returns response.data
        // response = { respCode, description, data: { accessToken, refreshToken, userId } }
        if (response && response.respCode === '0') {
            const tokenResponse = response.data;
            
            // Save tokens
            if (tokenResponse && tokenResponse.accessToken && tokenResponse.refreshToken) {
                localStorage.setItem('accessToken', tokenResponse.accessToken);
                localStorage.setItem('refreshToken', tokenResponse.refreshToken);
            }

            return {
                success: true,
                message: response.description || 'Đăng ký thành công!',
                data: tokenResponse
            };
        } else {
            // Return error object instead of throwing
            return {
                success: false,
                error: response.description || response.message || 'Đăng ký thất bại',
                respCode: response.respCode
            };
        }
    }
}

export default new AuthService();