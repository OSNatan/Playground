package com.playground.app.service.implementation;

import com.playground.app.exception.ResourceNotFoundException;
import com.playground.app.model.dto.SlotDTO;
import com.playground.app.model.entity.Slot;
import com.playground.app.model.repository.SlotRepository;
import com.playground.app.service.SlotService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
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
                slot.getStartTime().equals(bookedSlot.getStartTime()));
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
                        slot.getStartTime(),
                        slot.getEndTime(),
                        false // Not available
                ))
                .collect(Collectors.toList());
    }

    /**
     * Generates all possible slot DTOs for the given date range
     */
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
                        null, // No ID as these are virtual slots
                        date,
                        startTime,
                        startTime.plusHours(4),
                        true // Available
                ));
            }
        }
        
        return slots;
    }
}