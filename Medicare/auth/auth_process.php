<?php
session_start();
include "../config.php";

if (isset($_POST['register'])) {

    $username = $_POST['username'];
    $password = $_POST['password'];

    $sql = "INSERT INTO users (username,password)
            VALUES ('$username','$password')";

    if ($conn->query($sql)) {
        header("Location: login.php");
    } else {
        echo "Error: " . $conn->error;
    }
}

if (isset($_POST['login'])) {

    $username = $_POST['username'];
    $password = $_POST['password'];

    $result = $conn->query("SELECT * FROM users 
                            WHERE username='$username' 
                            AND password='$password'");

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $_SESSION['user_id'] = $user['id'];
        header("Location: ../dashboard/dashboard.php");
    } else {
        echo "Invalid Login";
    }
}
?>