<?php

$db = new PDO('mysql:host=localhost;dbname=trellotrain;charset=utf8', 'root', 'root');

if(isset($_GET['id'])){
	$id = $_GET['id'];

	$stmt = $db->prepare("SELECT * FROM notifiers WHERE id=:id");
	$stmt->bindValue(':id', $id, PDO::PARAM_INT);
	$stmt->execute();
	$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

	echo json_encode($rows);
}

?>