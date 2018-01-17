define(['jquery','utils','js/lib/webapi','layer','bootstrap'],function($,utils,apis){
	var eap = {
		ver:1.0,
		emptyFn : function(){},
		apply : function(o, c, defaults){
			if(defaults){
				eap.apply(o, defaults);
			}

			if(o && c && typeof c == 'object'){
				for(var p in c){
					o[p] = c[p];
				}
			}
			return o;
		},
		applyIf : function(o, c){
			if(o){
				for(var p in c){
					if(!eap.isDefined(o[p])){
						o[p] = c[p];
					}
				}
			}
			return o;
		},
		copyApply : function(source,obj){
			return eap.apply(eap.apply({},source),obj);
		},
		urlDecode : function(string, overwrite){
			if(eap.isEmpty(string)){
				return {};
			}
			var obj = {},
				pairs = string.split('&'),
				d = decodeURIComponent,
				name,
				value;
			eap.each(pairs, function(pair) {
				pair = pair.split('=');
				name = d(pair[0]);
				value = d(pair[1]);
				obj[name] = overwrite || !obj[name] ? value :
					[].concat(obj[name]).concat(value);
			});
			return obj;
		},
		urlEncode : function(o, pre){
			var empty,
				buf = [],
				e = encodeURIComponent;
			eap.iterate(o, function(key, item){
				empty = eap.isEmpty(item);
				eap.each(empty ? key : item, function(val){
					buf.push('&', e(key), '=', (!eap.isEmpty(val) && (val != key || !empty)) ? (eap.isDate(val) ? eap.encode(val).replace(/"/g, '') : e(val)) : '');
				});
			});
			if(!pre){
				buf.shift();
				pre = '';
			}
			return pre + buf.join('');
		},
		iterate : function(obj, fn, scope){
			if(eap.isEmpty(obj)){
				return;
			}
			if(eap.isIterable(obj)){
				eap.each(obj, fn, scope);
				return;
			}else if(typeof obj == 'object'){
				for(var prop in obj){
					if(obj.hasOwnProperty(prop)){
						if(fn.call(scope || obj, prop, obj[prop], obj) === false){
							return;
						};
					}
				}
			}
		},
		uuid : function() {
			var s = [];
			var hexDigits = "0123456789abcdef";
			for (var i = 0; i < 36; i++) {
				s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
			}
			s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
			s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
			s[8] = s[13] = s[18] = s[23] = "-";
			return s.join("");
		},
		each : function(array, fn, scope){
			if(eap.isEmpty(array, true)){
				return;
			}
			if(!eap.isIterable(array) || eap.isPrimitive(array)){
				array = [array];
			}
			for(var i = 0, len = array.length; i < len; i++){
				if(fn.call(scope || array[i], array[i], i, array) === false){
					return false;
				};
			}
			return true;
		},
		isIterable : function(v){
			if(eap.isArray(v) || v.callee){
				return true;
			}
			if(/NodeList|HTMLCollection/.test(toString.call(v))){
				return true;
			}
			return ((typeof v.nextNode != 'undefined' || v.item) && eap.isNumber(v.length));
		},
		isArray : function(v) {
			if (typeof Array.isArray === "function") {
				return Array.isArray(v);
			} else {
				return Object.prototype.toString.call(v) === "[object Array]";
			}
		},
		toBoolean : function(v){
			if(!eap.isBoolean(v)){
				switch(v){
					case "false":
					case "FALSE":
					case "0":
					case undefined:
						v = false;
						break;
					case "true":
					case "TRUE":
					case "1":
						v = true;
						break;
				}
			}
			return v;
		},
		isDefined : function(v){return typeof v !== 'undefined';},
		isPrimitive : function(v){return eap.isString(v) || eap.isNumber(v) || eap.isBoolean(v);},
		isBoolean : function(v){return typeof v === 'boolean';},
		isFunction : function(v){return typeof v === 'function';},
		isNumber : function(v){return typeof v === 'number' && isFinite(v);},
		isString : function(v){return typeof v === 'string';},
		isDate : function(v){return toString.apply(v) === '[object Date]';},
		isObject : function(v){return !!v && Object.prototype.toString.call(v) === '[object Object]';},
		isEmpty : function(v, allowBlank){
			return v === null
				|| v === undefined
				|| (eap.isArray(v) && ((!v.length)||v.length==0))
				|| (!allowBlank ? (v === ''|| v ==='null'): false)
				|| (eap.isObject(v)&&eap.isEmptyObject(v));
		},
		isEmptyObject:function (v) {
			var t;
			for (t in v)
				return !1;
			return !0
		},
		getModule : function(moduleName){
			return this.app.getModule(moduleName);
		},
		destory : function(obj){
			if(eap.isArray(obj)){
				for(var i = 0;i < obj.length;i++){
					this.destory(obj[i]);
				}
				return;
			}
			if(eap.isObject(obj)){
				for(var p in obj){
					obj[p] = null;
					delete obj[p];
				}
			}
		},
		parseJson:function(data) {
			return data?eval("("+data+")"):"";
		},
		dateFormat:function (date, format) {
			var o = {
				"M+": date.getMonth() + 1, //月份
				"d+": date.getDate(), //日
				"h+": date.getHours(), //小时
				"m+": date.getMinutes(), //分
				"s+": date.getSeconds(), //秒
				"q+": Math.floor((date.getMonth() + 3) / 3), //季度
				"S": date.getMilliseconds() //毫秒
			};
			if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
			for (var k in o)
				if (new RegExp("(" + k + ")").test(format)) format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			return format;
		},
		isWeiXin:function () {
			var ua = window.navigator.userAgent.toLowerCase();
			return ua.match(/MicroMessenger/i) == 'micromessenger';
		},
		isAliPay:function () {
			var ua = window.navigator.userAgent.toLowerCase();
			return ua.match(/AlipayClient/i)=='alipayclient';
		}
	};
//	=== 基本对象 扩展
	eap.applyIf(Array.prototype, {
		indexOf : function(o, from){
			var len = this.length;
			from = from || 0;
			from += (from < 0) ? len : 0;
			for (; from < len; ++from){
				if(this[from] === o){
					return from;
				}
			}
			return -1;
		},
		remove : function(o){
			var index = this.indexOf(o);
			if(index != -1){
				this.splice(index, 1);
			}
			return this;
		}
	});

	eap.apply(Function.prototype, {
		createInterceptor : function(fcn, scope){
			var method = this;
			return !eap.isFunction(fcn) ?
				this :
				function() {
					var me = this,args = arguments;
					fcn.target = me;
					fcn.method = method;
					return (fcn.apply(scope || me || window, args) !== false) ? method.apply(me || window, args) :null;
				};
		},
		createCallback : function(/*args...*/){
			var args = arguments,
				method = this;
			return function() {
				return method.apply(window, args);
			};
		},
		createDelegate : function(obj, args, appendArgs){
			var method = this;
			return function() {
				var callArgs = args || arguments;
				if (appendArgs === true){
					callArgs = Array.prototype.slice.call(arguments, 0);
					callArgs = callArgs.concat(args);
				}else if (eap.isNumber(appendArgs)){
					callArgs = Array.prototype.slice.call(arguments, 0); // copy arguments first
					var applyArgs = [appendArgs, 0].concat(args); // create method call params
					Array.prototype.splice.apply(callArgs, applyArgs); // splice them in
				}
				return method.apply(obj || window, callArgs);
			};
		},
		defer : function(millis, obj, args, appendArgs){
			var fn = this.createDelegate(obj, args, appendArgs);
			if(millis > 0){
				return setTimeout(fn, millis);
			}
			fn();
			return 0;
		}
	});
	/**
	 * 通用性后台操作
	 * @param flag  a@b command=a&actionFlag=b
	 * @param params  条件设置
	 * @returns {null}
	 */
	eap.parseParam=function(param, key){
		var paramStr="";
		if(param instanceof String||param instanceof Number||param instanceof Boolean){
			paramStr+="&"+key+"="+encodeURIComponent(param);
		}else{
			$.each(param,function(i){
				var k=key==null?i:key+(param instanceof Array?"["+i+"]":"."+i);
				paramStr+='&'+eap.parseParam(this, k);
			});
		}
		return paramStr.substr(1);
	};
	eap.webApi = function (flag,params,tenant){
		//return eap.webApiSync("../moge",flag,params,tenant)
		return eap.webApiSync(location.origin+"/cc",flag,params,tenant)
	};
	eap.webApiSync = function (host,flag,params,tenant) {
		if(flag){
			var url = host+'/COMMAND/FLAG';
			var actions = flag.split('@');
			//url = url.replace('COMMAND',actions[0]).replace('FLAG',actions[1]);
			url = url.replace('COMMAND',actions[0]=="comm"?"data":actions[0]).replace('FLAG',actions[1]);
			if(params){
				if(typeof(params) == "string"){
					url +="&" + params;
				} else if(typeof(params) == "object"){
					url +="&" + eap.parseParam(params)
				}
			}
			//url = tenant? url+"&useraudit=false":url+"&useraudit=false&ignoreTenant=true";
			return url;
		}else {
			console.error('请求操作符不能为空!')
			return  null
		}
	}
	/**
	 * 获取用户状态
	 * @returns {{}}
	 */
	eap.getUserInfo = function () {
		if(!eap.isEmpty(sessionStorage.getItem("user"))){
			return JSON.parse(sessionStorage.getItem("user"));
		}
	}
    eap.getTenantInfo = function () {
        if(!eap.isEmpty(sessionStorage.getItem("tenant"),false)) {
            return JSON.parse(sessionStorage.getItem("tenant"));
        }
    }
	eap.ajax = function (url,type,async,data,success) {
		var accessToken = sessionStorage.getItem("AccessToken");
		if(!eap.isEmpty(accessToken)){
			data = eap.copyApply(data,{
				accessToken:accessToken
			})
		}
		var userLv = sessionStorage.getItem("userLv");
		if(userLv=="0"){
			data = eap.copyApply(data,{
				ignoreTenant:true
			})
		}
		$.ajax({url:url,type:type,async:async,data:data,success:success})
	}
	eap.post = function(url,data,success){
		var accessToken = sessionStorage.getItem("AccessToken");
		if(!eap.isEmpty(accessToken)){
			data = eap.copyApply(data,{
				accessToken:accessToken
			})
		}
		$.post(url,data,success);
	}
	eap.postWithRequestBody = function (url, data, success, error,dataType) {
		var accessToken = sessionStorage.getItem("AccessToken");
		if(!eap.isEmpty(accessToken)){
			data = eap.copyApply(data,{
				accessToken:accessToken
			})
		}
		$.ajax({
			url: url,
			type: 'POST',
			dataType: dataType?dataType:'json',
			async: false,
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(data),
			success:success,
			error:error
		})
	}
    eap.call = function(apiStr,params,success,fail) {
        if(eap.isEmpty(apiStr)){
            console.error("apiStr is null!")
        }else{
            var apiStrs = apiStr.split("#")
            var api = apis.get(apiStrs[0]).split("#");
            if(apiStrs.length>1)api[1] = api[1].replace("PARAMS",apiStrs[1]);//接口url本身存在参数
            switch(api[0]){
                case "json":
                    eap.post(api[1],params,success,false,fail);
                    break;
                case "string":
                    eap.postWithRequestBody(api[1],params,success,'json',fail);
                    break;
            }
        }
    }
	/**
	 * 获取url参数组
	 */
	eap.getUrlParams = function(){
		var search = decodeURI(window.location.search);

		// 写入数据字典
		var tmparray =eap.isEmpty(search)?null:search.substr(1,search.length).split("&");
		var paramsArray = {};
		if(!eap.isEmpty(tmparray,false)){
			eap.each(tmparray,function (e) {
				var reg = /[=|^==]/;    // 用=进行拆分，但不包括==
				var set1 = e.replace(reg,'&');
				var tmpStr2 = set1.split('&');
				paramsArray[tmpStr2[0]] = tmpStr2[1] ;
			})
		}
		// 将参数数组进行返回
		return paramsArray ;
	}
	eap.getParamsUrl=function (params) {
		var pStr = [];
		if(!eap.isEmpty(params,false)){
			for (var p in params){
				if(typeof params[p] == 'string'||typeof params[p] == 'number'||typeof params[p] =='boolean') {
					pStr.push(p + "=" + encodeURIComponent(params[p]))
				}
			}
		}
		return pStr.join('&');
	}
	eap.toModView = function(modName){
		$('section').addClass('hidden');
		$("#section-"+modName).removeClass('hidden');
		// $('section').hide();
		// $("#section-"+modName).show();
	}
	eap.UniToStr = function (data) {
		return unescape(data.replace(/\\u/gi,'%u'));
	}
	eap.toMoney = function (v) {
        var m = Math.round(Number(v)*100)/100
        return m.toFixed(2);
    }
	return eap;
});
