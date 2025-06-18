package com.playground.app.model.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReservationRequestDTO {
    private Long userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean gender;
    private boolean bringOwnFood;
    private String decorations;
    private String music;
}
