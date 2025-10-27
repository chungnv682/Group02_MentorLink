package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Banner;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findTop5ByStatus_NameAndIsPublishedOrderByPositionAsc(String statusName, Boolean isPublished);
}
