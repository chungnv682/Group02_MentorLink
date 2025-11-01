// API Booking
import { instance } from '../../api/axios';

export const createBookingAndGetPaymentUrl = async (scheduleId, description) => {
    try {
        console.log('Sending booking request:', { scheduleId, description });
        const response = await instance.post('/api/bookings/create-payment', {
            scheduleId,
            description,
        });
        console.log('Booking API Response:', response);
        return response;
    } catch (error) {
        console.error('Booking API Error:', error);
        // instance interceptor already extracts response.data
        // If error, return it with proper respCode
        if (error?.respCode) {
            return error;
        }
        // Fallback for unexpected error format
        return {
            respCode: '1',
            description: error?.description || error?.message || 'Network error'
        };
    }
};

export const cleanupUnpaidBookings = async () => {
    try {
        console.log('Calling cleanup unpaid bookings...');
        const response = await instance.post('/api/bookings/cleanup-unpaid');
        console.log('Cleanup response:', response);
        return response;
    } catch (error) {
        console.error('Cleanup Error:', error);
        // Ignore cleanup errors, just log them
        return null;
    }
};

export const handleBookingActionApi = async (bookingId, action) => {
    try {
        console.log(`Handling booking action: ${action} for bookingId: ${bookingId}`);
        const response = await instance.post(`/api/mentors/handle-booking`, {
            bookingId,
            action
        });
        console.log('Booking action response:', response);
        return response;
    } catch (error) {
        console.error('Booking action error:', error);
    }
};