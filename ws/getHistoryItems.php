<?php
require("dbconn.php");

$st=$_GET['mydate'];
if(empty($st)||$st=="undefined") $st=date("Y-m-d");
$et=$st." 23:59:59";
$store=$_GET['store'];
if(empty($store)) $store="gallery";

//query db
$action='find';
$filter = ['datetime_i'=>['$gte'=>$st,'$lte'=>$et],'store'=>$store];
$payload = '{ 
    "collection":"orders",
    "database":"'.$database.'",
    "dataSource":"chiuen-cluster",
    "filter":'.json_encode($filter).',
	"sort":{"oid":-1}
}';
require("mongo.php");
$cursor = json_decode($mongo)->documents;


$result = array();
foreach ($cursor as $doc) {
	array_push($result, $doc);
}
echo json_encode($result);

?>
