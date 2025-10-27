package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Blog;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {

    @Query("SELECT b FROM Blog b JOIN b.author a JOIN b.status s " +
            "WHERE (LOWER(b.title) LIKE :keyword OR LOWER(a.fullname) LIKE :keyword OR LOWER(a.username) LIKE :keyword) " +
            "AND s.name = :statusName AND b.isPublished = :isPublished")
    Page<Blog> searchByKeywordAndStatusAndPublished(@Param("keyword") String keyword,
                                                    @Param("statusName") String statusName,
                                                    @Param("isPublished") Boolean isPublished,
                                                    Pageable pageable);

    Page<Blog> findByStatus_NameAndIsPublished(String statusName, Boolean isPublished, Pageable pageable);
}
