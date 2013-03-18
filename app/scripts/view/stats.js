define([
    './view',
    './stat',
    'underscore'
], function (View, StatView, _) {
    'use strict';

    var StatsView = View.extend({
        initialize: function () {
            this.template = _.template($('#stats_template').html());
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
        resize: function () {
            _.each(this.views, function (view) {
                view.resize();
            });
        },
        onTrackerAdded: function (dataSnapshot) {
            var _this = this;
            setTimeout(function () {
                console.log('onTrackerAdded', dataSnapshot.val());
                var trackerName = dataSnapshot.val();
                var tracker = _this.model.root().child('trackers').child(trackerName);
                var view = new StatView({
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
    return StatsView;
});
