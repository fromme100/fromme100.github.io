<?php
require("dbconn.php");

$st=date("Y-m-d");
$et=$st." 23:59:59";
$store=$_GET['store'];
$customerPhone=$_GET['customerPhone'];

//query db
$action='find';
$filter = ['datetime_i'=>['$gte'=>$st,'$lte'=>$et],'store'=>$store,'customerPhone'=>$customerPhone];
$payload = '{ 
    "collection":"orders",
    "database":"'.$database.'",
    "dataSource":"chiuen-cluster",
    "filter":'.json_encode($filter).',
	"sort":{"oid":1}
}';
require("mongo.php");
$cursor = json_decode($mongo)->documents;

$result = array();
foreach ($cursor as $doc) {
	//if( count($doc["log"])<3 ) 
		array_push($result, $doc);
}
echo json_encode($result);

?>
