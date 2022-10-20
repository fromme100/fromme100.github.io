<?php
require("dbconn.php");

$st=$_GET['mydate'];
if(empty($st)) $st=date("Y-m-d");
$et=$st." 23:59:59";
$store=$_GET['store'];
if(empty($store)) $store="gallery";

//query db
try {
	$filter = ['datetime_i'=>['$gte'=>$st,'$lte'=>$et],'store'=>$store,'status'=>['$ne'=>'作廢'],'log.action'=>['$ne'=>'作廢']];
	$options = []; 
	$query = new MongoDB\Driver\Query($filter,$options);
	$collect = 'fromme100.orders';
	$cursor = $m->executeQuery($collect,$query);
}
catch(MongoDB\Driver\Exception\Exception $e) {
	var_dump($e);
}

$t_ar=0;
$t_cash=0;
$t_coupon=0;
$t_credit=0;

//by P
$tp_qty=0;
$tp_ar=0;  //打單就算AR

//by Cat
$tc_qty=0;
$tc_ar=0;

foreach ($cursor as $doc) {
	//by C
	$log=$doc->log;
	foreach($log as $l) {
		if($l->action=="結帳") {
			$byCashier[$l->uid]["uid"]=$l->uid;  
			$byCashier[$l->uid]["cash"]+=($l->Cash-$l->Ret); $t_cash+=($l->Cash-$l->Ret);
			$byCashier[$l->uid]["coupon"]+=$l->Coupon; 
			$t_coupon+=$l->Coupon;
			$byCashier[$l->uid]["credit"]+=$l->Credit; 
			$t_credit+=$l->Credit;
		}
		if($l->action=="打單") {
			$doc->keyin=$l->uid;
			$byCashier[$l->uid]["uid"]=$l->uid;
		}
	}
	//by P
	$items=$doc->myItems;
	foreach($items as $it) {
		$byCashier[$doc->keyin]["ar"]+=$it->quantity*($it->price+$it->addup-$it->discount); 
		$t_ar+=$it->quantity*($it->price+$it->addup-$it->discount);
		$byProduct[$it->name]["product"]=$it->name;  
		$byProduct[$it->name]["qty"]+=$it->quantity; 
		$tp_qty+=$it->quantity; 
		$byProduct[$it->name]["ar"]+=$it->quantity*($it->price+$it->addup-$it->discount);
		$tp_ar+=$it->quantity*($it->price+$it->addup-$it->discount);

		$byCategory[$it->cat]["cat"]=$it->cat;  
		$byCategory[$it->cat]["qty"]+=$it->quantity; 
		$tc_qty+=$it->quantity;
		
		$byCategory[$it->cat]["ar"]+=$it->quantity*($it->price+$it->addup-$it->discount);          
		$tc_ar+=$it->quantity*($it->price+$it->addup-$it->discount);
	}
}

function cmp1($a, $b)
{
    if ($a["ar"] == $b["ar"]) {
        return 0;
    }
    return ($a["ar"] < $b["ar"]) ? 1 : -1;
}

function cmp2($a, $b)
{
    if ($a["qty"] == $b["qty"]) {
        return 0;
    }
    return ($a["qty"] < $b["qty"]) ? 1 : -1;
}

if(!empty($byCashier)) usort($byCashier, "cmp1");
if(!empty($byProduct)) usort($byProduct, "cmp2");
if(!empty($byCategory)) usort($byCategory, "cmp1");

$byCashier["total"]["uid"]="total";
$byCashier["total"]["ar"]=$t_ar;
$byCashier["total"]["cash"]=$t_cash;
$byCashier["total"]["coupon"]=$t_coupon;
$byCashier["total"]["credit"]=$t_credit;

$byProduct["total"]["product"]="合　　計";
$byProduct["total"]["qty"]=$tp_qty;
$byProduct["total"]["ar"]=$tp_ar;

$byCategory["total"]["cat"]="合　　計";
$byCategory["total"]["qty"]=$tc_qty;
$byCategory["total"]["ar"]=$tc_ar;

try {
	$filter = ['log.Strike'=>['$exists'=>true],'log.time'=>['$gte'=>$st,'$lte'=>$et],'store'=>$store,'status'=>['$ne'=>'作廢'],'log.action'=>['$ne'=>'作廢']];
	$options = []; 
	$query = new MongoDB\Driver\Query($filter,$options);
	$collect = 'fromme100.orders';
	$cursor2 = $m->executeQuery($collect,$query);
}
catch(MongoDB\Driver\Exception\Exception $e) {
	var_dump($e);
}


$t_strike=0;
$t_strike_atm=0;

foreach ($cursor2 as $doc) {
	 foreach ($doc["log"] as $l) {
	 	  if($l["action"]=="沖帳" && substr($l["time"],0,10)==$st) {
			  if($l["ATM"]==true) {
				$byStriker[$realname[$l["uid"]]."(收匯)"][$l["Debtor"]."(".substr($doc[datetime_i],5,5).")"]+=$l["Strike"]; 
				$t_strike_atm+=$l["Strike"];
			  }
			  else {
			    $byStriker[$realname[$l["uid"]]."(收現)"][$l["Debtor"]."(".substr($doc[datetime_i],5,5).")"]+=$l["Strike"]; 
			    $t_strike+=$l["Strike"];
			  }
	   }
	 }
}
$byStriker["total"]["Cash"]=$t_strike;
$byStriker["total"]["ATM"]=$t_strike_atm;

$result["byCashier"]=$byCashier;
$result["byProduct"]=$byProduct;
$result["byCategory"]=$byCategory;
$result["byStriker"]=$byStriker;
echo json_encode($result);
?>