!function(){function t(e,n){return(t=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(e,n)}function e(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(t){return!1}}();return function(){var r,a=o(t);if(e){var c=o(this).constructor;r=Reflect.construct(a,arguments,c)}else r=a.apply(this,arguments);return n(this,r)}}function n(t,e){return!e||"object"!=typeof e&&"function"!=typeof e?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):e}function o(t){return(o=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function a(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}function c(t,e,n){return e&&a(t.prototype,e),n&&a(t,n),t}(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{"/uUt":function(n,o,a){"use strict";a.d(o,"a",function(){return u});var i=a("7o/Q");function u(t,e){return function(n){return n.lift(new s(t,e))}}var s=function(){function t(e,n){r(this,t),this.compare=e,this.keySelector=n}return c(t,[{key:"call",value:function(t,e){return e.subscribe(new l(t,this.compare,this.keySelector))}}]),t}(),l=function(n){!function(e,n){if("function"!=typeof n&&null!==n)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(n&&n.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),n&&t(e,n)}(a,n);var o=e(a);function a(t,e,n){var c;return r(this,a),(c=o.call(this,t)).keySelector=n,c.hasKey=!1,"function"==typeof e&&(c.compare=e),c}return c(a,[{key:"compare",value:function(t,e){return t===e}},{key:"_next",value:function(t){var e;try{var n=this.keySelector;e=n?n(t):t}catch(r){return this.destination.error(r)}var o=!1;if(this.hasKey)try{o=(0,this.compare)(this.key,e)}catch(r){return this.destination.error(r)}else this.hasKey=!0;o||(this.key=e,this.destination.next(t))}}]),a}(i.a)},"3/ER":function(t,e,n){"use strict";(function(t){var o=n("Ju5/"),r="object"==typeof exports&&exports&&!exports.nodeType&&exports,a=r&&"object"==typeof t&&t&&!t.nodeType&&t,c=a&&a.exports===r?o.a.Buffer:void 0,i=c?c.allocUnsafe:void 0;e.a=function(t,e){if(e)return t.slice();var n=t.length,o=i?i(n):new t.constructor(n);return t.copy(o),o}}).call(this,n("3UD+")(t))},"9lAI":function(t,e,n){"use strict";n.d(e,"a",function(){return i});var o=n("fXoL"),a=n("ofXK");function c(t,e){1&t&&(o.Lb(0),o.Nb(1,"div",1),o.Nb(2,"div",2),o.Nb(3,"div"),o.Ib(4,"div",3),o.Ib(5,"div",3),o.Mb(),o.Nb(6,"div"),o.Ib(7,"div",3),o.Ib(8,"div",3),o.Mb(),o.Mb(),o.Mb(),o.Kb())}var i=function(){var t=function t(){r(this,t),this._loading=!0};return t.\u0275fac=function(e){return new(e||t)},t.\u0275cmp=o.Bb({type:t,selectors:[["spinner"]],inputs:{_loading:"_loading"},decls:1,vars:1,consts:[[4,"ngIf"],[1,"mesh-loader-container"],[1,"mesh-loader"],[1,"circle"]],template:function(t,e){1&t&&o.qc(0,c,9,0,"ng-container",0),2&t&&o.cc("ngIf",e._loading)},directives:[a.l],styles:[".mesh-loader-container[_ngcontent-%COMP%]{overflow:hidden;position:fixed;top:0;right:0;bottom:0;left:0;opacity:.85;z-index:10000;cursor:progress}.mesh-loader[_ngcontent-%COMP%]{overflow:hidden;height:100%;width:100%}.mesh-loader[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]{position:absolute;top:50%;left:50%}.mesh-loader[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]:last-child{transform:rotate(90deg)}.mesh-loader[_ngcontent-%COMP%]   .circle[_ngcontent-%COMP%]{width:1.6276041667vw;height:3.3156498674vh;position:absolute;background:#2d8ceb;border-radius:50%;margin:-.8138020833vw;-webkit-animation:mesh 3s ease-in-out infinite;animation:mesh 3s ease-in-out -1.5s infinite}.mesh-loader[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]   .circle[_ngcontent-%COMP%]:last-child{-webkit-animation-delay:0s;animation-delay:0s}@-webkit-keyframes mesh{0%{transform-origin:50% -100%;transform:rotate(0)}50%{transform-origin:50% -100%;transform:rotate(1turn)}50.00001%{transform-origin:50% 200%;transform:rotate(0deg)}to{transform-origin:50% 200%;transform:rotate(1turn)}}@keyframes mesh{0%{transform-origin:50% -100%;transform:rotate(0)}50%{transform-origin:50% -100%;transform:rotate(1turn)}50.00001%{transform-origin:50% 200%;transform:rotate(0deg)}to{transform-origin:50% 200%;transform:rotate(1turn)}}"]}),t}()},CfRg:function(t,e,n){"use strict";var o=n("oSzE"),r=n("Y7yP"),a=function(){try{var t=Object(r.a)(Object,"defineProperty");return t({},"",{}),t}catch(e){}}(),c=function(t,e,n){"__proto__"==e&&a?a(t,e,{configurable:!0,enumerable:!0,value:n,writable:!0}):t[e]=n},i=n("YHEm"),u=Object.prototype.hasOwnProperty,s=function(t,e,n){var o=t[e];u.call(t,e)&&Object(i.a)(o,n)&&(void 0!==n||e in t)||c(t,e,n)},l=function(t,e,n,o){var r=!n;n||(n={});for(var a=-1,i=e.length;++a<i;){var u=e[a],l=o?o(n[u],t[u],u,n,t):void 0;void 0===l&&(l=t[u]),r?c(n,u,l):s(n,u,l)}return n},f=n("mkut"),p=n("7gMY"),b=n("IzLi"),d=n("pyRK"),h=Object.prototype.hasOwnProperty,g=n("5WsY"),m=function(t){return Object(g.a)(t)?Object(p.a)(t,!0):function(t){if(!Object(b.a)(t))return function(t){var e=[];if(null!=t)for(var n in Object(t))e.push(n);return e}(t);var e=Object(d.a)(t),n=[];for(var o in t)("constructor"!=o||!e&&h.call(t,o))&&n.push(o);return n}(t)},v=n("3/ER"),y=n("jN84"),j=n("tPH9"),w=n("U6JX"),O=Object(w.a)(Object.getPrototypeOf,Object),P=n("WJ6P"),_=Object.getOwnPropertySymbols?function(t){for(var e=[];t;)Object(j.a)(e,Object(y.a)(t)),t=O(t);return e}:P.a,L=n("TFwu"),M=n("25cm"),k=function(t){return Object(M.a)(t,m,_)},I=n("YM6B"),A=Object.prototype.hasOwnProperty,S=n("Ce4a"),x=function(t){var e=new t.constructor(t.byteLength);return new S.a(e).set(new S.a(t)),e},U=/\w*$/,R=n("ylTp"),E=R.a?R.a.prototype:void 0,C=E?E.valueOf:void 0,B=Object.create,T=function(){function t(){}return function(e){if(!Object(b.a)(e))return{};if(B)return B(e);t.prototype=e;var n=new t;return t.prototype=void 0,n}}(),F=n("/1FC"),D=n("WOAq"),N=n("EUcb"),X=n("ovuK"),Y=n("xutz"),H=Y.a&&Y.a.isMap,K=H?Object(X.a)(H):function(t){return Object(N.a)(t)&&"[object Map]"==Object(I.a)(t)},W=Y.a&&Y.a.isSet,J=W?Object(X.a)(W):function(t){return Object(N.a)(t)&&"[object Set]"==Object(I.a)(t)},q={};q["[object Arguments]"]=q["[object Array]"]=q["[object ArrayBuffer]"]=q["[object DataView]"]=q["[object Boolean]"]=q["[object Date]"]=q["[object Float32Array]"]=q["[object Float64Array]"]=q["[object Int8Array]"]=q["[object Int16Array]"]=q["[object Int32Array]"]=q["[object Map]"]=q["[object Number]"]=q["[object Object]"]=q["[object RegExp]"]=q["[object Set]"]=q["[object String]"]=q["[object Symbol]"]=q["[object Uint8Array]"]=q["[object Uint8ClampedArray]"]=q["[object Uint16Array]"]=q["[object Uint32Array]"]=!0,q["[object Error]"]=q["[object Function]"]=q["[object WeakMap]"]=!1,e.a=function t(e,n,r,a,c,i){var u,p=1&n,h=2&n,g=4&n;if(r&&(u=c?r(e,a,c,i):r(e)),void 0!==u)return u;if(!Object(b.a)(e))return e;var j=Object(F.a)(e);if(j){if(u=function(t){var e=t.length,n=new t.constructor(e);return e&&"string"==typeof t[0]&&A.call(t,"index")&&(n.index=t.index,n.input=t.input),n}(e),!p)return function(t,e){var n=-1,o=t.length;for(e||(e=Array(o));++n<o;)e[n]=t[n];return e}(e,u)}else{var w=Object(I.a)(e),P="[object Function]"==w||"[object GeneratorFunction]"==w;if(Object(D.a)(e))return Object(v.a)(e,p);if("[object Object]"==w||"[object Arguments]"==w||P&&!c){if(u=h||P?{}:function(t){return"function"!=typeof t.constructor||Object(d.a)(t)?{}:T(O(t))}(e),!p)return h?function(t,e){return l(t,_(t),e)}(e,function(t,e){return t&&l(e,m(e),t)}(u,e)):function(t,e){return l(t,Object(y.a)(t),e)}(e,function(t,e){return t&&l(e,Object(f.a)(e),t)}(u,e))}else{if(!q[w])return c?e:{};u=function(t,e,n){var o,r,a=t.constructor;switch(e){case"[object ArrayBuffer]":return x(t);case"[object Boolean]":case"[object Date]":return new a(+t);case"[object DataView]":return function(t,e){var n=e?x(t.buffer):t.buffer;return new t.constructor(n,t.byteOffset,t.byteLength)}(t,n);case"[object Float32Array]":case"[object Float64Array]":case"[object Int8Array]":case"[object Int16Array]":case"[object Int32Array]":case"[object Uint8Array]":case"[object Uint8ClampedArray]":case"[object Uint16Array]":case"[object Uint32Array]":return function(t,e){var n=e?x(t.buffer):t.buffer;return new t.constructor(n,t.byteOffset,t.length)}(t,n);case"[object Map]":return new a;case"[object Number]":case"[object String]":return new a(t);case"[object RegExp]":return(r=new(o=t).constructor(o.source,U.exec(o))).lastIndex=o.lastIndex,r;case"[object Set]":return new a;case"[object Symbol]":return C?Object(C.call(t)):{}}}(e,w,p)}}i||(i=new o.a);var M=i.get(e);if(M)return M;i.set(e,u),J(e)?e.forEach(function(o){u.add(t(o,n,r,o,e,i))}):K(e)&&e.forEach(function(o,a){u.set(a,t(o,n,r,a,e,i))});var S=g?h?k:L.a:h?keysIn:f.a,R=j?void 0:S(e);return function(t,e){for(var n=-1,o=null==t?0:t.length;++n<o&&!1!==e(t[n],n););}(R||e,function(o,a){R&&(o=e[a=o]),s(u,a,t(o,n,r,a,e,i))}),u}},Iab2:function(t,e,n){var o,r;void 0===(r="function"==typeof(o=function(){"use strict";function e(t,e,n){var o=new XMLHttpRequest;o.open("GET",t),o.responseType="blob",o.onload=function(){c(o.response,e,n)},o.onerror=function(){console.error("could not download file")},o.send()}function n(t){var e=new XMLHttpRequest;e.open("HEAD",t,!1);try{e.send()}catch(t){}return 200<=e.status&&299>=e.status}function o(t){try{t.dispatchEvent(new MouseEvent("click"))}catch(e){var n=document.createEvent("MouseEvents");n.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),t.dispatchEvent(n)}}var r="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof global&&global.global===global?global:void 0,a=r.navigator&&/Macintosh/.test(navigator.userAgent)&&/AppleWebKit/.test(navigator.userAgent)&&!/Safari/.test(navigator.userAgent),c=r.saveAs||("object"!=typeof window||window!==r?function(){}:"download"in HTMLAnchorElement.prototype&&!a?function(t,a,c){var i=r.URL||r.webkitURL,u=document.createElement("a");u.download=a=a||t.name||"download",u.rel="noopener","string"==typeof t?(u.href=t,u.origin===location.origin?o(u):n(u.href)?e(t,a,c):o(u,u.target="_blank")):(u.href=i.createObjectURL(t),setTimeout(function(){i.revokeObjectURL(u.href)},4e4),setTimeout(function(){o(u)},0))}:"msSaveOrOpenBlob"in navigator?function(t,r,a){if(r=r||t.name||"download","string"!=typeof t)navigator.msSaveOrOpenBlob(function(t,e){return void 0===e?e={autoBom:!1}:"object"!=typeof e&&(console.warn("Deprecated: Expected third argument to be a object"),e={autoBom:!e}),e.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(t.type)?new Blob(["\ufeff",t],{type:t.type}):t}(t,a),r);else if(n(t))e(t,r,a);else{var c=document.createElement("a");c.href=t,c.target="_blank",setTimeout(function(){o(c)})}}:function(t,n,o,c){if((c=c||open("","_blank"))&&(c.document.title=c.document.body.innerText="downloading..."),"string"==typeof t)return e(t,n,o);var i="application/octet-stream"===t.type,u=/constructor/i.test(r.HTMLElement)||r.safari,s=/CriOS\/[\d]+/.test(navigator.userAgent);if((s||i&&u||a)&&"undefined"!=typeof FileReader){var l=new FileReader;l.onloadend=function(){var t=l.result;t=s?t:t.replace(/^data:[^;]*;/,"data:attachment/file;"),c?c.location.href=t:location=t,c=null},l.readAsDataURL(t)}else{var f=r.URL||r.webkitURL,p=f.createObjectURL(t);c?c.location=p:location.href=p,c=null,setTimeout(function(){f.revokeObjectURL(p)},4e4)}});r.saveAs=c.saveAs=c,t.exports=c})?o.apply(e,[]):o)||(t.exports=r)},LY9J:function(t,e,n){"use strict";n.d(e,"a",function(){return g});var o,a,i=n("/uUt"),u=n("cxbk"),s=n("fXoL"),l=n("tk/3"),f=n("14na"),p=n("tyNb"),b=n("mrSG"),d=n("Iab2"),h=((a=function(){function t(){r(this,t)}return c(t,[{key:"downloadUnsupportedImageList",value:function(t,e){return Object(b.a)(this,void 0,void 0,regeneratorRuntime.mark(function n(){var o;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return o=e.join("\n"),n.abrupt("return",(this.saveFile({content:o,filename:t+"_unsupported_images.txt",type:"text/plain;charset=utf-8"}),e.length));case 2:case"end":return n.stop()}},n,this)}))}},{key:"saveFile",value:function(t){var e=t.content,n=t.filename,o=t.type,r=new Blob([e],{type:o});d.saveAs(r,n)}}]),t}()).\u0275fac=function(t){return new(t||a)},a.\u0275prov=s.Db({token:a,factory:a.\u0275fac,providedIn:"root"}),a),g=((o=function(){function t(e,n,o,a){var c=this;r(this,t),this.http=e,this.mode=n,this.router=o,this._unsupportedImageService=a,this.hostPort=u.a.baseURL,this.imageLabellingMode=null,this.getProjectList=function(){return c.http.get("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/meta"))},this.createNewProject=function(t,e,n){return c.http.put(c.hostPort+"v2/projects",{project_name:t,annotation_type:"bndbox"===c.imageLabellingMode?"boundingbox":"segmentation",status:"raw",project_path:n,label_file_path:e})},this.importProject=function(){return c.http.put(c.hostPort+"v2/projects",{status:"config"})},this.renameProject=function(t,e){return c.http.put("".concat(c.hostPort,"v2/").concat(c.imageLabellingMode,"/projects/").concat(t,"/rename/").concat(e),{})},this.deleteProject=function(t){return c.http.delete("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t))},this.updateProjectLoadStatus=function(t){return c.http.get("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t))},this.checkProjectStatus=function(t){return c.http.get("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t,"/meta"))},this.manualCloseProject=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"closed";return c.http.put("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t),{status:e})},this.checkExistProjectStatus=function(t){return c.http.get("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t,"/loadingstatus"))},this.getThumbnailList=function(t,e){return c.http.get("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t,"/uuid/").concat(e,"/thumbnail"))},this.localUploadStatus=function(t){return c.http.get("".concat(c.hostPort,"v2/").concat(c.imageLabellingMode,"/projects/").concat(t))},this.updateLabelList=function(t,e){return c.http.put("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t,"/newlabels"),{label_list:e})},this.updateProjectStatus=function(t,e,n){return c.http.put("".concat(c.hostPort).concat(c.imageLabellingMode,"/projects/").concat(t,"/").concat("loaded"===n?"status":n),{status:e.toString()})},this.importStatus=function(){return c.http.get("".concat(c.hostPort,"v2/").concat(c.imageLabellingMode,"/projects/importstatus"))},this.mode.imgLabelMode$.pipe(Object(i.a)()).subscribe(function(t){t?c.imageLabellingMode=t:c.router.navigate(["/"])})}return c(t,[{key:"importLabelFile",value:function(){return this.http.put(this.hostPort+"v2/labelfiles",{})}},{key:"importLabelFileStatus",value:function(){return this.http.get(this.hostPort+"v2/labelfiles")}},{key:"importProjectFolder",value:function(){return this.http.put(this.hostPort+"v2/folders",{})}},{key:"importProjectFolderStatus",value:function(){return this.http.get(this.hostPort+"v2/folders")}},{key:"downloadUnsupportedImageList",value:function(t,e){return this._unsupportedImageService.downloadUnsupportedImageList(t,e)}}]),t}()).\u0275fac=function(t){return new(t||o)(s.Rb(l.b),s.Rb(f.a),s.Rb(p.a),s.Rb(h))},o.\u0275prov=s.Db({token:o,factory:o.\u0275fac,providedIn:"any"}),o)},XIp8:function(t,e,n){"use strict";var o=n("CfRg");e.a=function(t){return Object(o.a)(t,5)}},cxbk:function(t,e,n){"use strict";n.d(e,"a",function(){return o});var o={production:!0,baseURL:"http://localhost:9999/"}},l5mm:function(t,e,n){"use strict";n.d(e,"a",function(){return c});var o=n("HDdC"),r=n("D0XW"),a=n("Y7HM");function c(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:r.a;return(!Object(a.a)(t)||t<0)&&(t=0),e&&"function"==typeof e.schedule||(e=r.a),new o.a(function(n){return n.add(e.schedule(i,t,{subscriber:n,counter:0,period:t})),n})}function i(t){var e=t.subscriber,n=t.counter,o=t.period;e.next(n),this.schedule({subscriber:e,counter:n+1,period:o},o)}},s4fJ:function(t,e,n){"use strict";n.d(e,"a",function(){return i});var o=n("fXoL"),a=n("rq/W"),c=n("sYmb"),i=function(){var t=function t(){r(this,t),this._modalUnsupportedImage="",this._unsupportedImageList=[]};return t.\u0275fac=function(e){return new(e||t)},t.\u0275cmp=o.Bb({type:t,selectors:[["unsupported-image-modal"]],inputs:{_modalUnsupportedImage:"_modalUnsupportedImage",_unsupportedImageBodyStyle:"_unsupportedImageBodyStyle",_unsupportedImageList:"_unsupportedImageList"},decls:15,vars:19,consts:[[3,"id","modalBodyStyle","modalTitle","scrollable"],[1,"modal-content-container"],[1,"error-msg"],["href","https://github.com/CertifaiAI/CertifAI-Knowledge-Base/wiki/Image-Type-Unsupported-Walkaround","target","_blank","rel","noopener"],["src","assets/icons/help.svg","alt","help",1,"help-icon-sm"]],template:function(t,e){1&t&&(o.Nb(0,"modal",0),o.Xb(1,"translate"),o.Nb(2,"div",1),o.Nb(3,"p",2),o.sc(4),o.Xb(5,"translate"),o.Xb(6,"translate"),o.Nb(7,"a",3),o.Ib(8,"img",4),o.Mb(),o.Mb(),o.Nb(9,"p",2),o.sc(10),o.Xb(11,"translate"),o.Ib(12,"br"),o.sc(13),o.Xb(14,"translate"),o.Mb(),o.Mb(),o.Mb()),2&t&&(o.cc("id",e._modalUnsupportedImage)("modalBodyStyle",e._unsupportedImageBodyStyle)("modalTitle",o.Yb(1,9,"unsupportedImage"))("scrollable",!1),o.xb(4),o.wc(" ",o.Yb(5,11,"containsUnsupportedImage1")," ",e._unsupportedImageList.length," ",o.Yb(6,13,"containsUnsupportedImage2")," "),o.xb(6),o.uc(" ",o.Yb(11,15,"unsupportedImageList1"),""),o.xb(3),o.uc("",o.Yb(14,17,"unsupportedImageList2")," "))},directives:[a.a],pipes:[c.c],styles:[".modal-content-container[_ngcontent-%COMP%]{margin-left:1.3vw}.error-msg[_ngcontent-%COMP%]{padding-top:1vh;font-size:2vh}.help-icon-sm[_ngcontent-%COMP%]{height:2vh}"]}),t}()}}])}();