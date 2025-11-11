import { authInstance } from '../../api/axios';

/**
 * Service xử lý reset password với token
 */
class ResetPasswordService {
  /**
   * Đổi mật khẩu sử dụng token reset
   * @param {string} token - Reset token từ URL
   * @param {string} password - Mật khẩu mới
   * @param {string} confirmPassword - Xác nhận mật khẩu mới
   */
  async changePassword(token, password, confirmPassword) {
    try {
      const baseRequest = {
        requestDateTime: new Date().toISOString(),
        data: { 
          secretKey: token, 
          password, 
          confirmPassword 
        }
      };

      const response = await authInstance.post('/api/auth/change-password', baseRequest, {
        headers: { 'Content-Type': 'application/json' }
      });

      // Backend trả về string trực tiếp
      if (response) {
        const message = typeof response === 'string' ? response : response.data || 'Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.';
        return {
          success: true,
          message: message
        };
      }

      return { 
        success: false, 
        error: 'Không thể đổi mật khẩu' 
      };
    } catch (error) {
      console.error('❌ Change password error:', error);
      
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';

      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.description) {
          errorMessage = errorData.description;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.data && typeof errorData.data === 'string') {
          errorMessage = errorData.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  }
}

export default new ResetPasswordService();
