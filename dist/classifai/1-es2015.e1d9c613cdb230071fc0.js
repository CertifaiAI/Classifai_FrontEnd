(window.webpackJsonp=window.webpackJsonp||[]).push([[1],{"/1FC":function(t,e,n){"use strict";e.a=Array.isArray},"/uUt":function(t,e,n){"use strict";n.d(e,"a",function(){return o});var r=n("7o/Q");function o(t,e){return n=>n.lift(new i(t,e))}class i{constructor(t,e){this.compare=t,this.keySelector=e}call(t,e){return e.subscribe(new a(t,this.compare,this.keySelector))}}class a extends r.a{constructor(t,e,n){super(t),this.keySelector=n,this.hasKey=!1,"function"==typeof e&&(this.compare=e)}compare(t,e){return t===e}_next(t){let e;try{const{keySelector:n}=this;e=n?n(t):t}catch(r){return this.destination.error(r)}let n=!1;if(this.hasKey)try{const{compare:t}=this;n=t(this.key,e)}catch(r){return this.destination.error(r)}else this.hasKey=!0;n||(this.key=e,this.destination.next(t))}}},"1G5W":function(t,e,n){"use strict";n.d(e,"a",function(){return o});var r=n("zx2A");function o(t){return e=>e.lift(new i(t))}class i{constructor(t){this.notifier=t}call(t,e){const n=new a(t),o=Object(r.c)(this.notifier,new r.a(n));return o&&!n.seenValue?(n.add(o),e.subscribe(n)):n}}class a extends r.b{constructor(t){super(t),this.seenValue=!1}notifyNext(){this.seenValue=!0,this.complete()}notifyComplete(){}}},"25cm":function(t,e,n){"use strict";var r=n("tPH9"),o=n("/1FC");e.a=function(t,e,n){var i=e(t);return Object(o.a)(t)?i:Object(r.a)(i,n(t))}},"3/ER":function(t,e,n){"use strict";(function(t){var r=n("Ju5/"),o="object"==typeof exports&&exports&&!exports.nodeType&&exports,i=o&&"object"==typeof t&&t&&!t.nodeType&&t,a=i&&i.exports===o?r.a.Buffer:void 0,c=a?a.allocUnsafe:void 0;e.a=function(t,e){if(e)return t.slice();var n=t.length,r=c?c(n):new t.constructor(n);return t.copy(r),r}}).call(this,n("3UD+")(t))},"3UD+":function(t,e){t.exports=function(t){if(!t.webpackPolyfill){var e=Object.create(t);e.children||(e.children=[]),Object.defineProperty(e,"loaded",{enumerable:!0,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,get:function(){return e.i}}),Object.defineProperty(e,"exports",{enumerable:!0}),e.webpackPolyfill=1}return e}},"3cmB":function(t,e,n){"use strict";var r=n("Y7yP"),o=n("Ju5/"),i=Object(r.a)(o.a,"Map");e.a=i},"5WsY":function(t,e,n){"use strict";var r=n("vJtL"),o=n("Js68");e.a=function(t){return null!=t&&Object(o.a)(t.length)&&!Object(r.a)(t)}},"7gMY":function(t,e,n){"use strict";var r=n("8M4i"),o=n("EUcb"),i=function(t){return Object(o.a)(t)&&"[object Arguments]"==Object(r.a)(t)},a=Object.prototype,c=a.hasOwnProperty,s=a.propertyIsEnumerable,u=i(function(){return arguments}())?i:function(t){return Object(o.a)(t)&&c.call(t,"callee")&&!s.call(t,"callee")},l=n("/1FC"),b=n("WOAq"),h=/^(?:0|[1-9]\d*)$/,f=function(t,e){var n=typeof t;return!!(e=null==e?9007199254740991:e)&&("number"==n||"symbol"!=n&&h.test(t))&&t>-1&&t%1==0&&t<e},p=n("oYcn"),d=Object.prototype.hasOwnProperty;e.a=function(t,e){var n=Object(l.a)(t),r=!n&&u(t),o=!n&&!r&&Object(b.a)(t),i=!n&&!r&&!o&&Object(p.a)(t),a=n||r||o||i,c=a?function(t,e){for(var n=-1,r=Array(t);++n<t;)r[n]=e(n);return r}(t.length,String):[],s=c.length;for(var h in t)!e&&!d.call(t,h)||a&&("length"==h||o&&("offset"==h||"parent"==h)||i&&("buffer"==h||"byteLength"==h||"byteOffset"==h)||f(h,s))||c.push(h);return c}},"8M4i":function(t,e,n){"use strict";var r=n("ylTp"),o=Object.prototype,i=o.hasOwnProperty,a=o.toString,c=r.a?r.a.toStringTag:void 0,s=Object.prototype.toString,u=r.a?r.a.toStringTag:void 0;e.a=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":u&&u in Object(t)?function(t){var e=i.call(t,c),n=t[c];try{t[c]=void 0;var r=!0}catch(s){}var o=a.call(t);return r&&(e?t[c]=n:delete t[c]),o}(t):function(t){return s.call(t)}(t)}},Ce4a:function(t,e,n){"use strict";var r=n("Ju5/");e.a=r.a.Uint8Array},CfRg:function(t,e,n){"use strict";var r=n("oSzE"),o=n("Y7yP"),i=function(){try{var t=Object(o.a)(Object,"defineProperty");return t({},"",{}),t}catch(e){}}(),a=function(t,e,n){"__proto__"==e&&i?i(t,e,{configurable:!0,enumerable:!0,value:n,writable:!0}):t[e]=n},c=n("YHEm"),s=Object.prototype.hasOwnProperty,u=function(t,e,n){var r=t[e];s.call(t,e)&&Object(c.a)(r,n)&&(void 0!==n||e in t)||a(t,e,n)},l=function(t,e,n,r){var o=!n;n||(n={});for(var i=-1,c=e.length;++i<c;){var s=e[i],l=r?r(n[s],t[s],s,n,t):void 0;void 0===l&&(l=t[s]),o?a(n,s,l):u(n,s,l)}return n},b=n("mkut"),h=n("7gMY"),f=n("IzLi"),p=n("pyRK"),d=Object.prototype.hasOwnProperty,j=n("5WsY"),g=function(t){return Object(j.a)(t)?Object(h.a)(t,!0):function(t){if(!Object(f.a)(t))return function(t){var e=[];if(null!=t)for(var n in Object(t))e.push(n);return e}(t);var e=Object(p.a)(t),n=[];for(var r in t)("constructor"!=r||!e&&d.call(t,r))&&n.push(r);return n}(t)},v=n("3/ER"),y=n("jN84"),m=n("tPH9"),O=n("U6JX"),_=Object(O.a)(Object.getPrototypeOf,Object),w=n("WJ6P"),P=Object.getOwnPropertySymbols?function(t){for(var e=[];t;)Object(m.a)(e,Object(y.a)(t)),t=_(t);return e}:w.a,M=n("TFwu"),x=n("25cm"),L=function(t){return Object(x.a)(t,g,P)},k=n("YM6B"),C=Object.prototype.hasOwnProperty,A=n("Ce4a"),$=function(t){var e=new t.constructor(t.byteLength);return new A.a(e).set(new A.a(t)),e},S=/\w*$/,z=n("ylTp"),I=z.a?z.a.prototype:void 0,U=I?I.valueOf:void 0,F=Object.create,J=function(){function t(){}return function(e){if(!Object(f.a)(e))return{};if(F)return F(e);t.prototype=e;var n=new t;return t.prototype=void 0,n}}(),E=n("/1FC"),Y=n("WOAq"),W=n("EUcb"),D=n("ovuK"),B=n("xutz"),T=B.a&&B.a.isMap,K=T?Object(D.a)(T):function(t){return Object(W.a)(t)&&"[object Map]"==Object(k.a)(t)},N=B.a&&B.a.isSet,H=N?Object(D.a)(N):function(t){return Object(W.a)(t)&&"[object Set]"==Object(k.a)(t)},R={};R["[object Arguments]"]=R["[object Array]"]=R["[object ArrayBuffer]"]=R["[object DataView]"]=R["[object Boolean]"]=R["[object Date]"]=R["[object Float32Array]"]=R["[object Float64Array]"]=R["[object Int8Array]"]=R["[object Int16Array]"]=R["[object Int32Array]"]=R["[object Map]"]=R["[object Number]"]=R["[object Object]"]=R["[object RegExp]"]=R["[object Set]"]=R["[object String]"]=R["[object Symbol]"]=R["[object Uint8Array]"]=R["[object Uint8ClampedArray]"]=R["[object Uint16Array]"]=R["[object Uint32Array]"]=!0,R["[object Error]"]=R["[object Function]"]=R["[object WeakMap]"]=!1,e.a=function t(e,n,o,i,a,c){var s,h=1&n,d=2&n,j=4&n;if(o&&(s=a?o(e,i,a,c):o(e)),void 0!==s)return s;if(!Object(f.a)(e))return e;var m=Object(E.a)(e);if(m){if(s=function(t){var e=t.length,n=new t.constructor(e);return e&&"string"==typeof t[0]&&C.call(t,"index")&&(n.index=t.index,n.input=t.input),n}(e),!h)return function(t,e){var n=-1,r=t.length;for(e||(e=Array(r));++n<r;)e[n]=t[n];return e}(e,s)}else{var O=Object(k.a)(e),w="[object Function]"==O||"[object GeneratorFunction]"==O;if(Object(Y.a)(e))return Object(v.a)(e,h);if("[object Object]"==O||"[object Arguments]"==O||w&&!a){if(s=d||w?{}:function(t){return"function"!=typeof t.constructor||Object(p.a)(t)?{}:J(_(t))}(e),!h)return d?function(t,e){return l(t,P(t),e)}(e,function(t,e){return t&&l(e,g(e),t)}(s,e)):function(t,e){return l(t,Object(y.a)(t),e)}(e,function(t,e){return t&&l(e,Object(b.a)(e),t)}(s,e))}else{if(!R[O])return a?e:{};s=function(t,e,n){var r,o,i=t.constructor;switch(e){case"[object ArrayBuffer]":return $(t);case"[object Boolean]":case"[object Date]":return new i(+t);case"[object DataView]":return function(t,e){var n=e?$(t.buffer):t.buffer;return new t.constructor(n,t.byteOffset,t.byteLength)}(t,n);case"[object Float32Array]":case"[object Float64Array]":case"[object Int8Array]":case"[object Int16Array]":case"[object Int32Array]":case"[object Uint8Array]":case"[object Uint8ClampedArray]":case"[object Uint16Array]":case"[object Uint32Array]":return function(t,e){var n=e?$(t.buffer):t.buffer;return new t.constructor(n,t.byteOffset,t.length)}(t,n);case"[object Map]":return new i;case"[object Number]":case"[object String]":return new i(t);case"[object RegExp]":return(o=new(r=t).constructor(r.source,S.exec(r))).lastIndex=r.lastIndex,o;case"[object Set]":return new i;case"[object Symbol]":return U?Object(U.call(t)):{}}}(e,O,h)}}c||(c=new r.a);var x=c.get(e);if(x)return x;c.set(e,s),H(e)?e.forEach(function(r){s.add(t(r,n,o,r,e,c))}):K(e)&&e.forEach(function(r,i){s.set(i,t(r,n,o,i,e,c))});var A=m?void 0:(j?d?L:M.a:d?g:b.a)(e);return function(t,e){for(var n=-1,r=null==t?0:t.length;++n<r&&!1!==e(t[n],n););}(A||e,function(r,i){A&&(r=e[i=r]),u(s,i,t(r,n,o,i,e,c))}),s}},DlmY:function(t,e,n){"use strict";var r=n("Y7yP"),o=Object(r.a)(Object,"create"),i=Object.prototype.hasOwnProperty,a=Object.prototype.hasOwnProperty;function c(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}c.prototype.clear=function(){this.__data__=o?o(null):{},this.size=0},c.prototype.delete=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},c.prototype.get=function(t){var e=this.__data__;if(o){var n=e[t];return"__lodash_hash_undefined__"===n?void 0:n}return i.call(e,t)?e[t]:void 0},c.prototype.has=function(t){var e=this.__data__;return o?void 0!==e[t]:a.call(e,t)},c.prototype.set=function(t,e){var n=this.__data__;return this.size+=this.has(t)?0:1,n[t]=o&&void 0===e?"__lodash_hash_undefined__":e,this};var s=c,u=n("nLtN"),l=n("3cmB"),b=function(t,e){var n,r,o=t.__data__;return("string"==(r=typeof(n=e))||"number"==r||"symbol"==r||"boolean"==r?"__proto__"!==n:null===n)?o["string"==typeof e?"string":"hash"]:o.map};function h(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}h.prototype.clear=function(){this.size=0,this.__data__={hash:new s,map:new(l.a||u.a),string:new s}},h.prototype.delete=function(t){var e=b(this,t).delete(t);return this.size-=e?1:0,e},h.prototype.get=function(t){return b(this,t).get(t)},h.prototype.has=function(t){return b(this,t).has(t)},h.prototype.set=function(t,e){var n=b(this,t),r=n.size;return n.set(t,e),this.size+=n.size==r?0:1,this},e.a=h},EUcb:function(t,e,n){"use strict";e.a=function(t){return null!=t&&"object"==typeof t}},IzLi:function(t,e,n){"use strict";e.a=function(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}},Js68:function(t,e,n){"use strict";e.a=function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=9007199254740991}},"Ju5/":function(t,e,n){"use strict";var r=n("XqMk"),o="object"==typeof self&&self&&self.Object===Object&&self,i=r.a||o||Function("return this")();e.a=i},L3Qv:function(t,e,n){"use strict";e.a=function(){return!1}},LY9J:function(t,e,n){"use strict";n.d(e,"a",function(){return u});var r=n("/uUt"),o=n("cxbk"),i=n("fXoL"),a=n("tk/3"),c=n("14na"),s=n("tyNb");let u=(()=>{class t{constructor(t,e,n){this.http=t,this.mode=e,this.router=n,this.hostPort=o.a.baseURL,this.imageLabellingMode=null,this.getProjectList=()=>this.http.get(`${this.hostPort}${this.imageLabellingMode}/projects/meta`),this.createNewProject=(t,e,n)=>this.http.put(this.hostPort+"v2/projects",{project_name:t,annotation_type:"bndbox"===this.imageLabellingMode?"boundingbox":"segmentation",project_path:n,label_file_path:e}),this.importProject=()=>this.http.put(this.hostPort+"v2/newproject",{}),this.renameProject=(t,e)=>this.http.put(`${this.hostPort}v2/${this.imageLabellingMode}/projects/${t}/rename/${e}`,{}),this.deleteProject=t=>this.http.delete(`${this.hostPort}${this.imageLabellingMode}/projects/${t}`),this.updateProjectLoadStatus=t=>this.http.get(`${this.hostPort}${this.imageLabellingMode}/projects/${t}`),this.checkProjectStatus=t=>this.http.get(`${this.hostPort}${this.imageLabellingMode}/projects/${t}/meta`),this.manualCloseProject=(t,e="closed")=>this.http.put(`${this.hostPort}${this.imageLabellingMode}/projects/${t}`,{status:e}),this.checkExistProjectStatus=t=>this.http.get(`${this.hostPort}${this.imageLabellingMode}/projects/${t}/loadingstatus`),this.getThumbnailList=(t,e)=>this.http.get(`${this.hostPort}${this.imageLabellingMode}/projects/${t}/uuid/${e}/thumbnail`),this.localUploadStatus=t=>this.http.get(`${this.hostPort}v2/${this.imageLabellingMode}/projects/${t}`),this.updateLabelList=(t,e)=>this.http.put(`${this.hostPort}${this.imageLabellingMode}/projects/${t}/newlabels`,{label_list:e}),this.updateProjectStatus=(t,e,n)=>this.http.put(`${this.hostPort}${this.imageLabellingMode}/projects/${t}/${"loaded"===n?"status":n}`,{status:e.toString()}),this.importStatus=()=>this.http.get(`${this.hostPort}v2/${this.imageLabellingMode}/projects/importstatus`),this.mode.imgLabelMode$.pipe(Object(r.a)()).subscribe(t=>t?this.imageLabellingMode=t:this.router.navigate(["/"]))}importLabelFile(){return this.http.put(this.hostPort+"v2/labelfiles",{})}importLabelFileStatus(){return this.http.get(this.hostPort+"v2/labelfiles")}importProjectFolder(){return this.http.put(this.hostPort+"v2/folders",{})}importProjectFolderStatus(){return this.http.get(this.hostPort+"v2/folders")}}return t.\u0275fac=function(e){return new(e||t)(i.Qb(a.b),i.Qb(c.a),i.Qb(s.a))},t.\u0275prov=i.Db({token:t,factory:t.\u0275fac,providedIn:"any"}),t})()},TFwu:function(t,e,n){"use strict";var r=n("25cm"),o=n("jN84"),i=n("mkut");e.a=function(t){return Object(r.a)(t,i.a,o.a)}},TJKd:function(t,e,n){"use strict";n.d(e,"a",function(){return a});var r=n("fXoL"),o=n("ofXK");function i(t,e){1&t&&(r.Kb(0),r.Mb(1,"div",1),r.Mb(2,"div",2),r.Mb(3,"div",3),r.Ib(4,"div",4),r.Ib(5,"div",4),r.Lb(),r.Mb(6,"div",5),r.Ib(7,"div",4),r.Ib(8,"div",4),r.Lb(),r.Lb(),r.Lb(),r.Jb())}let a=(()=>{class t{constructor(){this._loading=!0}ngOnInit(){}ngOnChanges(t){}}return t.\u0275fac=function(e){return new(e||t)},t.\u0275cmp=r.Bb({type:t,selectors:[["spinner"]],inputs:{_loading:"_loading"},features:[r.vb],decls:1,vars:1,consts:[[4,"ngIf"],[1,"mesh-loader-container"],[1,"mesh-loader"],[1,"set-one"],[1,"circle"],[1,"set-two"]],template:function(t,e){1&t&&r.mc(0,i,9,0,"ng-container",0),2&t&&r.ac("ngIf",e._loading)},directives:[o.k],styles:[".mesh-loader-container[_ngcontent-%COMP%]{overflow:hidden;position:fixed;top:0;right:0;bottom:0;left:0;opacity:.85;z-index:10000;cursor:progress}.mesh-loader[_ngcontent-%COMP%]{overflow:hidden;height:100%;width:100%}.mesh-loader[_ngcontent-%COMP%]   .circle[_ngcontent-%COMP%]{width:1.6276041667vw;height:3.3156498674vh;position:absolute;background:#de1c44;border-radius:50%;margin:-.8138020833vw;-webkit-animation:mesh 3s ease-in-out infinite;animation:mesh 3s ease-in-out -1.5s infinite}.mesh-loader[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]   .circle[_ngcontent-%COMP%]:last-child{-webkit-animation-delay:0s;animation-delay:0s}.mesh-loader[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]{position:absolute;top:50%;left:50%}.mesh-loader[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]:last-child{transform:rotate(90deg)}@-webkit-keyframes mesh{0%{transform-origin:50% -100%;transform:rotate(0)}50%{transform-origin:50% -100%;transform:rotate(1turn)}50.00001%{transform-origin:50% 200%;transform:rotate(0deg)}to{transform-origin:50% 200%;transform:rotate(1turn)}}@keyframes mesh{0%{transform-origin:50% -100%;transform:rotate(0)}50%{transform-origin:50% -100%;transform:rotate(1turn)}50.00001%{transform-origin:50% 200%;transform:rotate(0deg)}to{transform-origin:50% 200%;transform:rotate(1turn)}}"]}),t})()},U6JX:function(t,e,n){"use strict";e.a=function(t,e){return function(n){return t(e(n))}}},WJ6P:function(t,e,n){"use strict";e.a=function(){return[]}},WOAq:function(t,e,n){"use strict";(function(t){var r=n("Ju5/"),o=n("L3Qv"),i="object"==typeof exports&&exports&&!exports.nodeType&&exports,a=i&&"object"==typeof t&&t&&!t.nodeType&&t,c=a&&a.exports===i?r.a.Buffer:void 0;e.a=(c?c.isBuffer:void 0)||o.a}).call(this,n("3UD+")(t))},XIp8:function(t,e,n){"use strict";var r=n("CfRg");e.a=function(t){return Object(r.a)(t,5)}},XqMk:function(t,e,n){"use strict";var r="object"==typeof global&&global&&global.Object===Object&&global;e.a=r},Y7yP:function(t,e,n){"use strict";var r,o=n("vJtL"),i=n("Ju5/").a["__core-js_shared__"],a=(r=/[^.]+$/.exec(i&&i.keys&&i.keys.IE_PROTO||""))?"Symbol(src)_1."+r:"",c=n("IzLi"),s=n("dLWn"),u=/^\[object .+?Constructor\]$/,l=RegExp("^"+Function.prototype.toString.call(Object.prototype.hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");e.a=function(t,e){var n=function(t,e){return null==t?void 0:t[e]}(t,e);return function(t){return!(!Object(c.a)(t)||(e=t,a&&a in e))&&(Object(o.a)(t)?l:u).test(Object(s.a)(t));var e}(n)?n:void 0}},YHEm:function(t,e,n){"use strict";e.a=function(t,e){return t===e||t!=t&&e!=e}},YM6B:function(t,e,n){"use strict";var r=n("Y7yP"),o=n("Ju5/"),i=Object(r.a)(o.a,"DataView"),a=n("3cmB"),c=Object(r.a)(o.a,"Promise"),s=Object(r.a)(o.a,"Set"),u=Object(r.a)(o.a,"WeakMap"),l=n("8M4i"),b=n("dLWn"),h=Object(b.a)(i),f=Object(b.a)(a.a),p=Object(b.a)(c),d=Object(b.a)(s),j=Object(b.a)(u),g=l.a;(i&&"[object DataView]"!=g(new i(new ArrayBuffer(1)))||a.a&&"[object Map]"!=g(new a.a)||c&&"[object Promise]"!=g(c.resolve())||s&&"[object Set]"!=g(new s)||u&&"[object WeakMap]"!=g(new u))&&(g=function(t){var e=Object(l.a)(t),n="[object Object]"==e?t.constructor:void 0,r=n?Object(b.a)(n):"";if(r)switch(r){case h:return"[object DataView]";case f:return"[object Map]";case p:return"[object Promise]";case d:return"[object Set]";case j:return"[object WeakMap]"}return e}),e.a=g},cxbk:function(t,e,n){"use strict";n.d(e,"a",function(){return r});const r={production:!0,baseURL:"http://localhost:9999/"}},dLWn:function(t,e,n){"use strict";var r=Function.prototype.toString;e.a=function(t){if(null!=t){try{return r.call(t)}catch(e){}try{return t+""}catch(e){}}return""}},jN84:function(t,e,n){"use strict";var r=n("WJ6P"),o=Object.prototype.propertyIsEnumerable,i=Object.getOwnPropertySymbols;e.a=i?function(t){return null==t?[]:(t=Object(t),function(e,n){for(var r=-1,i=null==e?0:e.length,a=0,c=[];++r<i;){var s=e[r];o.call(t,s)&&(c[a++]=s)}return c}(i(t)))}:r.a},l5mm:function(t,e,n){"use strict";n.d(e,"a",function(){return c});var r=n("HDdC"),o=n("3N8a");const i=new(n("IjjT").a)(o.a);var a=n("DH7j");function c(t=0,e=i){var n;return n=t,(Object(a.a)(n)||!(n-parseFloat(n)+1>=0)||t<0)&&(t=0),e&&"function"==typeof e.schedule||(e=i),new r.a(n=>(n.add(e.schedule(s,t,{subscriber:n,counter:0,period:t})),n))}function s(t){const{subscriber:e,counter:n,period:r}=t;e.next(n),this.schedule({subscriber:e,counter:n+1,period:r},r)}},mkut:function(t,e,n){"use strict";var r=n("7gMY"),o=n("pyRK"),i=n("U6JX"),a=Object(i.a)(Object.keys,Object),c=Object.prototype.hasOwnProperty,s=n("5WsY");e.a=function(t){return Object(s.a)(t)?Object(r.a)(t):function(t){if(!Object(o.a)(t))return a(t);var e=[];for(var n in Object(t))c.call(t,n)&&"constructor"!=n&&e.push(n);return e}(t)}},nLtN:function(t,e,n){"use strict";var r=n("YHEm"),o=function(t,e){for(var n=t.length;n--;)if(Object(r.a)(t[n][0],e))return n;return-1},i=Array.prototype.splice;function a(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}a.prototype.clear=function(){this.__data__=[],this.size=0},a.prototype.delete=function(t){var e=this.__data__,n=o(e,t);return!(n<0||(n==e.length-1?e.pop():i.call(e,n,1),--this.size,0))},a.prototype.get=function(t){var e=this.__data__,n=o(e,t);return n<0?void 0:e[n][1]},a.prototype.has=function(t){return o(this.__data__,t)>-1},a.prototype.set=function(t,e){var n=this.__data__,r=o(n,t);return r<0?(++this.size,n.push([t,e])):n[r][1]=e,this},e.a=a},oSzE:function(t,e,n){"use strict";var r=n("nLtN"),o=n("3cmB"),i=n("DlmY");function a(t){var e=this.__data__=new r.a(t);this.size=e.size}a.prototype.clear=function(){this.__data__=new r.a,this.size=0},a.prototype.delete=function(t){var e=this.__data__,n=e.delete(t);return this.size=e.size,n},a.prototype.get=function(t){return this.__data__.get(t)},a.prototype.has=function(t){return this.__data__.has(t)},a.prototype.set=function(t,e){var n=this.__data__;if(n instanceof r.a){var a=n.__data__;if(!o.a||a.length<199)return a.push([t,e]),this.size=++n.size,this;n=this.__data__=new i.a(a)}return n.set(t,e),this.size=n.size,this},e.a=a},oYcn:function(t,e,n){"use strict";var r=n("8M4i"),o=n("Js68"),i=n("EUcb"),a={};a["[object Float32Array]"]=a["[object Float64Array]"]=a["[object Int8Array]"]=a["[object Int16Array]"]=a["[object Int32Array]"]=a["[object Uint8Array]"]=a["[object Uint8ClampedArray]"]=a["[object Uint16Array]"]=a["[object Uint32Array]"]=!0,a["[object Arguments]"]=a["[object Array]"]=a["[object ArrayBuffer]"]=a["[object Boolean]"]=a["[object DataView]"]=a["[object Date]"]=a["[object Error]"]=a["[object Function]"]=a["[object Map]"]=a["[object Number]"]=a["[object Object]"]=a["[object RegExp]"]=a["[object Set]"]=a["[object String]"]=a["[object WeakMap]"]=!1;var c=n("ovuK"),s=n("xutz"),u=s.a&&s.a.isTypedArray,l=u?Object(c.a)(u):function(t){return Object(i.a)(t)&&Object(o.a)(t.length)&&!!a[Object(r.a)(t)]};e.a=l},ovuK:function(t,e,n){"use strict";e.a=function(t){return function(e){return t(e)}}},pyRK:function(t,e,n){"use strict";var r=Object.prototype;e.a=function(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||r)}},tPH9:function(t,e,n){"use strict";e.a=function(t,e){for(var n=-1,r=e.length,o=t.length;++n<r;)t[o+n]=e[n];return t}},vJtL:function(t,e,n){"use strict";var r=n("8M4i"),o=n("IzLi");e.a=function(t){if(!Object(o.a)(t))return!1;var e=Object(r.a)(t);return"[object Function]"==e||"[object GeneratorFunction]"==e||"[object AsyncFunction]"==e||"[object Proxy]"==e}},x2Se:function(t,e,n){"use strict";n.d(e,"a",function(){return b});var r=n("fXoL"),o=n("tyNb"),i=n("ofXK"),a=n("sYmb");const c=function(t){return{"last-btn-container":t}},s=function(){return{exact:!0}};function u(t,e){if(1&t&&(r.Kb(0),r.Mb(1,"a",6),r.Mb(2,"div",7),r.Mb(3,"label",8),r.oc(4),r.Wb(5,"translate"),r.Lb(),r.Lb(),r.Lb(),r.Jb()),2&t){const t=e.$implicit,n=e.last;r.xb(1),r.ac("routerLink",t.url),r.xb(1),r.ac("ngClass",r.dc(6,c,n))("routerLinkActiveOptions",r.cc(8,s)),r.xb(2),r.pc(r.Xb(5,4,t.name))}}function l(t,e){if(1&t&&(r.Kb(0),r.Mb(1,"div",9),r.Ib(2,"img",10),r.Wb(3,"translate"),r.Lb(),r.Jb()),2&t){const t=e.$implicit,n=e.index;r.xb(2),r.ac("src",t.imgPath,r.jc)("alt",t.alt)("title",r.Xb(3,4,t.hoverLabel)),r.yb("data-index",n)}}let b=(()=>{class t{constructor(t){this._router=t,this.logoSrc="../../../assets/icons/classifai_logo_white.svg",this.headerLabels=[{name:"pageHeader.home",url:"/"},{name:"pageHeader.datasetManagement",url:"/dataset"},{name:"pageHeader.revision",url:"/"}],this.bindImagePath=t=>{this.jsonSchema={logos:"/imglabel"===t?[{imgPath:"../../../assets/icons/add_user.svg",hoverLabel:"Add user to project",alt:"pageHeader.addUser",onClick:()=>null}]:[{imgPath:"../../../assets/icons/profile.svg",hoverLabel:"pageHeader.profile",alt:"Profile",onClick:()=>null}]}};const{url:e}=t;this.bindImagePath(e)}ngOnInit(){}}return t.\u0275fac=function(e){return new(e||t)(r.Hb(o.a))},t.\u0275cmp=r.Bb({type:t,selectors:[["page-header"]],inputs:{_onChange:"_onChange"},decls:7,vars:3,consts:[[1,"header-container"],[1,"container-flex-start"],[1,"logo-container"],["alt","logo","title","Classifai",1,"logo","position-absolute",3,"src"],[4,"ngFor","ngForOf"],[1,"container-flex-end"],[1,"link",3,"routerLink"],["routerLinkActive","active-link",1,"btn-container",3,"ngClass","routerLinkActiveOptions"],[1,"label"],[1,"utility-icon-container"],[1,"img","utility-icon-light",3,"src","alt","title"]],template:function(t,e){1&t&&(r.Mb(0,"div",0),r.Mb(1,"div",1),r.Mb(2,"div",2),r.Ib(3,"img",3),r.Lb(),r.mc(4,u,6,9,"ng-container",4),r.Lb(),r.Mb(5,"div",5),r.mc(6,l,4,6,"ng-container",4),r.Lb(),r.Lb()),2&t&&(r.xb(3),r.ac("src",e.logoSrc,r.jc),r.xb(1),r.ac("ngForOf",e.headerLabels),r.xb(2),r.ac("ngForOf",e.jsonSchema.logos))},directives:[i.j,o.c,o.b,i.i],pipes:[a.c],styles:[".header-container[_ngcontent-%COMP%]{min-width:100vw;max-width:100vw;min-height:4.3vh;max-height:4.3vh;background:#525353;border:.0625vw solid hsla(0,0%,100%,.25);display:flex;justify-content:space-between;z-index:1000;position:relative}.container-flex-start[_ngcontent-%COMP%]{display:flex}.container-flex-end[_ngcontent-%COMP%]{display:flex;min-width:6.5vw;max-width:6.5vw}.logo-container[_ngcontent-%COMP%]{min-width:2.15vw;max-width:2.15vw}.logo[_ngcontent-%COMP%], .utility-icon-dark[_ngcontent-%COMP%], .utility-icon-light[_ngcontent-%COMP%]{min-width:1.6vw;max-width:1.6vw;min-height:inherit;max-height:inherit;padding:.32vw}.utility-icon-dark[_ngcontent-%COMP%], .utility-icon-light[_ngcontent-%COMP%]{cursor:pointer}.utility-icon-light[_ngcontent-%COMP%]:active{background:#696969}.utility-icon-dark[_ngcontent-%COMP%]:active{background:#a9a9a9}.img[_ngcontent-%COMP%]{margin-left:4.2vw}.position-absolute[_ngcontent-%COMP%]{position:absolute}.utility-icon-container[_ngcontent-%COMP%]{display:flex;min-height:3.4vh;max-height:3.4vh}.img-container[_ngcontent-%COMP%]:hover   .img-description[_ngcontent-%COMP%]{visibility:visible;opacity:1}.btn-container[_ngcontent-%COMP%]{min-height:4.36vh;max-height:4.36vh;font-size:2vh;background:#525353;border-left:.0625vw solid hsla(0,0%,100%,.25);cursor:pointer;align-items:center;justify-content:center;display:flex;padding:0 1.5vw}.btn-container[_ngcontent-%COMP%]:hover{background:#383535}.last-btn-container[_ngcontent-%COMP%]{border-right:.0625vw solid hsla(0,0%,100%,.25)}.link[_ngcontent-%COMP%]{text-decoration:none;color:#fff}.label[_ngcontent-%COMP%]{white-space:nowrap;border:none;color:#fff;cursor:pointer}.active-link[_ngcontent-%COMP%]{background:#383535}"],changeDetection:0}),t})()},xutz:function(t,e,n){"use strict";(function(t){var r=n("XqMk"),o="object"==typeof exports&&exports&&!exports.nodeType&&exports,i=o&&"object"==typeof t&&t&&!t.nodeType&&t,a=i&&i.exports===o&&r.a.process,c=function(){try{return i&&i.require&&i.require("util").types||a&&a.binding&&a.binding("util")}catch(t){}}();e.a=c}).call(this,n("3UD+")(t))},ylTp:function(t,e,n){"use strict";var r=n("Ju5/");e.a=r.a.Symbol}}]);