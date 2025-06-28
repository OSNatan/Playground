package com.playground.app.model.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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
    @JsonBackReference
    private User user;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "slot_id", unique = true)
    @JsonBackReference
    private Slot slot;

    @Column(name = "gender")
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "music_type")
    private String musicType;

    @Column(name = "decoration_style")
    private String decorationStyle;

    @Column(name = "bring_own_food")
    @JsonBackReference
    private boolean bringOwnFood;

    @Column
    private LocalDateTime creationDate;

    @PrePersist
    protected void onCreate() {
        creationDate = LocalDateTime.now();
    }
}

