package com.playground.app.service.implementation;

import com.playground.app.exception.ResourceNotFoundException;
import com.playground.app.model.dto.SlotDTO;
import com.playground.app.model.entity.Slot;
import com.playground.app.repository.SlotRepository;
import com.playground.app.service.SlotService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;

    public SlotServiceImpl(SlotRepository slotRepository) {
        this.slotRepository = slotRepository;
    }

    @Override
    public List<Slot> getAllSlots() {
        return slotRepository.findAll();
    }

    @Override
    public Slot getSlotById(Long id) {
        return slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + id));
    }

    @Override
    public List<Slot> getSlotsByDate(LocalDate date) {
        return slotRepository.findByDate(date);
    }

    @Override
    public List<Slot> getSlotsBetweenDates(LocalDate startDate, LocalDate endDate) {
        return slotRepository.findByDateBetween(startDate, endDate);
    }

    @Override
    public List<SlotDTO> getAvailableSlotsForDateRange(LocalDate startDate, LocalDate endDate) {
        List<SlotDTO> allPossibleSlots = generateAllPossibleSlots(startDate, endDate);
        List<Slot> bookedSlots = slotRepository.findByDateBetween(startDate, endDate);

        // Remove booked slots from all possible slots
        for (Slot bookedSlot : bookedSlots) {
            allPossibleSlots.removeIf(slot -> 
                slot.getDate().equals(bookedSlot.getDate()) && 
                slot.getSlotNumber().equals(bookedSlot.getSlotNumber()));
        }

        return allPossibleSlots;
    }

    @Override
    public List<SlotDTO> getBookedSlotsForDateRange(LocalDate startDate, LocalDate endDate) {
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
     * Generates all possible slot DTOs for the given date range
     * Slot numbers: 0 (8-12), 1 (13-17), 2 (18-22)
     */
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
