package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Booking;
import vn.fpt.se18.MentorLinking_BackEnd.util.PaymentProcess;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Return list of schedule ids that have bookings among given schedule ids
    @Query("select b.schedule.id from Booking b where b.schedule.id in :ids")
    List<Long> findBookedScheduleIds(@Param("ids") List<Long> ids);

    // New: Return distinct schedule ids that have bookings with given payment process
    @Query("select distinct b.schedule.id from Booking b where b.schedule.id in :ids and b.paymentProcess = :process")
    List<Long> findScheduleIdsByIdsAndPaymentProcess(@Param("ids") List<Long> ids, @Param("process") PaymentProcess process);

    // Convenience derived method for single schedule
    boolean existsBySchedule_Id(Long scheduleId);

    // Find bookings by status id
    List<Booking> findByStatus_Id(Long statusId);

    Booking getBookingById(Long id);



    // Check if schedule has a COMPLETED payment booking
    boolean existsBySchedule_IdAndPaymentProcess(Long scheduleId, PaymentProcess paymentProcess);

    // Check if schedule has a COMPLETED booking excluding current booking (for race
    // condition check)
    boolean existsBySchedule_IdAndPaymentProcessAndIdNot(Long scheduleId, PaymentProcess paymentProcess,
            Long bookingId);

    // Find bookings for a given customer filtered by a list of payment processes
    List<Booking> findByCustomer_IdAndPaymentProcessIn(Long customerId, List<PaymentProcess> processes);

    @Query("select b from Booking b where b.mentor.email = :mentorEmail and b.paymentProcess = :process")
    List<Booking> findByMentorIdAndPaymentProcess(@Param("mentorEmail") String mentorEmail,
        @Param("process") PaymentProcess process);
}
