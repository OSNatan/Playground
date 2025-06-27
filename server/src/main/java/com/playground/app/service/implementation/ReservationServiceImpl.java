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
        // Get current date - in a real application, this might be passed in the request
        LocalDate currentDate = LocalDate.now();

        User user = userRepository.findById(requestDTO.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if the slot is already booked
        if (isSlotBooked(currentDate, requestDTO.getSlotNumber())) {
            throw new IllegalStateException("The requested time slot is already booked");
        }

        // Create a new slot
        Slot slot = new Slot();
        slot.setDate(currentDate);
        slot.setSlotNumber(requestDTO.getSlotNumber());

        // Create a new reservation
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setGender(requestDTO.getGender());
        reservation.setBringOwnFood(requestDTO.isBringOwnFood());
        reservation.setDecorationStyle(requestDTO.getDecorations());
        reservation.setMusicType(requestDTO.getMusic());

        // Link reservation and slot
        reservation.setSlot(slot);
        slot.setReservation(reservation);

        // Save the reservation (will cascade to slot)
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
                slot.getSlotNumber().equals(bookedSlot.getSlotNumber()));
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
     * Converts hour to slot number:
     * 0: 8-12 (morning)
     * 1: 13-17 (afternoon)
     * 2: 18-22 (evening)
     */
    private Integer timeToSlotNumber(int hour) {
        if (hour >= 8 && hour < 12) return 0;  // Morning slot
        if (hour >= 13 && hour < 17) return 1; // Afternoon slot
        if (hour >= 18 && hour < 22) return 2; // Evening slot
        return -1; // Invalid time
    }

    /**
     * Checks if a slot is already booked for the given date and slot number
     */
    private boolean isSlotBooked(LocalDate date, Integer slotNumber) {
        return slotRepository.existsByDateAndSlotNumber(date, slotNumber);
    }

    private List<SlotDTO> generateAllPossibleSlots(LocalDate startDate, LocalDate endDate) {
        List<SlotDTO> slots = new ArrayList<>();
        Integer[] slotNumbers = {0, 1, 2}; // 0: 8-12, 1: 13-17, 2: 18-22

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            for (Integer slotNumber : slotNumbers) {
                slots.add(new SlotDTO(
                    null, // No ID as these are virtual slots
                    date,
                    slotNumber,
                    true // Available
                ));
            }
        }

        return slots;
    }
}
