define([
    './view',
    './horizon',
    './donut',
    'underscore'
], function (View, HorizonView, DonutView, _) {
    'use strict';

    var StatsView = View.extend({
        initialize: function () {
            this.template = _.template($('#stats_template').html());
            this.views = {};
            this.donutView = new DonutView({
                model: this.model
            });
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
        resize: function () {
            _.each(this.views, function (view) {
                view.resize();
            });
        },
        onTrackerAdded: function (dataSnapshot) {
            console.log('onTrackerAdded', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            var tracker = this.model.root().child('trackers').child(trackerName);
            var view = new HorizonView({
                model: tracker
            });
            this.views[trackerName] = view;
            this.$('.horizons').append(view.render.el);
        },
        onTrackerRemoved: function (dataSnapshot) {
            console.log('onTrackerRemoved', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            var view = this.views[trackerName];
            view.remove();
            delete this.views[trackerName];
        },
        render: function () {
            console.log('render stats');
            var name = '';
            this.model.child('name').once('value', function (valueSnapshot) {
                name = valueSnapshot.val();
            });
            this.$el.html(this.template({
                name: name,
            }));
            this.assign(this.donutView, '.donuts');
            _.each(this.views, function (view) {
                this.$('.horizons').append(view.render().el);
            }, this);
            return this;
        }
    });
    return StatsView;
});
