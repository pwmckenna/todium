define([
    './view',
    './tracker',
    './api',
    './owners'
], function (View, TrackerView, ApiView, OwnersView) {
    'use strict';

    var CampaignView = View.extend({
        events: {
            'click .addTracker': 'onAddTracker'
        },
        initialize: function () {
            this.template = _.template($('#campaign_template').html());
            this.views = {};
            this.apiView = new ApiView({
                model: this.model
            });
            this.ownersView = new OwnersView({
                model: this.model
            });
            setTimeout(_.bind(function () {
                this.model.child('trackers').on('child_added', this.onTrackerAdded, this);
                this.model.child('trackers').on('child_removed', this.onTrackerRemoved, this);
                this.model.on('value', this.render, this);
            }, this));
        },
        destroy: function () {
            this.model.child('trackers').off('child_added', this.onTrackerAdded, this);
            this.model.child('trackers').off('child_removed', this.onTrackerRemoved, this);
            this.model.off('value', this.render, this);
            this.apiView.destroy();
            this.apiView.remove();
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
            var id = this.model.name();
            var secret = '';
            this.model.once('value', function (valueSnapshot) {
                var val = valueSnapshot.val();
                name = val.name;
                secret = val.secret;
            });

            this.$el.html(this.template({
                name: name,
                id: id,
                secret: secret
            }));
            this.$('.trackers').append(trackers);
            this.assign(this.apiView, '.api');
            this.assign(this.ownersView, '.owners');
            return this;
        }
    });
    return CampaignView;
});
