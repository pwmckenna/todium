define([
    'smoothie',
    './view'
], function(Smoothie, View) {
    'use strict';

    var bytesToSize = function(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
        if (bytes == 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }

    var StatsView = View.extend({
        initialize: function() {
            _.bindAll(this, 'resizeCanvas');
            this.template = _.template($('#stats_template').html());
            this.completedSeries = new Smoothie.TimeSeries();
            this.startedSeries = new Smoothie.TimeSeries();
            this.stoppedSeries = new Smoothie.TimeSeries();
            this.transferredSeries = new Smoothie.TimeSeries();
            
            this.startedEvents = 0;
            this.completedEvents = 0;
            this.stoppedEvents = 0;
            this.transferred = 0;

            this.model.child('stats').child('completed').on('child_added', this.onTransferredEvent, this);
            this.model.child('stats').child('completed').on('child_added', this.onCompletedEvent, this);
            this.model.child('stats').child('started').on('child_added', this.onStartedEvent, this);
            this.model.child('stats').child('stopped').on('child_added', this.onStoppedEvent, this);
            window.addEventListener('resize', this.resizeCanvas, false);
            setTimeout(_.bind(this.resizeCanvas, this));
        },
        destroy: function() {
            this.model.child('stats').off('value', this.onValue, this);
            window.removeEventListener('resize', this.resizeCanvas, false);
        },
        resizeCanvas: function() {
            this.$('.transferredChart')[0].width = this.$el.parent().innerWidth();
            this.$('.trackerEventChart')[0].width = this.$el.parent().innerWidth();
        },
        onCompletedEvent: function(childSnapshot) {
            var child = childSnapshot.val();
            var time = new Date(child.time).getTime();
            console.log('completed', child.time);
            this.completedSeries.append(time, ++this.completedEvents);
        },
        onStartedEvent: function(childSnapshot) {
            var child = childSnapshot.val();
            var time = new Date(child.time).getTime();
            console.log('started', child.time);
            this.startedSeries.append(time, ++this.startedEvents);
        },
        onStoppedEvent: function(childSnapshot) {
            var child = childSnapshot.val();
            var time = new Date(child.time).getTime();
            console.log('stopped', child.time);
            this.stoppedSeries.append(time, ++this.stoppedEvents);
            console.log(this.stoppedSeries.data.length, 'stopped data points');
        },
        onTransferredEvent: function(childSnapshot) {
            var child = childSnapshot.val();
            this.transferred += child.downloaded;
            this.$('.transferred').text(bytesToSize(this.transferred));
            this.transferredSeries.append(new Date().getTime(), this.transferred);
            console.log(this.transferredSeries.data.length, 'transferred data points');
        },
        renderTrackerEventGraph : function() {
            console.log('renderTrackerEventGraph');
            var chart = new Smoothie.SmoothieChart({ 
                millisPerPixel: 100, 
                grid: { 
                    strokeStyle: 'rgba(245, 245, 245, 0.2)',
                    fillStyle:'rgba(255, 255, 255, 0.0)',
                    lineWidth: 1,
                    millisPerLine: 10000, 
                    verticalSections: 4 
                }
            });
            var goal = new Smoothie.TimeSeries();
            goal.append(new Date().getTime(), 100000000000000000);
            var zero = new Smoothie.TimeSeries();
            zero.append(new Date().getTime(), 0);

            chart.addTimeSeries(this.completedSeries, { 
                strokeStyle:'#3A87AD',
                fillStyle:'rgba(255, 255, 255, 0.0)',
                lineWidth: 3
            });
            chart.addTimeSeries(this.startedSeries, { 
                strokeStyle:'green',
                fillStyle:'rgba(150, 255, 150, 0.0)',
                lineWidth: 3
            });
            chart.addTimeSeries(this.stoppedSeries, {
                strokeStyle:'red',
                fillStyle:'rgba(255, 255, 255, 0.0)',
                lineWidth: 3
            });
            chart.addTimeSeries(zero, { lineWidth: 0 });

            chart.streamTo(this.$('.trackerEventChart')[0], 1000);
        },
        renderTransferredGraph: function() {
            console.log('renderTransferredGraph');
            var chart = new Smoothie.SmoothieChart({ 
                millisPerPixel: 100, 
                grid: { 
                    strokeStyle: 'rgba(245, 245, 245, 0.2)',
                    fillStyle:'rgba(255, 255, 255, 0.0)',
                    lineWidth: 1,
                    millisPerLine: 10000, 
                    verticalSections: 4 
                }
            });
            var zero = new Smoothie.TimeSeries();
            zero.append(new Date().getTime(), 0);

            chart.addTimeSeries(this.transferredSeries, {
                strokeStyle:'#3A87AD',
                fillStyle:'rgba(255, 255, 255, 0.0)',
                lineWidth: 3
            });
            chart.addTimeSeries(zero, { lineWidth: 0 });

            chart.streamTo(this.$('.transferredChart')[0], 1000);
        },
        render: function() {
            console.log('render');
            this.$el.html(this.template({
                transferred: 0
            }));
            this.renderTrackerEventGraph();
            this.renderTransferredGraph();
            return this;
        }
    });
    return StatsView;
});