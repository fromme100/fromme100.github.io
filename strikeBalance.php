<?php
$mongoid=$_GET['mongoid'];
$uid=$_GET['uid'];
$Strike=$_GET['Strike'];
$Debtor=$_GET['Debtor'];

require("dbconn.php");

//query db
try {
	$filter = ["_id" => new MongoDB\BSON\ObjectId($mongoid),"log.action"=>"沖帳" ];
	$options = ['limit' => 1]; 
	$query = new MongoDB\Driver\Query($filter,$options);
	$collect = 'fromme100.orders';
	$cursor = $m->executeQuery($collect,$query);
}
catch(MongoDB\Driver\Exception\Exception $e) {
	var_dump($e);
}

$doc = $cursor->toArray();
if(isset($doc[0])) {
  echo "DUP";exit;
}

$filter = ["_id" => new MongoDB\BSON\ObjectId($mongoid),"log.ATM"=>true];
$options = ['limit' => 1]; 
$query = new MongoDB\Driver\Query($filter,$options);
$collect = 'fromme100.orders';
$cursor = $m->executeQuery($collect,$query);
$doc = $cursor->toArray();
if(isset($doc[0])) $ATM=true;
else $ATM=false;

try {
	$filter = ["_id" => new MongoDB\BSON\ObjectId($mongoid) ];
	$document = ['$set'=> ['status'=>'沖帳'],'$addToSet'=>['log'=>['uid'=>$uid,'time'=>date("Y-m-d H:i:s"),'action'=>'沖帳','Strike'=>$Strike,'Debtor'=>$Debtor,'ATM'=>$ATM]]];
	$bulk = new \MongoDB\Driver\BulkWrite;
	$bulk->update($filter,$document);
	$m->executeBulkWrite($collect, $bulk);
	echo "SUCCESS";
}
catch(MongoDB\Driver\Exception\Exception $e) {
	echo "FAIL";
}
?>
