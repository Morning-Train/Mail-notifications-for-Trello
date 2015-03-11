<?php

$db = new PDO('mysql:host=localhost;dbname=trellotrain;charset=utf8', 'root', 'root');

if(isset($_GET['id'])){
	$id = $_GET['id'];

	$stmt = $db->prepare("SELECT * FROM notifiers WHERE id=:id");
	$stmt->bindValue(':id', $id, PDO::PARAM_INT);
	$stmt->execute();
	$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

	$stmt2 = $db->prepare("SELECT * FROM lists WHERE notifierId=:id");
	$stmt2->bindValue(':id', $id, PDO::PARAM_INT);
	$stmt2->execute();
	$rows2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);

	$rows[0]['lists'] = $rows2;
	echo json_encode($rows);
}

?>