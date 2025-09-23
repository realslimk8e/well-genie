package org.example.wgdemo.model;

import java.util.ArrayList;
import java.util.List;

public class DataManager {
    private List<SleepEntry> sleepEntries = new ArrayList<>();

    public void addSleepEntry(SleepEntry entry) {
        sleepEntries.add(entry);
    }

    public List<SleepEntry> getSleepEntries() {
        return new ArrayList<>(sleepEntries);
    }
}