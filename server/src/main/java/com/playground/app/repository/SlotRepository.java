package com.playground.app.repository;

import com.playground.app.model.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Long> {
    List<Slot> findByDateBetween(LocalDate startDate, LocalDate endDate);
    List<Slot> findByDate(LocalDate date);
    public boolean existsByDateAndStartTime(LocalDate date, LocalTime startTime);
}