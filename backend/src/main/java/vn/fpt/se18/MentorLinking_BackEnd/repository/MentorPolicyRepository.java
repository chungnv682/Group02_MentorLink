package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorPolicy;

import java.util.List;

@Repository
public interface MentorPolicyRepository extends JpaRepository<MentorPolicy, Long> {

    /**
     * Find all active mentor policies
     */
    List<MentorPolicy> findByIsActiveTrue();

    /**
     * Find all inactive mentor policies
     */
    List<MentorPolicy> findByIsActiveFalse();

    /**
     * Find mentor policies by title containing keyword (case insensitive)
     */
    @Query("SELECT mp FROM MentorPolicy mp WHERE LOWER(mp.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<MentorPolicy> findByTitleContainingIgnoreCase(@Param("keyword") String keyword);

    /**
     * Find active mentor policies by title containing keyword
     */
    @Query("SELECT mp FROM MentorPolicy mp WHERE mp.isActive = true AND LOWER(mp.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<MentorPolicy> findActiveByTitleContainingIgnoreCase(@Param("keyword") String keyword);
}
