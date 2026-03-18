<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: ../auth/login.php");
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Add Medicine</title>
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>

<div class="card">
<h2>Add Medicine</h2>

<form action="save-medicine.php" method="POST">
<input type="text" name="medicine" placeholder="Medicine Name" required>
<input type="text" name="dosage" placeholder="Dosage" required>
<input type="time" name="time" required>
<input type="date" name="expiry" required>
<button type="submit">Save</button>
</form>

</div>

</body>
</html>