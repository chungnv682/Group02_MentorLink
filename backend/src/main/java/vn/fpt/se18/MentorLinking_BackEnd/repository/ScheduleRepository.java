// ...existing code...
package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Schedule;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    // Find schedules for a mentor between two dates (inclusive)
    @Query("select s from Schedule s where s.user.id = :mentorId and s.date between :from and :to")
    List<Schedule> findByMentorIdAndDateBetween(@Param("mentorId") Long mentorId,
                                               @Param("from") LocalDate from,
                                               @Param("to") LocalDate to);
}

