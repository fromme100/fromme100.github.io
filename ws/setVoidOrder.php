<?php
$mongoid=$_GET['mongoid'];
$uid=$_GET['uid'];
require("dbconn.php");

//query db
$action='find';
$payload = '{ 
    "collection":"orders",
    "database":"'.$database.'",
    "dataSource":"chiuen-cluster",
    "filter":{"_id":{"$oid":"'.$mongoid.'"},"log.action":"作廢" },
	"limit":1
}';
require("mongo.php");
$doc = json_decode($mongo)->documents;

if(isset($doc[0])) {
  echo "DUP";exit;
}

//update db
$action='updateOne';
$update = ['$set'=> ['status'=>'作廢'],'$push'=>['log'=>['uid'=>$uid,'time'=>date("Y-m-d H:i:s"),'action'=>'作廢']]];
$payload = '{ 
    "collection":"orders",
    "database":"'.$database.'",
    "dataSource":"chiuen-cluster",
    "filter":{"_id":{"$oid":"'.$mongoid.'"} },
	"update":'.json_encode($update).'
}';
require("mongo.php");
if($status==200||$status==201) echo "SUCCESS";
else echo "FAIL";

?>
