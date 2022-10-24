<?php
require("dbconn.php");

$order=json_decode(file_get_contents('php://input'));

$order->oid=getNextSequence($database,date("Y-m-d"));
$order->datetime_i=date("Y-m-d H:i:s");
if(empty($order->resrvTime)) $order->resrvTime='0';
$order->arrivalTime=date("Y-m-d H:i:s",strtotime("+".$order->resrvTime." minutes"));
$order->log=[["uid"=> $order->myUID , "time"=>date("Y-m-d H:i:s"), "action"=>"打單" ]];

$action = 'insertOne';
$document = $order;
$payload = '{ 
    "collection":"orders",
    "database":"'.$database.'",
    "dataSource":"chiuen-cluster",
    "document":'.json_encode($document).'
}';
require("mongo.php");

$action = 'find';
$filter = ["oid" => $order->oid,"datetime_i"=>$order->datetime_i ];
$payload = '{ 
    "collection":"orders",
    "database":"'.$database.'",
    "dataSource":"chiuen-cluster",
    "filter":'.json_encode($filter).',
	"limit":1
}';
require("mongo.php");
$cursor = json_decode($mongo)->documents;
$doc = $cursor;
if(isset($doc[0])) echo json_encode($doc[0]);
else echo '[]';


function getNextSequence($db,$name)  {
	$action = 'updateOne';
	$payload = '{ 
       "collection":"counters",
       "database":"'.$db.'",
       "dataSource":"chiuen-cluster",
       "filter":{"_id":"'.$name.'"},
	   "update":{"$inc":{"seq":1}},
       "upsert": true	   
	}';
	require('mongo.php');
	$action = 'findOne';
	$payload = '{ 
       "collection":"counters",
       "database":"'.$db.'",
       "dataSource":"chiuen-cluster",
       "filter":{"_id":"'.$name.'"}
	}';
	require('mongo.php');
	$cursor = json_decode($mongo)->document;
	$result = $cursor;
	if(isset($result->seq)) return $result->seq;
	else return false;
}
?>
