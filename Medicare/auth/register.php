<!DOCTYPE html>
<html>
<head>
<title>Register</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

<div class="card">
<h2>Register</h2>
<form action="auth_process.php" method="POST">
<input type="text" name="username" placeholder="Username" required>
<input type="password" name="password" placeholder="Password" required>
<button type="submit" name="register">Register</button>
</form>
<h2><a href="login.php">Login</a></h2>
</div>

</body>
</html>