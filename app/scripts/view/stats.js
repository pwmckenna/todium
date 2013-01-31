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
            window.addEventListener('resize', _.bind(this.resizeCanvas, this), false);
            setTimeout(_.bind(this.resizeCanvas, this));
        },
        resizeCanvas: function() {
            this.$('.chart')[0].width = this.$el.parent().innerWidth();
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

            var chart = new Smoothie.SmoothieChart({ 
                millisPerPixel: 100, 
                grid: { 
                    strokeStyle: '#F8F8F8',
                    fillStyle:'#FFF',
                    lineWidth: 1, 
                    millisPerLine: 10000, 
                    verticalSections: 4 
                }
            });
            var goal = new Smoothie.TimeSeries();
            goal.append(new Date().getTime(), 100000000000000000)
            var zero = new Smoothie.TimeSeries();
            zero.append(new Date().getTime(), 0);
            chart.addTimeSeries(this.series, { strokeStyle:'rgba(134, 202, 250, 0.5)', fillStyle: 'rgba(134, 202, 250, 0.2)', lineWidth: 1 });
            //chart.addTimeSeries(goal, { lineWidth: 0 });
            //chart.addTimeSeries(zero, { lineWidth: 0 });
            chart.streamTo(this.$('.chart')[0], 1000);

            return this;
        }
    });
    return StatsView;
});