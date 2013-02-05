define([
    'smoothie',
    './view'
], function(Smoothie, View) {
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
            this.completedSeries = new Smoothie.TimeSeries();
            this.startedSeries = new Smoothie.TimeSeries();
            this.stoppedSeries = new Smoothie.TimeSeries();
            
            this.model.on('change:user', this.onUser, this);
            this.model.firebase.child('stats').on('value', this.onValue, this);
            window.addEventListener('resize', _.bind(this.resizeCanvas, this), false);
            setTimeout(_.bind(this.resizeCanvas, this));
        },
        resizeCanvas: function() {
            this.$('.chart')[0].width = this.$el.parent().innerWidth();
        },
        onValue: function(valueSnapshot) {
            console.log('onValue');
            var value = valueSnapshot.val();
            var completed = value.completed;
            var started = value.started;
            var stopped = value.stopped;
            console.log(completed, started, stopped);
            this.completedSeries.append(new Date().getTime(), completed);
            this.startedSeries.append(new Date().getTime(), started);
            this.stoppedSeries.append(new Date().getTime(), stopped);
        },
        onUser: function() {
            if(this.model.get('user')) {
                this.$el.hide();
            } else {
                this.$el.show();
            }
        },
        render: function() {
            console.log('render');
            this.$el.html(this.template());

            var chart = new Smoothie.SmoothieChart({ 
                millisPerPixel: 100, 
                grid: { 
                    strokeStyle: 'rgba(245, 245, 245, 0.2)',
                    fillStyle:'rgba(255, 255, 255, 0.1)',
                    lineWidth: 1,
                    millisPerLine: 10000, 
                    verticalSections: 4 
                }
            });
            var goal = new Smoothie.TimeSeries();
            goal.append(new Date().getTime(), 100000000000000000)
            var zero = new Smoothie.TimeSeries();
            zero.append(new Date().getTime(), 0);

            chart.addTimeSeries(this.completedSeries, { 
                strokeStyle:'#3A87AD', 
                fillStyle:'rgba(255, 255, 255, 0.1)', 
                lineWidth: 3 
            });
            chart.addTimeSeries(this.startedSeries, { 
                strokeStyle:'green', 
                fillStyle:'rgba(150, 255, 150, 0.1)', 
                lineWidth: 3 
            });
            chart.addTimeSeries(this.stoppedSeries, {
                strokeStyle:'red', 
                fillStyle:'rgba(255, 255, 255, 0.1)', 
                lineWidth: 3 
            });
            chart.addTimeSeries(zero, { lineWidth: 0 });

            chart.streamTo(this.$('.chart')[0], 1000);

            return this;
        }
    });
    return StatsView;
});