package org.example.wgdemo.view;

import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;

public class MainView {
    private BorderPane root = new BorderPane();

    // Navigation buttons
    private Button dashboardButton = new Button("Dashboard");
    private Button chatButton = new Button("Chatbot");
    private Button importButton = new Button("Import CSV");

    public MainView() {
        // Create a simple top navigation bar
        HBox navBar = new HBox(15, dashboardButton, chatButton, importButton);
        navBar.setAlignment(Pos.CENTER);
        navBar.setStyle("-fx-padding: 10; -fx-background-color: #eeeeee;");

        root.setTop(navBar);
    }

    public BorderPane getRoot() { return root; }

    public Button getDashboardButton() { return dashboardButton; }
    public Button getChatButton() { return chatButton; }
    public Button getImportButton() { return importButton; }
}