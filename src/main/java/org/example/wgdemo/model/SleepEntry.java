package org.example.wgdemo.model;

import java.time.LocalDate;

public class SleepEntry {
    private LocalDate date;
    private double hoursSlept;

    public SleepEntry(LocalDate date, double hoursSlept) {
        this.date = date;
        this.hoursSlept = hoursSlept;
    }

    public LocalDate getDate() { return date; }
    public double getHoursSlept() { return hoursSlept; }
}