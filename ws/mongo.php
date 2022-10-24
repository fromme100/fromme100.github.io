<?
$url='https://data.mongodb-api.com/app/data-qjmit/endpoint/data/v1/action/'.$action;

$header=[ 'Content-Type: application/json', 
			'Access-Control-Request-Headers: *',
			'api-key:  qXm8Q24pZCk1GWDAM8SnIJOZtyKp3hfAlyXwzVg2GDrMvVcwDXVz47YL6kDU2fPf' ];

// Create a new cURL resource
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$mongo = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

?>