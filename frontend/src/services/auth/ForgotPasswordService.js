import { authInstance } from '../../api/axios';

const ForgotPasswordService = {
  async forgotPassword(email) {
    try {
      const response = await authInstance.post('/api/auth/forgot-password', {
        email: email
      });
      
      // Backend trả về string trực tiếp
      if (response) {
        const message = typeof response === 'string' ? response : response.data || 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.';
        return {
          success: true,
          message: message
        };
      }
      
      return {
        success: false,
        error: 'Không thể gửi email đặt lại mật khẩu.'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      
      // Xử lý error message từ backend
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.description) {
          errorMessage = errorData.description;
        } else if (errorData.message) {
          errorMessage = errorData.message;
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
};

export default ForgotPasswordService;
