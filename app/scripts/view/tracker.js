define([
    './view'
], function (View) {
    'use strict';

    var clip = new ZeroClipboard.Client();
    clip.setHandCursor(true);
    clip.addEventListener('complete', function () {
        var linkElem = $(clip.domElement).prev();
        linkElem.attr('value', ' Copied to clipboard!');
        setTimeout(function () {
            linkElem.attr('value', linkElem.attr('url'));
        }, 1000);
    });

    // var bytesToSize = function (bytes) {
    //     var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
    //     if (bytes === 0) {
    //         return 'n/a';
    //     }
    //     var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    //     return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    // };


    var TrackerView = View.extend({
        events: {
            'mouseover .copy': 'onCopy',
            'click .button-label': 'onAddLabel'
        },
        initialize: function () {
            this.url = '...';
            this.template = _.template($('#tracker_template').html());
            this.model.on('value', this.onValue, this);
        },
        destroy: function () {
            this.model.off('value', this.onValue, this);
        },
        onValue: function (valueSnapshot) {
            console.log('onValue', valueSnapshot.val());
            var val = valueSnapshot.val();
            var url = val.trackable;
            val.url = url;

            var startedcount = 0;
            var started = _.map(val.hasOwnProperty('stats') && val.stats.hasOwnProperty('started') ? val.stats.started : [], function (stat) {
                var date = new Date(stat.time).getTime();
                return [date, ++startedcount];
            });
            started.unshift([new Date(val.time).getTime(), 0]);
            started.push([new Date().getTime(), _.last(started)[1]]);

            var stoppedcount = 0;
            var stopped = _.map(val.hasOwnProperty('stats') && val.stats.hasOwnProperty('stopped') ? val.stats.stopped : [], function (stat) {
                var date = new Date(stat.time).getTime();
                return [date, ++stoppedcount];
            });
            stopped.unshift([new Date(val.time).getTime(), 0]);
            stopped.push([new Date().getTime(), _.last(stopped)[1]]);

            var completedcount = 0;
            var completed = _.map(val.hasOwnProperty('stats') && val.stats.hasOwnProperty('completed') ? val.stats.completed : [], function (stat) {
                var date = new Date(stat.time).getTime();
                return [date, ++completedcount];
            });
            completed.unshift([new Date(val.time).getTime(), 0]);
            completed.push([new Date().getTime(), _.last(completed)[1]]);


            val.time = humaneDate(new Date(val.time));
            this.$el.html(this.template(val));

            var max = Math.max(startedcount, stoppedcount, completedcount);
            var height = 20 * Math.floor(max ? Math.log(max) : 1);

            var chartMax = Math.floor(max * 1.2);

            this.$('.sparkline').sparkline(started, {
                width: '100%',
                height: height + 'px',
                fillColor: false,
                lineColor: 'green',
                chartRangeMin: 0,
                chartRangeMax: chartMax
            });
            this.$('.sparkline').sparkline(stopped, {
                composite: true,
                fillColor: false,
                lineColor: 'red',
                chartRangeMin: 0,
                chartRangeMax: chartMax
            });
            this.$('.sparkline').sparkline(completed, {
                composite: true,
                fillColor: false,
                lineColor: 'blue',
                chartRangeMin: 0,
                chartRangeMax: chartMax
            });
            this.url = url;
        },
        onAddLabel: function () {
            var label = this.$('.input-label').val();

            this.model.child('labels').push(label);
        },
        onCopy: function () {
            console.log('onCopy', this.url);
            clip.setText(this.url);

            var elem = this.$('.copy')[0];
            if (clip.div) {
                clip.receiveEvent('mouseout', null);
                clip.reposition(elem);
            } else {
                clip.glue(elem);
            }
            clip.receiveEvent('mouseover', null);
        },
        render: function () {
            return this;
        }
    });
    return TrackerView;
});