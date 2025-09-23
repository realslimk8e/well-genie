package org.example.wgdemo.view;

import org.example.wgdemo.model.SleepEntry;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;

import java.time.LocalDate;

public class DashboardView {
    private VBox layout = new VBox(10);
    private TableView<SleepEntry> table = new TableView<>();

    private TableColumn<SleepEntry, LocalDate> dateColumn = new TableColumn<>("Date");
    private TableColumn<SleepEntry, Double> hoursColumn = new TableColumn<>("Hours Slept");

    public DashboardView() {
        // Setup table columns
        dateColumn.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getDate()));
        hoursColumn.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getHoursSlept()));

        table.getColumns().addAll(dateColumn, hoursColumn);

        layout.getChildren().addAll(new Label("Sleep Data"), table);
    }

    public VBox getLayout() { return layout; }

    public void updateTable(java.util.List<SleepEntry> entries) {
        ObservableList<SleepEntry> data = FXCollections.observableArrayList(entries);
        table.setItems(data);
    }
}

