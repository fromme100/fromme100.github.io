var app = angular.module('myApp', [
  'ngRoute',
  'mobile-angular-ui'
]);

app.config(function($routeProvider) {
  $routeProvider
    .when("/menu", {
      templateUrl: "menu.html"	  
    });
});

app.controller('myCtrl', function($scope, $http) {

  //var wsUrl='https://fromme100.herokuapp.com/';
  var wsUrl='https://hanas01.tcust.csie.org/fromme100/';
  angular.element(document).ready(function() {
	$scope.init();    
	window.location.href='./#menu';
	
  });

  //on login modal ready 
  $scope.$on('mobile-angular-ui.state.initialized.modal_login', function(e, currentValue) {
	$scope.login();
  });
  
  $scope.login = function() {
	$scope.myUID = '';
    $scope.myPass = '';
    $scope.Ui.turnOn('modal_login');
  };

  $scope.checkInitialMoney = function() {
	  return true;
	  //if($scope.realNames == undefined ) return false;
	  //if($scope.realNames[$scope.today] == undefined ) return false;
	  //if(parseInt($scope.realNames[$scope.today]) == 0) return false;
	  //$scope.initialMoney=parseInt($scope.realNames[$scope.today]); 
	  //return true;
  };
  
  $scope.checkLogin = function(myU, myP, store) {
	$scope.loading=true;
	$scope.loginMessage = '驗證中...';
    	$http.get('https://script.google.com/macros/s/AKfycbz8vWuxfmL4mxj1CsCwtZ_n7bStFlZPRPgKYdXZ5sSjwDxbtb2-/exec?user=' + myU + '&pass=' + myP)
	.then(function(response) {
	  if(response.data) {
		 result=response.data.substring(0,2);
		 $scope.realName=response.data.substring(2);
		 //result='OK';
		 //$scope.realName='QQQ';
	  }
	  else result='';
      	  if (result == 'OK') {
		$scope.loginMessage = '驗證成功!!';
        	$scope.Ui.turnOff('modal_login');
        	$scope.authenticated = true;
		$scope.myUID = myU;
		$scope.myPass = myP;
		$scope.store = store;
		$scope.staff = true;
		$scope.sto=$scope.showHistoryItems(false,0);
		//if(!$scope.checkInitialMoney()) $scope.showInitialMoney();
      	  } else {
        	$scope.loginMessage = "帳密錯誤!!";
      	  }
	  $scope.loading=false;
    }, function(err) {
	  	  $scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
	  $scope.loading=false;
    });
  };
  
  $scope.setInitialMoney = function(begin) {
	  $scope.loading=true;
      $http.get(wsUrl+'setInitialMoney.php?begin=' + begin).then(function(response) {
	    var result=response.data.trim();
		if (result == 'OK') {
          $scope.Ui.turnOff('modal_initial_money');
		  $scope.realNames[$scope.today]=begin; 
		  //奧義:realNames[$scope.today]表示開帳金額;
        } else {
          $scope.showDialog('開帳失敗','不明原因', '');
        }
	    $scope.loading=false;
      }, function(err) {
        $scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
	    $scope.loading=false;
    });
  };
  
  $scope.showInitialMoney = function() {
	  if($scope.checkInitialMoney()) return;
	  $scope.Ui.turnOn('modal_initial_money');
  };
  
  $scope.logout = function() {
	  window.location.reload();
  };

  $scope.switchStore = function() {
      //if(!$scope.staff) return;
      return;
      if($scope.store=='zhizhu') $scope.store='gallery' ;
      else if($scope.store=='gallery') $scope.store='zhizhu' ;
	  $scope.showHistoryItems(false,0);
  };

  $scope.showDialog = function(t, c, f) {
    this.dialog.title = t;
    this.dialog.content = c;
    this.dialog.callback = f;
    this.Ui.turnOn('modal_general');
  };

  $scope.showItem = function(o) {
	$scope.oItem = angular.copy(o);
	$scope.oItem.quantity=1;
	$scope.oItem.discount=0;
	$scope.showDiscOption=false;
	$scope.discType=0;  $scope.discRate=0;
    if ($scope.oItem.memo == null) $scope.oItem.memo = '';
    $scope.Ui.turnOn('modal_item_confirm');
  };

  $scope.setDiscOption = function() {
	$scope.showDiscOption=!$scope.showDiscOption;  
  };
  
  $scope.setItemQty = function(o,x,discType,discRate) {
	o.quantity+=x;
    if(o.quantity<=0) {
		o.quantity='';	
	    o.discount=0;
		return;
	}
	if(discType==0) { 
	  o.discount=0;
	}
	else if(discType==1) {
      if(o.cat<3 && o.name!="外帶杯") {
	    //第二杯8折, 即買二杯9折
	    o.discount=Math.round(((o.quantity - (o.quantity % 2))/2 ) * o.price * 0.2); 
	  }
	}
	else if(discType==2) { //其它折扣
	  o.discount=Math.round(o.quantity*o.price*discRate/100);
	}
  };
  
  $scope.showItemList = function() {
    $scope.submitAck = '';
    $scope.readySubmit = false;
    $scope.Ui.turnOn('modal_item_list');
  };

  $scope.stopRefresh = function() {
	clearTimeout($scope.sto);
  };

  $scope.showHistoryItem = function(index) {
    $scope.Ui.turnOn('modal_history_item');
    $scope.currentHistoryIndex = index;
	$scope.oHistoryItem = $scope.oHistoryItems[$scope.currentHistoryIndex];$scope.oCashing=false;
  };
  
  
  $scope.showHistoryItems = function(show,htype,query,d) {
    if(show) {
		$scope.Ui.turnOn('modal_history_items');
		$scope.loading=true;
	}
	if(htype=='undefined') htype=0;
	$scope.histType=htype;
    //htype=0 某日全部點單
    //htype=1 本日某顧客點單
	//htype=2 某日某信用客戶點單
	$scope.stopRefresh();
	switch(htype) {
	  case 0:
	    if(!$scope.staff) {
			$scope.showHistoryItems(false,1);
			return;
		}
		if(d!=null) {
		  var myY = d.getFullYear();
    	  var myM = ('0'+(d.getMonth()+1)).slice(-2);
	      var myD = ('0'+d.getDate()).slice(-2);
	      $scope.mydate = myY + '-' + myM + '-' +myD;
        }
		
		$http.get(wsUrl+'getHistoryItems.php?store='+$scope.store+'&mydate='+$scope.mydate).then(function(res) {
	    	$scope.loading=false;
		  	$scope.oHistoryItems=res.data;
        }, function(err) {
		$scope.oHistoryItems=[];
	    	$scope.loading=false;
          	$scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
	      	//window.location.reload(true);
        });
		break;
	  case 1:
    	if($scope.customerPhone == undefined ) return;
    	if(show) {$scope.Ui.turnOn('modal_history_items');$scope.loading=true;}
    	
    	$http.get(wsUrl+'getCustomerItems.php?store='+$scope.store+'&customerPhone='+$scope.customerPhone).then(function(res) {
    		$scope.loading=false;
          $scope.oHistoryItems=res.data;
    	  
        }, function(err) {
    		$scope.loading=false;
          $scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, 'window.location.reload(true)');
        });
        break;
	  case 2:
	    if(!$scope.staff) return;
		if(query.slice(-7)==" [等待匯款]") 
			$scope.Debtor=query.substring(0,query.length-7);
		else $scope.Debtor=query;
		
		
		$http.get(wsUrl+'getDebtorItems.php?store='+$scope.store+'&Debtor='+$scope.Debtor).then(function(res) {
	    	$scope.loading=false;
		    $scope.oHistoryItems=res.data;
			
	  
        }, function(err) {
	    	$scope.loading=false;
          $scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
	      window.location.reload(true);
        });
		break;
	}
  };
  
  $scope.stopRefresh = function() {
	  clearTimeout($scope.sto);
  };
  
  $scope.editItem = function(i) {
    $scope.oTemp = angular.copy($scope.oItems[i]);
    $scope.itemIndex = i;
  };

  $scope.updateItem = function(o) {
    $scope.oItems[$scope.itemIndex] = angular.copy(o);
  };

  $scope.setReadySubmit = function(bool) {
	if (bool) {
      $scope.readySubmit = true;
    } else $scope.readySubmit = false;
  };

  $scope.calcItem = function(o) {
    var p;
    var op = o.options;
    p = 0;
    if (op != null)
      for (i = 0; i < op.length; i++) {
        if (op[i].checked) p += op[i].price;
      }
    o.addup = p;
	return o.price + p;
  };

  $scope.pushItem = function(o,bool) {
    var op = o.options;
	if (op != null)
      for (i = 0; i < op.length; i++) {
        if (op[i].price == 0 && op[i].selected == null) {
          $scope.showDialog('提醒', '請選擇' + op[i].name, '');
          return;
        }
      }
    $scope.oItems.push(o);
	$scope.Ui.turnOff('modal_item_confirm');
	if(bool) $scope.showItemList();
  };

  $scope.sumItems = function(items) {
    if (items == null) return 0;
    var total = 0;
    for (i = 0; i < items.length; i++) {
      total = total + (items[i].price + items[i].addup)*items[i].quantity - items[i].discount;
    }
	return total;
  };

  $scope.orderSubmit = function(rsvType, rsvTime, rsvTable, custPhone,custType,oMemo) {
	//checkToday
	var d=new Date();
	var myY = d.getFullYear();
	var myM = ('0'+(d.getMonth()+1)).slice(-2);
	var myD = ('0'+d.getDate()).slice(-2);
	if($scope.today!= myY + '-' + myM + '-' +myD) {
		$scope.logout();
	};
	
	rsvType=rsvType || '';
	rsvTime=rsvTime || '0';
	rsvTable=rsvTable || '0';
	custPhone=custPhone || '';
	custType=custType || '';
	oMemo=oMemo || '';
    if ($scope.myUID=='') {
      $scope.login();
      return;
    }
	if (!$scope.staff && custPhone.length!=10) {
		$scope.showDialog('提醒','請輸入手機號碼','');
		return;
	}
	/*if (custType=='') {
		$scope.showDialog('提醒','請選擇顧客類別是教職員還是學生?','');
		return;
	}*/
    $scope.submitAck = "";
    if (rsvType == '外帶') rsvTable = '0';
    if (rsvType == '內用') rsvTime = '0';
    var submitOrder = {
      'myItems': $scope.oItems,
      'resrvType': rsvType,
      'resrvTime': rsvTime,
      'resrvTable': rsvTable,
      'myUID': $scope.myUID,
	  'store': $scope.store,
	  'customerPhone': custPhone,
	  'customerType': custType,
	  'orderMemo': oMemo
    };
	$scope.loading=true;
    $http.post(wsUrl+'submitOrder.php', submitOrder ).then(function(response) {
	  $scope.loading=false;
	  submitOrder = response.data;
	  $scope.oHistoryItem = submitOrder;

      $scope.oItems = []; //clear shopping list
	  $scope.Ui.turnOff('modal_item_list');

	  $scope.oCashing=false;
	  $scope.Ui.turnOn('modal_history_item');
      
    }, function(err) {
	  $scope.loading=false;
      $scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
    });
  };

 
  $scope.voidOrder = function(o) {
	if(!$scope.staff) return;
	var mongoid=o._id['$oid'];
	$scope.loading=true;
	$http.get(wsUrl+'setVoidOrder.php?mongoid='+mongoid+'&uid='+$scope.myUID).then( function(response) {
        $scope.loading=false;
    	if(response.data=='SUCCESS') {
			   $scope.Ui.turnOff('modal_history_item');
			   if($scope.oHistoryItems.length>0)$scope.lastOID=$scope.oHistoryItems[$scope.oHistoryItems.length-1].oid;
			   else $scope.lastOID=0;
			   $scope.showHistoryItems(false,0);
		   }
		   else if(response.data=='DUP') $scope.showDialog('提醒','本單已按過「作廢」','');
		   else $scope.showDialog('錯誤','請稍後再試一次','');
		}, function(err){
		   $scope.loading=false;
           $scope.showDialog('錯誤',err.status+':'+err.statusText,'');
		});
  };
	
  $scope.setCashing = function(b) {
	  if(!$scope.staff) return;
	  $scope.oCashing=b;
	  $scope.oCash='';
	  $scope.oCoupon='';
	  $scope.oCredit='';  
  };

  $scope.check = function(o,ar,cash,ret,coupon,credit,debtor) {
	  if(!$scope.staff) return;
	  if(credit>0 && debtor.length<2) {
		  alert('信用人不得空白');
		  return;
	  }
	  var mongoid=o._id['$oid'];
      $scope.loading=true;
	  console.log(mongoid,o);
	  
	  $http.get(wsUrl+'setCheckedItem.php?mongoid='+mongoid+'&uid='+$scope.myUID+'&AR='+ar+'&Cash='+cash+'&Ret='+ret+'&Coupon='+coupon+'&Credit='+credit+'&Debtor='+debtor).then( function(response) {
		   $scope.loading=false;
		   if(response.data=='SUCCESS') {
			   $scope.Ui.turnOff('modal_history_item');
	           $scope.showHistoryItems(false,0);
		   }
		   else if(response.data=='DUP') $scope.showDialog('提醒','本單已按過「結帳」','');
		   else $scope.showDialog('錯誤','請稍後再試一次','');
		   
		}, function(err){
           $scope.loading=false;
		   $scope.showDialog('錯誤',err.status+':'+err.statusText,'');
		   
		});
  };
  
  $scope.strikeBalance = function(o,strike,debtor) {
	if(!$scope.staff) return;
	var mongoid=o._id['$oid'];
	$scope.loading=true;
	$http.get(wsUrl+'strikeBalance.php?mongoid='+mongoid+'&uid='+$scope.myUID+'&Strike='+strike+'&Debtor='+debtor).then( function(response) {
        $scope.loading=false;
    	if(response.data=='SUCCESS') {
		   $scope.Ui.turnOff('modal_history_item');
	       o.log.push({'uid':$scope.myUID,'action':'沖帳','Strike':strike});
		   $scope.loading=false;
		   $scope.showHistoryItems(false,0);
    	}
		else if(response.data=='DUP') $scope.showDialog('提醒','本單已按過「沖帳」','');
		   else $scope.showDialog('錯誤','請稍後再試一次','');
		}, function(err){
		   $scope.loading=false;
           $scope.showDialog('錯誤',err.status+':'+err.statusText,'');
		});
  };
  
  $scope.showDaySheet = function(d) {
	if(!$scope.staff) return;
	$scope.Ui.turnOn('modal_day_sheet');
	var myY = d.getFullYear();
	var myM = ('0'+(d.getMonth()+1)).slice(-2);
	var myD = ('0'+d.getDate()).slice(-2);
	$scope.mydate = myY + '-' + myM + '-' +myD;
	$scope.loading=true;
    $http.get(wsUrl+'getDaySheet.php?store='+$scope.store+'&mydate='+$scope.mydate).then(function(res) {
      $scope.loading=false;
      if (res.data == null) return;
      $scope.oDaySheet=res.data.byCashier;
	  $scope.oDaySheet_Strike=res.data.byStriker;
      //$scope.nowCash=$scope.oDaySheet["total"]["cash"];
      $scope.oDaySheet_P=res.data.byProduct;
	  $scope.oDaySheet_C=res.data.byCategory;
	  
    }, function(err) {
      $scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
	  $scope.loading=false;
    }); 
  };
  
  $scope.showMonthSheet = function(d) {
	if(!$scope.staff) return;
	$scope.Ui.turnOn('modal_month_sheet');
	var myY = d.getFullYear();
	var myM = ('0'+(d.getMonth()+1)).slice(-2);
	var mydate = myY + '-' + myM;
	$scope.loading=true;
	$http.get(wsUrl+'getMonthSheet.php?store='+$scope.store+'&mydate='+mydate).then(function(res) {
	  $scope.loading=false;
	  console.log(angular.toJson(res.data));
	  if (res.data == null) return;
      $scope.oMonthSheet=res.data.byCashier;
      $scope.oMonthSheet_P=res.data.byProduct;
	  $scope.oMonthSheet_C=res.data.byCategory;
	  $scope.oMonthSheet_D=res.data.byDate;
    }, function(err) {
	  $scope.loading=false;
      $scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
    }); 
  };

  $scope.showDebtorList = function() {
	if(!$scope.staff) return;
	$scope.loading=true;
    $http.get(wsUrl+'getDebtorList.php').then(function(res) {
      
	  $scope.loading=false;
	  if (res.data == null) $scope.oDebtors=[];
      else $scope.oDebtors=res.data;
	  console.log(angular.toJson($scope.oDebtors));
	  $scope.Ui.turnOn('modal_debtor_list');
	  
    }, function(err) {
      $scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
	  $scope.loading=false;
    }); 
  };
  
  $scope.setStaff = function(bool) {
	 if(bool) {
	     $scope.staff=true;
		 $scope.myUID="";
	 }
     else {
		 $scope.staff=false;
		 $scope.myUID="guest";
		 $scope.realName="顧客";
		 $scope.authenticated=false;
		 $scope.store="gallery";
	 }	 
  };
  
  $scope.init = function() {
    var d=new Date();
	var myY = d.getFullYear();
	var myM = ('0'+(d.getMonth()+1)).slice(-2);
	var myD = ('0'+d.getDate()).slice(-2);
	$scope.today= myY + '-' + myM + '-' +myD;
        	
    $scope.dialog = {
      title: '',
      content: '',
      callback: ''
    };

	
    $scope.oItem = {};
	$scope.oItems = [];
	$scope.oHistoryItems = [];
	$scope.currentHistoryIndex = 0;
	$scope.oDaySheet = [];
	$scope.oDaySheet_P = [];
	$scope.oMonthSheet = [];
    $scope.oMonthSheet_P = [];
	$scope.oDebtors = [];
	$scope.oTemp = {};
    $scope.histType = '';
	$scope.Debtor = '';
    $scope.sto = '';
    $itemIndex = 0;
    $scope.submitAck = "";
    $scope.readySubmit = false;
    $scope.store = "gallery";
	$scope.staff = false;
	$scope.loginMessage = "";
    $scope.oCashing = false;
    $scope.pickedDate = new Date();
	$scope.pickedMonth = new Date();
    $scope.classifyBy = "Cashier";
	$scope.loading = false;
	$scope.customerPhone='';
	$scope.lastOID=0;
	$scope.initialMoney=0;
    $scope.nowCash=0;
	$scope.customerType='';
	$scope.authenticated=false;

	//getRealNames
	$http.get('https://script.google.com/macros/s/AKfycbxBoC4gWhleKATW-OH22XfDM85Z3wrvXoMVb9NLsQZbVVahyd8/exec').then(function(res) {
      if (res.data == null) return;
      $scope.realNames=res.data;
	  $scope.realNames['total']='合　　計';
	  }, function(err) {
    }); 

	//getCats
	$http.get('https://script.google.com/macros/s/AKfycby68whl-0C6dhds4hE_SOJ9120Bh-WuN0NHh-zVp48QnLSCmgSD/exec').then(function(res) {
      if (res.data == null) return;
      $scope.cats=res.data;
	  }, function(err) {
    }); 
	
	//getProducts
	$http.get('https://script.google.com/macros/s/AKfycbywdB4QWsHFXN4SiRCSHonQSRnR3LXGtuQJhu0FTKI8PCBjAHVB/exec').then(function(res) {
      if (res.data == null) return;
      $scope.products=res.data;
	  }, function(err) {
    }); 
  };
});
