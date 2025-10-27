package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BlogPageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BlogResponse;

public interface BlogService {
    BlogPageResponse getBlogs(String keyword, String sort, int page, int size);

    BlogResponse getBlogById(Long id);
}
