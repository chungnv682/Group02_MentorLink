package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.request.country.CountrySuggestionRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.country.CountryApprovalRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.CountryResponse;

import java.util.List;

public interface CountryService {
    
    // Get all approved countries
    List<CountryResponse> getApprovedCountries();
    
    // Get pending country suggestions
    List<CountryResponse> getPendingCountries();
    
    // Submit country suggestion
    CountryResponse suggestCountry(CountrySuggestionRequest request);
    
    // Admin: Approve country suggestion
    CountryResponse approveCountry(Long countryId, CountryApprovalRequest request);
    
    // Admin: Reject country suggestion
    void rejectCountry(Long countryId, String reason);
    
    // Search countries
    List<CountryResponse> searchCountries(String keyword);
    
    // Get country statistics
    Object getCountryStats();
    
    // Get popular countries (most mentors)
    List<CountryResponse> getPopularCountries(int limit);
}
