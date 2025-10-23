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

    // Lấy thông tin user từ token hiện tại
    getCurrentUser() {
        const token = localStorage.getItem('accessToken');
        if (!token || this.isTokenExpired(token)) {
            return null;
        }

        return this.decodeToken(token);
    }

    // Logout
    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authState');
    }

    // Kiểm tra đã đăng nhập chưa
    isAuthenticated() {
        const token = localStorage.getItem('accessToken');
        return token && !this.isTokenExpired(token);
    }

    // Lấy access token
    getAccessToken() {
        return localStorage.getItem('accessToken');
    }

    // Lấy refresh token
    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }

    // Navigate based on role
    getRouteByRole(role) {
        const routes = {
            'CUSTOMER': '/',
            'ADMIN': '/admin',
            'MENTOR': '/mentor/dashboard',
            'MODERATOR': '/moderator'
        };

        return routes[role.toUpperCase()] || '/';
    }
}

export default new AuthService();