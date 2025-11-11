package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.PasswordResetToken;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository quản lý password reset tokens
 */
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /**
     * Tìm token hợp lệ (chưa dùng và chưa hết hạn)
     */
    Optional<PasswordResetToken> findByTokenAndUsedFalseAndExpiryDateAfter(String token, LocalDateTime now);

    /**
     * Tìm token theo value (dùng cho debug)
     */
    Optional<PasswordResetToken> findByToken(String token);

    /**
     * Xóa tất cả token đã hết hạn (cleanup)
     */
    void deleteByExpiryDateBefore(LocalDateTime now);

    /**
     * Xóa tất cả token của email (khi tạo token mới)
     */
    void deleteByEmail(String email);
}
