// ...existing code...
package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.response.ScheduleResponse;

import java.util.List;

public interface ScheduleService {
    /**
     * Get schedules for a mentor for today, tomorrow and the day after (3 days)
     * @param mentorId mentor id
     * @return list of ScheduleResponse
     */
    List<ScheduleResponse> getUpcomingSchedulesForMentor(Long mentorId);
}

