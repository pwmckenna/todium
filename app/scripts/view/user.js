define([
    'jquery',
    'underscore',
    './view',
    './tracker'
], function($, _, View, TrackerView) {
    'use strict';

    var MAGNET_LINK_IDENTIFIER = 'magnet:?xt=urn:btih:';

    var LoggedInView = View.extend({
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
        addMagnetLink: function(magnetLink) {
            var info_hash = magnetLink.substr(MAGNET_LINK_IDENTIFIER.length, 40);
            var user = this.model.get('user');
            var globalTracker = this.model.firebase.child('users').child(user.provider).child(user.id).child('trackers').push();
            var userTracker = this.model.firebase.child('trackers').push();
            magnetLink += '&tr=http://tracker.todium.com/' + userTracker.name() + '/announce';
            userTracker.set({
                owner: this.model.get('user').id,
                info_hash: info_hash,
                completed: 0,
                transferred: 0,
                url: magnetLink,
                labels: []
            });
            globalTracker.set(userTracker.name());
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

            if(torrentLink.indexOf(MAGNET_LINK_IDENTIFIER) === 0) {
                this.addMagnetLink(torrentLink);
            } else {
                var hashRequest = $.getJSON('http://hasher.todium.com?torrent=' + torrentLink);
                hashRequest.then(_.bind(function(info_hash) {
                    this.addMagnetLink(MAGNET_LINK_IDENTIFIER + info_hash);
                }, this));
            } 
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
    return LoggedInView;
});