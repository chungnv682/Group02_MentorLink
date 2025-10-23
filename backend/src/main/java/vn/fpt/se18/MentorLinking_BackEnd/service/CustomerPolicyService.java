package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.MentorPolicyRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorPolicyResponse;

import java.util.List;

public interface CustomerPolicyService {

    /**
     * Get all customer policies
     */
    List<MentorPolicyResponse> getAllCustomerPolicies();

    /**
     * Get all active customer policies
     */
    List<MentorPolicyResponse> getActiveCustomerPolicies();

    /**
     * Get customer policy by ID
     */
    MentorPolicyResponse getCustomerPolicyById(Long id);

    /**
     * Create new customer policy
     */
    MentorPolicyResponse createCustomerPolicy(MentorPolicyRequest request);

    /**
     * Update customer policy
     */
    MentorPolicyResponse updateCustomerPolicy(Long id, MentorPolicyRequest request);

    /**
     * Delete customer policy
     */
    void deleteCustomerPolicy(Long id);

    /**
     * Toggle active status of customer policy
     */
    MentorPolicyResponse toggleActiveStatus(Long id);

    /**
     * Search customer policies by title
     */
    List<MentorPolicyResponse> searchCustomerPoliciesByTitle(String keyword);
}
