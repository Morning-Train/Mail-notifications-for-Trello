<?php
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);

$db = new PDO('mysql:host=localhost;dbname=trellotrain;charset=utf8', 'root', 'root');

$query = $db->query('SELECT * FROM notifiers');

foreach($query as $row) {
	$fieldSet = "<fieldset disabled>";
	$fieldSet .= "<input type='text' class='field-info-item project-name' value='".$row['project']."'>";
	$fieldSet .= "<input type='text' class='field-info-item email-name' value='".$row['email']."'>";
	$fieldSet .= "<input type='text' class='field-info-item board-name' value='".$row['board']."'>";
    $fieldSet .= "<div class='edit rm-dis'><img class='img-swap' src='img/edit.svg' alt='edit' width='20%' />
            </div>
            </fieldset>";
    echo $fieldSet;
}

?>