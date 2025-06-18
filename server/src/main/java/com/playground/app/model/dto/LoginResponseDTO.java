package com.playground.app.model.dto;

import lombok.Data;

@Data
public class LoginResponseDTO {
    private Long id;
    private String username;
    private String email;
}