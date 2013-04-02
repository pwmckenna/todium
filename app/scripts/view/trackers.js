define([
    './view',
    './tracker',
    'underscore'
], function (View, TrackerView, _) {
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
            console.log('onTrackerAdded', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            var tracker = this.model.parent().parent().child('trackers').child(trackerName);
            this.views[trackerName] = new TrackerView({
                model: tracker
            });
            this.render();
        },
        onTrackerRemoved: function (dataSnapshot) {
            console.log('onTrackerRemoved', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            var view = this.views[trackerName];
            view.remove();
            delete this.views[trackerName];
        },
        onAddTracker: function (ev) {
            ev.preventDefault();

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
                $.post('http://api.todium.com', {
                    id: this.model.name(),
                    secret: secret,
                    src: torrentLink
                }).then(function (url) {
                    console.log(url);
                });
            }, this);
        },
        render: function () {
            console.log('render trackers');
            var name = '';
            this.model.child('name').once('value', function (valueSnapshot) {
                name = valueSnapshot.val();
            });
            this.$el.html(this.template({
                name: name,
            }));
            _.each(this.views, function (view) {
                this.$('.trackers').append(view.render().el);
            }, this);
            return this;
        }
    });
    return TrackersView;
});
