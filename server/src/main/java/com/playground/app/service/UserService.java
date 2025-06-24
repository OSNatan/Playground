package com.playground.app.service;
import com.playground.app.model.dto.UserRegistrationDTO;
import com.playground.app.model.entity.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface UserService {

    User createUser(User user);

    User getUserById(Long id);

    List<User> getAllUsers();

    void deleteUser(Long id);

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    User getUserByUsername(String username);

    public User updateUser(User user);

    public Optional<User> findByEmail(String email);

    User registerUser(UserRegistrationDTO registrationDTO);
}