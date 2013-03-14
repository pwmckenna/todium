define([
    './view',
    './tracker'
], function (View, TrackerView) {
    'use strict';

    var TrackersView = View.extend({
        events: {
            'click .addTracker': 'onAddTracker'
        },
        initialize: function () {
            this.template = _.template($('#trackers_template').html());
            this.views = {};
            this.model.child('trackers').on('child_added', this.onTrackerAdded, this);
            this.model.child('trackers').on('child_removed', this.onTrackerRemoved, this);
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
            var _this = this;
            setTimeout(function () {
                console.log('onTrackerAdded', dataSnapshot.val());
                var trackerName = dataSnapshot.val();
                var tracker = _this.model.parent().parent().child('trackers').child(trackerName);
                var view = new TrackerView({
                    model: tracker
                });
                _this.views[trackerName] = view;
                _this.$('.trackers').append(view.$el);
            });
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
                $.getJSON('http://api.todium.com', {
                    id: this.model.name(),
                    secret: secret,
                    src: torrentLink
                }).then(function (url) {
                    console.log(url);
                });
            }, this);
        },
        render: function () {
            var trackers = this.$('.trackers').children().detach();

            var name = '';
            this.model.child('name').once('value', function (valueSnapshot) {
                name = valueSnapshot.val();
            });
            this.$el.html(this.template({
                name: name,
            }));
            this.$('.trackers').append(trackers);
            return this;
        }
    });
    return TrackersView;
});