define([
    'jquery',
    'underscore',
    './view',
    './tracker'
], function($, _, View, TrackerView) {
    'use strict';
    var LoggedInView = View.extend({
        events: {
            'click .addTracker': 'onAddTracker'
        },
        initialize: function() {
            _.bindAll(this, 'onTrackerAdded');
            this.template = _.template($('#logged_in_template').html());
            this.model.on('change:user', this.onUser, this);
            this.views = [];
        },
        onTrackerAdded: function(dataSnapshot) {
            var trackerName = dataSnapshot.val();
            var tracker = this.model.firebase.child('trackers').child(trackerName);
            var view = new TrackerView({
                model: tracker
            });
            this.views[tracker] = view;
            this.$('.trackers').append(view.$el);
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

            var magnetLink = this.$('.createTorrentLink').val();
            if(!magnetLink) {
                return;
            }
            this.$('.createTorrentLink').val('');            

            var magnetLinkIdentifier = 'magnet:?xt=urn:btih:';
            if(magnetLink.indexOf(magnetLinkIdentifier) !== 0) {
                console.log('bad torrent link');
                return;
            }

            var user = this.model.get('user');
            var info_hash = magnetLink.substr(magnetLinkIdentifier.length, 40);
            var globalTracker = this.model.firebase.child('users').child(user.id).child('trackers').push();
            console.log('tracker id', globalTracker.name());
            console.log('info_hash', info_hash);


            var userTracker = this.model.firebase.child('trackers').push();
            magnetLink += '&tr=http://featureable.herokuapp.com/' + userTracker.name() + '/announce';
            userTracker.set({
                owner: this.model.get('user').id,
                info_hash: info_hash,
                completed: 0,
                size: 0,
                url: magnetLink,
                labels: []
            });
            globalTracker.set(userTracker.name());

        },
        onUser: function() {
            var user = this.model.get('user');
            if(user) {
                this.model.firebase.child('users').child(user.id).child('trackers').on('child_added', this.onTrackerAdded);
            }
            this.render();
        },
        render: function() {
            this.$el.html(this.template());
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