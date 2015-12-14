/**
 * Created by Administrator on 2015/11/20.
 *   前端小类库
 *   author xhy
 *   date 2015-12
 *   version 0.1
 *
 *   |一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一|
 *   | //                                                                   |
 *   |   @1:事件系统未完成                                                    |
 *   |   @2:缓存系统未完成                                                    |
 *   |                                                                      |
 *   |  @tips 因为主要是面向移动端的，所以基本没有做ie的兼容，只封装了             |
 *   |  一部分常会用到的方法，目前事件代理，动画效果都需要自己去做                 |
 *   |  考虑到文件的大小，以后最多就实现todo中的两个，动画就不做了，               |
 *   |  交给css3了                                                           |
 *   |                                                                      |
 *   |一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一|
 */
;(function(window,undefined){
    /*ajax对象构造函数*/
    function ajax(opts){//ajax方法
        var _opt = {
            url:'',
            method:'GET',
            data:'',
            async:true,
            cache:true,
            contentType:'application/x-www-form-urlencoded',
            success:function(){},
            error:function(){}
        };

        for(var key in opts){
            _opt[key] = opts[key];
        }
        this.opts = _opt;
    }

    /*
    * ajax原型方法
    * */
    ajax.prototype = {
        constructor:ajax,
        getSearch: function () {
            var search = '?';
            if(typeof this.opts.data === 'object'){//如果需要传递额外参数
                var args = [];
                for(var key in this.opts.data){
                    args.push(key+'='+this.opts.data[key]);
                }
                search += args.join('&');
            }else{
                search += '';
            }

            if(!this.opts.cache){
                search += '&timeStamp='+(+new Date());
            }
            if(search.length == 1){
                search = '';
            }

            return search;
        },
        initAjax : function () {
            var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
            if(this.opts.method.toUpperCase() == 'GET'){
                xhr.open('GET',this.opts.url+this.getSearch(),this.opts.async);
                xhr.send(null);
            }else{
                xhr.open('POST',this.opts.url,this.opts.async);
                xhr.setRequestHeader("Content-type", this.opts.contentType);
                xhr.send(this.getSearch().slice(1));
            }
            var success = this.opts.success,
                error = this.opts.error;


            xhr.onreadystatechange = function(evt){
                if(xhr.readyState == 4){
                    if(xhr.status === 200){
                        var data = JSON.parse(xhr.responseText);
                        success(data,xhr);
                    }else{
                        error(xhr);
                    }
                }
            };

        }
    };

    /*
    * 核心构造函数
    * */
    function xQuery(elemArr,selector){
        //this.selector = selector;
        var that = this;
        this.domElemList = elemArr;
        [].map.call(this.domElemList,function(v,i){
            that[i] = v;
        });
        this.opIndex = 0;
        this.length = this.domElemList.length;
    }

    /*
    * 一些工具方法
    * */
    var _util = {
        //驼峰式
        camelCase: function (str) {
            str = str.replace(/^-/,'');
            return str.replace(/(-[\da-z])/gi,function(word,letter){
                return RegExp.$1.substr(1,1).toUpperCase();
            });
        },
        //获取对象类型
        getType : function(obj){
            var regx = /^\[object (\w+)\]$/ig,
                o = {};
            return regx.exec(o.toString.call(obj))[1].toLowerCase();
        },
        //判断是不是类数组元素（暂时不管window对象）
        isArraylike : function( obj ) {
            var length = obj.length,
                type = _util.getType( obj );

            if ( obj.nodeType === 1 && length ) {
                return true;
            }

            return type === "array" || type !== "function" &&
                ( length === 0 ||
                typeof length === "number" && length > 0 && ( length - 1 ) in obj );
        },
        //获取所有参数
        getQuery : function () {
            var search = window.location.search.substr(1),
                tmp = {};
            search.split('&').map(function (v,i) {
                var _t = v.split('=');
               tmp[_t[0]] = _t[1];
            });
            return tmp;
        },
        //获取单个参数
        getQueryByName : function(name) {
            var r = window.location.search.substr(1).match(name);
            if (r != null)
                return unescape(r[2]);
            return null;
        },
        //判断是不是元素节点
        isElement: function (ele) {
            if(typeof ele == 'string' || typeof ele == 'undefined'){
                return;
            }
            var nodeType = ele.nodeType;
            return nodeType && nodeType === 1;
        },
        /*
        * @ context 执行上下文
        * @ selector 选择器
        * @ direc 是否直接子元素
        * */
        findElement: function (context,selector,direc) {//查找元素
            var slcStr = '',
                ret;
            direc = typeof direc === 'undefined' ? ' ':' > ';
            if(_util.isElement(context)){//判断上下文是不是元素
                var id = context.id;
                if(id ){
                    slcStr = '#'+id+direc+selector;
                    //console.log(slcStr);
                    return [].slice.call(document.querySelectorAll(slcStr));
                }else{
                    var idStr = context.id = '__unique__'+new Date().getTime();//添加一个唯一的id，用于限定上下文
                    slcStr = '#'+idStr+direc+selector;
                    ret = document.querySelectorAll(slcStr);
                    context.removeAttribute('id');//用完以后删掉无用的id
                    //console.log(context.id);
                    return [].slice.call(ret);
                }

            }else if(typeof context == 'string'){//直接当做选择器
                return [].slice.call(document.querySelectorAll(context+direc+selector));
            }
        },
        //设置元素的唯一标识用完删除
        setUnique: function (elem) {
            var id = '__unique__'+new Date().getTime();
            elem.id = id;
            return id;
        },
        //判断两个元素之间是否存在包含关系
        ifContain: function (outerElem, innerElem) {
            var uniqueId = _util.setUnique(outerElem),
                //copyInner = innerElem.clone(true),
                copyInner = innerElem,
                flag = false;
            while(copyInner = copyInner.parentNode){
                //copyInner = copyInner.parentNode;
                if(copyInner.id === uniqueId){
                    flag = true;
                    break;
                }
            }
            outerElem.removeAttribute('id');//用完删除
            return flag;
        },
        // 判断是不是function
        isFunction:function(obj){
            return this.getType(obj) === 'function';
        },
        //判断是不是数组
        isArray: function (obj) {
          return this.getType(obj) === 'array';
        },
        //判断是不是window对象
        isWindow: function (obj) {
          return obj != null && obj === obj.window;
        },

        //判断是不是普通对象
        isPlainObject: function (obj) {
            // Not plain objects:
            //不是普通对象的特征
            // - Any object or value whose internal [[Class]] property is not "[object Object]"
            //内部类不是[Object Object] 也就是说借用Obect的提哦String返回的值不是object
            // - DOM nodes
            //DOM节点
            // - window
            // window对象
            if (this.getType( obj ) !== "object" || obj.nodeType || this.isWindow( obj ) ) {//三个特性有一个或一个以上不符合
                return false;
            }

            // Support: Firefox <20
            // The try/catch suppresses exceptions thrown when attempting to access
            // the "constructor" property of certain host objects, ie. |window.location|
            // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
            //这个是专门用来判断一些特殊浏览器的对象，比如说window.location对象
            try {
                if ( obj.constructor &&
                    !Object.prototype.hasOwnProperty.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
                    return false;
                }
            } catch ( e ) {
                return false;
            }

            // If the function hasn't returned already, we're confident that
            // |obj| is a plain object, created by {} or constructed with new Object

            //如果上面都没有返回，那我们就能确定当前这个对象是一个普通对象，是由字面量{}或者new Object()创建的
            return true;
        },

        //判断数组或类数组元素中是否包含指定的元素
        ifArrayIn: function (item,arr) {
            for(var i = 0,length = arr.length;i<length;i++){
                if(item === arr[i]){
                    return item;
                }
            }

            return null;
        },
        //把类数组对象转化成数组
        toArray: function (arrlike) {
            if(this.isArraylike(arrlike)){
                return [].slice.call(arrlike);
            }
            throw Error('该对象无法转换成数组对象');
            return null;

        },
        
        //合并多个对象(从jQuery那边偷过来的)
        extend: function () {
            var options, name, src, copy, copyIsArray, clone,
                target = arguments[0] || {},//第一个参数~如果第一个参数为boolean型，将执行深/浅克隆
                i = 1,
                length = arguments.length,//参数数量
                deep = false;//默认浅克隆

            // Handle a deep copy situation
            //深度克隆
            if ( typeof target === "boolean" ) {
                deep = target;
                target = arguments[1] || {};//克隆目标为第二个参数
                // skip the boolean and the target
                i = 2;
            }

            // Handle case when target is a string or something (possible in deep copy)
            //控制目标对象为一个字符串或者其他的类型|（可能在深克隆时）
            if ( typeof target !== "object" && _util.getType(target) === 'function' ) {
                target = {};
            }

            // extend jQuery itself if only one argument is passed
            //根据参数判断是不是扩展jquery对象自身
            if ( length === i ) {
                target = this;//克隆目标为第一个jquery对象本身
                --i;//根据情况选择性忽略第一个参数（保证后续的遍历只会被执行一次）
            }

            //遍历除了克隆目标和深浅克隆标志参数外的所有参数
            for ( ; i < length; i++ ) {
                // Only deal with non-null/undefined values
                //只用来处理正常情况
                if ( (options = arguments[ i ]) != null ) {
                    // Extend the base object
                    for ( name in options ) {
                        src = target[ name ];
                        copy = options[ name ];

                        // Prevent never-ending loop
                        //避免死循环
                        if ( target === copy ) {//不理解什么时候会发生？？
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays
                        //在合并普通对象或者数组的时候使用递归调用方式
                        if ( deep && copy && ( this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)) ) ) {
                            if ( copyIsArray ) {//是数组
                                copyIsArray = false;
                                clone = src && this.isArray(src) ? src : [];

                            } else {//是普通对象
                                clone = src && this.isPlainObject(src) ? src : {};
                            }

                            // Never move original objects, clone them
                            //递归调用本身进行克隆
                            target[ name ] = this.extend( deep, clone, copy );

                            // Don't bring in undefined values
                            //浅拷贝，且属性值不是undefined
                        } else if ( copy !== undefined ) {
                            target[ name ] = copy;
                        }
                    }
                }
            }

            // Return the modified object
            return target;//返回被更改后的对象
        },
        camelCase : function (str) {//驼峰式
            return str.replace(/(-[\da-z])/gi,function(word,letter){
                return RegExp.$1.substr(1,1).toUpperCase();
            });
        },
        //文档加载完成函数
        domReady : function (callback){
            document.addEventListener('DOMContentLoaded',callback);
        },
        //ajax函数
        ajax:function(opts){
            return new ajax(opts).initAjax();
        }
    };

    /*
    * 核心对象的原型方法
    * */


    xQuery.fn = xQuery.prototype = {
        constructor:xQuery,
        //原生方法splice借用（这个其实没用，就是防止在控制台把整个对象打出来）
        splice:function(args){
            //[].splice.apply(this,arguments);
            //return this;
        },
        ////原生方法slice借用
        //slice: function (args) {
        //    [].slice.apply(this,arguments);
        //    return this;
        //},
        //原生方法each借用
        each: function (args) {
            [].map.apply(this,arguments);
            return this;
        },
        //获取当前操作元素
        getOpElem: function (index) {
            index  = index || this.opIndex;
            return this.domElemList[index];
        },
        //获取元素
        get : function(index){
            //index不传也没事，直接交给getOpElem去处理空值
            return this.getOpElem(index);
        },
        //设置样式值
        css: function (prop,value) {
            var opElems = this.domElemList,
                _arguments = arguments;
            if(_arguments.length < 1){
                return null;
            }else if(_arguments.length === 1 && typeof _arguments[0] !== 'object'){
                prop = _util.camelCase(prop);
                return window.getComputedStyle(this.getOpElem(),null)[prop];
            }

            [].map.call(opElems,function (opElem) {
               if(_arguments.length === 1){
                    for(var obj in _arguments[0]){
                        opElem.style[_util.camelCase(obj)] = _arguments[0][obj];
                    }
                }else{
                    prop = _util.camelCase(prop);
                    opElem.style[prop] = value;
                }
            });

            return this;

        },
        //获取className的工具函数
        _getClassArr:function (callback) {
            var opElems = this.domElemList;
            [].map.call(opElems,function(v,i){
                var classArr = v.className.split(/\s+/);
                v.className = callback(classArr).trim();
            });
            return this;
        },
        //添加类
        addClass:function(className){
            return this._getClassArr(function(classArr){
                if(classArr.indexOf(className) === -1){
                    classArr.push(className);
                }
                return classArr.join(' ');
            });
        },
        //判断是都有类
        hasClass:function(className){
            var opElem = this.getOpElem();

            return opElem.className.indexOf(className) !== -1;
        },
        //移除class
        removeClass: function (className) {
            return this._getClassArr(function(classArr){
                var index = classArr.indexOf(className);
                if(index !== -1){
                    classArr.splice(index,1);
                }
                return classArr.join(' ');
            });
        },
        //切换class
        toggleClass:function(className){
            return this._getClassArr(function (classArr) {
                var index = classArr.indexOf(className);
                if(index !== -1){
                    classArr.splice(index,1);
                }else{
                    classArr.push(className);
                }

                return classArr.join(' ');
            });
        },
        //向文档中append元素
        append:function(str){
            var fragment = document.createDocumentFragment(),
                container = document.createElement('div'),
                opElems = this.domElemList;
            container.innerHTML = str;
            var cN = container.childNodes;
            for(var i = 0;i<cN.length;i++){
                fragment.appendChild(cN[i]);
            }
            [].map.call(opElems,function (opElem,i) {
                opElem.appendChild(fragment);
            });

            return this;
        },
        //向文档中prepend元素
        prepend: function (str) {
            var fragment = document.createDocumentFragment(),
                container = document.createElement('div'),
                opElems = this.domElemList;
            container.innerHTML = str;
            var cN = container.childNodes;
            for(var i = 0;i<cN.length;i++){
                fragment.appendChild(cN[i]);
            }
            [].map.call(opElems,function (opElem,i) {
                opElem.insertBefore(fragment,opElem.firstChild);
            });

            return this;
        },
        //移除元素
        remove:function(){
            var opElem = this.getOpElem(),
                opElems = this.domElemList;
            opElem.parentNode.removeChild(opElem);
            /*this.domElemList = */[].shift.call(opElems);
            //console.log(this.domElemList);
            //this.opIndex = 0;
            return this._stateChange(opElems);
        },
        //选择
        //为防止引用传递对原来对象的影响，这里返回一个独立的克隆对象
        eq:function(index){
            index = index||0;
            if(index > this.length-1){
                throw 'Array out of Range';
            }
            return this._stateChange([this.domElemList[index]]);
        },
        //回到第一个元素
        end:function(){
            return this.eq();
        },
        //事件绑定
        /*
        *  param proxyObj 事件代理对象
        *  param eventType 事件类型
        *  param callback 事件回调函数
        *  param data 事件所需的数据，可以不传
        * */
        bind:function(proxyObj,eventType,callback,data){

        },
        //执行一些dom操作，这个会破坏链式操作，无法用end返回
        _stateChange: function (domElem) {
            domElem = _util.isArraylike(domElem) ? domElem : [domElem];
            //domElem = _util.getType(domElem).toLowerCase() !== 'array' ? [domElem]:domElem;
            var copy = _util.extend(true,{},this);
            copy.domElemList = domElem;
            [].map.call(copy.domElemList,function(v,i){
                copy[i] = v;
            });
            copy.opIndex = 0;
            copy.length = copy.domElemList.length;
            return copy;
        },
        //找到父元素，
        parent:function(){
            var opElem = this.getOpElem();
            return this._stateChange(opElem.parentNode);
        },
        //孩子元素
        children:function(selector){
            var opElem = this.getOpElem(),
                retElem;
            selector = selector ? selector : '*';
            retElem = _util.findElement(opElem,selector,true);
            return this._stateChange(retElem);
        },
        //递归寻找子元素
        find: function (selector) {
            var opElem = this.getOpElem(),
                retElem;
            selector = selector ? selector : '*';
            retElem = _util.findElement(opElem,selector);
            return this._stateChange(retElem);
        },
        //向上查找最近的祖先元素
        closest:function(selector){
            if(!selector){
                return this._stateChange(document.body);
            }
            var opElem = this.getOpElem(),
                copyInner = opElem,
                retElem,
                targetElems = document.querySelectorAll(selector);
            while(copyInner = copyInner.parentNode){
                if(retElem = _util.ifArrayIn(copyInner,targetElems)){
                    return this._stateChange(retElem);
                }
            }

            return this._stateChange(document.body);

        },
        //缓存数据
        data:function(dataName,value){
            //这里直接用了html5的dataset属性
            var opElems = this.domElemList,
                opElem = this.getOpElem();
            if(arguments.length === 1){
                if(typeof arguments[0] !== 'object'){//值的获取
                    return opElem.dataset[_util.camelCase(dataName)];
                }else{//以对象的方式传入的(值的设置)
                    [].map.call(opElems,function(outerV,i){//这里有个双重循环了，可以想办法优化一下
                        for(var obj in dataName){
                            outerV.dataset[obj] = dataName[obj];
                        }
                    });
                }

            }else if(arguments.length === 2){
                [].map.call(opElems,function(v,i){
                    v.dataset[dataName] = value;
                });
            }

            return this;

        },
        //移除缓存数据
        removeData:function(dataName){
            var opElems = this.domElemList,
                opElem = this.getOpElem();
            if(typeof dataName !== 'object'){
                delete opElem.dataset[dataName];
            }else if(_util.getType(dataName) === 'array'){
                dataName.map(function(v,i){
                    delete opElem.dataset[v];
                });
            }
            return this._stateChange(opElems);
        },
        //后向查找元素
        next: function (selector) {
            var opElem = this.getOpElem(),
                retElems,
                copyElem = opElem,
                tmp = [];
            //console.log(opElem.nextElementSibling);
            if(selector === undefined){//查找直接后项元素
                var ret = opElem.nextElementSibling || [];
                return this._stateChange(ret);
            }

            retElems = _util.findElement(opElem.parentNode,selector,true);
            while(copyElem = copyElem.nextElementSibling){
                if(_util.ifArrayIn(copyElem,retElems)){
                    tmp.push(copyElem);
                }
            }
            return this._stateChange(tmp);
        },
        //前向查找元素
        prev: function (selector) {
            var opElem = this.getOpElem(),
                retElems,
                copyElem = opElem,
                tmp = [];
            if(selector === undefined){//查找直接后项元素
                var ret = opElem.previousElementSibling || [];
                return this._stateChange(ret);
            }

            retElems = _util.findElement(opElem.parentNode,selector,true);
            while(copyElem = copyElem.previousElementSibling){
                if(_util.ifArrayIn(copyElem,retElems)){
                    tmp.push(copyElem);
                    //return this._stateChange(copyElem);
                }
            }
            return this._stateChange(tmp);
        },
        //设置元素attribute属性
        attr: function (attr,value) {
            var opElem = this.getOpElem(),
                opElems = this.domElemList;
            if(arguments.length === 1){//获取
                if(typeof attr == 'string'){
                    return opElem.getAttribute(attr);
                }else{
                    for(var i in attr){
                        [],map.call(attr[i],function(v,i){
                            v.setAttribute(attr,value);
                        });
                    }
                }

            }else if(arguments.length == 2){
                [].map.call(opElems, function (v,i) {
                    v.setAttribute(attr,value);
                });
            }else{
                return opElem.attributes;//返回元素的attributes属性
            }

            return this._stateChange(opElems);
        },
        //移除属性
        removeAttr: function (attr) {
            var opElem = this.getOpElem();
            if(typeof attr !== 'object'){
                delete opElem.removeAttribute(attr);
            }else if(_util.getType(attr) === 'array'){
                attr.map(function(v,i){
                    delete opElem.removeAttribute(v);
                });
            }
            return this;

        },
        //text和html的公用方法
        _get_set_dom:function(text,type/*1 for text | 2 for html*/){
            var opElem = this.getOpElem(),
                opElems = this.domElemList;
            //console.log(typeof text);
            if(typeof text === 'undefined'){//表示是获取(那就只操作第一个匹配)
                if(type == 1){
                    return opElem.textContent;
                }else{
                    return opElem.innerHTML;
                }
            }else{//表示是设置(对所有匹配集合中得元素操作)
                [].map.call(opElems, function (v,i) {
                    if(type == 1){
                        v.textContent = text;
                    }else{
                        v.innerHTML = text;
                    }
                });
            }
            return this;
        },

        //获取或设置text
        text: function (text) {
            return this._get_set_dom(text,1);
        },

        //设置获取innerHTML
        html: function (strHtml) {
            return this._get_set_dom(strHtml,2);
        },

        //在结果集中查找某个元素或者某批元素
        /*
        * tips 只能进行简单的一些匹配
        * 类选择器 .class
        * id选择器 #id
        * 元素选择器 div
        *
        * */
        filter:function(selector){
            selector = selector.trim();
            var opElems = this.domElemList,
                testArr = [//测试选择器类型
                {
                    slc:selector.slice(1),
                    reg:/^\./,
                    handler:function(ele){
                        return ele.className.indexOf(this.slc) !== -1;
                    }
                },
                {
                    slc:selector.slice(1),
                    reg:/^#/,
                    handler:function(ele){
                        return ele.id === this.slc;
                    }
                },
                {
                    slc:selector,
                    reg:/([a-zA-Z.]+)/g,
                    handler:function(ele){
                        return ele.tagName.toLowerCase() === this.slc;
                    }
                }
                ],
                useObj = {},
                tmp = [];

            //遍历测试选择器类型对象
            for(var i = 0;i<testArr.length;i++){
                if(testArr[i].reg.test(selector)){
                    useObj = testArr[i];
                    break;
                }
            }
            //如果有匹配到的话
            if(typeof useObj.reg === 'undefined'){
                return this._stateChange([]);
            }

            //把符合条件的元素都放入一个临时数组中
            [].map.call(opElems,function(v,i){
                if(useObj.handler(v)){
                    tmp.push(v);
                }
            });

            return this._stateChange(tmp);
        }

    };

    /*
    * 可以接受的参数有
    * @ 选择器字串
    * @ nodeList或者元素数组
    * */
    function get(selector){
        var nodeList;
        if(typeof selector == 'string'){
            nodeList= document.querySelectorAll(selector);
        }else if(_util.isArraylike(selector)){
            nodeList = selector;
        }else{
            throw '你好歹传个对的参数啊！';
            //return null;
        }
        nodeList = _util.toArray(nodeList);//转成数组对象
        return new xQuery(nodeList,selector);
    }

    /*
    * 把选择器函数直接赋值给全局对象
    * */
    var _$ = function (selector) {
        if(_util.getType(selector) == 'function'){
            _util.domReady(selector);
            return get('body');
        }
        return get(selector);
    };

    /*
    * 合并工具类到全局对象中
    * */
    for(var i in _util){
        _$[i] = _util[i];
    }

    /*
    * 放弃对全局$的控制权
    * */
    var noConflit = function(deep/*是否连xQuery也给放弃掉*/){
        deep && (window.xQuery = null);
        window.$ = null;
        return _$;
    };

    _$.noConflit = noConflit;
    _$.version = 'xQuery_0.1';//版本号
    _$.getTime = function(){//获取当前时间
      return +new Date();
    };

    window.xQuery = window.$ = _$;//赋值给全局变量

})(window,undefined);