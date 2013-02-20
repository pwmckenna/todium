(function(){define("model/authentication",[],function(){"use strict";var e=Backbone.Model.extend({initialize:function(){this.firebase=new Firebase("https://featuredcontent.firebaseIO.com/"),this.auth=new FirebaseAuthClient(this.firebase,_.bind(this.onLogin,this))},login:function(e){this.auth.login(e)},logout:function(){this.auth.logout()},onLogin:function(e,t){console.log("onLogin",e,t),e?console.log(e):(this.set("user",t),t&&this.firebase.child("users").child(t.provider).child(t.id).update({token:t.firebaseAuthToken}))}});return e}),define("view/view",[],function(){"use strict";var e=Backbone.View.extend({assign:function(e,t){e.setElement(this.$(t)).render()}});return e}),define("view/login",["./view"],function(e){"use strict";var t=e.extend({events:{"click .facebook.btn":"login","click .github.btn":"login","click .twitter.btn":"login"},initialize:function(){this.template=_.template($("#login_template").html()),this.model.on("change:user",this.render,this)},login:function(e){var t=$(e.currentTarget);if(!t.hasClass("disabled")){t.addClass("disabled");var i="";if(t.hasClass("facebook"))i="facebook";else if(t.hasClass("github"))i="github";else{if(!t.hasClass("twitter"))throw"invalid login provider";i="twitter"}this.model.login(i)}},render:function(){return this.model.get("user")?this.$el.hide():(this.$el.html(this.template()),this.$el.show()),this}});return t}),define("view/logout",["./view"],function(e){"use strict";var t=e.extend({events:{"click .logout.btn":"logout"},initialize:function(){this.template=_.template($("#logout_template").html()),this.model.on("change:user",this.render,this)},logout:function(e){var t=$(e.currentTarget);t.hasClass("disabled")||(t.addClass("disabled"),this.model.logout())},render:function(){return this.model.get("user")?(this.$el.html(this.template()),this.$el.show()):this.$el.hide(),this}});return t}),define("view/tracker",["./view"],function(e){"use strict";var t=new ZeroClipboard.Client;t.setHandCursor(!0),t.addEventListener("complete",function(){var e=$(t.domElement).prev();e.attr("value"," Copied to clipboard!"),setTimeout(function(){e.attr("value",e.attr("url"))},1e3)});var i=e.extend({events:{"mouseover .copy":"onCopy","click .button-label":"onAddLabel"},initialize:function(){this.url="...",this.template=_.template($("#tracker_template").html()),this.model.on("value",this.onValue,this)},destroy:function(){this.model.off("value",this.onValue,this)},onValue:function(e){console.log("onValue",e.val());var t=e.val(),i=t.trackable;t.url=i;var n=0,s=_.map(t.hasOwnProperty("stats")&&t.stats.hasOwnProperty("started")?t.stats.started:[],function(e){var t=new Date(e.time).getTime();return[t,++n]});s.unshift([new Date(t.time).getTime(),0]),s.push([(new Date).getTime(),_.last(s)[1]]);var o=0,r=_.map(t.hasOwnProperty("stats")&&t.stats.hasOwnProperty("stopped")?t.stats.stopped:[],function(e){var t=new Date(e.time).getTime();return[t,++o]});r.unshift([new Date(t.time).getTime(),0]),r.push([(new Date).getTime(),_.last(r)[1]]);var a=0,l=_.map(t.hasOwnProperty("stats")&&t.stats.hasOwnProperty("completed")?t.stats.completed:[],function(e){var t=new Date(e.time).getTime();return[t,++a]});l.unshift([new Date(t.time).getTime(),0]),l.push([(new Date).getTime(),_.last(l)[1]]),t.time=humaneDate(new Date(t.time)),this.$el.html(this.template(t));var h=Math.max(n,o,a),d=20*Math.floor(h?Math.log(h):1),u=Math.floor(1.2*h);this.$(".sparkline").sparkline(s,{width:"100%",height:d+"px",fillColor:!1,lineColor:"green",chartRangeMin:0,chartRangeMax:u}),this.$(".sparkline").sparkline(r,{composite:!0,fillColor:!1,lineColor:"red",chartRangeMin:0,chartRangeMax:u}),this.$(".sparkline").sparkline(l,{composite:!0,fillColor:!1,lineColor:"blue",chartRangeMin:0,chartRangeMax:u}),this.url=i},onAddLabel:function(){var e=this.$(".input-label").val();this.model.child("labels").push(e)},onCopy:function(){console.log("onCopy",this.url),t.setText(this.url);var e=this.$(".copy")[0];t.div?(t.receiveEvent("mouseout",null),t.reposition(e)):t.glue(e),t.receiveEvent("mouseover",null)},render:function(){return this}});return i}),define("view/user",["./view","./tracker"],function(e,t){"use strict";var i=e.extend({events:{"click .addTracker":"onAddTracker"},initialize:function(){this.template=_.template($("#user_template").html()),this.views={};var e=this.model.get("user");this.trackers=this.model.firebase.child("users").child(e.provider).child(e.id).child("trackers"),setTimeout(_.bind(function(){this.trackers.on("child_added",this.onTrackerAdded,this),this.trackers.on("child_removed",this.onTrackerRemoved,this)},this))},destroy:function(){this.trackers.off("child_added",this.onTrackerAdded,this),this.trackers.off("child_removed",this.onTrackerRemoved,this),_.each(this.views,function(e){e.destroy(),e.remove()}),this.views={}},onTrackerAdded:function(e){console.log("onTrackerAdded",e.val());var i=e.val(),n=this.model.firebase.child("trackers").child(i),s=new t({model:n});this.views[i]=s,this.$(".trackers").append(s.$el)},onTrackerRemoved:function(e){console.log("onTrackerRemoved",e.val());var t=e.val(),i=this.views[t];i.remove(),delete this.views[t]},onAddTracker:function(){var e=this.$(".btn");if(!e.hasClass("disabled")){e.addClass("disabled"),setTimeout(function(){e.removeClass("disabled")},3e3);var t=this.$(".createTorrentLink").val();t&&(this.$(".createTorrentLink").val(""),$.getJSON("http://api.todium.com",{token:this.model.get("user").firebaseAuthToken,src:t}).then(function(e){console.log(e)}))}},render:function(){var e=this.$(".trackers").children().detach();this.$el.html(this.template()),this.$(".trackers").append(e)}});return i}),define("view/app",["./view","./login","./logout","./user"],function(e,t,i,n){"use strict";var s=e.extend({initialize:function(){this.template=_.template($("#app_template").html()),this.loginView=new t({model:this.model}),this.logoutView=new i({model:this.model}),this.onUser(),this.model.on("change:user",this.onUser,this)},onUser:function(){this.model.get("user")?this.userView||(this.userView=new n({model:this.model})):this.userView&&(this.userView.destroy(),this.userView=null),this.render()},render:function(){return this.$el.html(this.template()),this.userView&&this.assign(this.userView,".user"),this.assign(this.loginView,".login"),this.assign(this.logoutView,".logout"),this}});return s}),require.config({paths:{hm:"vendor/hm",esprima:"vendor/esprima",jquery:"vendor/jquery.min",smoothie:"vendor/smoothie",underscore:"components/underscore/underscore-min",backbone:"components/backbone/backbone-min",humane:"components/Humane-Dates/humane"}}),require(["model/authentication","view/app"],function(e,t){"use strict";window.authentication=new e;var i=new t({model:window.authentication});$("body").append(i.render().el)}),define("main",function(){})})();