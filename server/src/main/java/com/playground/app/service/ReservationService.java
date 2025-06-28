package com.playground.app.service;

import com.playground.app.model.dto.ReservationRequestDTO;
import com.playground.app.model.dto.SlotDTO;
import com.playground.app.model.entity.Reservation;

import java.time.LocalDate;
import java.util.List;

public interface ReservationService {
    Reservation createReservation(ReservationRequestDTO reservationRequestDTO, String username);
    List<Reservation> getAllReservations();
    Reservation getReservationById(Long id);
    List<Reservation> getReservationsByUserId(Long userId);
    void cancelReservation(Long id);
    List<SlotDTO> getAvailableSlots(LocalDate startDate, LocalDate endDate);
    List<SlotDTO> getBookedSlots(LocalDate startDate, LocalDate endDate);
}