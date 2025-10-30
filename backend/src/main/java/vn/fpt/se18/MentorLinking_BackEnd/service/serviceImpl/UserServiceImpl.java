package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.user.GetUserRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.user.UserRequestDTO;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.user.UserDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.user.UserStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Role;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.RoleRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserStatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.UserService;
import vn.fpt.se18.MentorLinking_BackEnd.util.UserStatus;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserStatusRepository userStatusRepository;
    private final RoleRepository roleRepository;

    @Override
    public UserDetailsService userDetailsService() {
//        return username -> userRepository.findByUsernameWithRole(username)
//                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return username -> userRepository.findByEmailWithRole(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    }

    @Override
    public User getByUsername(String userName) {
        return userRepository.findByUsername(userName).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    public long saveUser(UserRequestDTO request) {
        User user = User.builder()
                .fullname(request.getFirstName())
                .email(request.getEmail())
                .password(request.getPassword())
                .build();
        userRepository.save(user);

        log.info("User has added successfully, userId={}", user.getId());

        return user.getId();
    }

    @Override
    public void saveUser(User user) {
        userRepository.save(user);
    }

    @Override
    public List<String> getAllRolesByUserId(long userId) {
        return userRepository.findAllRolesByUserId(userId);
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "Email not found"));
    }

    @Override
    public BaseResponse<PageResponse<UserDetailResponse>> getAllUsersWithCondition(BaseRequest<GetUserRequest> request) {
        GetUserRequest requestData = request.getData();
        Pageable pageable = PageRequest.of(requestData.getPage() - 1, requestData.getSize());


        String keySearch = requestData.getKeySearch() != null ? requestData.getKeySearch().trim() : null;
        Long status = requestData.getStatus() != null ? requestData.getStatus().longValue() : null;
        Long roleId = requestData.getRoleId() != null ? requestData.getRoleId().longValue() : null;

        Page<User> pageResult = userRepository.findAllWithCondition(
                keySearch,
                roleId,
                status,
                pageable
        );

        PageResponse<UserDetailResponse> pageResponse = PageResponse.<UserDetailResponse>builder()
                .content(pageResult.getContent().stream()
                        .map(this::convertToResponse)
                        .collect(Collectors.toList()))
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .currentPage(request.getData().getPage())
                .pageSize(request.getData().getSize())
                .build();

        return BaseResponse.<PageResponse<UserDetailResponse>>builder()
                .requestDateTime(request.getRequestDateTime())
                .respCode("0")
                .description("Get all users successfully")
                .data(pageResponse)
                .build();
    }

    @Override
    public BaseResponse<UserDetailResponse> getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED, "User not found"));

        return BaseResponse.<UserDetailResponse>builder()
                .requestDateTime("")
                .respCode("0")
                .description("Get user successfully")
                .data(convertToResponse(user))
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<Void> deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED, "User not found"));

        userRepository.delete(user);
        log.info("User deleted successfully, userId={}", id);

        return BaseResponse.<Void>builder()
                .requestDateTime(String.valueOf(LocalDateTime.now()))
                .respCode("0")
                .description("User deleted successfully")
                .build();
    }

    @Override
    public BaseResponse<UserStatisticsResponse> getUserStatistics() {
        long totalUsers = userRepository.count();

        Map<String, Long> usersByStatus = new HashMap<>();
        List<Status> allStatuses = userStatusRepository.findAll();
        for (Status status : allStatuses) {
            long count = userRepository.countByStatus(status);
            usersByStatus.put(status.getName(), count);
        }

        Map<String, Long> usersByRole = new HashMap<>();
        List<Role> allRoles = roleRepository.findAll();
        for (Role role : allRoles) {
            long count = userRepository.countByRole(role);
            usersByRole.put(role.getName(), count);
        }

        UserStatisticsResponse statistics = UserStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .totalUserBlocked(usersByStatus.getOrDefault("BLOCKED", 0L))
                .totalMentorPending(usersByStatus.getOrDefault("PENDING", 0L))
                .totalMentors(usersByRole.getOrDefault("MENTOR", 0L))
                .build();

        return BaseResponse.<UserStatisticsResponse>builder()
                .requestDateTime("")
                .respCode("0")
                .description("Get user statistics successfully")
                .data(statistics)
                .build();
    }


    private UserDetailResponse convertToResponse(User user) {
        return UserDetailResponse.builder()
                .id(user.getId())
                .fullName(user.getFullname())
                .email(user.getEmail())
                .roleName(user.getRole().getName().isEmpty() ? null : user.getRole().getName())
                .status(user.getStatus().getName())
                .createTime(user.getCreatedAt())
                .build();
    }
}
