<?php


$url = 'http://localhost:3000/sendMail';
$db = new PDO('mysql:host=localhost;dbname=trellotrain;charset=utf8', 'root', 'root');

if($_GET['action'] == "all"){
	$stmt = $db->prepare("SELECT * FROM notifiers");
	$stmt->execute();
	$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

	foreach ($rows as $key => $value) {

		$email = $value['email'];
		$board = $value['board'];
		$lists = array();

		# code...
		$notifierId = $value['id'];
		$stmt2 = $db->prepare("SELECT listId FROM lists WHERE notifierId=:id");
		$stmt2->execute(array(':id' => $notifierId));
		$rows2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);

		foreach ($rows2 as $key => $value) {
			array_push($lists, $value['listId']);
		}

		$finalData = array('email' => $email, 'board' => $board, 'lists' => $lists);
		// echo "<br>";
		// var_dump($finalData);
		// echo "<br>";

		// echo "<br>";
		// echo json_encode($finalData);
		// echo "<br>";

		// echo $email;
		// echo "<br>";
		// echo $board;
		// echo "<br>";
		// echo $lists;

		$options = array(
				  'http' => array(
				    'method'  => 'POST',
				    'content' => json_encode($finalData),
				    'header'=>  "Content-Type: application/json\r\n" .
				                "Accept: application/json\r\n"
				    )
				);

		$context  = stream_context_create( $options );
		$result = file_get_contents( $url, false, $context );
		$response = json_decode( $result );

		echo "OK!";

	}
}

if($_GET['action'] == "single"){
	$id = $_GET['id'];

	$stmt = $db->prepare("SELECT * FROM notifiers WHERE id=:id");
	$stmt->execute(array(':id' => $id));
	$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

	foreach ($rows as $key => $value) {

		$email = $value['email'];
		$board = $value['board'];
		$lists = array();

		# code...
		$notifierId = $value['id'];
		$stmt2 = $db->prepare("SELECT listId FROM lists WHERE notifierId=:id");
		$stmt2->execute(array(':id' => $notifierId));
		$rows2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);

		foreach ($rows2 as $key => $value) {
			array_push($lists, $value['listId']);
		}

		$finalData = array('email' => $email, 'board' => $board, 'lists' => $lists);
		// echo "<br>";
		// var_dump($finalData);
		// echo "<br>";

		// echo "<br>";
		// echo json_encode($finalData);
		// echo "<br>";

		// echo $email;
		// echo "<br>";
		// echo $board;
		// echo "<br>";
		// echo $lists;

		$options = array(
				  'http' => array(
				    'method'  => 'POST',
				    'content' => json_encode($finalData),
				    'header'=>  "Content-Type: application/json\r\n" .
				                "Accept: application/json\r\n"
				    )
				);

		$context  = stream_context_create( $options );
		$result = file_get_contents( $url, false, $context );
		$response = json_decode( $result );

		echo "OK!";

	}
}
?>