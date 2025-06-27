package com.playground.app.service.implementation;

import com.playground.app.exception.ResourceNotFoundException;
import com.playground.app.model.dto.ReservationRequestDTO;
import com.playground.app.model.dto.SlotDTO;
import com.playground.app.model.entity.Reservation;
import com.playground.app.model.entity.Slot;
import com.playground.app.model.entity.User;
import com.playground.app.repository.ReservationRepository;
import com.playground.app.repository.SlotRepository;
import com.playground.app.repository.UserRepository;
import com.playground.app.service.ReservationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationServiceImpl implements ReservationService {

    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final SlotRepository slotRepository;

    public ReservationServiceImpl(UserRepository userRepository, 
                                  ReservationRepository reservationRepository,
                                  SlotRepository slotRepository) {
        this.userRepository = userRepository;
        this.reservationRepository = reservationRepository;
        this.slotRepository = slotRepository;
    }

    @Override
    @Transactional
    public Reservation createReservation(ReservationRequestDTO requestDTO) {

        User user = userRepository.findById(requestDTO.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (isSlotBooked( requestedStartTime)) {
            throw new IllegalStateException("The requested time slot is already booked");
        }

        Slot slot = new Slot();
        slot.setSlotNumber();

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setGender(requestDTO.getGender());
        reservation.setBringOwnFood(requestDTO.isBringOwnFood());
        reservation.setDecorationStyle(requestDTO.getDecorations());
        reservation.setMusicType(requestDTO.getMusic());

        reservation.setSlot(slot);
        slot.setReservation(reservation);

        return reservationRepository.save(reservation);
    }

    @Override
    public List<Reservation> getAllReservations() {

        return reservationRepository.findAll();
    }

    @Override
    public Reservation getReservationById(Long id) {

        return reservationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));
    }

    @Override
    public List<Reservation> getReservationsByUserId(Long userId) {

        if (!userRepository.existsById(userId)) {

            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return reservationRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public void cancelReservation(Long id) {

        Reservation reservation = reservationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        reservationRepository.delete(reservation);
    }

    @Override
    public List<SlotDTO> getAvailableSlots(LocalDate startDate, LocalDate endDate) {
        List<SlotDTO> allPossibleSlots = generateAllPossibleSlots(startDate, endDate);
        List<Slot> bookedSlots = slotRepository.findByDateBetween(startDate, endDate);

        for (Slot bookedSlot : bookedSlots) {
            allPossibleSlots.removeIf(slot -> 
                slot.getDate().equals(bookedSlot.getDate()) && 
                slot.getStartTime().equals(bookedSlot.getStartTime()));
        }
        
        return allPossibleSlots;
    }

    @Override
    public List<SlotDTO> getBookedSlots(LocalDate startDate, LocalDate endDate) {

        List<Slot> bookedSlots = slotRepository.findByDateBetween(startDate, endDate);
        
        return bookedSlots.stream()
            .map(slot -> new SlotDTO(
                slot.getId(),
                slot.getDate(),
                slot.getSlotNumber(),
                false // Not available
            ))
            .collect(Collectors.toList());
    }

    /**
     * Normalizes any time to the nearest valid slot start time (8:00, 12:00, or 16:00)
     */
    private LocalTime normalizeToSlotStart(LocalTime requestedTime) {
        int hour = requestedTime.getHour();

        if (hour < 12) return LocalTime.of(8, 0);
        if (hour < 16) return LocalTime.of(12, 0);
        return LocalTime.of(16, 0);
    }

    /**
     * Checks if a slot is already booked for the given date and start time
     */
    private boolean isSlotBooked(LocalTime startTime) {

        return slotRepository.existsByDateAndStartTime(startTime);
    }

    private List<SlotDTO> generateAllPossibleSlots(LocalDate startDate, LocalDate endDate) {
        List<SlotDTO> slots = new ArrayList<>();
        LocalTime[] slotTimes = {
            LocalTime.of(8, 0),
            LocalTime.of(12, 0),
            LocalTime.of(16, 0)
        };
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            for (LocalTime startTime : slotTimes) {
                slots.add(new SlotDTO(
                    null, // slot imaginar
                    date,
                    startTime,
                    startTime.plusHours(4),
                    true
                ));
            }
        }
        
        return slots;
    }
}