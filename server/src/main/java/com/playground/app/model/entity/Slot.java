package com.playground.app.model.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "\"slot\"", uniqueConstraints = @UniqueConstraint(columnNames = {"date", "slot_number"}))
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

    @Column(name = "slot_number")
    private Integer slotNumber;

    @OneToOne(mappedBy = "slot")
    @JsonManagedReference
    private Reservation reservation;
}