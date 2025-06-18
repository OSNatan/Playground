package com.playground.app.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "\"slot\"")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Slot {

    @Id
    @Column(name = "slot_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    //Transient
    @Column(name = "available")
    private boolean available;

    @OneToOne(mappedBy = "slot")
    private Reservation reservation;
}