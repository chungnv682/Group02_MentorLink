import { authInstance } from '../../api/axios';

class PolicyService {
    /**
     * Lấy danh sách customer policies đang active
     * @returns {Promise} - Promise chứa response data
     */
    async getActiveCustomerPolicies() {
        try {
            const response = await authInstance.get('/api/customer-policies/active');
            console.log('API Response:', response); // Debug log
            return response;
        } catch (error) {
            console.error('Error fetching active customer policies:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách mentor policies đang active
     * @returns {Promise} - Promise chứa response data
     */
    async getActiveMentorPolicies() {
        try {
            const response = await authInstance.get('/api/mentor-policies/active');
            console.log('Mentor API Response:', response); // Debug log
            return response;
        } catch (error) {
            console.error('Error fetching active mentor policies:', error);
            throw error;
        }
    }
}

export default new PolicyService();