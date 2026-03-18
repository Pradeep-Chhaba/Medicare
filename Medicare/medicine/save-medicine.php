<?php
session_start();
include "../config.php";

$user_id = $_SESSION['user_id'];

$medicine = $_POST['medicine'];
$dosage = $_POST['dosage'];
$time = $_POST['time'];
$expiry = $_POST['expiry'];

$sql = "INSERT INTO medicines 
(user_id,medicine_name,dosage,schedule_time,expiry_date)
VALUES 
('$user_id','$medicine','$dosage','$time','$expiry')";

$conn->query($sql);

header("Location: view-medicine.php");
?>