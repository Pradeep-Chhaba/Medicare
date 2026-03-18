<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: ../auth/login.php");
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Dashboard</title>
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>

<div class="card">
<h2>Dashboard</h2>
<!-- Welcome Section -->
<section class="card">
    <h2>Welcome, User 👋</h2>
    <p style="text-align:center;">
        Manage your medicines, reminders, and reports from one place.
    </p>
</section>



<a href="../medicine/add-medicine.php"><button>Add Medicine</button></a>
<a href="../medicine/view-medicine.php"><button>View Medicines</button></a>
<a href="../logout.php"><button>Logout</button></a>

</div>

</body>
</html>