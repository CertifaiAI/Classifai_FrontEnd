!function(){function t(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(n&&n.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),n&&e(t,n)}function e(t,n){return(e=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,n)}function n(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(t){return!1}}();return function(){var n,a=o(t);if(e){var i=o(this).constructor;n=Reflect.construct(a,arguments,i)}else n=a.apply(this,arguments);return r(this,n)}}function r(t,e){return!e||"object"!=typeof e&&"function"!=typeof e?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):e}function o(t){return(o=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function a(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function c(t,e,n){return e&&i(t.prototype,e),n&&i(t,n),t}(window.webpackJsonp=window.webpackJsonp||[]).push([[1],{"/1FC":function(t,e,n){"use strict";e.a=Array.isArray},"/uUt":function(e,r,o){"use strict";o.d(r,"a",function(){return u});var i=o("7o/Q");function u(t,e){return function(n){return n.lift(new s(t,e))}}var s=function(){function t(e,n){a(this,t),this.compare=e,this.keySelector=n}return c(t,[{key:"call",value:function(t,e){return e.subscribe(new l(t,this.compare,this.keySelector))}}]),t}(),l=function(e){t(o,e);var r=n(o);function o(t,e,n){var i;return a(this,o),(i=r.call(this,t)).keySelector=n,i.hasKey=!1,"function"==typeof e&&(i.compare=e),i}return c(o,[{key:"compare",value:function(t,e){return t===e}},{key:"_next",value:function(t){var e;try{var n=this.keySelector;e=n?n(t):t}catch(o){return this.destination.error(o)}var r=!1;if(this.hasKey)try{r=(0,this.compare)(this.key,e)}catch(o){return this.destination.error(o)}else this.hasKey=!0;r||(this.key=e,this.destination.next(t))}}]),o}(i.a)},"1G5W":function(e,r,o){"use strict";o.d(r,"a",function(){return u});var i=o("zx2A");function u(t){return function(e){return e.lift(new s(t))}}var s=function(){function t(e){a(this,t),this.notifier=e}return c(t,[{key:"call",value:function(t,e){var n=new l(t),r=Object(i.c)(this.notifier,new i.a(n));return r&&!n.seenValue?(n.add(r),e.subscribe(n)):n}}]),t}(),l=function(e){t(o,e);var r=n(o);function o(t){var e;return a(this,o),(e=r.call(this,t)).seenValue=!1,e}return c(o,[{key:"notifyNext",value:function(){this.seenValue=!0,this.complete()}},{key:"notifyComplete",value:function(){}}]),o}(i.b)},"25cm":function(t,e,n){"use strict";var r=n("tPH9"),o=n("/1FC");e.a=function(t,e,n){var a=e(t);return Object(o.a)(t)?a:Object(r.a)(a,n(t))}},"3/ER":function(t,e,n){"use strict";(function(t){var r=n("Ju5/"),o="object"==typeof exports&&exports&&!exports.nodeType&&exports,a=o&&"object"==typeof t&&t&&!t.nodeType&&t,i=a&&a.exports===o?r.a.Buffer:void 0,c=i?i.allocUnsafe:void 0;e.a=function(t,e){if(e)return t.slice();var n=t.length,r=c?c(n):new t.constructor(n);return t.copy(r),r}}).call(this,n("3UD+")(t))},"3UD+":function(t,e){t.exports=function(t){if(!t.webpackPolyfill){var e=Object.create(t);e.children||(e.children=[]),Object.defineProperty(e,"loaded",{enumerable:!0,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,get:function(){return e.i}}),Object.defineProperty(e,"exports",{enumerable:!0}),e.webpackPolyfill=1}return e}},"3cmB":function(t,e,n){"use strict";var r=n("Y7yP"),o=n("Ju5/"),a=Object(r.a)(o.a,"Map");e.a=a},"5WsY":function(t,e,n){"use strict";var r=n("vJtL"),o=n("Js68");e.a=function(t){return null!=t&&Object(o.a)(t.length)&&!Object(r.a)(t)}},"7gMY":function(t,e,n){"use strict";var r=n("8M4i"),o=n("EUcb"),a=function(t){return Object(o.a)(t)&&"[object Arguments]"==Object(r.a)(t)},i=Object.prototype,c=i.hasOwnProperty,u=i.propertyIsEnumerable,s=a(function(){return arguments}())?a:function(t){return Object(o.a)(t)&&c.call(t,"callee")&&!u.call(t,"callee")},l=n("/1FC"),f=n("WOAq"),b=/^(?:0|[1-9]\d*)$/,p=function(t,e){var n=typeof t;return!!(e=null==e?9007199254740991:e)&&("number"==n||"symbol"!=n&&b.test(t))&&t>-1&&t%1==0&&t<e},d=n("oYcn"),h=Object.prototype.hasOwnProperty;e.a=function(t,e){var n=Object(l.a)(t),r=!n&&s(t),o=!n&&!r&&Object(f.a)(t),a=!n&&!r&&!o&&Object(d.a)(t),i=n||r||o||a,c=i?function(t,e){for(var n=-1,r=Array(t);++n<t;)r[n]=e(n);return r}(t.length,String):[],u=c.length;for(var b in t)!e&&!h.call(t,b)||i&&("length"==b||o&&("offset"==b||"parent"==b)||a&&("buffer"==b||"byteLength"==b||"byteOffset"==b)||p(b,u))||c.push(b);return c}},"8M4i":function(t,e,n){"use strict";var r=n("ylTp"),o=Object.prototype,a=o.hasOwnProperty,i=o.toString,c=r.a?r.a.toStringTag:void 0,u=Object.prototype.toString,s=r.a?r.a.toStringTag:void 0;e.a=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":s&&s in Object(t)?function(t){var e=a.call(t,c),n=t[c];try{t[c]=void 0;var r=!0}catch(u){}var o=i.call(t);return r&&(e?t[c]=n:delete t[c]),o}(t):function(t){return u.call(t)}(t)}},Ce4a:function(t,e,n){"use strict";var r=n("Ju5/");e.a=r.a.Uint8Array},CfRg:function(t,e,n){"use strict";var r=n("oSzE"),o=n("Y7yP"),a=function(){try{var t=Object(o.a)(Object,"defineProperty");return t({},"",{}),t}catch(e){}}(),i=function(t,e,n){"__proto__"==e&&a?a(t,e,{configurable:!0,enumerable:!0,value:n,writable:!0}):t[e]=n},c=n("YHEm"),u=Object.prototype.hasOwnProperty,s=function(t,e,n){var r=t[e];u.call(t,e)&&Object(c.a)(r,n)&&(void 0!==n||e in t)||i(t,e,n)},l=function(t,e,n,r){var o=!n;n||(n={});for(var a=-1,c=e.length;++a<c;){var u=e[a],l=r?r(n[u],t[u],u,n,t):void 0;void 0===l&&(l=t[u]),o?i(n,u,l):s(n,u,l)}return n},f=n("mkut"),b=n("7gMY"),p=n("IzLi"),d=n("pyRK"),h=Object.prototype.hasOwnProperty,v=n("5WsY"),g=function(t){return Object(v.a)(t)?Object(b.a)(t,!0):function(t){if(!Object(p.a)(t))return function(t){var e=[];if(null!=t)for(var n in Object(t))e.push(n);return e}(t);var e=Object(d.a)(t),n=[];for(var r in t)("constructor"!=r||!e&&h.call(t,r))&&n.push(r);return n}(t)},y=n("3/ER"),j=n("jN84"),m=n("tPH9"),O=n("U6JX"),_=Object(O.a)(Object.getPrototypeOf,Object),w=n("WJ6P"),P=Object.getOwnPropertySymbols?function(t){for(var e=[];t;)Object(m.a)(e,Object(j.a)(t)),t=_(t);return e}:w.a,M=n("TFwu"),L=n("25cm"),x=function(t){return Object(L.a)(t,g,P)},k=n("YM6B"),A=Object.prototype.hasOwnProperty,I=n("Ce4a"),C=function(t){var e=new t.constructor(t.byteLength);return new I.a(e).set(new I.a(t)),e},S=/\w*$/,U=n("ylTp"),E=U.a?U.a.prototype:void 0,F=E?E.valueOf:void 0,R=Object.create,z=function(){function t(){}return function(e){if(!Object(p.a)(e))return{};if(R)return R(e);t.prototype=e;var n=new t;return t.prototype=void 0,n}}(),B=n("/1FC"),T=n("WOAq"),W=n("EUcb"),J=n("ovuK"),D=n("xutz"),X=D.a&&D.a.isMap,Y=X?Object(J.a)(X):function(t){return Object(W.a)(t)&&"[object Map]"==Object(k.a)(t)},H=D.a&&D.a.isSet,K=H?Object(J.a)(H):function(t){return Object(W.a)(t)&&"[object Set]"==Object(k.a)(t)},N={};N["[object Arguments]"]=N["[object Array]"]=N["[object ArrayBuffer]"]=N["[object DataView]"]=N["[object Boolean]"]=N["[object Date]"]=N["[object Float32Array]"]=N["[object Float64Array]"]=N["[object Int8Array]"]=N["[object Int16Array]"]=N["[object Int32Array]"]=N["[object Map]"]=N["[object Number]"]=N["[object Object]"]=N["[object RegExp]"]=N["[object Set]"]=N["[object String]"]=N["[object Symbol]"]=N["[object Uint8Array]"]=N["[object Uint8ClampedArray]"]=N["[object Uint16Array]"]=N["[object Uint32Array]"]=!0,N["[object Error]"]=N["[object Function]"]=N["[object WeakMap]"]=!1,e.a=function t(e,n,o,a,i,c){var u,b=1&n,h=2&n,v=4&n;if(o&&(u=i?o(e,a,i,c):o(e)),void 0!==u)return u;if(!Object(p.a)(e))return e;var m=Object(B.a)(e);if(m){if(u=function(t){var e=t.length,n=new t.constructor(e);return e&&"string"==typeof t[0]&&A.call(t,"index")&&(n.index=t.index,n.input=t.input),n}(e),!b)return function(t,e){var n=-1,r=t.length;for(e||(e=Array(r));++n<r;)e[n]=t[n];return e}(e,u)}else{var O=Object(k.a)(e),w="[object Function]"==O||"[object GeneratorFunction]"==O;if(Object(T.a)(e))return Object(y.a)(e,b);if("[object Object]"==O||"[object Arguments]"==O||w&&!i){if(u=h||w?{}:function(t){return"function"!=typeof t.constructor||Object(d.a)(t)?{}:z(_(t))}(e),!b)return h?function(t,e){return l(t,P(t),e)}(e,function(t,e){return t&&l(e,g(e),t)}(u,e)):function(t,e){return l(t,Object(j.a)(t),e)}(e,function(t,e){return t&&l(e,Object(f.a)(e),t)}(u,e))}else{if(!N[O])return i?e:{};u=function(t,e,n){var r,o,a=t.constructor;switch(e){case"[object ArrayBuffer]":return C(t);case"[object Boolean]":case"[object Date]":return new a(+t);case"[object DataView]":return function(t,e){var n=e?C(t.buffer):t.buffer;return new t.constructor(n,t.byteOffset,t.byteLength)}(t,n);case"[object Float32Array]":case"[object Float64Array]":case"[object Int8Array]":case"[object Int16Array]":case"[object Int32Array]":case"[object Uint8Array]":case"[object Uint8ClampedArray]":case"[object Uint16Array]":case"[object Uint32Array]":return function(t,e){var n=e?C(t.buffer):t.buffer;return new t.constructor(n,t.byteOffset,t.length)}(t,n);case"[object Map]":return new a;case"[object Number]":case"[object String]":return new a(t);case"[object RegExp]":return(o=new(r=t).constructor(r.source,S.exec(r))).lastIndex=r.lastIndex,o;case"[object Set]":return new a;case"[object Symbol]":return F?Object(F.call(t)):{}}}(e,O,b)}}c||(c=new r.a);var L=c.get(e);if(L)return L;c.set(e,u),K(e)?e.forEach(function(r){u.add(t(r,n,o,r,e,c))}):Y(e)&&e.forEach(function(r,a){u.set(a,t(r,n,o,a,e,c))});var I=v?h?x:M.a:h?keysIn:f.a,U=m?void 0:I(e);return function(t,e){for(var n=-1,r=null==t?0:t.length;++n<r&&!1!==e(t[n],n););}(U||e,function(r,a){U&&(r=e[a=r]),s(u,a,t(r,n,o,a,e,c))}),u}},DlmY:function(t,e,n){"use strict";var r=n("Y7yP"),o=Object(r.a)(Object,"create"),a=Object.prototype.hasOwnProperty,i=Object.prototype.hasOwnProperty;function c(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}c.prototype.clear=function(){this.__data__=o?o(null):{},this.size=0},c.prototype.delete=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},c.prototype.get=function(t){var e=this.__data__;if(o){var n=e[t];return"__lodash_hash_undefined__"===n?void 0:n}return a.call(e,t)?e[t]:void 0},c.prototype.has=function(t){var e=this.__data__;return o?void 0!==e[t]:i.call(e,t)},c.prototype.set=function(t,e){var n=this.__data__;return this.size+=this.has(t)?0:1,n[t]=o&&void 0===e?"__lodash_hash_undefined__":e,this};var u=c,s=n("nLtN"),l=n("3cmB"),f=function(t,e){var n,r,o=t.__data__;return("string"==(r=typeof(n=e))||"number"==r||"symbol"==r||"boolean"==r?"__proto__"!==n:null===n)?o["string"==typeof e?"string":"hash"]:o.map};function b(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}b.prototype.clear=function(){this.size=0,this.__data__={hash:new u,map:new(l.a||s.a),string:new u}},b.prototype.delete=function(t){var e=f(this,t).delete(t);return this.size-=e?1:0,e},b.prototype.get=function(t){return f(this,t).get(t)},b.prototype.has=function(t){return f(this,t).has(t)},b.prototype.set=function(t,e){var n=f(this,t),r=n.size;return n.set(t,e),this.size+=n.size==r?0:1,this},e.a=b},EUcb:function(t,e,n){"use strict";e.a=function(t){return null!=t&&"object"==typeof t}},Iab2:function(t,e,n){var r,o;void 0===(o="function"==typeof(r=function(){"use strict";function e(t,e,n){var r=new XMLHttpRequest;r.open("GET",t),r.responseType="blob",r.onload=function(){i(r.response,e,n)},r.onerror=function(){console.error("could not download file")},r.send()}function n(t){var e=new XMLHttpRequest;e.open("HEAD",t,!1);try{e.send()}catch(t){}return 200<=e.status&&299>=e.status}function r(t){try{t.dispatchEvent(new MouseEvent("click"))}catch(e){var n=document.createEvent("MouseEvents");n.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),t.dispatchEvent(n)}}var o="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof global&&global.global===global?global:void 0,a=o.navigator&&/Macintosh/.test(navigator.userAgent)&&/AppleWebKit/.test(navigator.userAgent)&&!/Safari/.test(navigator.userAgent),i=o.saveAs||("object"!=typeof window||window!==o?function(){}:"download"in HTMLAnchorElement.prototype&&!a?function(t,a,i){var c=o.URL||o.webkitURL,u=document.createElement("a");u.download=a=a||t.name||"download",u.rel="noopener","string"==typeof t?(u.href=t,u.origin===location.origin?r(u):n(u.href)?e(t,a,i):r(u,u.target="_blank")):(u.href=c.createObjectURL(t),setTimeout(function(){c.revokeObjectURL(u.href)},4e4),setTimeout(function(){r(u)},0))}:"msSaveOrOpenBlob"in navigator?function(t,o,a){if(o=o||t.name||"download","string"!=typeof t)navigator.msSaveOrOpenBlob(function(t,e){return void 0===e?e={autoBom:!1}:"object"!=typeof e&&(console.warn("Deprecated: Expected third argument to be a object"),e={autoBom:!e}),e.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(t.type)?new Blob(["\ufeff",t],{type:t.type}):t}(t,a),o);else if(n(t))e(t,o,a);else{var i=document.createElement("a");i.href=t,i.target="_blank",setTimeout(function(){r(i)})}}:function(t,n,r,i){if((i=i||open("","_blank"))&&(i.document.title=i.document.body.innerText="downloading..."),"string"==typeof t)return e(t,n,r);var c="application/octet-stream"===t.type,u=/constructor/i.test(o.HTMLElement)||o.safari,s=/CriOS\/[\d]+/.test(navigator.userAgent);if((s||c&&u||a)&&"undefined"!=typeof FileReader){var l=new FileReader;l.onloadend=function(){var t=l.result;t=s?t:t.replace(/^data:[^;]*;/,"data:attachment/file;"),i?i.location.href=t:location=t,i=null},l.readAsDataURL(t)}else{var f=o.URL||o.webkitURL,b=f.createObjectURL(t);i?i.location=b:location.href=b,i=null,setTimeout(function(){f.revokeObjectURL(b)},4e4)}});o.saveAs=i.saveAs=i,t.exports=i})?r.apply(e,[]):r)||(t.exports=o)},IzLi:function(t,e,n){"use strict";e.a=function(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}},Js68:function(t,e,n){"use strict";e.a=function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=9007199254740991}},"Ju5/":function(t,e,n){"use strict";var r=n("XqMk"),o="object"==typeof self&&self&&self.Object===Object&&self,a=r.a||o||Function("return this")();e.a=a},L3Qv:function(t,e,n){"use strict";e.a=function(){return!1}},LY9J:function(t,e,n){"use strict";n.d(e,"a",function(){return v});var r,o,i=n("/uUt"),u=n("cxbk"),s=n("fXoL"),l=n("tk/3"),f=n("14na"),b=n("tyNb"),p=n("mrSG"),d=n("Iab2"),h=((o=function(){function t(){a(this,t)}return c(t,[{key:"downloadUnsupportedImageList",value:function(t,e){return Object(p.a)(this,void 0,void 0,regeneratorRuntime.mark(function n(){var r;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return r=e.join("\n"),n.abrupt("return",(this.saveFile({content:r,filename:t+"_unsupported_images.txt",type:"text/plain;charset=utf-8"}),e.length));case 2:case"end":return n.stop()}},n,this)}))}},{key:"saveFile",value:function(t){var e=t.content,n=t.filename,r=t.type,o=new Blob([e],{type:r});d.saveAs(o,n)}}]),t}()).\u0275fac=function(t){return new(t||o)},o.\u0275prov=s.Db({token:o,factory:o.\u0275fac,providedIn:"root"}),o),v=((r=function(){function t(e,n,r,o){var c=this;a(this,t),this.http=e,this.mode=n,this.router=r,this._unsupportedImageService=o,this.hostPort=u.a.baseURL,this.imageLabellingMode=null,this.getProjectList=function(){return c.http.get("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/meta"))},this.createNewProject=function(t,e,n){return c.http.put(c.hostPort+"v2/projects",{project_name:t,annotation_type:"bndbox"===c.imageLabellingMode?"boundingbox":"segmentation",project_path:n,label_file_path:e})},this.importProject=function(){return c.http.put(c.hostPort+"v2/newproject",{})},this.renameProject=function(t,e){return c.http.put("".concat(c.hostPort,"v2/").concat(c.imageLabellingMode,"/projects/").concat(t,"/rename/").concat(e),{})},this.deleteProject=function(t){return c.http.delete("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t))},this.updateProjectLoadStatus=function(t){return c.http.get("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t))},this.checkProjectStatus=function(t){return c.http.get("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t,"/meta"))},this.manualCloseProject=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"closed";return c.http.put("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t),{status:e})},this.checkExistProjectStatus=function(t){return c.http.get("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t,"/loadingstatus"))},this.getThumbnailList=function(t,e){return c.http.get("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t,"/uuid/").concat(e,"/thumbnail"))},this.localUploadStatus=function(t){return c.http.get("".concat(c.hostPort,"v2/").concat(c.imageLabellingMode,"/projects/").concat(t))},this.updateLabelList=function(t,e){return c.http.put("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t,"/newlabels"),{label_list:e})},this.updateProjectStatus=function(t,e,n){return c.http.put("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t,"/").concat("loaded"===n?"status":n),{status:e.toString()})},this.importStatus=function(){return c.http.get("".concat(c.hostPort,"v2/").concat(c.imageLabellingMode,"/projects/importstatus"))},this.mode.imgLabelMode$.pipe(Object(i.a)()).subscribe(function(t){return t?c.imageLabellingMode=t:c.router.navigate(["/"])})}return c(t,[{key:"importLabelFile",value:function(){return this.http.put(this.hostPort+"v2/labelfiles",{})}},{key:"importLabelFileStatus",value:function(){return this.http.get(this.hostPort+"v2/labelfiles")}},{key:"importProjectFolder",value:function(){return this.http.put(this.hostPort+"v2/folders",{})}},{key:"importProjectFolderStatus",value:function(){return this.http.get(this.hostPort+"v2/folders")}},{key:"downloadUnsupportedImageList",value:function(t,e){return this._unsupportedImageService.downloadUnsupportedImageList(t,e)}}]),t}()).\u0275fac=function(t){return new(t||r)(s.Qb(l.b),s.Qb(f.a),s.Qb(b.a),s.Qb(h))},r.\u0275prov=s.Db({token:r,factory:r.\u0275fac,providedIn:"any"}),r)},OObL:function(t,e,n){"use strict";n.d(e,"a",function(){return c});var r=n("fXoL"),o=n("44N4"),i=n("sYmb"),c=function(){var t=function t(){a(this,t),this._modalUnsupportedImage="",this._unsupportedImageList=[]};return t.\u0275fac=function(e){return new(e||t)},t.\u0275cmp=r.Bb({type:t,selectors:[["unsupported-image-modal"]],inputs:{_modalUnsupportedImage:"_modalUnsupportedImage",_unsupportedImageBodyStyle:"_unsupportedImageBodyStyle",_unsupportedImageList:"_unsupportedImageList"},decls:15,vars:19,consts:[[3,"id","modalBodyStyle","modalTitle","scrollable"],[1,"modal-content-container"],[1,"error-msg"],["href","https://github.com/CertifaiAI/CertifAI-Knowledge-Base/wiki/Image-Type-Unsupported-Walkaround","target","_blank","rel","noopener"],["src","../../assets/icons/help.svg","alt","help",1,"help-icon-sm"]],template:function(t,e){1&t&&(r.Mb(0,"modal",0),r.Wb(1,"translate"),r.Mb(2,"div",1),r.Mb(3,"p",2),r.oc(4),r.Wb(5,"translate"),r.Wb(6,"translate"),r.Mb(7,"a",3),r.Ib(8,"img",4),r.Lb(),r.Lb(),r.Mb(9,"p",2),r.oc(10),r.Wb(11,"translate"),r.Ib(12,"br"),r.oc(13),r.Wb(14,"translate"),r.Lb(),r.Lb(),r.Lb()),2&t&&(r.ac("id",e._modalUnsupportedImage)("modalBodyStyle",e._unsupportedImageBodyStyle)("modalTitle",r.Xb(1,9,"unsupportedImage"))("scrollable",!1),r.xb(4),r.sc(" ",r.Xb(5,11,"containsUnsupportedImage1")," ",e._unsupportedImageList.length," ",r.Xb(6,13,"containsUnsupportedImage2")," "),r.xb(6),r.qc(" ",r.Xb(11,15,"unsupportedImageList1"),""),r.xb(3),r.qc("",r.Xb(14,17,"unsupportedImageList2")," "))},directives:[o.a],pipes:[i.c],styles:[".modal-content-container[_ngcontent-%COMP%]{margin-left:1.3vw}.error-msg[_ngcontent-%COMP%]{padding-top:1vh;font-size:2vh}.help-icon-sm[_ngcontent-%COMP%]{height:2vh}"]}),t}()},TFwu:function(t,e,n){"use strict";var r=n("25cm"),o=n("jN84"),a=n("mkut");e.a=function(t){return Object(r.a)(t,a.a,o.a)}},TJKd:function(t,e,n){"use strict";n.d(e,"a",function(){return u});var r=n("fXoL"),o=n("ofXK");function i(t,e){1&t&&(r.Kb(0),r.Mb(1,"div",1),r.Mb(2,"div",2),r.Mb(3,"div",3),r.Ib(4,"div",4),r.Ib(5,"div",4),r.Lb(),r.Mb(6,"div",5),r.Ib(7,"div",4),r.Ib(8,"div",4),r.Lb(),r.Lb(),r.Lb(),r.Jb())}var u=function(){var t=function(){function t(){a(this,t),this._loading=!0}return c(t,[{key:"ngOnInit",value:function(){}},{key:"ngOnChanges",value:function(t){}}]),t}();return t.\u0275fac=function(e){return new(e||t)},t.\u0275cmp=r.Bb({type:t,selectors:[["spinner"]],inputs:{_loading:"_loading"},features:[r.vb],decls:1,vars:1,consts:[[4,"ngIf"],[1,"mesh-loader-container"],[1,"mesh-loader"],[1,"set-one"],[1,"circle"],[1,"set-two"]],template:function(t,e){1&t&&r.mc(0,i,9,0,"ng-container",0),2&t&&r.ac("ngIf",e._loading)},directives:[o.k],styles:[".mesh-loader-container[_ngcontent-%COMP%]{overflow:hidden;position:fixed;top:0;right:0;bottom:0;left:0;opacity:.85;z-index:10000;cursor:progress}.mesh-loader[_ngcontent-%COMP%]{overflow:hidden;height:100%;width:100%}.mesh-loader[_ngcontent-%COMP%]   .circle[_ngcontent-%COMP%]{width:1.6276041667vw;height:3.3156498674vh;position:absolute;background:#2d8ceb;border-radius:50%;margin:-.8138020833vw;-webkit-animation:mesh 3s ease-in-out infinite;animation:mesh 3s ease-in-out -1.5s infinite}.mesh-loader[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]   .circle[_ngcontent-%COMP%]:last-child{-webkit-animation-delay:0s;animation-delay:0s}.mesh-loader[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]{position:absolute;top:50%;left:50%}.mesh-loader[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]:last-child{transform:rotate(90deg)}@-webkit-keyframes mesh{0%{transform-origin:50% -100%;transform:rotate(0)}50%{transform-origin:50% -100%;transform:rotate(1turn)}50.00001%{transform-origin:50% 200%;transform:rotate(0deg)}to{transform-origin:50% 200%;transform:rotate(1turn)}}@keyframes mesh{0%{transform-origin:50% -100%;transform:rotate(0)}50%{transform-origin:50% -100%;transform:rotate(1turn)}50.00001%{transform-origin:50% 200%;transform:rotate(0deg)}to{transform-origin:50% 200%;transform:rotate(1turn)}}"]}),t}()},U6JX:function(t,e,n){"use strict";e.a=function(t,e){return function(n){return t(e(n))}}},WJ6P:function(t,e,n){"use strict";e.a=function(){return[]}},WOAq:function(t,e,n){"use strict";(function(t){var r=n("Ju5/"),o=n("L3Qv"),a="object"==typeof exports&&exports&&!exports.nodeType&&exports,i=a&&"object"==typeof t&&t&&!t.nodeType&&t,c=i&&i.exports===a?r.a.Buffer:void 0;e.a=(c?c.isBuffer:void 0)||o.a}).call(this,n("3UD+")(t))},XIp8:function(t,e,n){"use strict";var r=n("CfRg");e.a=function(t){return Object(r.a)(t,5)}},XqMk:function(t,e,n){"use strict";var r="object"==typeof global&&global&&global.Object===Object&&global;e.a=r},Y7yP:function(t,e,n){"use strict";var r,o=n("vJtL"),a=n("Ju5/").a["__core-js_shared__"],i=(r=/[^.]+$/.exec(a&&a.keys&&a.keys.IE_PROTO||""))?"Symbol(src)_1."+r:"",c=n("IzLi"),u=n("dLWn"),s=/^\[object .+?Constructor\]$/,l=RegExp("^"+Function.prototype.toString.call(Object.prototype.hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");e.a=function(t,e){var n=function(t,e){return null==t?void 0:t[e]}(t,e);return function(t){return!(!Object(c.a)(t)||(e=t,i&&i in e))&&(Object(o.a)(t)?l:s).test(Object(u.a)(t));var e}(n)?n:void 0}},YHEm:function(t,e,n){"use strict";e.a=function(t,e){return t===e||t!=t&&e!=e}},YM6B:function(t,e,n){"use strict";var r=n("Y7yP"),o=n("Ju5/"),a=Object(r.a)(o.a,"DataView"),i=n("3cmB"),c=Object(r.a)(o.a,"Promise"),u=Object(r.a)(o.a,"Set"),s=Object(r.a)(o.a,"WeakMap"),l=n("8M4i"),f=n("dLWn"),b=Object(f.a)(a),p=Object(f.a)(i.a),d=Object(f.a)(c),h=Object(f.a)(u),v=Object(f.a)(s),g=l.a;(a&&"[object DataView]"!=g(new a(new ArrayBuffer(1)))||i.a&&"[object Map]"!=g(new i.a)||c&&"[object Promise]"!=g(c.resolve())||u&&"[object Set]"!=g(new u)||s&&"[object WeakMap]"!=g(new s))&&(g=function(t){var e=Object(l.a)(t),n="[object Object]"==e?t.constructor:void 0,r=n?Object(f.a)(n):"";if(r)switch(r){case b:return"[object DataView]";case p:return"[object Map]";case d:return"[object Promise]";case h:return"[object Set]";case v:return"[object WeakMap]"}return e}),e.a=g},cxbk:function(t,e,n){"use strict";n.d(e,"a",function(){return r});var r={production:!0,baseURL:"http://localhost:9999/"}},dLWn:function(t,e,n){"use strict";var r=Function.prototype.toString;e.a=function(t){if(null!=t){try{return r.call(t)}catch(e){}try{return t+""}catch(e){}}return""}},jN84:function(t,e,n){"use strict";var r=n("WJ6P"),o=Object.prototype.propertyIsEnumerable,a=Object.getOwnPropertySymbols;e.a=a?function(t){return null==t?[]:(t=Object(t),function(e,n){for(var r=-1,a=null==e?0:e.length,i=0,c=[];++r<a;){var u=e[r];o.call(t,u)&&(c[i++]=u)}return c}(a(t)))}:r.a},l5mm:function(t,e,n){"use strict";n.d(e,"a",function(){return c});var r=n("HDdC"),o=n("3N8a"),a=new(n("IjjT").a)(o.a),i=n("DH7j");function c(){var t,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:a;return t=e,(Object(i.a)(t)||!(t-parseFloat(t)+1>=0)||e<0)&&(e=0),n&&"function"==typeof n.schedule||(n=a),new r.a(function(t){return t.add(n.schedule(u,e,{subscriber:t,counter:0,period:e})),t})}function u(t){var e=t.subscriber,n=t.counter,r=t.period;e.next(n),this.schedule({subscriber:e,counter:n+1,period:r},r)}},mkut:function(t,e,n){"use strict";var r=n("7gMY"),o=n("pyRK"),a=n("U6JX"),i=Object(a.a)(Object.keys,Object),c=Object.prototype.hasOwnProperty,u=n("5WsY");e.a=function(t){return Object(u.a)(t)?Object(r.a)(t):function(t){if(!Object(o.a)(t))return i(t);var e=[];for(var n in Object(t))c.call(t,n)&&"constructor"!=n&&e.push(n);return e}(t)}},mrSG:function(t,e,n){"use strict";function r(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(t);o<r.length;o++)e.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(t,r[o])&&(n[r[o]]=t[r[o]])}return n}function o(t,e,n,r){return new(n||(n=Promise))(function(o,a){function i(t){try{u(r.next(t))}catch(e){a(e)}}function c(t){try{u(r.throw(t))}catch(e){a(e)}}function u(t){var e;t.done?o(t.value):(e=t.value,e instanceof n?e:new n(function(t){t(e)})).then(i,c)}u((r=r.apply(t,e||[])).next())})}n.d(e,"b",function(){return r}),n.d(e,"a",function(){return o})},nLtN:function(t,e,n){"use strict";var r=n("YHEm"),o=function(t,e){for(var n=t.length;n--;)if(Object(r.a)(t[n][0],e))return n;return-1},a=Array.prototype.splice;function i(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}i.prototype.clear=function(){this.__data__=[],this.size=0},i.prototype.delete=function(t){var e=this.__data__,n=o(e,t);return!(n<0||(n==e.length-1?e.pop():a.call(e,n,1),--this.size,0))},i.prototype.get=function(t){var e=this.__data__,n=o(e,t);return n<0?void 0:e[n][1]},i.prototype.has=function(t){return o(this.__data__,t)>-1},i.prototype.set=function(t,e){var n=this.__data__,r=o(n,t);return r<0?(++this.size,n.push([t,e])):n[r][1]=e,this},e.a=i},oSzE:function(t,e,n){"use strict";var r=n("nLtN"),o=n("3cmB"),a=n("DlmY");function i(t){var e=this.__data__=new r.a(t);this.size=e.size}i.prototype.clear=function(){this.__data__=new r.a,this.size=0},i.prototype.delete=function(t){var e=this.__data__,n=e.delete(t);return this.size=e.size,n},i.prototype.get=function(t){return this.__data__.get(t)},i.prototype.has=function(t){return this.__data__.has(t)},i.prototype.set=function(t,e){var n=this.__data__;if(n instanceof r.a){var i=n.__data__;if(!o.a||i.length<199)return i.push([t,e]),this.size=++n.size,this;n=this.__data__=new a.a(i)}return n.set(t,e),this.size=n.size,this},e.a=i},oYcn:function(t,e,n){"use strict";var r=n("8M4i"),o=n("Js68"),a=n("EUcb"),i={};i["[object Float32Array]"]=i["[object Float64Array]"]=i["[object Int8Array]"]=i["[object Int16Array]"]=i["[object Int32Array]"]=i["[object Uint8Array]"]=i["[object Uint8ClampedArray]"]=i["[object Uint16Array]"]=i["[object Uint32Array]"]=!0,i["[object Arguments]"]=i["[object Array]"]=i["[object ArrayBuffer]"]=i["[object Boolean]"]=i["[object DataView]"]=i["[object Date]"]=i["[object Error]"]=i["[object Function]"]=i["[object Map]"]=i["[object Number]"]=i["[object Object]"]=i["[object RegExp]"]=i["[object Set]"]=i["[object String]"]=i["[object WeakMap]"]=!1;var c=n("ovuK"),u=n("xutz"),s=u.a&&u.a.isTypedArray,l=s?Object(c.a)(s):function(t){return Object(a.a)(t)&&Object(o.a)(t.length)&&!!i[Object(r.a)(t)]};e.a=l},ovuK:function(t,e,n){"use strict";e.a=function(t){return function(e){return t(e)}}},pyRK:function(t,e,n){"use strict";var r=Object.prototype;e.a=function(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||r)}},tPH9:function(t,e,n){"use strict";e.a=function(t,e){for(var n=-1,r=e.length,o=t.length;++n<r;)t[o+n]=e[n];return t}},vJtL:function(t,e,n){"use strict";var r=n("8M4i"),o=n("IzLi");e.a=function(t){if(!Object(o.a)(t))return!1;var e=Object(r.a)(t);return"[object Function]"==e||"[object GeneratorFunction]"==e||"[object AsyncFunction]"==e||"[object Proxy]"==e}},x2Se:function(t,e,n){"use strict";n.d(e,"a",function(){return h});var r=n("fXoL"),o=n("tyNb"),i=n("ofXK"),u=n("sYmb"),s=function(t){return{"last-btn-container":t}},l=function(){return{exact:!0}};function f(t,e){if(1&t&&(r.Mb(0,"div"),r.Mb(1,"a",7),r.Mb(2,"div",8),r.Mb(3,"label",9),r.oc(4),r.Wb(5,"translate"),r.Lb(),r.Lb(),r.Lb(),r.Lb()),2&t){var n=r.Vb(),o=n.$implicit,a=n.last;r.xb(1),r.ac("routerLink",o.url),r.xb(1),r.ac("ngClass",r.dc(6,s,a))("routerLinkActiveOptions",r.cc(8,l)),r.xb(2),r.pc(r.Xb(5,4,o.name))}}function b(t,e){if(1&t&&(r.Mb(0,"div"),r.Mb(1,"a",10),r.Mb(2,"div",11),r.Mb(3,"label",12),r.oc(4),r.Wb(5,"translate"),r.Lb(),r.Lb(),r.Lb(),r.Lb()),2&t){var n=r.Vb(),o=n.last,a=n.$implicit;r.xb(2),r.ac("ngClass",r.dc(5,s,o))("routerLinkActiveOptions",r.cc(7,l)),r.xb(2),r.pc(r.Xb(5,3,a.name))}}function p(t,e){if(1&t&&(r.Kb(0),r.mc(1,f,6,9,"div",6),r.mc(2,b,6,8,"div",6),r.Jb()),2&t){var n=e.$implicit;r.xb(1),r.ac("ngIf",!n.disable),r.xb(1),r.ac("ngIf",n.disable)}}function d(t,e){if(1&t&&(r.Kb(0),r.Mb(1,"div",13),r.Ib(2,"img",14),r.Wb(3,"translate"),r.Lb(),r.Jb()),2&t){var n=e.$implicit,o=e.index;r.xb(2),r.ac("src",n.imgPath,r.jc)("alt",n.alt)("title",r.Xb(3,4,n.hoverLabel)),r.yb("data-index",o)}}var h=function(){var t=function(){function t(e){var n=this;a(this,t),this._router=e,this.logoSrc="../../../assets/icons/classifai_logo_white.svg",this.headerLabels=[{name:"pageHeader.home",url:"/",disable:!1}],this.bindImagePath=function(t){n.jsonSchema={logos:"/imglabel"===t?[{imgPath:"../../../assets/icons/add_user.svg",hoverLabel:"Add user to project",alt:"pageHeader.addUser",onClick:function(){return null}}]:[{imgPath:"../../../assets/icons/profile.svg",hoverLabel:"pageHeader.profile",alt:"Profile",onClick:function(){return null}}]}};var r=e.url;this.bindImagePath(r)}return c(t,[{key:"ngOnInit",value:function(){}}]),t}();return t.\u0275fac=function(e){return new(e||t)(r.Hb(o.a))},t.\u0275cmp=r.Bb({type:t,selectors:[["page-header"]],inputs:{_onChange:"_onChange"},decls:7,vars:3,consts:[[1,"header-container"],[1,"container-flex-start"],[1,"logo-container"],["alt","logo","title","Classifai",1,"logo","position-absolute",3,"src"],[4,"ngFor","ngForOf"],[1,"container-flex-end"],[4,"ngIf"],[1,"link",3,"routerLink"],["routerLinkActive","active-link",1,"btn-container",3,"ngClass","routerLinkActiveOptions"],[1,"label"],[1,"link"],["routerLinkActive","active-link",1,"btn-container",2,"cursor","not-allowed",3,"ngClass","routerLinkActiveOptions"],[1,"label",2,"cursor","not-allowed"],[1,"utility-icon-container"],[1,"img","utility-icon-light",3,"src","alt","title"]],template:function(t,e){1&t&&(r.Mb(0,"div",0),r.Mb(1,"div",1),r.Mb(2,"div",2),r.Ib(3,"img",3),r.Lb(),r.mc(4,p,3,2,"ng-container",4),r.Lb(),r.Mb(5,"div",5),r.mc(6,d,4,6,"ng-container",4),r.Lb(),r.Lb()),2&t&&(r.xb(3),r.ac("src",e.logoSrc,r.jc),r.xb(1),r.ac("ngForOf",e.headerLabels),r.xb(2),r.ac("ngForOf",e.jsonSchema.logos))},directives:[i.j,i.k,o.c,o.b,i.i],pipes:[u.c],styles:[".header-container[_ngcontent-%COMP%]{min-width:100vw;max-width:100vw;min-height:4.3vh;max-height:4.3vh;background:#525353;border:.0625vw solid hsla(0,0%,100%,.25);display:flex;justify-content:space-between;z-index:1000;position:relative}.container-flex-start[_ngcontent-%COMP%]{display:flex}.container-flex-end[_ngcontent-%COMP%]{display:flex;min-width:6.5vw;max-width:6.5vw}.logo-container[_ngcontent-%COMP%]{min-width:2.15vw;max-width:2.15vw}.logo[_ngcontent-%COMP%], .utility-icon-dark[_ngcontent-%COMP%], .utility-icon-light[_ngcontent-%COMP%]{min-width:1.6vw;max-width:1.6vw;min-height:inherit;max-height:inherit;padding:.32vw}.utility-icon-dark[_ngcontent-%COMP%], .utility-icon-light[_ngcontent-%COMP%]{cursor:pointer}.utility-icon-light[_ngcontent-%COMP%]:active{background:#696969}.utility-icon-dark[_ngcontent-%COMP%]:active{background:#a9a9a9}.img[_ngcontent-%COMP%]{margin-left:4.2vw}.position-absolute[_ngcontent-%COMP%]{position:absolute}.utility-icon-container[_ngcontent-%COMP%]{display:flex;min-height:3.4vh;max-height:3.4vh}.img-container[_ngcontent-%COMP%]:hover   .img-description[_ngcontent-%COMP%]{visibility:visible;opacity:1}.btn-container[_ngcontent-%COMP%]{min-height:4.36vh;max-height:4.36vh;font-size:2vh;background:#525353;border-left:.0625vw solid hsla(0,0%,100%,.25);cursor:pointer;align-items:center;justify-content:center;display:flex;padding:0 1.5vw}.btn-container[_ngcontent-%COMP%]:hover{background:#383535}.last-btn-container[_ngcontent-%COMP%]{border-right:.0625vw solid hsla(0,0%,100%,.25)}.link[_ngcontent-%COMP%]{text-decoration:none;color:#fff}.label[_ngcontent-%COMP%]{white-space:nowrap;border:none;color:#fff;cursor:pointer}.active-link[_ngcontent-%COMP%]{background:#383535}"],changeDetection:0}),t}()},xutz:function(t,e,n){"use strict";(function(t){var r=n("XqMk"),o="object"==typeof exports&&exports&&!exports.nodeType&&exports,a=o&&"object"==typeof t&&t&&!t.nodeType&&t,i=a&&a.exports===o&&r.a.process,c=function(){try{return a&&a.require&&a.require("util").types||i&&i.binding&&i.binding("util")}catch(t){}}();e.a=c}).call(this,n("3UD+")(t))},ylTp:function(t,e,n){"use strict";var r=n("Ju5/");e.a=r.a.Symbol}}])}();