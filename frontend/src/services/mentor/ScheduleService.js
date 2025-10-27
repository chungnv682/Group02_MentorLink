import { instance } from '../../api/axios';

class ScheduleService {
    /**
     * Get upcoming schedules for a specific mentor
     * @param {number} mentorId - Mentor ID
     * @returns {Promise} Response with schedule data
     */
    static async getUpcomingSchedules(mentorId) {
        try {
            const response = await instance.get(`/api/schedules/mentor/${mentorId}/upcoming`);
            return response;
        } catch (error) {
            console.error('Error fetching upcoming schedules:', error);
            throw error;
        }
    }

    /**
     * Get schedules for a mentor within a date range
     * @param {number} mentorId - Mentor ID
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @returns {Promise} Response with schedule data
     */
    static async getSchedulesByDateRange(mentorId, startDate, endDate) {
        try {
            const response = await instance.get(`/api/schedules/mentor/${mentorId}`, {
                params: {
                    startDate,
                    endDate
                }
            });
            return response;
        } catch (error) {
            console.error('Error fetching schedules by date range:', error);
            throw error;
        }
    }

    /**
     * Get all available time slots
     * @returns {Promise} Response with time slots data
     */
    static async getTimeSlots() {
        try {
            const response = await instance.get(`/api/time-slots`);
            return response;
        } catch (error) {
            console.error('Error fetching time slots:', error);
            throw error;
        }
    }

    /**
     * Book a schedule slot
     * @param {number} scheduleId - Schedule ID
     * @param {number} timeSlotId - Time slot ID
     * @param {object} bookingData - Additional booking data
     * @returns {Promise} Response with booking confirmation
     */
    static async bookScheduleSlot(scheduleId, timeSlotId, bookingData = {}) {
        try {
            const response = await instance.post(
                `/api/schedules/${scheduleId}/slots/${timeSlotId}/book`,
                bookingData
            );
            return response;
        } catch (error) {
            console.error('Error booking schedule slot:', error);
            throw error;
        }
    }
}

export default ScheduleService;
