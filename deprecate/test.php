<?
require("dbconn.php");

$action = 'updateOne';
$payload = '{ 
       "collection":"counters",
       "database":"test",
       "dataSource":"chiuen-cluster",
       "filter":{"_id":"2022-10-23"},
	   "update":{"$inc":{"seq":1}},
       "upsert": true
}';
require('mongo.php');
$action = 'findOne';
$payload = '{ 
       "collection":"counters",
       "database":"test",
       "dataSource":"chiuen-cluster",
       "filter":{"_id":"2022-10-23"}
}';
require('mongo.php');

echo "<p>...............<p>";
print_r($mongo);

$cursor = json_decode($mongo)->document;
$result = $cursor;
echo "<p>...............<p>";
if(isset($result->seq)) echo $result->seq;
else echo "fail to fetch seq no";

?>