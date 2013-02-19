(function () {
define('model/authentication',[], function() {
    'use strict';
    var AuthenticationModel = Backbone.Model.extend({
        initialize: function() {
            this.firebase = new Firebase('https://featuredcontent.firebaseIO.com/');
            this.auth = new FirebaseAuthClient(this.firebase, _.bind(this.onLogin, this));
        },
        login: function(provider) {
            this.auth.login(provider);
        },
        logout: function() {
            this.auth.logout();
        },
        onLogin: function(error, user) {
            console.log('onLogin', error, user);
            if (!error) {
                this.set('user', user);

                if(user) {
                    //store the access token so that we can add rss feed links to todium on behalf of the user
                    this.firebase.child('users').child(user.provider).child(user.id).update({
                        'token': user.firebaseAuthToken
                    });
                }
            } else {
                console.log(error);
            }
        }
    });
    return AuthenticationModel;
});
define('view/view',[], function() {
    'use strict';
    var View = Backbone.View.extend({
        assign : function (view, selector) {
            view.setElement(this.$(selector)).render();
        }
    });
    return View;
});
define('view/login',[
    './view'
], function(View) {
    'use strict';
    var LoginView = View.extend({
        events: {
            'click .facebook.btn': 'login',
            'click .github.btn': 'login',
            'click .twitter.btn': 'login',
        },
        initialize: function() {
            this.template = _.template($('#login_template').html());
            this.model.on('change:user', this.render, this);
        },
        login: function(ev) {
            var button = $(ev.currentTarget);
            if(button.hasClass('disabled')) {
                return;
            }
            button.addClass('disabled');
            var provider = '';
            if(button.hasClass('facebook')) {
                provider = 'facebook';
            } else if(button.hasClass('github')) {
                provider = 'github';
            } else if(button.hasClass('twitter')) {
                provider = 'twitter';
            } else {
                throw 'invalid login provider';
            }
            this.model.login(provider);
        },
        render: function() {
            if(this.model.get('user')) {
                this.$el.hide();
            } else {
                this.$el.html(this.template());
                this.$el.show();
            }            
            return this;
        }
    });
    return LoginView;
});
define('view/logout',[
    './view'
], function(View) {
    'use strict';
    var LogoutView = View.extend({
        events: {
            'click .logout.btn': 'logout'
        },
        initialize: function() {
            this.template = _.template($('#logout_template').html());
            this.model.on('change:user', this.render, this);
        },
        logout: function(ev) {
            var button = $(ev.currentTarget);
            if(button.hasClass('disabled')) {
                return;
            }
            button.addClass('disabled');
            this.model.logout();
        },
        render: function() {
            if(this.model.get('user')) {
                this.$el.html(this.template());
                this.$el.show();
            } else {
                this.$el.hide();
            }            
            return this;
        }
    });
    return LogoutView;
});
define('view/tracker',[
    './view'
], function(View) {
    'use strict';

    var MAGNET_LINK_IDENTIFIER = 'magnet:?xt=urn:btih:';

    var clip = new ZeroClipboard.Client();
    clip.setHandCursor(true);
    clip.addEventListener('complete', function(client, text) {
        var linkElem = $(clip.domElement).prev();
        var link = linkElem.attr('value');
        linkElem.attr('value',' Copied to clipboard!');
        setTimeout(function() {
            linkElem.attr('value', linkElem.attr('url'));
        }, 1000);
    });

    var bytesToSize = function(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
        if (bytes == 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }


    var TrackerView = View.extend({
        events: {
            'mouseover .copy': 'onCopy',
            'click .button-label': 'onAddLabel'
        },
        initialize: function() {
            this.url = '...';
            this.template = _.template($('#tracker_template').html());
            this.model.on('value', this.onValue, this);
        },
        destroy: function() {
            this.model.off('value', this.onValue, this);
        },
        onValue: function(valueSnapshot) {
            console.log('onValue', valueSnapshot.val());
            var val = valueSnapshot.val();
            var url = val.trackable;
            val.time = humaneDate(new Date(val.time));
            val.url = url;
            this.$el.html(this.template(val));
            this.url = url;
        },
        onAddLabel: function(ev) {
            var label = this.$('.input-label').val();

            this.model.child('labels').push(label);
        },
        onCopy: function(ev) {
            console.log('onCopy', this.url);
            clip.setText(this.url);

            var elem = this.$('.copy')[0];
            if(clip.div) {
                clip.receiveEvent('mouseout', null);
                clip.reposition(elem);
            } else {
                clip.glue(elem)
            }
            clip.receiveEvent('mouseover', null);
        },
        render: function() {
            return this;
        }
    });
    return TrackerView;
});
define('view/user',[
    './view',
    './tracker'
], function(View, TrackerView) {
    'use strict';

    var MAGNET_LINK_IDENTIFIER = 'magnet:?xt=urn:btih:';

    var UserView = View.extend({
        events: {
            'click .addTracker': 'onAddTracker'
        },
        initialize: function() {
            this.template = _.template($('#user_template').html());
            this.views = {};
            var user = this.model.get('user');
            this.trackers = this.model.firebase.child('users').child(user.provider).child(user.id).child('trackers');
            setTimeout(_.bind(function() {
                this.trackers.on('child_added', this.onTrackerAdded, this);
                this.trackers.on('child_removed', this.onTrackerRemoved, this);
            }, this));
        },
        destroy: function() {
            this.trackers.off('child_added', this.onTrackerAdded, this);
            this.trackers.off('child_removed', this.onTrackerRemoved, this);
            _.each(this.views, function(view) {
                view.destroy();
                view.remove();
            });
            this.views = {};
        },
        onTrackerAdded: function(dataSnapshot) {
            console.log('onTrackerAdded', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            var tracker = this.model.firebase.child('trackers').child(trackerName);
            var view = new TrackerView({
                model: tracker
            });
            this.views[trackerName] = view;
            this.$('.trackers').append(view.$el);
        },
        onTrackerRemoved: function(dataSnapshot) {
            console.log('onTrackerRemoved', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            var view = this.views[trackerName];
            view.remove();
            delete this.views[trackerName];
        },
        onAddTracker: function(ev) {
            var button = this.$('.btn');
            if(button.hasClass('disabled')) {
                return;
            }
            button.addClass('disabled');
            setTimeout(function() {
                button.removeClass('disabled');
            }, 3000);

            var torrentLink = this.$('.createTorrentLink').val();
            if(!torrentLink) {
                return;
            }
            this.$('.createTorrentLink').val('');            

            $.getJSON('http://api.todium.com', {
                token: this.model.get('user').firebaseAuthToken,
                src: torrentLink
            }).then(function(url) {
                console.log(url);
            });
        },
        render: function() {
            var trackers = this.$('.trackers').children().detach();
            this.$el.html(this.template());
            this.$('.trackers').append(trackers);
        }
    });
    return UserView;
});
define('view/app',[
    './view',
    './login',
    './logout',
    './user'
], function(View, LoginView, LogoutView, UserView) {
    'use strict';

    var AppView = View.extend({
        initialize: function() {
            this.template = _.template($('#app_template').html());

            this.loginView = new LoginView({
                model: this.model
            });
            this.logoutView = new LogoutView({
                model: this.model
            });
            this.onUser();
            this.model.on('change:user', this.onUser, this);
        },
        onUser: function() {
            if(this.model.get('user')) {
                if(!this.userView) {
                    this.userView = new UserView({
                        model: this.model
                    });
                }
            } else {
                if(this.userView) {
                    this.userView.destroy();
                    this.userView = null;   
                }
            }
            this.render();
        },
        render: function() {
            this.$el.html(this.template());

            if(this.userView) {
                this.assign(this.userView, '.user');
            }
            this.assign(this.loginView, '.login');
            this.assign(this.logoutView, '.logout');

            return this;
        }
    });
    return AppView;
});
require.config({
    paths: {
        hm: 'vendor/hm',
        esprima: 'vendor/esprima',
        jquery: 'vendor/jquery.min',
        smoothie: 'vendor/smoothie',
        underscore: 'components/underscore/underscore-min',
        backbone: 'components/backbone/backbone-min',
        humane: 'components/Humane-Dates/humane'
    }
});
 
require(['model/authentication', 'view/app'], function (AuthenticationModel, AppView) {
    'use strict';
    window.authentication = new AuthenticationModel();
    var view = new AppView({
        model: window.authentication
    });
    $('body').append(view.render().el);
});
define("main", function(){});
}());