<?php
require("dbconn.php");

$st=$_GET['mydate'];
if(empty($st)) $st=date("Y-m");
$et=$st."-31 23:59:59";
$store=$_GET['store'];
if(empty($store))$store="gallery";

//query db
$action='find';
$filter = ['datetime_i'=>['$gte'=>$st,'$lte'=>$et],'status'=>['$ne'=>'作廢'],'store'=>$store,'log.action'=>['$ne'=>'作廢']];
$payload = '{ 
    "collection":"orders",
    "database":"'.$database.'",
    "dataSource":"chiuen-cluster",
    "filter":'.json_encode($filter).'
}';
require("mongo.php");
$cursor = json_decode($mongo)->documents;


//by Cashier
$t_ar=0;
$t_cash=0;
$t_coupon=0;
$t_credit=0;

//by Date
$td_ar=0;
$td_cash=0;
$td_coupon=0;
$td_credit=0;

//by P
$tp_qty=0;
$tp_ar=0;

//by Cat
$tc_qty=0;
$tc_ar=0;



foreach ($cursor as $doc) {
	//by Cash
	$log=$doc->log;
	$date=substr($doc->datetime_i,0,10);
	foreach($log as $l) {
		if($l->action=="結帳") {
			if($l->Cash=="null") $l->Cash=0;
			$byCashier[$l->uid]["uid"]=$l->uid;  
			$byCashier[$l->uid]["cash"]+=($l->Cash-$l->Ret); 
                                    $t_cash+=($l->Cash-$l->Ret);
			$byCashier[$l->uid]["coupon"]+=$l->Coupon; $t_coupon+=$l->Coupon;
			$byCashier[$l->uid]["credit"]+=$l->Credit; $t_credit+=$l->Credit;
			
		    $byDate[$date]["date"]=$date;  
			$byDate[$date]["cash"]+=($l->Cash-$l->Ret); 
                                   $td_cash+=($l->Cash-$l->Ret);
			$byDate[$date]["coupon"]+=$l->Coupon; $td_coupon+=$l->Coupon;
			$byDate[$date]["credit"]+=$l->Credit; $td_credit+=$l->Credit;

		}
		if($l->action=="打單") {
          $byDate[$date]["date"]=$date;  
		  $doc->keyin=$l->uid;
			$byCashier[$l->uid]["uid"]=$l->uid;
		}
	}
	//by P
	$items=$doc->myItems;
	foreach($items as $it) {
		$byProduct[$it->name]["product"]=$it->name;  
		$byProduct[$it->name]["qty"]+=$it->quantity; 
		                   $tp_qty+=$it->quantity; 
		$byProduct[$it->name]["ar"]+=$it->quantity*($it->price+$it->addup-$it->discount);
		$tp_ar+=$it->quantity*($it->price+$it->addup-$it->discount);

		$byDate[$date]["ar"]+=$it->quantity*($it->price+$it->addup-$it->discount); $td_ar+=$it->quantity*($it->price+$it->addup-$it->discount);
			
		$byCashier[$doc->keyin]["ar"]+=$it->quantity*($it->price+$it->addup-$it->discount); $t_ar+=$it->quantity*($it->price+$it->addup-$it->discount);
			
		
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

function cmp3($a, $b)
{
    if ($a["date"] == $b["date"]) {
        return 0;
    }
    return ($a["date"] > $b["date"]) ? 1 : -1;
}

if(isset($byCashier)) usort($byCashier, "cmp1");
if(isset($byDate)) usort($byDate, "cmp3");
if(isset($byProduct)) usort($byProduct, "cmp2");
if(isset($byCategory)) usort($byCategory, "cmp1");


$byCashier["total"]["uid"]="total";
$byCashier["total"]["ar"]=$t_ar;
$byCashier["total"]["cash"]=$t_cash;
$byCashier["total"]["coupon"]=$t_coupon;
$byCashier["total"]["credit"]=$t_credit;

$byDate["total"]["date"]="total";
$byDate["total"]["ar"]=$td_ar;
$byDate["total"]["cash"]=$td_cash;
$byDate["total"]["coupon"]=$td_coupon;
$byDate["total"]["credit"]=$td_credit;


$byProduct["total"]["product"]="合　　計";
$byProduct["total"]["qty"]=$tp_qty;
$byProduct["total"]["ar"]=$tp_ar;

$byCategory["total"]["cat"]="合　　計";
$byCategory["total"]["qty"]=$tc_qty;
$byCategory["total"]["ar"]=$tc_ar;

$result["byCashier"]=$byCashier;
$result["byDate"]=$byDate;
$result["byProduct"]=$byProduct;
$result["byCategory"]=$byCategory;
echo json_encode($result);

?>
