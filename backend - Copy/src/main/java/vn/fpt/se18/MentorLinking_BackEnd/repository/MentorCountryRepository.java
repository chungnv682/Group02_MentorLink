package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorCountry;

import java.util.List;

@Repository
public interface MentorCountryRepository extends JpaRepository<MentorCountry, Long> {
    List<MentorCountry> findAllByStatus_Code(String code);
}
