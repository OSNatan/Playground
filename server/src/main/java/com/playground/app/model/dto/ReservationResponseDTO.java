package com.playground.app.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
public class ReservationResponseDTO {
    private Long id;
    private Long userId;
    private String userName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean gender;
    private boolean bringOwnFood;
    private String decorationStyle;
    private String musicType;
}