import { instance } from '../../api/axios';

const BASE_URL = '/api/admin/user-management';

/**
 * Get all users with filters and pagination
 * @param {Object} params - Filter parameters
 * @param {string} params.keySearch - Search by name or email
 * @param {number} params.roleId - Filter by role ID
 * @param {number} params.status - Filter by status
 * @param {number} params.page - Page number (starts from 1)
 * @param {number} params.size - Items per page
 * @returns {Promise} Response with users list and pagination info
 */
export const getAllUsers = async (params = {}) => {
    const { keySearch, roleId, status, page = 1, size = 10 } = params;
    
    // Build data object theo đúng GetUserRequest DTO của backend
    const data = {
        page: parseInt(page), // @NotNull, @Min(1)
        size: parseInt(size)  // @NotNull, @Min(1)
    };
    
    // Only add optional fields if they have truthy values
    if (keySearch && keySearch.trim() !== '') {
        data.keySearch = keySearch.trim();
    }
    if (roleId !== null && roleId !== undefined && roleId !== '') {
        data.roleId = parseInt(roleId);
    }
    if (status !== null && status !== undefined && status !== '') {
        data.status = parseInt(status);
    }
    
    const requestBody = {
        requestDateTime: new Date().toISOString(),
        data
    };

    console.log('🔍 Request to:', `${BASE_URL}/get-all-users`);
    console.log('📦 Request Body:', JSON.stringify(requestBody, null, 2));
    
    try {
        // POST request - không bị conflict với GET /{id}
        const response = await instance.post(`${BASE_URL}/get-all-users`, requestBody);
        console.log('✅ Response:', response);
        return response;
    } catch (error) {
        console.error('❌ Error calling getAllUsers:', error);
        console.error('Error details:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise} User detail
 */
export const getUserById = async (id) => {
    return await instance.get(`${BASE_URL}/${id}`);
};

/**
 * Delete user by ID
 * @param {number} id - User ID
 * @returns {Promise} Delete result
 */
export const deleteUser = async (id) => {
    return await instance.delete(`${BASE_URL}/delete/${id}`);
};

/**
 * Get user statistics (total users, mentors, blocked, pending)
 * @returns {Promise} Statistics data
 */
export const getUserStatistics = async () => {
    return await instance.get(`${BASE_URL}/statistics`);
};

export default {
    getAllUsers,
    getUserById,
    deleteUser,
    getUserStatistics
};
