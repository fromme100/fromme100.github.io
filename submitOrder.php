<?php
require("dbconn.php");

$order=json_decode(file_get_contents('php://input'));

$order->oid=getNextSequence('fromme100',date("Y-m-d"),$m);
$order->datetime_i=date("Y-m-d H:i:s");
if(empty($order->resrvTime)) $order->resrvTime='0';
$order->arrivalTime=date("Y-m-d H:i:s",strtotime("+".$order->resrvTime." minutes"));
$order->log=[["uid"=> $order->myUID , "time"=>date("Y-m-d H:i:s"), "action"=>"打單" ]];

try {
	$collect = 'fromme100.orders';
	$document = $order;
	$bulk = new \MongoDB\Driver\BulkWrite;
	$bulk->insert($document);
	$m->executeBulkWrite($collect, $bulk);
	try {
		$filter = ["oid" => $order->oid,"datetime_i"=>$order->datetime_i ];
		$options = ['limit' => 1]; 
		$query = new MongoDB\Driver\Query($filter,$options);
		$collect = 'fromme100.orders';
		$cursor = $m->executeQuery($collect,$query);
		$doc = $cursor->toArray();
	}
	catch(MongoDB\Driver\Exception\Exception $e) {
		var_dump($e);
	}
	if(isset($doc[0])) echo json_encode($doc[0]);
	else echo '[]';
}
catch(MongoDB\Driver\Exception\Exception $e) {
	var_dump($e);
}

function getNextSequence($db,$name,$manager)  {
	$cursor = $manager->executeCommand($db,
		new MongoDB\Driver\Command([
		'findAndModify' => 'counters',
		'query'         => ['_id' => $name],
		'update'        => ['$inc' => ['seq' => 1]],
		'new'           => true,
		'upsert'        => true
	]));
	$result=$cursor->toArray()[0];
	if(isset($result->value->seq)) return $result->value->seq;
	else return false;
}
?>
