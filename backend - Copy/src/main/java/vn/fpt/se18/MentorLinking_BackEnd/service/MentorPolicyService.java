package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.MentorPolicyRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorPolicyResponse;

import java.util.List;

public interface MentorPolicyService {

    /**
     * Get all mentor policies
     */
    List<MentorPolicyResponse> getAllMentorPolicies();

    /**
     * Get all active mentor policies
     */
    List<MentorPolicyResponse> getActiveMentorPolicies();

    /**
     * Get mentor policy by ID
     */
    MentorPolicyResponse getMentorPolicyById(Long id);

    /**
     * Create new mentor policy
     */
    MentorPolicyResponse createMentorPolicy(MentorPolicyRequest request);

    /**
     * Update mentor policy
     */
    MentorPolicyResponse updateMentorPolicy(Long id, MentorPolicyRequest request);

    /**
     * Delete mentor policy
     */
    void deleteMentorPolicy(Long id);

    /**
     * Toggle active status of mentor policy
     */
    MentorPolicyResponse toggleActiveStatus(Long id);

    /**
     * Search mentor policies by title
     */
    List<MentorPolicyResponse> searchMentorPoliciesByTitle(String keyword);
}
