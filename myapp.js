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
  
  $scope.title="v3.15";
  
  const init_URL = 'https://cashflow.yushanth.com/thankGod/fromme/init.php';
  const checkLogin_URL = 'https://cashflow.yushanth.com/thankGod/fromme/checkLogin.php';
    
  const getHistoryItems_URL = 'https://cashflow.yushanth.com/thankGod/fromme/getHistoryItems.php'; 
  const getDaySheet_URL = 'https://cashflow.yushanth.com/thankGod/fromme/getDaySheet.php';
  const getMonthSheet_URL = 'https://cashflow.yushanth.com/thankGod/fromme/getMonthSheet.php';
  const setCheckedItem_URL = 'https://cashflow.yushanth.com/thankGod/fromme/setCheckedItem.php';
  const setVoidOrder_URL = 'https://cashflow.yushanth.com/thankGod/fromme/setVoidOrder.php';
  const submitOrder_URL = 'https://cashflow.yushanth.com/thankGod/fromme/submitOrder.php';

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
   
  $scope.checkLogin = function(myU, myP, store) {
	$scope.loading=true;
	$scope.loginMessage = '驗證中...';
    $http.get(checkLogin_URL+'?user=' + myU + '&pass=' + myP)
	.then(function(response) {
	  if(response.data) {
		 result=response.data.substring(0,2);
		 $scope.realName=response.data.substring(2);
	  }
	  else result='';
      if (result == 'OK') {
		$scope.loginMessage = '驗證成功!!';
        $scope.Ui.turnOff('modal_login');
        $scope.authenticated = true;
		$scope.myUID = myU;
		$scope.myPass = myP;
		$scope.store = store;
		//$scope.showHistoryItems(false,$scope.pickedDate);
		//$scope.showMonthSheet($scope.pickedDate,false);
		//$scope.showDaySheet($scope.pickedDate,false);
	  } else {
        	$scope.loginMessage = "帳密錯誤!!請再試一次";
			$scope.loading=false;
      }
	  $scope.loading=false;
    }, function(err) {
		$scope.loginMessage = "連線錯誤!!請再試一次";
	  	$scope.loading=false;
    });
  };
  
  $scope.logout = function() {
	  //window.location.reload();
	  $scope.Ui.turnOn('modal_login');
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

  $scope.showHistoryItem = function(index) {
    $scope.Ui.turnOn('modal_history_item');
    $scope.currentHistoryIndex = index;
	$scope.oHistoryItem = $scope.oHistoryItems[$scope.currentHistoryIndex];
	$scope.oCashing=false;
  };
  
  
  $scope.showHistoryItems = function(show=true,d) {
    if(!d) d = $scope.pickedDate;
	else $scope.pickedDate=d;
	$scope.mydate = $scope.localDate(d);
	if(show) {
		$scope.Ui.turnOn('modal_history_items');
	}
	console.log('hist',d,$scope.qHistItemsDate,$scope.mydate);
	if(!show || $scope.qHistItemsDate!=$scope.mydate) {
		$scope.loading=true;
		$http.get(getHistoryItems_URL+'?store='+$scope.store+'&mydate='+$scope.mydate).then(function(res) {
			$scope.oHistoryItems=res.data;
			$scope.loading=false;
			$scope.qHistItemsDate=$scope.mydate;
		}, function(err) {
			$scope.oHistoryItems=[];
			$scope.loading=false;
			$scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
		});
	}
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

  $scope.orderSubmit = function(rsvType,rsvTable,oMemo) {
	var d=$scope.localDate(new Date());
	if($scope.today!= d) {
		$scope.logout();
	};
	
	rsvType=rsvType || '';
	rsvTable=rsvTable || '0';
	oMemo=oMemo || '';
    if ($scope.myUID=='') {
      $scope.login();
      return;
    }
	
	$scope.submitAck = "";
    if (rsvType == '外帶') rsvTable = '0';
    var orderPayload = {
      'myItems': $scope.oItems,
      'resrvType': rsvType,
      'resrvTable': rsvTable,
      'myUID': $scope.myUID,
	  'store': $scope.store,
	  'orderMemo': oMemo
    };
	$scope.loading=true;
	$http.get(submitOrder_URL+'?data='+JSON.stringify(orderPayload)).then(function(response) {
	  $scope.loading=false;
	  orderPayload = response.data;
	  $scope.oHistoryItem = orderPayload;

      $scope.oItems = []; //clear shopping list
	  $scope.Ui.turnOff('modal_item_list');

	  $scope.oCashing=false;
	  $scope.Ui.turnOn('modal_history_item');
	  
	  $scope.showHistoryItems(false,$scope.pickedDate);
	  $scope.showDaySheet($scope.pickedDate,false);
	  $scope.showMonthSheet($scope.pickedDate,false);
      
    }, function(err) {
	  $scope.loading=false;
      $scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
    });
  };

 
  $scope.voidOrder = function(o) {
	var mongoid=o._id.$id;
	$scope.loading=true;
	$http.get(setVoidOrder_URL+'?mongoid='+mongoid+'&uid='+$scope.myUID).then( function(response) {
        $scope.loading=false;
    	if(response.data=='SUCCESS') {
			$scope.Ui.turnOff('modal_history_item');
			$scope.showHistoryItems(false,$scope.pickedDate);
			$scope.showDaySheet($scope.pickedDate,false);
			$scope.showMonthSheet($scope.pickedDate,false);
		}
		else if(response.data=='DUP') $scope.showDialog('提醒','本單已按過「作廢」','');
		else $scope.showDialog('錯誤','請稍後再試一次','');
	}, function(err){
	   $scope.loading=false;
       $scope.showDialog('錯誤',err.status+':'+err.statusText,'');
	});
  };
	
  $scope.setCashing = function(b) {
	  $scope.oCashing=b;
	  $scope.oCash='';
	  $scope.oCoupon='';
  };

  $scope.check = function(o,ar,cash,ret,coupon) {
	  var mongoid=o._id.$id;
      $scope.loading=true;
	  cash = cash || 0;
	  
	  $http.get(setCheckedItem_URL+'?mongoid='+mongoid+'&uid='+$scope.myUID+'&AR='+ar+'&Cash='+cash+'&Ret='+ret+'&Coupon='+coupon).then( function(response) {
		   $scope.loading=false;
		   if(response.data=='SUCCESS') {
				$scope.Ui.turnOff('modal_history_item');
				$scope.showHistoryItems(false,$scope.pickedDate);
				$scope.showDaySheet($scope.pickedDate,false);
				$scope.showMonthSheet($scope.pickedDate,false);
		   }
		   else if(response.data=='DUP') $scope.showDialog('提醒','本單已按過「結帳」','');
		   else $scope.showDialog('錯誤','請稍後再試一次','');
	  }, function(err){
           $scope.loading=false;
		   $scope.showDialog('錯誤',err.status+':'+err.statusText,'');
	  });
  };
  
  $scope.showDaySheet = function(d,show=true) {
	if(!d) d=$scope.pickedDate;
	else $scope.pickedDate=d;
	$scope.mydate = $scope.localDate(d);
	if(show) {
		$scope.Ui.turnOn('modal_day_sheet');
	}
	console.log('day',d,$scope.qDaySheetDate,$scope.mydate);
	if(!show || $scope.qDaySheetDate!=$scope.mydate) {
		$scope.loading=true;
		$http.get(getDaySheet_URL+'?store='+$scope.store+'&mydate='+$scope.mydate).then(function(res) {
			$scope.loading=false;
			if (!res.data) return;
			$scope.oDaySheet=res.data;
			$scope.qDaySheetDate=$scope.mydate;
		}, function(err) {
		$scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
			$scope.loading=false;	
		});
	}	
  };
  
  $scope.showMonthSheet = function(d,show=true) {
	if(!d) d=$scope.pickedMonth;
	else $scope.pickedMonth=d;
	
	var myY = d.getFullYear();
	var myM = ('0'+(d.getMonth()+1)).slice(-2);
	var mydate = myY + '-' + myM;
	if(show) {
		$scope.Ui.turnOn('modal_month_sheet');
	}
	
	if(!show || $scope.qMonthSheetDate!=mydate) {
		$scope.loading=true;
		$http.get(getMonthSheet_URL+'?store='+$scope.store+'&mydate='+mydate).then(function(res) {
			$scope.loading=false;
			if (res.data == null) return;
			$scope.oMonthSheet=res.data;
			$scope.qMonthSheetDate=mydate;
		}, function(err) {
			$scope.loading=false;
			$scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
		}); 
	}
  };

  $scope.setActiveTab = function(id) {
    $scope.activeTab=id;
  }
  
  $scope.localDate = function(d) {
	if(typeof d === 'string') return d;
	  
	var myY = d.getFullYear();
	var myM = ('0'+(d.getMonth()+1)).slice(-2);
	var myD = ('0'+d.getDate()).slice(-2);
	return myY + '-' + myM + '-' +myD;
  }
  
  $scope.init = function() {
    $scope.today=$scope.localDate(new Date());
	$scope.dialog = {
      title: '',
      content: '',
      callback: ''
    };

	$scope.activeTab = "1";
    $scope.oItem = {};
	$scope.oItems = [];
	$scope.currentHistoryIndex = 0;
	$scope.oTemp = {};
	$itemIndex = 0;
    $scope.submitAck = "";
    $scope.readySubmit = false;
    $scope.store = "gallery";
	$scope.loginMessage = "";
    $scope.oCashing = false;
	$scope.qHistItemsDate = '';
	$scope.qDaySheetDate = '';
	$scope.qMonthSheetDate = '';
    $scope.pickedDate = new Date();
	$scope.pickedMonth = new Date();
    $scope.classifyBy = "Cashier";
	$scope.loading = true;
	$scope.customerType='';
	$scope.authenticated=false;

	//init.php
	$http.get(init_URL).then(function(res) {
		$scope.loading = false;
		if (res.data == null) return;
			console.log(res.data);
			$scope.realNames=res.data.realNames;
			$scope.realNames['total']='合　　計';
			$scope.cats=res.data.cats;
			$scope.products=res.data.products;
		}, function(err) {
			console.log(err);
			$scope.loading = false;
    }); 
  };
});
