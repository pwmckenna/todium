define([
    './view',
    'underscore',
    'chart'
], function (View, _, Chart) {
    'use strict';
    var GranularView = View.extend({
        initialize: function () {
            this.template = _.template($('#granular_template').html());
            this.model.on('change', this.render, this);
        },
        resize: function () {
            this.render();
        },
        renderSharesPer: function () {
            var width = this.$el.get(0).offsetWidth;
            var height = 200;
            var size = {
                width: width,
                height: height
            };
            this.$('.sharesper').css(size).attr(size);


            var torrentStarts = this.model.get('started').values();
            if (torrentStarts.length === 0) {
                return this;
            }

            var startCounts = _.map(torrentStarts, function (starts) {
                return _.keys(starts).length;
            });

            var numStartCounts = _.countBy(startCounts);
            // {
            //     67: 1
            // }
            var data = _.pairs(numStartCounts);
            data.unshift(['Torrents', 'Shares']);

            var table = google.visualization.arrayToDataTable(data);

            var options = {
                hAxis: {
                    title: 'Torrents',
                    titleTextStyle: {
                        color: '#ccc'
                    },
                    textStyle: {
                        color: '#ccc'
                    }
                },
                vAxis: {
                    title: 'Shares',
                    titleTextStyle: {
                        color: '#ccc'
                    },
                    textStyle: {
                        color: '#ccc'
                    }
                },
                backgroundColor: '#333',
                legend: {
                    position: 'none'
                }
            };
            var chart = new google.visualization.ColumnChart(this.$('.sharesper').get(0));
            chart.draw(table, options);
        },
        renderRatio: function () {
            var width = this.$el.get(0).offsetWidth;
            var height = 200;
            var size = {
                width: width,
                height: height
            };
            this.$('.ratio').css(size).attr(size);


            var started = this.model.get('started').values().reduce(function (memo, nums) {
                return memo + _.keys(nums).length;
            }, 0);
            var stopped = this.model.get('stopped').values().reduce(function (memo, nums) {
                return memo + _.keys(nums).length;
            }, 0);
            var completed = this.model.get('completed').values().reduce(function (memo, nums) {
                return memo + _.keys(nums).length;
            }, 0);
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
            var ctx = this.$('.ratio').get(0).getContext('2d');
            new Chart(ctx).Doughnut(data, {
                animation: false
            });
        },
        render: function () {
            var started = this.model.get('started').values().reduce(function (memo, nums) {
                return memo + _.keys(nums).length;
            }, 0);
            var stopped = this.model.get('stopped').values().reduce(function (memo, nums) {
                return memo + _.keys(nums).length;
            }, 0);
            var completed = this.model.get('completed').values().reduce(function (memo, nums) {
                return memo + _.keys(nums).length;
            }, 0);
            this.$el.html(this.template({
                started: started,
                stopped: stopped,
                completed: completed
            }));
            this.renderRatio();
            this.renderSharesPer();
            return this;
        }
    });
    return GranularView;
});
