/**
 * Created by xx on 16/11/2.
 */
define(function() {
    var Map = function (){
        var map = new Object();
        map.data = new Array();

        map.put = function(key,value){
            this.data[key] = value;
        };

        map.get = function(key){
            return this.data[key];
        };
        map.toString = function () {
            var str = '';
            for(key in this.data){
                if(key === 'remove')continue;
                str = str.concat(key).concat(':').concat(this.get(key)).concat(',')
            }
            return str.substring(0,str.length-1);
        };

        map.toMap = function (str) {
            var keyValue = str.split(',');
            for(var i = 0;i<keyValue.length;i++){
                var temp = keyValue[i].split(':');
                if(temp.length !== 2){continue}
                this.put(temp[0],temp[1])
            }
            return this;
        };

        map.toJsonString =function () {
            var str = '{"data":[DATA]}';
            var arr = [];
            for(key in this.data){
                if(key === 'remove')continue;
                arr.push('{"key":"KEY","value":"VAL"}'
                    .replace("KEY",key)
                    .replace("VAL",this.get(key))
                )
            }
            return str.replace("DATA",arr.join(','));
        };
        map.toJsonObject = function () {
           return eval("("+map.toJsonString()+")").data
        }
        map.remove = function(key){
            this.data[key] = null;
        };

        map.isEmpty = function(){
            return this.data.length == 0;
        };

        map.size = function(){
            return this.data.length;
        };
        map.keySet = function () {
            var arr = []
            for (key in this.data){
                arr.push(key)
            }
            return arr;
        }
        map.valueSet = function () {
            var arr = []
            for (key in this.data){
                arr.push(this.get(key))
            }
            return arr;
        }
        return map;
    };
    return {
        Map : Map
    }
});