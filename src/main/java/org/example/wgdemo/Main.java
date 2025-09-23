package org.example.wgdemo;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;
import org.example.wgdemo.view.MainView;
import org.example.wgdemo.controller.MainController;

import java.io.IOException;

public class Main extends Application {

    @Override
    public void start(Stage primaryStage) {
        MainView view = new MainView();
        MainController controller = new MainController(view);

        Scene scene = new Scene(view.getRoot(), 800, 600);
        primaryStage.setTitle("Health Companion Prototype");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}