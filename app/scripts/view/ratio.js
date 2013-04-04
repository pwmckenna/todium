define([
    './view',
    'underscore',
    'chart'
], function (View, _, Chart) {
    'use strict';
    var RatioView = View.extend({
        initialize: function () {
            this.template = _.template($('#ratio_template').html());

            this.model.child('trackers').on('child_added', this.onTrackerAdded, this);
            this.model.child('trackers').on('child_removed', this.onTrackerRemoved, this);

            this.started = {};
            this.stopped = {};
            this.completed = {};
        },
        destroy: function () {
            this.model.child('trackers').off('child_added', this.onTrackerAdded, this);
            this.model.child('trackers').off('child_removed', this.onTrackerRemoved, this);
        },
        onTrackerValue: function (trackerName, valueSnapshot) {
            var val = valueSnapshot.val();
            if (val) {
                if (val.hasOwnProperty('started')) {
                    this.started[trackerName] = _.keys(val.started).length;
                }
                if (val.hasOwnProperty('stopped')) {
                    this.stopped[trackerName] = _.keys(val.stopped).length;
                }
                if (val.hasOwnProperty('completed')) {
                    this.completed[trackerName] = _.keys(val.completed).length;
                }
                this.render();
            }
        },
        onTrackerAdded: function (dataSnapshot) {
            console.log('onTrackerAdded', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            var tracker = this.model.root().child('trackers').child(trackerName);
            tracker.child('stats').on('value', _.partial(this.onTrackerValue, trackerName), this);
        },
        onTrackerRemoved: function (dataSnapshot) {
            console.log('onTrackerRemoved', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            console.log(trackerName);
        },
        resize: function () {
            this.render();
        },
        render: function () {
            var started = _(this.started).values().reduce(function (memo, num) {
                return memo + num;
            }, 0);
            var stopped = _(this.stopped).values().reduce(function (memo, num) {
                return memo + num;
            }, 0);
            var completed = _(this.completed).values().reduce(function (memo, num) {
                return memo + num;
            }, 0);
            this.$el.html(this.template({
                started: started,
                stopped: stopped,
                completed: completed
            }));
            var width = this.$el.get(0).offsetWidth - 200;
            var height = this.$el.get(0).offsetHeight;
            var size = {
                width: width,
                height: height
            };
            this.$('canvas').css(size).attr(size);
            var data = [
                {
                    value : started,
                    color : '#E2EAE9'
                },
                {
                    value: stopped,
                    color: '#F7464A'
                },
                {
                    value : completed,
                    color : '#4D5360'
                }
            ];
            var ctx = this.$('canvas').get(0).getContext('2d');
            new Chart(ctx).Doughnut(data, {
                animation: false
            });
            return this;
        }
    });
    return RatioView;
});
