module org.example.wgdemo {
    requires javafx.controls;
    requires javafx.fxml;


    opens org.example.wgdemo to javafx.fxml;
    exports org.example.wgdemo;
}