import { authInstance } from '../../api/axios';

class ResetPasswordService {
  /**
   * Change password using reset token
   * @param {string} token - reset token (secretKey)
   * @param {string} password - new password
   * @param {string} confirmPassword - confirm new password
   */
  async changePassword(token, password, confirmPassword) {
    try {
      const baseRequest = {
        requestDateTime: new Date().toISOString(),
        data: { secretKey: token, password, confirmPassword }
      };

      const response = await authInstance.post('/api/auth/change-password', baseRequest, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response && response.respCode === '0') {
        return {
          success: true,
          message: response.description || 'Đổi mật khẩu thành công',
          data: response.data
        };
      }

      return { success: false, error: response?.description || 'Không thể đổi mật khẩu' };
    } catch (error) {
      console.error('Change password error:', error);
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';

      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.description) errorMessage = errorData.description;
        else if (errorData.message) errorMessage = errorData.message;
        else if (typeof errorData.data === 'string') errorMessage = errorData.data;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  }
}

export default new ResetPasswordService();
