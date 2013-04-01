define([
    './view',
    'underscore',
    'horizon'
], function (View, _, d3) {
    'use strict';
    var median = function (values) {
        values.sort(function (a, b) {
            return a - b;
        });
        var half = Math.floor(values.length / 2);
        if (values.length % 2) {
            return values[half];
        } else {
            return (values[half - 1] + values[half]) / 2.0;
        }
    };

    var HorizonView = View.extend({
        initialize: function () {
            this.template = _.template($('#horizon_template').html());
            this.model.child('stats').on('value', this.render, this);
            this.model.child('info_hash').on('value', this.render, this);
            this.options.firstDateObserver.on('change:time', this.render, this);
            this.options.meanCompletedObserver.on('change', this.render, this);
        },
        destroy: function () {
            this.model.child('stats').off('value', this.render, this);
            this.model.child('info_hash').off('value', this.render, this);
            this.options.firstDateObserver.off('change:time', this.render, this);
        },
        resize: function () {
            this.render();
        },
        render: function () {
            var info_hash;
            this.model.child('info_hash').once('value', function (valueSnapshot) {
                info_hash = valueSnapshot.val();
            });
            if (!info_hash) {
                return this;
            }

            this.$el.html(this.template({
                info_hash: info_hash
            }));

            var width = this.$el.get(0).offsetWidth - 50;
            var height = 30;

            var chart = d3.horizon()
                .width(width)
                .height(height)
                .bands(5)
                .mode('mirror')
                .colors(['red', 'white', 'white', 'navy']);

            this.$('.completed').css('width', width).css('height', height);
            this.model.child('stats').child('started').once('value', _.bind(function (valueSnapshot) {
                var val = valueSnapshot.val();
                var len = _.keys(val || {}).length;


                if (!this.options.meanCompletedObserver.has(info_hash) ||
                    this.options.meanCompletedObserver.get(info_hash) !== len
                ) {
                    this.options.meanCompletedObserver.set(info_hash, len);
                    console.log('meanCompletedObserver', info_hash, len);
                    return;
                }

                if (!val || len <= 0) {
                    this.$('.count').text(len);
                    return;
                }









                var lens = _.values(this.options.meanCompletedObserver.toJSON());
                var mean = median(lens);
                var time = _.first(_.values(val)).time;
                var firstTime = new Date(time).getTime();
                if (!this.options.firstDateObserver.has('time') ||
                    this.options.firstDateObserver.get('time') > firstTime
                ) {
                    this.options.firstDateObserver.set('time', firstTime);
                    return;
                }



                var index = 0;
                var data = _.map(val, function (announce) {
                    return [new Date(announce.time), ++index - mean];
                });
                if (this.options.firstDateObserver.get('time') !== firstTime) {
                    data.unshift([new Date(firstTime - 1), 0]);
                    data.unshift([new Date(this.options.firstDateObserver.get('time')), 0]);
                }


                d3.select(this.$('.completed').get(0)).data([data]).call(chart);
                this.$('.count').text(len);
            }, this));

            return this;
        }
    });
    return HorizonView;
});
