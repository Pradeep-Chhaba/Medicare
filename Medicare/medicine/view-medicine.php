<?php
session_start();
include "../config.php";

$user_id = $_SESSION['user_id'];

$result = $conn->query("SELECT * FROM medicines 
                        WHERE user_id='$user_id'");
?>

<!DOCTYPE html>
<html>
<head>
<title>View Medicines</title>
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>

<div class="card">
<h2>Your Medicines</h2>

<?php while($row = $result->fetch_assoc()) { ?>
<p>
<?php echo $row['medicine_name']; ?> -
<?php echo $row['dosage']; ?> -
<?php echo $row['schedule_time']; ?>
</p>
<?php } ?>

<a href="../dashboard/dashboard.php">
<button>Back</button>
</a>

</div>

</body>
</html>