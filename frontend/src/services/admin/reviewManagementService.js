import { instance } from '../../api/axios';

const BASE_URL = '/api/admin/review-management';

/**
 * Admin Review Management Service
 * Handles reviews/ratings management from bookings
 */

// Get all reviews with filtering and pagination
export const getAllReviews = async (params = {}) => {
    const payload = {
        data: {
            keySearch: params.keySearch || '',
            rating: params.rating || null,
            status: params.status || null, // published, pending, reported
            page: params.page || 1,
            size: params.size || 10
        }
    };
    return instance.post(`${BASE_URL}/get-all-reviews`, payload);
};

// Get review details by ID
export const getReviewById = async (id) => {
    return instance.get(`${BASE_URL}/${id}`);
};

// Approve/Publish review
export const approveReview = async (id) => {
    return instance.put(`${BASE_URL}/${id}/approve`);
};

// Reject/Hide review
export const rejectReview = async (id) => {
    return instance.put(`${BASE_URL}/${id}/reject`);
};

// Delete review
export const deleteReview = async (id) => {
    return instance.delete(`${BASE_URL}/${id}`);
};

// Bulk approve reviews
export const bulkApproveReviews = async (reviewIds) => {
    return instance.put(`${BASE_URL}/bulk-approve`, reviewIds);
};

// Bulk reject reviews
export const bulkRejectReviews = async (reviewIds) => {
    return instance.put(`${BASE_URL}/bulk-reject`, reviewIds);
};

// Get review statistics
export const getReviewStatistics = async () => {
    return instance.get(`${BASE_URL}/statistics`);
};

// Handle reported review (approve or delete)
export const handleReportedReview = async (id, action) => {
    // action: 'approve' or 'delete'
    return instance.put(`${BASE_URL}/${id}/handle-report`, { action });
};

export default {
    getAllReviews,
    getReviewById,
    approveReview,
    rejectReview,
    deleteReview,
    bulkApproveReviews,
    bulkRejectReviews,
    getReviewStatistics,
    handleReportedReview
};
