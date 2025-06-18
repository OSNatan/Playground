package com.playground.app.model.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String email;
}