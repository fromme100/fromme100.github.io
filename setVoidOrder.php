<?php
$mongoid=$_GET['mongoid'];
$uid=$_GET['uid'];
require("dbconn.php");

//query db
try {
	$filter = ["_id" => new MongoDB\BSON\ObjectId($mongoid),"log.action"=>"作廢" ];
	$options = ['limit' => 1]; 
	$query = new MongoDB\Driver\Query($filter,$options);
	$collect = 'fromme100.orders';
	$cursor = $m->executeQuery($collect,$query);
	$doc = $cursor->toArray();
}
catch(MongoDB\Driver\Exception\Exception $e) {
	var_dump($e);
}

if(isset($doc[0])) {
  echo "DUP";exit;
}

try {
	$filter = ["_id" => new MongoDB\BSON\ObjectId($mongoid) ];
	$document = ['$set'=> ['status'=>'作廢'],'$push'=>['log'=>['uid'=>$uid,'time'=>date("Y-m-d H:i:s"),'action'=>'作廢']]];
	$bulk = new \MongoDB\Driver\BulkWrite;
	$bulk->update($filter,$document);
	$m->executeBulkWrite($collect, $bulk);
	echo "SUCCESS";
}
catch(MongoDB\Driver\Exception\Exception $e) {
	echo "FAIL";
}

?>
