package com.playground.app.model.dto;

import com.playground.app.model.entity.Gender;
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
    private Integer slotNumber;
    private LocalDate date;
    private Gender gender;
    private boolean bringOwnFood;
    private String decorationStyle;
    private String musicType;
}