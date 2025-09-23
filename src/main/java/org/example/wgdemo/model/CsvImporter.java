package org.example.wgdemo.model;

import java.io.*;
import java.time.LocalDate;
import java.util.*;

public class CsvImporter {
    public static List<SleepEntry> readSleepCsv(File file) {
        List<SleepEntry> entries = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            br.readLine(); // skip header
            while ((line = br.readLine()) != null) {
                String[] tokens = line.split(",");
                LocalDate date = LocalDate.parse(tokens[0]);
                double hours = Double.parseDouble(tokens[1]);
                entries.add(new SleepEntry(date, hours));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return entries;
    }
}
