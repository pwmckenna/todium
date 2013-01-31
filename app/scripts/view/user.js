define([
    'jquery',
    'underscore',
    './view',
    './tracker'
], function($, _, View, TrackerView) {
    'use strict';

    var MAGNET_LINK_IDENTIFIER = 'magnet:?xt=urn:btih:';

    var UserView = View.extend({
        events: {
            'click .addTracker': 'onAddTracker'
        },
        initialize: function() {
            this.template = _.template($('#user_template').html());
            this.model.on('change:user', this.onUser, this);
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
        onUser: function() {
            console.log('onUser', this.model.get('user'));
            var user = this.model.get('user');
            if(user) {
                var trackers = this.model.firebase.child('users').child(user.provider).child(user.id).child('trackers');
                trackers.on('child_added', this.onTrackerAdded, this);
                trackers.on('child_removed', this.onTrackerRemoved, this);
                if(this.removeCallbacks) {
                    throw 'leaking callbacks';
                }
                this.removeCallbacks = _.bind(function() {
                    trackers.off('child_added', this.onTrackerAdded, this);
                    trackers.off('child_removed', this.onTrackerRemoved, this);                    
                }, this);
            } else if(this.removeCallbacks) {
                _.each(this.views, function(view) {
                    view.destroy();
                    view.remove();
                });
                this.views = {};
                this.removeCallbacks();
                this.removeCallbacks = undefined;
            }
            this.render();
        },
        render: function() {
            var trackers = this.$('.trackers').children().detach();
            this.$el.html(this.template());
            this.$('.trackers').append(trackers);

            if(this.model.get('user')) {
                this.$el.show();
            } else {
                this.$el.hide();
            }
            return this;
        }
    });
    return UserView;
});