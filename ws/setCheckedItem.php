<?php
$mongoid=$_GET['mongoid'];
$uid=$_GET['uid'];
$AR=$_GET['AR'];
$Cash=$_GET['Cash'];
$Ret=$_GET['Ret'];
$Coupon=$_GET['Coupon'];
$Credit=$_GET['Credit'];
$Debtor=$_GET['Debtor'];

require("dbconn.php");

//query db
$action='find';
$payload = '{ 
    "collection":"orders",
    "database":"'.$database.'",
    "dataSource":"chiuen-cluster",
    "filter":{"_id":{"$oid":"'.$mongoid.'"},"log.action":"結帳"},
	"limit":1
}';
require("mongo.php");
$doc = json_decode($mongo)->documents;

if(isset($doc[0])) {
  echo "DUP";exit;
}

$action='updateOne';
$update = ['$set'=> ['status'=>'結帳'],
						 '$push'=>['log'=>['uid'=>$uid,
						                   'time'=>date("Y-m-d H:i:s"),
										   'action'=>'結帳',
										   'AR'=>$AR,
										   'Cash'=>$Cash,
										   'Ret'=>$Ret,
										   'Coupon'=>$Coupon,
										   'Credit'=>$Credit,
										   'Debtor'=>$Debtor]]];
										   
										   
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
