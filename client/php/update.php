<?php

$db = new PDO('mysql:host=localhost;dbname=trellotrain;charset=utf8', 'root', 'root');

function updateData($db) {

	$id = $_POST['notifier_id'];
	$project_name = $_POST['project_name'];
	$email = $_POST['email'];
	$board = $_POST['board'];
	$lists = $_POST['lists'];
	$email = strtolower($email);

	$validation = true;
	$validationErrorMsg = "";

	if(empty($project_name)){
		$validationErrorMsg .= "Missing Project Name <br>";
		http_response_code(404);
		$validation = false;
	}

	if(empty($email)){
		$validationErrorMsg .= "Email is invalid or missing <br>";
		http_response_code(404);
		$validation = false;
	}

	if(empty($board)){
		$validationErrorMsg .= "Board is not specified <br>";
		http_response_code(404);
		$validation = false;
	}


	if($validation){
		echo "ID: " . $id . " Email: " . $email . ", Board: " . $board . ", Lists: " . print_r($lists) . ", Project name: " . $project_name;
		$stmt = $db->prepare("DELETE FROM lists WHERE notifierId=:id");
		$stmt->bindValue(':id', $id, PDO::PARAM_STR);
		$stmt->execute();
		$affected_rows = $stmt->rowCount();

		echo "Deleted listsCount: " . $affected_rows;

		$list = '';
		$stmt = $db->prepare("INSERT INTO lists(notifierId, listId) VALUES(:notifierId, :listId)");
		$stmt->bindParam(':notifierId', $id, PDO::PARAM_STR);
		$stmt->bindParam(':listId', $listId, PDO::PARAM_STR);
		foreach($lists as $listId) {
		   $stmt->execute();
		}

		$stmt = $db->prepare("UPDATE notifiers SET project=?, email=?, board=? WHERE id=?");
		$stmt->execute(array($project_name, $email, $board, $id));
		$affected_rows = $stmt->rowCount();

	} else {
		echo $validationErrorMsg;
	}


}

try {
   updateData($db);
} catch(PDOException $ex) {
   //handle me.
}


?>