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

            var info_hash = '???';
            this.model.child('info_hash').once('value', function (valueSnapshot) {
                info_hash = valueSnapshot.val();
            });

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

            var select = this.$('.completed');
            var stat = this.model.child('stats').child('completed');


            select.css('width', width).css('height', height);
            stat.once('value', _.bind(function (valueSnapshot) {
                var val = valueSnapshot.val();
                if (!val) {
                    return;
                }
                var len = _.keys(val).length;
                if (len <= 0) {
                    return;
                }
                var time = _.first(_.values(val)).time;
                var firstTime = new Date(time).getTime();
                if (!this.options.firstDateObserver.has('time') ||
                    this.options.firstDateObserver.get('time') > firstTime
                ) {
                    this.options.firstDateObserver.set('time', firstTime);
                }
                var index = 0;

                var data = _.map(val, function (announce) {
                    return [new Date(announce.time), ++index];
                });
                if (this.options.firstDateObserver.get('time') === firstTime) {
                    console.log('first!');
                } else {
                    console.log('not first');
                    data.unshift([new Date(this.options.firstDateObserver.get('time')), 0]);
                }

                d3.select(select.get(0)).data([data]).call(chart);
            }, this));

            return this;
        }
    });
    return HorizonView;
});
