(function(){define("model/authentication",[],function(){"use strict";var e=Backbone.Model.extend({initialize:function(){this.firebase=new Firebase("https://featuredcontent.firebaseIO.com/"),this.auth=new FirebaseAuthClient(this.firebase,_.bind(this.onLogin,this))},login:function(e){this.auth.login(e)},logout:function(){this.auth.logout()},onLogin:function(e,t){console.log("onLogin",e,t),e?console.log(e):(this.set("user",t),t&&this.firebase.child("users").child(t.provider).child(t.id).update({token:t.firebaseAuthToken}))}});return e}),define("view/view",[],function(){"use strict";var e=Backbone.View.extend({assign:function(e,t){e.setElement(this.$(t)).render()}});return e}),define("view/login",["./view"],function(e){"use strict";var t=e.extend({events:{"click .facebook.btn":"login","click .github.btn":"login","click .twitter.btn":"login"},initialize:function(){this.template=_.template($("#login_template").html()),this.model.on("change:user",this.render,this)},login:function(e){var t=$(e.currentTarget);if(!t.hasClass("disabled")){t.addClass("disabled");var i="";if(t.hasClass("facebook"))i="facebook";else if(t.hasClass("github"))i="github";else{if(!t.hasClass("twitter"))throw"invalid login provider";i="twitter"}this.model.login(i)}},render:function(){return this.model.get("user")?this.$el.hide():(this.$el.html(this.template()),this.$el.show()),this}});return t}),define("view/logout",["./view"],function(e){"use strict";var t=e.extend({events:{"click .logout.btn":"logout"},initialize:function(){this.template=_.template($("#logout_template").html()),this.model.on("change:user",this.render,this)},logout:function(e){var t=$(e.currentTarget);t.hasClass("disabled")||(t.addClass("disabled"),this.model.logout())},render:function(){return this.model.get("user")?(this.$el.html(this.template()),this.$el.show()):this.$el.hide(),this}});return t}),define("view/stats",["./view"],function(e){"use strict";var t=e.extend({initialize:function(){this.val={},this.model.on("value",this.onValue,this)},onValue:function(e){this.val=e.val()||{},console.log("stats onValue",this.val),this.render()},destroy:function(){this.model.off("value",this.onValue,this)},render:function(){this.$el.empty(),console.log("statsview render");var e=this.$el,t=this.val,i=0,s=_.map(t.hasOwnProperty("started")?t.started:[],function(e){var t=new Date(e.time).getTime();return[t,++i]});s.push([(new Date).getTime(),s.length?_.last(s)[1]:0]);var n=0,o=_.map(t.hasOwnProperty("stopped")?t.stopped:[],function(e){var t=new Date(e.time).getTime();return[t,++n]});o.push([(new Date).getTime(),o.length?_.last(o)[1]:0]);var r=0,a=_.map(t.hasOwnProperty("completed")?t.completed:[],function(e){var t=new Date(e.time).getTime();return[t,++r]});a.push([(new Date).getTime(),a.length?_.last(a)[1]:0]);var l=Math.max(i,n,r);console.log(i,n,r),console.log(s,o,a);var h=20*Math.floor(l?Math.log(l):1),d=Math.floor(1.2*l);return e.sparkline(s,{width:"100%",height:h+"px",fillColor:!1,lineColor:"green",chartRangeMin:0,chartRangeMax:d}),e.sparkline(o,{composite:!0,fillColor:!1,lineColor:"red",chartRangeMin:0,chartRangeMax:d}),e.sparkline(a,{composite:!0,fillColor:!1,lineColor:"blue",chartRangeMin:0,chartRangeMax:d}),this}});return t}),define("view/tracker",["./view","./stats"],function(e,t){"use strict";var i=new ZeroClipboard.Client;i.setHandCursor(!0),i.addEventListener("complete",function(){var e=$(i.domElement).prev();e.attr("value"," Copied to clipboard!"),setTimeout(function(){e.attr("value",e.attr("url"))},1e3)});var s=e.extend({events:{"mouseover .copy":"onCopy","click .button-label":"onAddLabel"},initialize:function(){this.url="...",this.template=_.template($("#tracker_template").html()),this.statsView=new t({model:this.model.child("stats")}),this.model.on("value",this.onValue,this)},destroy:function(){this.model.off("value",this.onValue,this)},onValue:function(e){console.log("onValue",e.val()),this.val=e.val(),this.render()},onAddLabel:function(){var e=this.$(".input-label").val();this.model.child("labels").push(e)},onCopy:function(){console.log("onCopy",this.url),i.setText(this.url);var e=this.$(".copy")[0];i.div?(i.receiveEvent("mouseout",null),i.reposition(e)):i.glue(e),i.receiveEvent("mouseover",null)},render:function(){return this.$el.html(this.template({src:this.val.src,time:humaneDate(new Date(this.val.time)),labels:this.val.labels,url:this.val.trackable})),this.url=this.val.url,this.assign(this.statsView,".stats"),this}});return s}),define("view/user",["./view","./tracker"],function(e,t){"use strict";var i=e.extend({events:{"click .addTracker":"onAddTracker"},initialize:function(){this.template=_.template($("#user_template").html()),this.views={};var e=this.model.get("user");this.trackers=this.model.firebase.child("users").child(e.provider).child(e.id).child("trackers"),setTimeout(_.bind(function(){this.trackers.on("child_added",this.onTrackerAdded,this),this.trackers.on("child_removed",this.onTrackerRemoved,this)},this))},destroy:function(){this.trackers.off("child_added",this.onTrackerAdded,this),this.trackers.off("child_removed",this.onTrackerRemoved,this),_.each(this.views,function(e){e.destroy(),e.remove()}),this.views={}},onTrackerAdded:function(e){console.log("onTrackerAdded",e.val());var i=e.val(),s=this.model.firebase.child("trackers").child(i),n=new t({model:s});this.views[i]=n,this.$(".trackers").append(n.$el)},onTrackerRemoved:function(e){console.log("onTrackerRemoved",e.val());var t=e.val(),i=this.views[t];i.remove(),delete this.views[t]},onAddTracker:function(){var e=this.$(".btn");if(!e.hasClass("disabled")){e.addClass("disabled"),setTimeout(function(){e.removeClass("disabled")},3e3);var t=this.$(".createTorrentLink").val();t&&(this.$(".createTorrentLink").val(""),$.getJSON("http://api.todium.com",{token:this.model.get("user").firebaseAuthToken,src:t}).then(function(e){console.log(e)}))}},render:function(){var e=this.$(".trackers").children().detach();this.$el.html(this.template()),this.$(".trackers").append(e)}});return i}),define("view/app",["./view","./login","./logout","./user","./stats"],function(e,t,i,s,n){"use strict";var o=e.extend({initialize:function(){this.template=_.template($("#app_template").html()),this.loginView=new t({model:this.model}),this.logoutView=new i({model:this.model}),this.onUser(),this.model.on("change:user",this.onUser,this)},onUser:function(){this.model.get("user")?(this.userView||(this.userView=new s({model:this.model})),this.statsView&&(this.statsView.destroy(),this.statsView=null)):(this.userView&&(this.userView.destroy(),this.userView=null),this.statsView||(this.statsView=new n({model:this.model.firebase.child("stats")}))),this.render()},render:function(){return this.$el.html(this.template()),this.userView&&this.assign(this.userView,".user"),this.statsView&&(console.log("rendering stats"),this.assign(this.statsView,".stats")),this.assign(this.loginView,".login"),this.assign(this.logoutView,".logout"),this}});return o}),require.config({paths:{hm:"vendor/hm",esprima:"vendor/esprima",jquery:"vendor/jquery.min",smoothie:"vendor/smoothie",underscore:"components/underscore/underscore-min",backbone:"components/backbone/backbone-min",humane:"components/Humane-Dates/humane"}}),require(["model/authentication","view/app"],function(e,t){"use strict";window.authentication=new e;var i=new t({model:window.authentication});$("body").append(i.render().el)}),define("main",function(){})})();