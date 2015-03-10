<?php
$db = new PDO('mysql:host=localhost;dbname=trellotrain;charset=utf8', 'root', 'root');

function sendData($db) {
	var_dump($_POST);

	$project_name = $_POST['project_name'];
	$email = $_POST['email'];
	$board = $_POST['board'];
	$lists = $_POST['lists'];

   	$stmt = $db->prepare("INSERT INTO notifiers(project, email, board) VALUES(:project, :email, :board)");
	$stmt->execute(array(':project' => $project_name, ':email' => $email, ':board' => $board));
	$affected_rows = $stmt->rowCount();
	$insertId = $db->lastInsertId();
	echo $insertId;


	$list = '';
	$stmt = $db->prepare("INSERT INTO lists(notifierId, listId) VALUES(:notifierId, :listId)");
	$stmt->bindParam(':notifierId', $insertId, PDO::PARAM_STR);
	$stmt->bindParam(':listId', $listId, PDO::PARAM_STR);
	foreach($lists as $listId) {
	   $stmt->execute();
	}



}

try {
   sendData($db);
} catch(PDOException $ex) {
   //handle me.
}

?>