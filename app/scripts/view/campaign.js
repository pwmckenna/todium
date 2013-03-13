define([
    './view',
    './tracker'
], function (View, TrackerView) {
    'use strict';

    var CampaignView = View.extend({
        events: {
            'click .addTracker': 'onAddTracker'
        },
        initialize: function () {
            this.template = _.template($('#campaign_template').html());
            this.views = {};
            setTimeout(_.bind(function () {
                this.model.child('trackers').on('child_added', this.onTrackerAdded, this);
                this.model.child('trackers').on('child_removed', this.onTrackerRemoved, this);
            }, this));
        },
        destroy: function () {
            this.model.child('trackers').off('child_added', this.onTrackerAdded, this);
            this.model.child('trackers').off('child_removed', this.onTrackerRemoved, this);
            _.each(this.views, function (view) {
                view.destroy();
                view.remove();
            });
            this.views = {};
        },
        onTrackerAdded: function (dataSnapshot) {
            console.log('onTrackerAdded', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            var tracker = this.model.parent().parent().child('trackers').child(trackerName);
            var view = new TrackerView({
                model: tracker
            });
            this.views[trackerName] = view;
            this.$('.trackers').append(view.$el);
        },
        onTrackerRemoved: function (dataSnapshot) {
            console.log('onTrackerRemoved', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            var view = this.views[trackerName];
            view.remove();
            delete this.views[trackerName];
        },
        onAddTracker: function () {
            var button = this.$('.btn');
            if (button.hasClass('disabled')) {
                return;
            }
            button.addClass('disabled');
            setTimeout(function () {
                button.removeClass('disabled');
            }, 3000);

            var torrentLink = this.$('.createTorrentLink').val();
            if (!torrentLink) {
                return;
            }
            this.$('.createTorrentLink').val('');

            this.model.child('secret').once('value', function (secretSnapshot) {
                var secret = secretSnapshot.val();
                $.getJSON('http://localhost:5000', { //http://api.todium.com', {
                    id: this.model.name(),
                    secret: secret,
                    src: torrentLink
                }).then(function (url) {
                    console.log(url);
                });
            }, this);
        },
        render: function () {
            this.model.child('name').once('value', function (nameSnapshot) {
                var trackers = this.$('.trackers').children().detach();
                this.$el.html(this.template({
                    name: nameSnapshot.val()
                }));
                this.$('.trackers').append(trackers);
            }, this);
            return this;
        }
    });
    return CampaignView;
});
