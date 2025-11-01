import { useState, useCallbac } from 'react';
import { createBookingAndGetPaymentUrl } from '../services/booking/bookingApi';
import { useQuery } from "@tanstack/react-query"
import MentorService from '../services/mentor/MentorService';


export const useBooking = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const createBooking = useCallback(async (scheduleId, description) => {
        setLoading(true);
        setError('');

        try {
            const response = await createBookingAndGetPaymentUrl(scheduleId, description);

            if (response.respCode === '0' && response.data) {
                return {
                    success: true,
                    paymentUrl: response.data,
                };
            } else {
                setError(response.description || 'Tạo đơn đặt lịch thất bại');
                return {
                    success: false,
                    error: response.description,
                };
            }
        } catch (err) {
            const errorMessage = err.description || 'Lỗi khi tạo đơn đặt lịch';
            setError(errorMessage);
            console.error('Booking error:', err);
            return {
                success: false,
                error: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        createBooking,
    };
};
