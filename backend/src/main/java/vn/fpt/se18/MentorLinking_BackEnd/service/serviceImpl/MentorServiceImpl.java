package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.*;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Booking;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.repository.BookingRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorService;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import vn.fpt.se18.MentorLinking_BackEnd.util.PaymentProcess;

@Service
@RequiredArgsConstructor
public class MentorServiceImpl implements MentorService {


    private final MentorRepository mentorRepository;
    private final BookingRepository bookingRepository;

    public MentorPageResponse getAllMentors(String keyword, String sort, int page, int size) {
        Sort.Order order = new Sort.Order(Sort.Direction.ASC, "id");
        if (StringUtils.hasLength(sort)) {
            Pattern pattern = Pattern.compile("^(\\w+):(asc|desc)$", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(sort);
            if (matcher.find()) {
                String columnName = matcher.group(1);
                if (matcher.group(2).equalsIgnoreCase("asc")) {
                    order = new Sort.Order(Sort.Direction.ASC, columnName);
                } else {
                    order = new Sort.Order(Sort.Direction.DESC, columnName);
                }
            }
        }

        int pageNo = 0;
        if (page > 0) {
            pageNo = page - 1;
        }

        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(order));

        Page<User> entityPage;

        if (StringUtils.hasLength(keyword)) {
            keyword = "%" + keyword.toLowerCase() + "%";
            entityPage = mentorRepository.searchByKeyword(keyword, pageable);
        } else {
            entityPage = mentorRepository.getAllMentorWithRelatedData(pageable);
        }

        List<MentorResponse> mentorResponses = entityPage.stream().map(
                user -> {
                    // Map approved countries - only get APPROVED status
                    List<String> approvedCountries = user.getMentorCountries().stream()
                            .filter(mentorCountry -> "APPROVED".equals(mentorCountry.getStatus().getCode()))
                            .map(mentorCountry -> mentorCountry.getCountry().getName())
                            .toList();

                    return MentorResponse.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .fullname(user.getFullname())
                            .dob(user.getDob())
                            .phone(user.getPhone())
                            .gender(user.getGender())
                            .address(user.getAddress())
                            .currentLocation(user.getCurrentLocation())
                            .title(user.getTitle())
                            .linkedinUrl(user.getLinkedinUrl())
                            .avatarUrl(user.getAvatarUrl())
                            .intro(user.getIntro())
                            .rating(user.getRating())
                            .numberOfBooking(user.getNumberOfBooking())
                            .approvedCountries(approvedCountries)
                            .build();
                }
        ).toList();

        MentorPageResponse mentorPageResponse = new MentorPageResponse();
        mentorPageResponse.setPageNumber(entityPage.getNumber());
        mentorPageResponse.setPageSize(entityPage.getSize());
        mentorPageResponse.setTotalElements(entityPage.getTotalElements());
        mentorPageResponse.setTotalPages(entityPage.getTotalPages());
        mentorPageResponse.setMentors(mentorResponses);

        return mentorPageResponse;
    }

    @Transactional(readOnly = true)
    public MentorDetailResponse getMentorById(Long id) {
        User mentor = mentorRepository.getMentorByIdWithRelatedData(id);

        if (mentor == null) {
            throw new RuntimeException("Mentor not found with id: " + id);
        }

        // Map educations - force lazy loading
        List<MentorEducationResponse> educations = mentor.getMentorEducations().stream()
                .map(education -> MentorEducationResponse.builder()
                        .schoolName(education.getSchoolName())
                        .major(education.getMajor())
                        .startDate(education.getStartDate())
                        .endDate(education.getEndDate())
                        .certificateImage(education.getCertificateImage())
                        .build())
                .toList();

        // Map experiences - force lazy loading
        List<MentorExperienceResponse> experiences = mentor.getMentorExperiences().stream()
                .map(experience -> MentorExperienceResponse.builder()
                        .companyName(experience.getCompanyName())
                        .position(experience.getPosition())
                        .startDate(experience.getStartDate())
                        .endDate(experience.getEndDate())
                        .experienceImage(experience.getExperienceImage())
                        .build())
                .toList();

        // Map services - force lazy loading
        List<MentorServiceResponse> services = mentor.getMentorServices().stream()
                .map(service -> MentorServiceResponse.builder()
                        .serviceName(service.getServiceName())
                        .description(service.getDescription())
                        .build())
                .toList();

        // Map tests - force lazy loading
        List<MentorTestResponse> tests = mentor.getMentorTests().stream()
                .map(test -> MentorTestResponse.builder()
                        .testName(test.getTestName())
                        .score(test.getScore())
                        .scoreImage(test.getScoreImage())
                        .build())
                .toList();

        // Map approved countries - only get APPROVED status
        List<CountryResponse> approvedCountries = mentor.getMentorCountries().stream()
                .filter(mentorCountry -> "APPROVED".equals(mentorCountry.getStatus().getCode()))
                .map(mentorCountry -> CountryResponse.builder()
                        .id(mentorCountry.getCountry().getId())
                        .code(mentorCountry.getCountry().getCode())
                        .name(mentorCountry.getCountry().getName())
                        .flagUrl(mentorCountry.getCountry().getFlagUrl())
                        .description(mentorCountry.getCountry().getDescription())
                        .build())
                .toList();

        return MentorDetailResponse.builder()
                .id(mentor.getId())
                .username(mentor.getUsername())
                .email(mentor.getEmail())
                .role(mentor.getRole())
                .fullname(mentor.getFullname())
                .dob(mentor.getDob())
                .phone(mentor.getPhone())
                .gender(mentor.getGender())
                .address(mentor.getAddress())
                .currentLocation(mentor.getCurrentLocation())
                .title(mentor.getTitle())
                .linkedinUrl(mentor.getLinkedinUrl())
                .avatarUrl(mentor.getAvatarUrl())
                .intro(mentor.getIntro())
                .rating(mentor.getRating())
                .numberOfBooking(mentor.getNumberOfBooking())
                .educations(educations)
                .experiences(experiences)
                .services(services)
                .tests(tests)
                .approvedCountries(approvedCountries)
                .build();
    }

    @Override
    public MentorActivityResponse getMentorActivitiesByMentorEmail(String email) {
        List<Booking> bookings = bookingRepository.findByMentorIdAndPaymentProcess(email, PaymentProcess.COMPLETED);
        if (bookings.isEmpty()) {
            return MentorActivityResponse.builder()
                .pending(List.of())
                .confirmed(List.of())
                .completed(List.of())
                .cancelled(List.of())
                .build();
        }
        Map<String, List<BookingResponse>> grouped = bookings.stream()
            .map(this::toBookingResponse)
            .collect(Collectors.groupingBy(BookingResponse::getStatus));

        return MentorActivityResponse.builder()
            .pending(grouped.getOrDefault("PENDING", List.of()))
            .confirmed(grouped.getOrDefault("CONFIRMED", List.of()))
            .completed(grouped.getOrDefault("COMPLETED", List.of()))
            .cancelled(grouped.getOrDefault("CANCELLED", List.of()))
            .build();
    }

    private BookingResponse toBookingResponse(Booking b) {
        return BookingResponse.builder()
            .id(b.getId())
            .customer(BookingCustomerProfileResponse.builder()
                .id(b.getCustomer().getId())
                .fullname(b.getCustomer().getFullname())
                .email(b.getCustomer().getEmail())
                .phone(b.getCustomer().getPhone())
                .build())
            .service(b.getSchedule().getUser().getTitle()) // Hoặc tên service bạn muốn
            .date(b.getSchedule().getDate())
            .timeSlot(b.getSchedule().getTimeSlots().stream()
                .findFirst()
                .map(ts -> new BookingTimeSlotResponse(ts.getTimeStart(), ts.getTimeEnd()))
                .orElse(null))
            .status(b.getStatus().getCode().toUpperCase())
            .createdAt(b.getCreatedAt())
            .note(b.getDescription())
            .comment(b.getComment())
            .rating(b.getReview() != null ? b.getReview().getRating() : null)
            .review(b.getReview() != null ? b.getReview().getComment() : null)
            .build();
    }
}
