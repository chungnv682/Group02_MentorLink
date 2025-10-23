package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.MentorPolicyRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorPolicyResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.CustomerPolicyService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/customer-policies")
@RequiredArgsConstructor
@Slf4j
public class CustomerPolicyController {

    private final CustomerPolicyService customerPolicyService;

    @GetMapping
    public BaseResponse<List<MentorPolicyResponse>> getAllCustomerPolicies() {
        log.info("Getting all customer policies");
        return BaseResponse.<List<MentorPolicyResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get all customer policies successfully")
                .data(customerPolicyService.getAllCustomerPolicies())
                .build();
    }

    @GetMapping("/active")
    public BaseResponse<List<MentorPolicyResponse>> getActiveCustomerPolicies() {
        log.info("Getting all active customer policies");
        return BaseResponse.<List<MentorPolicyResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get active customer policies successfully")
                .data(customerPolicyService.getActiveCustomerPolicies())
                .build();
    }

    @GetMapping("/{id}")
    public BaseResponse<MentorPolicyResponse> getCustomerPolicyById(@PathVariable Long id) {
        log.info("Getting customer policy by id: {}", id);
        return BaseResponse.<MentorPolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get customer policy successfully")
                .data(customerPolicyService.getCustomerPolicyById(id))
                .build();
    }

    @PostMapping
    public BaseResponse<MentorPolicyResponse> createCustomerPolicy(@Valid @RequestBody MentorPolicyRequest request) {
        log.info("Creating new customer policy with title: {}", request.getTitle());
        return BaseResponse.<MentorPolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Customer policy created successfully")
                .data(customerPolicyService.createCustomerPolicy(request))
                .build();
    }

    @PutMapping("/{id}")
    public BaseResponse<MentorPolicyResponse> updateCustomerPolicy(@PathVariable Long id,
                                                                   @Valid @RequestBody MentorPolicyRequest request) {
        log.info("Updating customer policy with id: {}", id);
        return BaseResponse.<MentorPolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Customer policy updated successfully")
                .data(customerPolicyService.updateCustomerPolicy(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public BaseResponse<Void> deleteCustomerPolicy(@PathVariable Long id) {
        log.info("Deleting customer policy with id: {}", id);
        customerPolicyService.deleteCustomerPolicy(id);
        return BaseResponse.<Void>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Customer policy deleted successfully")
                .build();
    }

    @PatchMapping("/{id}/toggle-status")
    public BaseResponse<MentorPolicyResponse> toggleActiveStatus(@PathVariable Long id) {
        log.info("Toggling active status for customer policy with id: {}", id);
        return BaseResponse.<MentorPolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Customer policy status toggled successfully")
                .data(customerPolicyService.toggleActiveStatus(id))
                .build();
    }

    @GetMapping("/search")
    public BaseResponse<List<MentorPolicyResponse>> searchCustomerPolicies(@RequestParam String keyword) {
        log.info("Searching customer policies with keyword: {}", keyword);
        return BaseResponse.<List<MentorPolicyResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Search customer policies successfully")
                .data(customerPolicyService.searchCustomerPoliciesByTitle(keyword))
                .build();
    }
}
