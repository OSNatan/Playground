package com.playground.app.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import static jakarta.persistence.CascadeType.ALL;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Getter
@Setter
@Table(name = "\"user\"")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;
    
    @Column(name = "username", unique = true)
    @NotNull
    @Size(min = 4, max = 20)
    private String username;

    @Column(name = "email", unique = true)
    @Email
    @NotNull
    private String email;

    @Column(name = "password")
    private String password;

    @JsonIgnoreProperties("user")
    @OneToMany(cascade = ALL, mappedBy = "user", fetch = FetchType.LAZY)
    private java.util.List<Reservation> reservations;
}