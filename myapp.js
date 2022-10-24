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

  const checkLogin_URL = 'https://script.google.com/macros/s/AKfycbz8vWuxfmL4mxj1CsCwtZ_n7bStFlZPRPgKYdXZ5sSjwDxbtb2-/exec';
  const getRealName_URL = 'https://script.google.com/macros/s/AKfycbxBoC4gWhleKATW-OH22XfDM85Z3wrvXoMVb9NLsQZbVVahyd8/exec';
  const getCats_URL = 'https://script.google.com/macros/s/AKfycby68whl-0C6dhds4hE_SOJ9120Bh-WuN0NHh-zVp48QnLSCmgSD/exec';
  const getProducts_URL = 'https://script.google.com/macros/s/AKfycbywdB4QWsHFXN4SiRCSHonQSRnR3LXGtuQJhu0FTKI8PCBjAHVB/exec';
  const getHistoryItems_URL = 'https://script.google.com/macros/s/AKfycbwRSrwYw5E5m7SVaoKLIGHM1swnpLBimZI1v8Khjl_hppKl0LJiv5xrufpoAuiVJ4LU/exec'; 
  const getDaySheet_URL = 'https://script.google.com/macros/s/AKfycbwWonALr-i7SnqzYJi8WsibbPzTgUqYSU_QqOY5kyTcpClZp07VBEqJqMyMSABkcUGi/exec';
  const getMonthSheet_URL = 'https://script.google.com/macros/s/AKfycbztINf1uW4JsB26pTZu9QTM9jeBYgqlpIXuLSnfYjoQeC-VwaBUUZWqurZ4T3f6gWMA/exec';
  const setCheckedItem_URL = 'https://script.google.com/macros/s/AKfycbw2QYRcT88_PrdZ-R-pqSEs3yt4kjmQgKortVqQ3s6W8NzNGpgJusKCGxWLi-mlG1yI/exec';
  const setVoidOrder_URL = 'https://script.google.com/macros/s/AKfycbwxnSs8YXkAPuQT8x6DFHKDZmSM_OpnYVUbFHDijgsi_rz5NvrugoeskjMUEvgp4-oy/exec';
  const submitOrder_URL = 'https://script.google.com/macros/s/AKfycbw8Rk91zsvqvycoOSVMwCQ72u3-9_B-5PgzWG8Itshmy8phmvZ2CBwEUE4nFmCpjT-NHQ/exec';

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
		$scope.sto=$scope.showHistoryItems(false,0);
	  } else {
        	$scope.loginMessage = "帳密錯誤!!";
      }
	  $scope.loading=false;
    }, function(err) {
	  	$scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
		$scope.loading=false;
    });
  };
  
  $scope.logout = function() {
	  window.location.reload();
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
	$scope.oHistoryItem = $scope.oHistoryItems[$scope.currentHistoryIndex];
	$scope.oCashing=false;
  };
  
  
  $scope.showHistoryItems = function(show,htype,query,d) {
    if(show) {
		$scope.Ui.turnOn('modal_history_items');
		$scope.loading=true;
	}
	
	if(d) {
		var myY = d.getFullYear();
		var myM = ('0'+(d.getMonth()+1)).slice(-2);
		var myD = ('0'+d.getDate()).slice(-2);
		$scope.mydate = myY + '-' + myM + '-' +myD;
    }
		
	$http.get(getHistoryItems_URL+'?store='+$scope.store+'&mydate='+$scope.mydate).then(function(res) {
	    $scope.loading=false;
		$scope.oHistoryItems=res.data;
    }, function(err) {
		$scope.oHistoryItems=[];
	   	$scope.loading=false;
       	$scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
	});
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

  $scope.orderSubmit = function(rsvType,rsvTable,oMemo) {
	var d=new Date();
	var myY = d.getFullYear();
	var myM = ('0'+(d.getMonth()+1)).slice(-2);
	var myD = ('0'+d.getDate()).slice(-2);
	if($scope.today!= myY + '-' + myM + '-' +myD) {
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
      
    }, function(err) {
	  $scope.loading=false;
      $scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
    });
  };

 
  $scope.voidOrder = function(o) {
	var mongoid=o._id;
	$scope.loading=true;
	$http.get(setVoidOrder_URL+'?mongoid='+mongoid+'&uid='+$scope.myUID).then( function(response) {
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
	  $scope.oCashing=b;
	  $scope.oCash='';
	  $scope.oCoupon='';
  };

  $scope.check = function(o,ar,cash,ret,coupon) {
	  var mongoid=o._id;
      $scope.loading=true;
	  cash = cash || 0;
	  
	  $http.get(setCheckedItem_URL+'?mongoid='+mongoid+'&uid='+$scope.myUID+'&AR='+ar+'&Cash='+cash+'&Ret='+ret+'&Coupon='+coupon).then( function(response) {
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
  
  $scope.showDaySheet = function(d) {
	$scope.Ui.turnOn('modal_day_sheet');
	var myY = d.getFullYear();
	var myM = ('0'+(d.getMonth()+1)).slice(-2);
	var myD = ('0'+d.getDate()).slice(-2);
	$scope.mydate = myY + '-' + myM + '-' +myD;
	$scope.loading=true;
    $http.get(getDaySheet_URL+'?store='+$scope.store+'&mydate='+$scope.mydate).then(function(res) {
      if (!res.data) return;
      $scope.oDaySheet=res.data.byCashier;
	  $scope.oDaySheet_P=res.data.byProduct;
	  $scope.oDaySheet_C=res.data.byCategory;
	  $scope.loading=false;
    }, function(err) {
      $scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
	  $scope.loading=false;
    }); 
  };
  
  $scope.showMonthSheet = function(d) {
	$scope.Ui.turnOn('modal_month_sheet');
	var myY = d.getFullYear();
	var myM = ('0'+(d.getMonth()+1)).slice(-2);
	var mydate = myY + '-' + myM;
	$scope.loading=true;
	$http.get(getMonthSheet_URL+'?store='+$scope.store+'&mydate='+mydate).then(function(res) {
      if (res.data == null) return;
      $scope.oMonthSheet=res.data.byCashier;
      $scope.oMonthSheet_P=res.data.byProduct;
	  $scope.oMonthSheet_C=res.data.byCategory;
	  $scope.oMonthSheet_D=res.data.byDate;
	  $scope.loading=false;
    }, function(err) {
	  $scope.loading=false;
      $scope.showDialog('網路連線錯誤', err.status + ':' + err.statusText, '');
    }); 
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
	$scope.oTemp = {};
    $scope.histType = '';
	$scope.sto = '';
    $itemIndex = 0;
    $scope.submitAck = "";
    $scope.readySubmit = false;
    $scope.store = "gallery";
	$scope.loginMessage = "";
    $scope.oCashing = false;
    $scope.pickedDate = new Date();
	$scope.pickedMonth = new Date();
    $scope.classifyBy = "Cashier";
	$scope.loading = false;
	$scope.lastOID=0;
	$scope.nowCash=0;
	$scope.customerType='';
	$scope.authenticated=false;

	//getRealNames
	$http.get(getRealName_URL).then(function(res) {
      if (res.data == null) return;
      $scope.realNames=res.data;
	  $scope.realNames['total']='合　　計';
	  }, function(err) {
    }); 

	//getCats
	$http.get(getCats_URL).then(function(res) {
      if (res.data == null) return;
      $scope.cats=res.data;
	  }, function(err) {
    }); 
	
	//getProducts
	$http.get(getProducts_URL).then(function(res) {
      if (res.data == null) return;
      $scope.products=res.data;
	  }, function(err) {
    }); 
  };
});
