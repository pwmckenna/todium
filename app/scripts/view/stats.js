define(['./view'], function (View) {
    'use strict';
    var StatsView = View.extend({
    	initialize: function() {
    		this.val = {};
    		this.model.on('value', this.onValue, this);
    	},
    	onValue: function(valueSnapshot) {
			this.val = valueSnapshot.val() || {};
    		console.log('stats onValue', this.val);
			this.render();
    	},
    	destroy: function() {
    		this.model.off('value', this.onValue, this);
    	},
    	render: function() {
    		this.$el.empty();
    		console.log('statsview render');
    		var elem = this.$el;
    		var val = this.val;

			var startedcount = 0;
		    var started = _.map(val.hasOwnProperty('started') ? val.started : [], function (stat) {
		        var date = new Date(stat.time).getTime();
		        return [date, ++startedcount];
		    });
		    started.push([new Date().getTime(), started.length ? _.last(started)[1] : 0]);

		    var stoppedcount = 0;
		    var stopped = _.map(val.hasOwnProperty('stopped') ? val.stopped : [], function (stat) {
		        var date = new Date(stat.time).getTime();
		        return [date, ++stoppedcount];
		    });
		    stopped.push([new Date().getTime(), stopped.length ? _.last(stopped)[1] : 0]);

		    var completedcount = 0;
		    var completed = _.map(val.hasOwnProperty('completed') ? val.completed : [], function (stat) {
		        var date = new Date(stat.time).getTime();
		        return [date, ++completedcount];
		    });
		    completed.push([new Date().getTime(), completed.length ? _.last(completed)[1] : 0]);


		    var max = Math.max(startedcount, stoppedcount, completedcount);
		    console.log(startedcount, stoppedcount, completedcount);
		    console.log(started, stopped, completed);
		    var height = 20 * Math.floor(max ? Math.log(max) : 1);

		    var chartMax = Math.floor(max * 1.2);

		    elem.sparkline(started, {
		        width: '100%',
		        height: height + 'px',
		        fillColor: false,
		        lineColor: 'green',
		        chartRangeMin: 0,
		        chartRangeMax: chartMax
		    });
		    elem.sparkline(stopped, {
		        composite: true,
		        fillColor: false,
		        lineColor: 'red',
		        chartRangeMin: 0,
		        chartRangeMax: chartMax
		    });
		    elem.sparkline(completed, {
		        composite: true,
		        fillColor: false,
		        lineColor: 'blue',
		        chartRangeMin: 0,
		        chartRangeMax: chartMax
		    });    

    		return this;
    	}
    });
    return StatsView;
});