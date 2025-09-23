package org.example.wgdemo.controller;

import org.example.wgdemo.view.*;
import org.example.wgdemo.model.*;
import javafx.stage.FileChooser;
import javafx.scene.layout.BorderPane;

import java.io.File;
import java.util.List;

public class MainController {
    private MainView mainView;
    private DashboardView dashboardView;
    private ChatView chatView;
    private DataManager dataManager;

    public MainController(MainView view) {
        this.mainView = view;
        this.dashboardView = new DashboardView();
        this.chatView = new ChatView();
        this.dataManager = new DataManager();

        BorderPane root = view.getRoot();

        // Dashboard button → show dashboard
        view.getDashboardButton().setOnAction(e -> root.setCenter(dashboardView.getLayout()));

        // Chatbot button → show chatbot
        view.getChatButton().setOnAction(e -> root.setCenter(chatView.getLayout()));

        // Import CSV button → open file chooser
        view.getImportButton().setOnAction(e -> {
            FileChooser fileChooser = new FileChooser();
            fileChooser.setTitle("Import Sleep CSV");
            File file = fileChooser.showOpenDialog(root.getScene().getWindow());

            if (file != null) {
                List<SleepEntry> entries = CsvImporter.readSleepCsv(file);
                for (SleepEntry entry : entries) {
                    dataManager.addSleepEntry(entry);
                }
                // Update dashboard table after import
                dashboardView.updateTable(dataManager.getSleepEntries());
                root.setCenter(dashboardView.getLayout());
            }
        });
    }
}
