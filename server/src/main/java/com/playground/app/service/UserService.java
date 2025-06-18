package com.playground.app.service;

import com.playground.app.model.dto.UserDTO;
import com.playground.app.model.dto.UserRegistrationDTO;
import com.playground.app.model.entity.User;

import java.util.List;

public interface UserService {
    
    /**
     * Register a new user
     */
    User registerUser(UserRegistrationDTO registrationDTO);
    
    /**
     * Get user by ID
     */
    User getUserById(Long id);
    
    /**
     * Get user by username
     */
    User getUserByUsername(String username);
    
    /**
     * Get all users
     */
    List<User> getAllUsers();
    
    /**
     * Update user information
     */
    User updateUser(Long id, UserDTO userDTO);
    
    /**
     * Delete a user
     */
    void deleteUser(Long id);
    
    /**
     * Check if a username exists
     */
    boolean existsByUsername(String username);
    
    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);
}