define([
    './view',
    'underscore',
    'chart'
], function (View, _, Chart) {
    'use strict';
    var HorizonView = View.extend({
        initialize: function () {
            this.template = _.template($('#donut_template').html());

            this.model.child('trackers').on('child_added', this.onTrackerAdded, this);
            this.model.child('trackers').on('child_removed', this.onTrackerRemoved, this);
        },
        destroy: function () {
            this.model.child('trackers').off('child_added', this.onTrackerAdded, this);
            this.model.child('trackers').off('child_removed', this.onTrackerRemoved, this);
        },
        onTrackerAdded: function (dataSnapshot) {
            console.log('onTrackerAdded', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            var tracker = this.model.root().child('trackers').child(trackerName);
        },
        onTrackerRemoved: function (dataSnapshot) {
            console.log('onTrackerRemoved', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
        },
        resize: function () {
            this.render();
        },
        render: function () {
            console.log('render stat');
            this.$el.html(this.template());

            var width = this.$el.get(0).offsetWidth;
            var height = this.$el.get(0).offsetHeight;
            var size = {
                width: width,
                height: height
            };
            this.$('canvas').css(size).attr(size);

            var data = [
                {
                    value: 30,
                    color:"#F7464A"
                },
                {
                    value : 50,
                    color : "#E2EAE9"
                },
                {
                    value : 100,
                    color : "#D4CCC5"
                },
                {
                    value : 40,
                    color : "#949FB1"
                },
                {
                    value : 120,
                    color : "#4D5360"
                }
            ];
            var ctx = this.$('canvas').get(0).getContext('2d');
            new Chart(ctx).Doughnut(data);
            return this;
        }
    });
    return HorizonView;
});
