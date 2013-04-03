define([
    './view',
    'underscore',
    'chart'
], function (View, _, Chart) {
    'use strict';
    var DonutView = View.extend({
        initialize: function () {
            this.template = _.template($('#donut_template').html());

            this.model.child('trackers').on('child_added', this.onTrackerAdded, this);
            this.model.child('trackers').on('child_removed', this.onTrackerRemoved, this);

            this.started = this.stopped = this.completed = 0;
        },
        destroy: function () {
            this.model.child('trackers').off('child_added', this.onTrackerAdded, this);
            this.model.child('trackers').off('child_removed', this.onTrackerRemoved, this);
        },
        onTrackerAdded: function (dataSnapshot) {
            console.log('onTrackerAdded', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            var tracker = this.model.root().child('trackers').child(trackerName);
            tracker.child('stats').once('value', _.bind(function (valueSnapshot) {
                var val = valueSnapshot.val();
                if (val) {
                    if (val.hasOwnProperty('started')) {
                        this.started += _.keys(val.started).length;
                    }
                    if (val.hasOwnProperty('stopped')) {
                        this.stopped += _.keys(val.stopped).length;
                    }
                    if (val.hasOwnProperty('completed')) {
                        this.completed += _.keys(val.completed).length;
                    }
                    this.render();
                }
            }, this));
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
            this.$el.html(this.template({
                started: this.started,
                stopped: this.stopped,
                completed: this.completed
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
                    value : this.started,
                    color : '#E2EAE9'
                },
                {
                    value: this.stopped,
                    color: '#F7464A'
                },
                {
                    value : this.completed,
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
    return DonutView;
});
