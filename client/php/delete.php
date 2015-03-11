<?php

$db = new PDO('mysql:host=localhost;dbname=trellotrain;charset=utf8', 'root', 'root');

function updateData($db) {

	$id = $_GET['notifier_id'];
	$validation = true;

	if($validation){
		$stmt = $db->prepare("DELETE FROM lists WHERE notifierId=:id");
		$stmt->bindValue(':id', $id, PDO::PARAM_STR);
		$stmt->execute();
		$affected_rows = $stmt->rowCount();

		$stmt2 = $db->prepare("DELETE FROM notifiers WHERE id=:id");
		$stmt2->bindValue(':id', $id, PDO::PARAM_STR);
		$stmt2->execute();
		$affected_rows = $stmt2->rowCount();

		echo "Should be done now..";
		
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