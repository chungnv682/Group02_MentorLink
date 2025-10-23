package vn.fpt.se18.MentorLinking_BackEnd.service;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.user.UserRequestDTO;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;

@Service
public interface UserService {

    UserDetailsService userDetailsService();

    User getByUsername(String userName);

    long saveUser(UserRequestDTO request);

    void saveUser(User user);

    List<String> getAllRolesByUserId(long userId);

    User getUserByEmail(String email);
}
