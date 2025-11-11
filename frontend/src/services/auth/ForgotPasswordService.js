import { authInstance } from '../../api/axios';

class ForgotPasswordService {
    /**
     * Gửi yêu cầu quên mật khẩu
     * @param {string} email - Email người dùng
     * @returns {Promise<Object>} Response từ API
     */
    async forgotPassword(email) {
        try {
            const baseRequest = {
                requestDateTime: new Date().toISOString(),
                data: { email }
            };

            const response = await authInstance.post('/api/auth/forgot-password', baseRequest, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response && response.respCode === '0') {
                return {
                    success: true,
                    message: response.description || 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn',
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    error: response.description || 'Không thể gửi yêu cầu. Vui lòng thử lại.'
                };
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            
            let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
            
            if (error.response?.data) {
                const errorData = error.response.data;
                if (errorData.description) {
                    errorMessage = errorData.description;
                } else if (errorData.message) {
                        if (errorData.message.includes('Email không tồn tại')) {
                        errorMessage = '❌ Email này chưa được đăng ký trong hệ thống.';
                    } else {
                        errorMessage = errorData.message;
                    }
                } else if (errorData.data && typeof errorData.data === 'string') {
                    errorMessage = errorData.data;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }
}

export default new ForgotPasswordService();
