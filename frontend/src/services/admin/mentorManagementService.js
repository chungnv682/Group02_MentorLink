import { instance } from '../../api/axios';

const BASE_URL = '/api/admin/mentor-management';

/**
 * Admin Mentor Management Service
 * Handles mentor approval, rejection, and management operations
 */

// Get all mentors with filtering and pagination
export const getAllMentors = async (params = {}) => {
    const payload = {
        data: {
            keySearch: params.keySearch || '',
            status: params.status || null,
            page: params.page || 1,
            size: params.size || 10
        }
    };
    return instance.post(`${BASE_URL}/get-all-mentors`, payload);
};

// Get mentor details by ID
export const getMentorById = async (id) => {
    return instance.get(`${BASE_URL}/${id}`);
};

// Approve a mentor
export const approveMentor = async (id) => {
    return instance.put(`${BASE_URL}/${id}/approve`);
};

// Reject a mentor
export const rejectMentor = async (id) => {
    return instance.put(`${BASE_URL}/${id}/reject`);
};

// Bulk approve mentors
export const bulkApproveMentors = async (mentorIds) => {
    return instance.put(`${BASE_URL}/bulk-approve`, mentorIds);
};

// Bulk reject mentors
export const bulkRejectMentors = async (mentorIds) => {
    return instance.put(`${BASE_URL}/bulk-reject`, mentorIds);
};

// Get mentor statistics (pending, approved, rejected, total)
export const getMentorStatistics = async () => {
    return instance.get(`${BASE_URL}/statistics`);
};

export default {
    getAllMentors,
    getMentorById,
    approveMentor,
    rejectMentor,
    bulkApproveMentors,
    bulkRejectMentors,
    getMentorStatistics
};
