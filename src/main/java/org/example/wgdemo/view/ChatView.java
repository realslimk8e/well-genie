package org.example.wgdemo.view;

import javafx.scene.control.*;
import javafx.scene.layout.VBox;

public class ChatView {
    private VBox layout = new VBox(10);
    private TextArea chatHistory = new TextArea();
    private TextField input = new TextField();
    private Button sendButton = new Button("Send");

    public ChatView() {
        chatHistory.setEditable(false);
        layout.getChildren().addAll(chatHistory, input, sendButton);
    }

    public VBox getLayout() { return layout; }
    public TextArea getChatHistory() { return chatHistory; }
    public TextField getInput() { return input; }
    public Button getSendButton() { return sendButton; }
}