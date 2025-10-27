package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.FAQ;

@Repository
public interface FaqRepository extends JpaRepository<FAQ, Long> {
    Page<FAQ> findByIsPublishedTrue(Pageable pageable);
}

