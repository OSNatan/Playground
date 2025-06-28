package com.playground.app.model.dto;

import com.playground.app.model.entity.Gender;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
public class ReservationRequestDTO {
    private Integer slotNumber;
    private LocalDate date;
    private Gender gender;
    private boolean bringOwnFood;
    private String decorations;
    private String music;
}
