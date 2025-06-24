package com.playground.app.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "\"reservation\"")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @Column(name = "reservation_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(name = "bring_own_food")
    private boolean bringOwnFood;

    @Column(name = "gender")
    private boolean gender;

    //@Column(name = "double_time_slot")
    //private boolean doubleTimeSlot;

    @Column(name = "music_type")
    private String musicType;

    @Column(name = "decoration_style")
    private String decorationStyle;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", unique = true)
    private Slot slot;

}

