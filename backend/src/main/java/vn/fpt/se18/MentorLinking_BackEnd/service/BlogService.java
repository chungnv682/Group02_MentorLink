package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.request.ModerateBlogRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BlogPageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BlogResponse;

public interface BlogService {
    BlogPageResponse getBlogs(String keyword, String sort, int page, int size);

    BlogResponse getBlogById(Long id);

    // Admin management methods only
    BlogPageResponse getAllBlogsForAdmin(String keyword, String status, String sort, int page, int size);

    void deleteBlog(Long id);

    BlogResponse moderateBlog(Long blogId, ModerateBlogRequest request, Long moderatorId);

    BlogResponse togglePublishStatus(Long id, Long updatedBy);
}
