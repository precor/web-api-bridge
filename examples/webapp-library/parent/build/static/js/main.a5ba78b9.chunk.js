(window.webpackJsonpparent=window.webpackJsonpparent||[]).push([[0],{18:function(e,n,t){e.exports=t(46)},45:function(e,n,t){},46:function(e,n,t){"use strict";t.r(n);var i=t(0),a=t.n(i),o=t(15),s=t.n(o),r=t(17),p=t(1),c=t(16),l=t.n(c),u=function e(){Object(p.a)(this,e)};u.instances=[],u.add=function(e){return u.instances.push(e)},u.executeOnType=function(e,n){u.instances.forEach(function(t){var i=t.findApiOfType(e);i&&n(i)})};var d={Common:function e(){var n=this;Object(p.a)(this,e),this.setSend=function(e){n.send=e},this.displayBlur=function(e){n.send("displayBlur",[e],!1)},this.displayGrayscale=function(e){n.send("displayGrayscale",[e],!1)}},Api1:function e(){var n=this;Object(p.a)(this,e),this.setSend=function(e){n.send=e},this.photoSelected=function(e){n.send("photoSelected",[e],!1)}},Api2:function e(){var n=this;Object(p.a)(this,e),this.setSend=function(e){n.send=e},this.photoClicked=function(e){u.executeOnType("Api1",function(n){return n.photoSelected(e)}),u.executeOnType("Api2",function(e){e!==n&&e.displayNewPhoto()})},this.displayNewPhoto=function(){n.send("displayNewPhoto",null,!1)}},Api3:function e(){var n=this;Object(p.a)(this,e),this.setSend=function(e){n.send=e},this.setGrayscale=function(e){u.executeOnType("Common",function(n){return n.displayGrayscale(e)})},this.setBlur=function(e){u.executeOnType("Common",function(n){return n.displayBlur(e)})}}},b=function(e){var n=e.src,t=e.type,i=e.apis,o=Object(r.a)(e,["src","type","apis"]);console.log("render iframe: ".concat(n));var s=function(e){var a=new URL(n),o=new l.a;o.origin=a.origin,o.targetOrigin=a.origin;var s,r=o.send.bind(o);u.add({webApiBridge:(s={webApiBridge:o,apis:i}).webApiBridge,apis:s.apis,findApiOfType:function(e){return this.webApiBridge.apis.find(function(n){return n instanceof d[e]})}}),o.target=e.contentWindow,window.addEventListener("message",function(e){e&&e.source===o.target&&o.onMessage(e,e.data)}),o.apis=i.map(function(e){var n=new d[e];return n.setSend(r),n}),e.onload=function(){console.log("".concat(e.src," loaded")),setTimeout(function(){r("ready",[{type:t,apis:i}],!1)},100)}};return a.a.createElement("iframe",Object.assign({src:n,title:n,ref:function(e){s(e)},scrolling:"no"},o))},f=(t(45),{src:"https://precor.github.io/web-api-bridge/examples/webapp-library/webapp1/build/",type:"LibType1",apis:["Common","Api1"]}),h=[{src:"https://precor.github.io/web-api-bridge/examples/webapp-library/webapp1/build/",type:"LibType2",apis:["Common","Api2","Api3"]},{src:"https://precor.github.io/web-api-bridge/examples/webapp-library/webapp1/build/",type:"LibType2",apis:["Common","Api2"]},{src:"https://precor.github.io/web-api-bridge/examples/webapp-library/webapp2/build/",type:"LibType2",apis:["Common","Api2"]},{src:"https://precor.github.io/web-api-bridge/examples/webapp-library/webapp2/build/",type:"LibType2",apis:["Common","Api2"]}],m=function(){return console.log("render parent"),a.a.createElement("div",null,a.a.createElement("div",null,a.a.createElement(b,{className:"fullscreen-iframe",src:f.src,type:f.type,apis:f.apis})),a.a.createElement("div",{className:"container"},a.a.createElement("div",{className:"row"},h.map(function(e,n){var t=e.src,i=e.type,o=e.apis;return a.a.createElement(b,{className:"image-select",key:"LibType2_".concat(n),src:t,type:i,apis:o})})),a.a.createElement("div",{className:"overlay-text"},"Click on one of the 4 photos")))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));s.a.render(a.a.createElement(m,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[18,1,2]]]);
//# sourceMappingURL=main.a5ba78b9.chunk.js.map