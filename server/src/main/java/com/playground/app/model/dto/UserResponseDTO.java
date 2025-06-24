package com.playground.app.model.dto;


import com.playground.app.model.entity.Reservation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {

    private Long id;

    private String username;

    private String email;

    private LocalDateTime creationDate;

    private List<Reservation> reservations;
}