package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Booking;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Return list of schedule ids that have bookings among given schedule ids
    @Query("select b.schedule.id from Booking b where b.schedule.id in :ids")
    List<Long> findBookedScheduleIds(@Param("ids") List<Long> ids);

    // Convenience derived method for single schedule
    boolean existsBySchedule_Id(Long scheduleId);
}

