package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorPageResponse;

public interface MentorService {
     MentorPageResponse getAllMentors(String keyword, String sort, int page, int size);

     MentorDetailResponse getMentorById(Long id);
}
