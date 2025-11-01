package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.country.CountryApprovalRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.country.CountrySuggestionRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.CountryResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Country;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.CountryRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.CountryService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CountryServiceImpl implements CountryService {

    private final CountryRepository countryRepository;
    private final StatusRepository statusRepository;
    private final UserRepository userRepository;

    @Override
    public List<CountryResponse> getApprovedCountries() {
        log.info("Fetching all approved countries");
        List<Country> countries = countryRepository.findAllByStatus_Code("APPROVED");
        return countries.stream()
                .map(this::toCountryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CountryResponse> getPendingCountries() {
        log.info("Fetching all pending countries");
        List<Country> countries = countryRepository.findAllByStatus_Code("PENDING");
        return countries.stream()
                .map(this::toCountryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CountryResponse suggestCountry(CountrySuggestionRequest request) {
        log.info("Suggesting new country: {} ({})", request.getName(), request.getCode());
        
        // Check if country already exists
        if (countryRepository.findByCode(request.getCode()).isPresent()) {
            throw new AppException(ErrorCode.COUNTRY_ALREADY_EXISTS);
        }
        
        // Get PENDING status
        Status pendingStatus = statusRepository.findByCode("PENDING")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));
        
        // Get user who suggested
        User suggestedBy = userRepository.findById(request.getSuggestedBy())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        // Create new country
        Country country = Country.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .status(pendingStatus)
                .createdBy(suggestedBy)
                .build();
        
        Country savedCountry = countryRepository.save(country);
        log.info("Country suggestion saved with ID: {}", savedCountry.getId());
        
        return toCountryResponse(savedCountry);
    }

    @Override
    @Transactional
    public CountryResponse approveCountry(Long countryId, CountryApprovalRequest request) {
        log.info("Approving country with ID: {}", countryId);
        
        Country country = countryRepository.findById(countryId)
                .orElseThrow(() -> new AppException(ErrorCode.COUNTRY_NOT_FOUND));
        
        // Get APPROVED status
        Status approvedStatus = statusRepository.findByCode("APPROVED")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));
        
        // Update country
        country.setStatus(approvedStatus);
        if (request.getFlagUrl() != null) {
            country.setFlagUrl(request.getFlagUrl());
        }
        if (request.getDescription() != null) {
            country.setDescription(request.getDescription());
        }
        
        Country updatedCountry = countryRepository.save(country);
        log.info("Country approved: {}", updatedCountry.getName());
        
        return toCountryResponse(updatedCountry);
    }

    @Override
    @Transactional
    public void rejectCountry(Long countryId, String reason) {
        log.info("Rejecting country with ID: {}", countryId);
        
        Country country = countryRepository.findById(countryId)
                .orElseThrow(() -> new AppException(ErrorCode.COUNTRY_NOT_FOUND));
        
        // Get REJECTED status
        Status rejectedStatus = statusRepository.findByCode("REJECTED")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));
        
        country.setStatus(rejectedStatus);
        countryRepository.save(country);
        
        log.info("Country rejected: {}", country.getName());
    }

    @Override
    public List<CountryResponse> searchCountries(String keyword) {
        log.info("Searching countries with keyword: {}", keyword);
        
        List<Country> countries = countryRepository.searchCountries(keyword, "APPROVED");
        return countries.stream()
                .map(this::toCountryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Object getCountryStats() {
        log.info("Fetching country statistics");
        
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalApproved", countryRepository.countByStatus_Code("APPROVED"));
        stats.put("totalPending", countryRepository.countByStatus_Code("PENDING"));
        stats.put("totalRejected", countryRepository.countByStatus_Code("REJECTED"));
        stats.put("totalCountries", countryRepository.count());
        
        return stats;
    }

    @Override
    public List<CountryResponse> getPopularCountries(int limit) {
        log.info("Fetching top {} popular countries", limit);
        
        Pageable pageable = PageRequest.of(0, limit);
        List<Country> countries = countryRepository.findPopularCountries(pageable);
        
        return countries.stream()
                .map(this::toCountryResponse)
                .collect(Collectors.toList());
    }

    private CountryResponse toCountryResponse(Country country) {
        if (country == null) {
            return null;
        }
        
        return CountryResponse.builder()
                .id(country.getId())
                .code(country.getCode())
                .name(country.getName())
                .flagUrl(country.getFlagUrl())
                .description(country.getDescription())
                .build();
    }
}
