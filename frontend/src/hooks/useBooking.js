<<<<<<< HEAD
import { useState, useCallbac } from 'react';
import { createBookingAndGetPaymentUrl } from '../services/booking/bookingApi';
import { useQuery } from "@tanstack/react-query"
import MentorService from '../services/mentor/MentorService';

=======
import { useState, useCallback } from 'react';
import { createBookingAndGetPaymentUrl } from '../services/booking/bookingApi';
>>>>>>> 1cbb84ee52c3c7e89de0706aa458716d0cd487df

export const useBooking = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

<<<<<<< HEAD
    const createBooking = useCallback(async (scheduleId, description) => {
=======
    // createBooking now accepts an optional `service` parameter (matching backend enum)
    const createBooking = useCallback(async (scheduleId, description, service = 'OTHERS') => {
>>>>>>> 1cbb84ee52c3c7e89de0706aa458716d0cd487df
        setLoading(true);
        setError('');

        try {
<<<<<<< HEAD
            const response = await createBookingAndGetPaymentUrl(scheduleId, description);
=======
            const response = await createBookingAndGetPaymentUrl(scheduleId, description, service);
>>>>>>> 1cbb84ee52c3c7e89de0706aa458716d0cd487df

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
