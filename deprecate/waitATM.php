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
    "filter":{"_id":ObjectId("'.$mongoid.'"),"log.ATM":true },
	"limit":1
}';
require("mongo.php");
$doc = json_decode($mongo)->documents;
if(isset($doc[0])) {echo "DUP";exit;}

//update db
$action='updateOne';
$update = ['$set'=> ['status'=>'製作'],'$addToSet'=>['log'=>['uid'=>$uid,'time'=>date("Y-m-d H:i:s"),'action'=>'製作']]];
$payload = '{ 
    "collection":"orders",
    "database":"'.$database.'",
    "dataSource":"chiuen-cluster",
    "filter":{"_id":{"$oid":"'.$mongoid.'"},"log.Credit":{"$gt":"0"} },
	"update":'.json_encode($update).'
}';
require("mongo.php");
if($status==200||$status==201) echo "SUCCESS";
else echo "FAIL";
?>
