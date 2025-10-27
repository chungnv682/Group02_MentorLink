package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.MentorPolicyRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorPolicyResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.CustomerPolicy;
import vn.fpt.se18.MentorLinking_BackEnd.repository.CustomerPolicyRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.CustomerPolicyService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerPolicyServiceImpl implements CustomerPolicyService {

    private final CustomerPolicyRepository customerPolicyRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MentorPolicyResponse> getAllCustomerPolicies() {
        return customerPolicyRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorPolicyResponse> getActiveCustomerPolicies() {
        return customerPolicyRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MentorPolicyResponse getCustomerPolicyById(Long id) {
        CustomerPolicy policy = customerPolicyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer policy not found with id: " + id));
        return mapToResponse(policy);
    }

    @Override
    public MentorPolicyResponse createCustomerPolicy(MentorPolicyRequest request) {
        CustomerPolicy policy = CustomerPolicy.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .isActive(request.getIsActive())
                .build();

        CustomerPolicy savedPolicy = customerPolicyRepository.save(policy);
        return mapToResponse(savedPolicy);
    }

    @Override
    public MentorPolicyResponse updateCustomerPolicy(Long id, MentorPolicyRequest request) {
        CustomerPolicy existingPolicy = customerPolicyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer policy not found with id: " + id));

        existingPolicy.setTitle(request.getTitle());
        existingPolicy.setContent(request.getContent());
        existingPolicy.setIsActive(request.getIsActive());

        CustomerPolicy updatedPolicy = customerPolicyRepository.save(existingPolicy);
        return mapToResponse(updatedPolicy);
    }

    @Override
    public void deleteCustomerPolicy(Long id) {
        if (!customerPolicyRepository.existsById(id)) {
            throw new RuntimeException("Customer policy not found with id: " + id);
        }
        customerPolicyRepository.deleteById(id);
    }

    @Override
    public MentorPolicyResponse toggleActiveStatus(Long id) {
        CustomerPolicy policy = customerPolicyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer policy not found with id: " + id));

        policy.setIsActive(!policy.getIsActive());
        CustomerPolicy updatedPolicy = customerPolicyRepository.save(policy);
        return mapToResponse(updatedPolicy);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorPolicyResponse> searchCustomerPoliciesByTitle(String keyword) {
        return customerPolicyRepository.findByTitleContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private MentorPolicyResponse mapToResponse(CustomerPolicy policy) {
        return MentorPolicyResponse.builder()
                .id(policy.getId())
                .title(policy.getTitle())
                .content(policy.getContent())
                .isActive(policy.getIsActive())
                .createdAt(policy.getCreatedAt())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }
}
