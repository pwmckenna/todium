define([
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