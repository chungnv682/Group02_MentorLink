import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import passwordResetService from '../../services/auth/PasswordResetService';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const { showToast } = useToast();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            showToast('Vui lòng nhập email', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showToast('Email không hợp lệ', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const result = await passwordResetService.sendResetPasswordEmail(email);

            if (result.success) {
                setIsEmailSent(true);
                showToast(result.message, 'success');
            } else {
                showToast(result.error, 'error');
            }
        } catch (error) {
            console.error('Error sending reset email:', error);
            showToast('Có lỗi xảy ra. Vui lòng thử lại sau.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendEmail = async () => {
        if (!email.trim()) return;
        
        setIsLoading(true);
        try {
            const result = await passwordResetService.sendResetPasswordEmail(email);
            if (result.success) {
                showToast('Email đã được gửi lại', 'success');
            } else {
                showToast(result.error, 'error');
            }
        } catch (error) {
            showToast('Có lỗi xảy ra khi gửi lại email', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isEmailSent) {
        return (
            <div className="forgot-password-container">
                <div className="forgot-password-card">
                    <div className="forgot-password-header">
                        <div className="logo">📧</div>
                        <h2>Kiểm tra email của bạn</h2>
                    </div>
                    
                    <div className="forgot-password-content">
                        <div className="success-message">
                            <p>Chúng tôi đã gửi link đặt lại mật khẩu đến:</p>
                            <div className="email-display">{email}</div>
                            
                            <p className="instruction">
                                Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam) và nhấp vào link để đặt lại mật khẩu.
                            </p>
                            
                            <p className="expiry-note">
                                <strong>Lưu ý:</strong> Link sẽ hết hạn sau 15 phút.
                            </p>
                        </div>
                        
                        <div className="action-buttons">
                            <button 
                                type="button"
                                onClick={handleResendEmail}
                                disabled={isLoading}
                                className="resend-button"
                            >
                                {isLoading ? 'Đang gửi...' : 'Gửi lại email'}
                            </button>
                            
                            <Link to="/login" className="back-to-login">
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <div className="forgot-password-header">
                    <div className="logo">🔑</div>
                    <h2>Quên mật khẩu</h2>
                    <p>Nhập email để nhận link đặt lại mật khẩu</p>
                </div>
                
                <form onSubmit={handleSubmit} className="forgot-password-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <span className="input-icon">📧</span>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập email của bạn"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="submit-button"
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Đang gửi...
                            </>
                        ) : (
                            'Gửi link đặt lại mật khẩu'
                        )}
                    </button>
                </form>
                
                <div className="forgot-password-footer">
                    <p>Đã nhớ mật khẩu? <Link to="/login">Đăng nhập</Link></p>
                    <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;