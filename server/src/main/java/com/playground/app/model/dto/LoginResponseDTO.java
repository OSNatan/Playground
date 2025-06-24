package com.playground.app.model.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LoginResponseDTO {
    private Long id;
    private String username;
    private String email;
    private LocalDateTime creationDate;

}