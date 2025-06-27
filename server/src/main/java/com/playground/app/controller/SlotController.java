package com.playground.app.controller;

import com.playground.app.model.dto.SlotDTO;
import com.playground.app.model.entity.Slot;
import com.playground.app.service.SlotService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/slots")
public class SlotController {

    private final SlotService slotService;

    public SlotController(SlotService slotService) {
        this.slotService = slotService;
    }

    @GetMapping
    public ResponseEntity<List<Slot>> getAllSlots() {
        return ResponseEntity.ok(slotService.getAllSlots());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Slot> getSlotById(@PathVariable Long id) {
        return ResponseEntity.ok(slotService.getSlotById(id));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Slot>> getSlotsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(slotService.getSlotsByDate(date));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Slot>> getSlotsBetweenDates(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(slotService.getSlotsBetweenDates(startDate, endDate));
    }

    @GetMapping("/available")
    public ResponseEntity<List<SlotDTO>> getAvailableSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(slotService.getAvailableSlotsForDateRange(startDate, endDate));
    }

    @GetMapping("/booked")
    public ResponseEntity<List<SlotDTO>> getBookedSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(slotService.getBookedSlotsForDateRange(startDate, endDate));
    }
}