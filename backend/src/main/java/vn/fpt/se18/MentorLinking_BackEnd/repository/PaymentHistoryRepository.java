package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.PaymentHistory;

import java.util.Optional;

public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory, Long> {
    Optional<PaymentHistory> findByTransactionCode(String transactionCode);

    Optional<PaymentHistory> findByBookingId(Long bookingId);
}
