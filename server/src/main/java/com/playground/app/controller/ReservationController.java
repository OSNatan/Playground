package com.playground.app.controller;

import com.playground.app.model.dto.ReservationRequestDTO;
import com.playground.app.model.dto.ReservationResponseDTO;
import com.playground.app.model.dto.SlotDTO;
import com.playground.app.model.entity.Reservation;
import com.playground.app.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<ReservationResponseDTO> createReservation(
             @Valid @RequestBody ReservationRequestDTO reservationRequestDTO) {
        
        Reservation reservation = reservationService.createReservation(reservationRequestDTO);
        return new ResponseEntity<>(convertToResponseDTO(reservation), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponseDTO>> getAllReservations() {

        List<Reservation> reservations = reservationService.getAllReservations();
        List<ReservationResponseDTO> responseList = reservations.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponseDTO> getReservationById(@PathVariable Long id) {

        Reservation reservation = reservationService.getReservationById(id);
        return ResponseEntity.ok(convertToResponseDTO(reservation));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReservationResponseDTO>> getReservationsByUserId(@PathVariable Long userId) {

        List<Reservation> reservations = reservationService.getReservationsByUserId(userId);
        List<ReservationResponseDTO> responseList = reservations.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id) {

        reservationService.cancelReservation(id);

        return ResponseEntity.noContent().build();
    }

    private ReservationResponseDTO convertToResponseDTO(Reservation reservation) {

        ReservationResponseDTO responseDTO = new ReservationResponseDTO();
        responseDTO.setId(reservation.getId());
        responseDTO.setUserId(reservation.getUser().getId());
        responseDTO.setUserName(reservation.getUser().getUsername());
        responseDTO.setDate(reservation.getSlot().getDate());
        responseDTO.setSlotNumber(reservation.getSlot().getSlotNumber());
        responseDTO.setGender(reservation.getGender());
        responseDTO.setBringOwnFood(reservation.isBringOwnFood());
        responseDTO.setDecorationStyle(reservation.getDecorationStyle());
        responseDTO.setMusicType(reservation.getMusicType());

        return responseDTO;
    }
}