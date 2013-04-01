define([
    './view',
    'underscore',
    'horizon'
], function (View, _, d3) {
    'use strict';
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
            console.log('render stat');

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

            var width = this.$el.get(0).offsetWidth;
            var height = 25;
            console.log('width', width);
            console.log('height', height);

            var chart = d3.horizon()
                .width(width)
                .height(height)
                .bands(4)
                .mode('mirror')
                .colors(['red', 'white', 'white', 'navy'])
                .interpolate('basis');

            this.$('.completed').css('width', width).css('height', height);
            this.model.child('stats').child('completed').once('value', _.bind(function (valueSnapshot) {
                var val = valueSnapshot.val();
                if (!val) {
                    return;
                }
                var len = _.keys(val).length;
                if (len <= 0) {
                    return;
                }



                if (!this.options.meanCompletedObserver.has(info_hash) ||
                    this.options.meanCompletedObserver.get(info_hash) !== len
                ) {
                    this.options.meanCompletedObserver.set(info_hash, len);
                    console.log('meanCompletedObserver', info_hash, len);
                    return;
                }
                var lens = _.values(this.options.meanCompletedObserver.toJSON());
                var mean = _.reduce(lens, function (memo, num) {
                    return memo + num;
                }, 0) / lens.length / 2;

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
                if (this.options.firstDateObserver.get('time') === firstTime) {
                    console.log('first!');
                } else {
                    console.log('not first');
                    data.unshift([new Date(this.options.firstDateObserver.get('time')), -mean]);
                }


                d3.select(this.$('.completed').get(0)).data([data]).call(chart);
                this.$('.count').text(len);
            }, this));

            return this;
        }
    });
    return HorizonView;
});
