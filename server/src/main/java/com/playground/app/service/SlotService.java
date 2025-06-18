package com.playground.app.service;

import com.playground.app.model.dto.SlotDTO;
import com.playground.app.model.entity.Slot;

import java.time.LocalDate;
import java.util.List;

public interface SlotService {
    
    /**
     * Get all slots in the system
     */
    List<Slot> getAllSlots();
    
    /**
     * Get a specific slot by ID
     */
    Slot getSlotById(Long id);
    
    /**
     * Find slots by date
     */
    List<Slot> getSlotsByDate(LocalDate date);
    
    /**
     * Find slots between two dates
     */
    List<Slot> getSlotsBetweenDates(LocalDate startDate, LocalDate endDate);
    
    /**
     * Get all available virtual slots for the date range
     * (includes slots that don't exist in DB but are available time periods)
     */
    List<SlotDTO> getAvailableSlotsForDateRange(LocalDate startDate, LocalDate endDate);
    
    /**
     * Get all booked slots for the date range
     */
    List<SlotDTO> getBookedSlotsForDateRange(LocalDate startDate, LocalDate endDate);
}