package com.playground.app.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlotDTO {
    private Long id;
    private LocalDate date;
    private Integer slotNumber;
    private boolean available;

}