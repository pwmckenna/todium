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
            this.template = _.template($('#transfer_graph_template').html());
            this.transferredSeries = new Smoothie.TimeSeries();
            this.transferred = 0;
            this.render();

            this.model.child('stats').child('completed').on('child_added', this.onTransferredEvent, this);
            window.addEventListener('resize', this.resizeCanvas, false);
            setTimeout(_.bind(this.resizeCanvas, this));
        },
        destroy: function() {
            this.model.child('stats').off('value', this.onValue, this);
            window.removeEventListener('resize', this.resizeCanvas, false);
        },
        resizeCanvas: function() {
            var width = this.$el.parent().innerWidth();
            this.$('.chart')[0].width = width;
            this.$('.chart')[0].height = width / 3;
        },
        onTransferredEvent: function(childSnapshot) {
            var child = childSnapshot.val();
            this.transferred += child.downloaded;
            this.$('.transferred').text(bytesToSize(this.transferred));
            this.transferredSeries.append(new Date().getTime(), this.transferred);
            console.log(this.transferredSeries.data.length, 'transferred data points');
        },
        renderGraph: function() {
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

            chart.streamTo(this.$('.chart')[0], 1000);
        },
        render: function() {
            console.log('render');
            this.$el.html(this.template({
                transferred: bytesToSize(this.transferred)
            }));
            this.renderGraph();
            return this;
        }
    });
    return StatsView;
});