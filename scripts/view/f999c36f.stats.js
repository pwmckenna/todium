define([
    'jquery',
    'underscore',
    'smoothie',
    './view'
], function($, _, Smoothie, View) {
    'use strict';

    var bytesToSize = function(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
        if (bytes == 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return (bytes / Math.pow(1024, i)).toFixed(8) + ' ' + sizes[i];
    }

    var StatsView = View.extend({
        initialize: function() {
            this.template = _.template($('#stats_template').html());
            this.series = new Smoothie.TimeSeries();

            this.model.on('change:user', this.onUser, this);
            this.model.firebase.child('transferred').on('value', this.onValue, this);

        },
        onValue: function(valueSnapshot) {
            var transferredDays = valueSnapshot.val();
            var total = 0;
            _.each(transferredDays, function(amount) {
                total = amount;
            });
            console.log('onValue', 'total', total)
            this.series.append(new Date().getTime(), total);
        },
        onUser: function() {
            if(this.model.get('user')) {
                this.$el.hide();
            } else {
                this.$el.show();
            }
        },
        render: function() {
            this.$el.html(this.template());

            var chart = new Smoothie.SmoothieChart({ millisPerPixel: 100, grid: { strokeStyle: '#555555', lineWidth: 1, millisPerLine: 10000, verticalSections: 10 }});
            var goal = new Smoothie.TimeSeries();
            goal.append(new Date().getTime(), 100000000000000000)

            chart.addTimeSeries(this.series, { strokeStyle:'rgb(0, 255, 0)', fillStyle: 'rgba(255, 255, 255, 0.2)', lineWidth: 5 });
            chart.addTimeSeries(goal, { fillStyle: 'rgba(255, 255, 255, 0.1)', lineWidth: 5 });
            chart.streamTo(this.$('.chart')[0], 1000);

            return this;
        }
    });
    return StatsView;
});