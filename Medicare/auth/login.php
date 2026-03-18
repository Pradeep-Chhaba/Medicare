<?php
session_start();
if (isset($_SESSION['user_id'])) {
    header("Location: ../dashboard/dashboard.php");
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Login</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

<div class="card">
<h2>Login</h2>
<form action="auth_process.php" method="POST">
<input type="text" name="username" placeholder="Username" required>
<input type="password" name="password" placeholder="Password" required>
<button type="submit" name="login">Login</button>
</form>
<h2><a href="register.php">Register</a></h2>
</div>

</body>
</html>