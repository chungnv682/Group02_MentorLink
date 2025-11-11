package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.PasswordResetToken;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /**
     * Find valid reset token (not used and not expired)
     */
    Optional<PasswordResetToken> findByTokenAndUsedFalseAndExpiryDateAfter(String token, LocalDateTime now);

    /**
     * Find token by value regardless of validity (for debugging/logging)
     */
    Optional<PasswordResetToken> findByToken(String token);

    /**
     * Delete all expired tokens for cleanup
     */
    void deleteByExpiryDateBefore(LocalDateTime now);

    /**
     * Delete all tokens for a given email (e.g., when user requests new token)
     */
    void deleteByEmail(String email);
}
