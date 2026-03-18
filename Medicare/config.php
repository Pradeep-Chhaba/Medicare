<?php
$conn = new mysqli("localhost", "root", "", "medicare");

if ($conn->connect_error) {
    die("Connection Failed: " . $conn->connect_error);
}
?>