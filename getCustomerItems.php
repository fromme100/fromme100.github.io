<?php
require("dbconn.php");

$st=date("Y-m-d");
$et=$st." 23:59:59";
$store=$_GET['store'];
$customerPhone=$_GET['customerPhone'];

//query db
try {
	$filter = ['datetime_i'=>['$gte'=>$st,'$lte'=>$et],'store'=>$store,'customerPhone'=>$customerPhone];
	$options = ['sort'=>['oid'=>1]]; 
	$query = new MongoDB\Driver\Query($filter,$options);
	$collect = 'fromme100.orders';
	$cursor = $m->executeQuery($collect,$query);
}
catch(MongoDB\Driver\Exception\Exception $e) {
	var_dump($e);
}

$result = array();
foreach ($cursor as $doc) {
	//if( count($doc["log"])<3 ) 
		array_push($result, $doc);
}
echo json_encode($result);

?>
