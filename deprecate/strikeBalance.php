<?php
$mongoid=$_GET['mongoid'];
$uid=$_GET['uid'];
$Strike=$_GET['Strike'];
$Debtor=$_GET['Debtor'];

require("dbconn.php");

//query db
$action='find';
$payload = '{ 
    "collection":"orders",
    "database":"'.$database.'",
    "dataSource":"chiuen-cluster",
    "filter":{"_id":{"$oid":"'.$mongoid.'"}},
	"limit":1
}';
require("mongo.php");
$doc = json_decode($mongo)->documents;

if(isset($doc[0])) {
  echo "DUP";exit;
}

$action='find';
$payload = '{ 
    "collection":"orders",
    "database":"'.$database.'",
    "dataSource":"chiuen-cluster",
    "filter":{"_id":ObjectId("'.$mongoid.'"),"log.ATM":true},
	"limit":1
}';
require("mongo.php");
$doc = json_decode($mongo)->documents;
if(isset($doc[0])) $ATM=true;
else $ATM=false;

$action = 'updateOne';
$update = ['$set'=> ['status'=>'沖帳'],'$addToSet'=>['log'=>['uid'=>$uid,'time'=>date("Y-m-d H:i:s"),'action'=>'沖帳','Strike'=>$Strike,'Debtor'=>$Debtor,'ATM'=>$ATM]]];
$payload = '{ 
    "collection":"orders",
    "database":"'.$database.'",
    "dataSource":"chiuen-cluster",
	"filter":{"_id":{"$oid":"'.$mongoid.'"}},
    "update":'.json_encode($update).'
}';
require("mongo.php");
if($status==200||$status==201) echo "SUCCESS";
else echo "FAIL";
?>
