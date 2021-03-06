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
            this.model.child('trackers').endAt().limit(1).on('child_added', this.onTrackerAdded, this);
        },
        destroy: function () {
            this.model.child('trackers').endAt().limit(1).off('child_added', this.onTrackerAdded, this);
            _.each(this.views, function (view) {
                view.destroy();
                view.remove();
            });
            this.views = {};
        },
        onTrackerAdded: function (dataSnapshot) {
            var trackerName = dataSnapshot.val();
            console.log('onTrackerAdded', trackerName);
            setTimeout(_.bind(function () {
                var tracker = this.model.parent().parent().child('trackers').child(trackerName);
                var view = new TrackerView({
                    model: tracker
                });
                this.views[trackerName] = view;
                this.$('.trackers').append(view.render().el);
            }, this), 1);
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
            var children = this.$('.trackers').children().detach();
            console.log('children', children.length);
            var name = '';
            this.model.child('name').once('value', function (valueSnapshot) {
                name = valueSnapshot.val();
            });
            this.$el.html(this.template({
                name: name,
            }));
            this.$('.trackers').append(children);
            return this;
        }
    });
    return TrackersView;
});
