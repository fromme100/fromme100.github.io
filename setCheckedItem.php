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
try {
	$filter = ["_id" => new MongoDB\BSON\ObjectId($mongoid),"log.action"=>"結帳" ];
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
	$document = ['$set'=> ['status'=>'結帳'],
						 '$push'=>['log'=>['uid'=>$uid,
						                   'time'=>date("Y-m-d H:i:s"),
										   'action'=>'結帳',
										   'AR'=>$AR,
										   'Cash'=>$Cash,
										   'Ret'=>$Ret,
										   'Coupon'=>$Coupon,
										   'Credit'=>$Credit,
										   'Debtor'=>$Debtor]]];
	$bulk = new \MongoDB\Driver\BulkWrite;
	$bulk->update($filter,$document);
	$m->executeBulkWrite($collect, $bulk);
	echo "SUCCESS";
}
catch(MongoDB\Driver\Exception\Exception $e) {
	echo "FAIL";
}
?>
