define([
    './view',
    'underscore',
    'horizon'
], function (View, _, d3) {
    'use strict';
    var HorizonView = View.extend({
        initialize: function () {
            this.url = '...';
            this.template = _.template($('#stat_template').html());
            this.model.child('stats').on('value', this.onValue, this);
        },
        destroy: function () {
            this.model.child('stats').off('value', this.onValue, this);
        },
        onValue: function (valueSnapshot) {
            this.val = valueSnapshot.val();
            this.render();
        },
        resize: function () {
            this.render();
        },
        render: function () {
            console.log('render stat');
            this.$el.html(this.template());


            var width = this.$el.get(0).offsetWidth;
            var height = this.$el.get(0).offsetHeight;

            var value = null;
            this.model.child('stats').once('value', function (valueSnapshot) {
                value = valueSnapshot.val();
            });

            var chart = d3.horizon()
                .width(width)
                .height(height)
                .bands(4)
                .mode('mirror')
                .interpolate('basis');

            var elem = this.$('svg').get(0);
            this.$('svg').css('width', width).css('height', height);
            var svg = d3.select(elem);
            var data = JSON.parse('{"year":[2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2001,2001,2001,2001,2001,2001,2001,2001,2001,2001,2001,2001,2002,2002,2002,2002,2002,2002,2002,2002,2002,2002,2002,2002,2003,2003,2003,2003,2003,2003,2003,2003,2003,2003,2003,2003,2004,2004,2004,2004,2004,2004,2004,2004,2004,2004,2004,2004,2005,2005,2005,2005,2005,2005,2005,2005,2005,2005,2005,2005,2006,2006,2006,2006,2006,2006,2006,2006,2006,2006,2006,2006,2007,2007,2007,2007,2007,2007,2007,2007,2007,2007,2007,2007,2008,2008,2008,2008,2008,2008,2008,2008,2008,2008,2008,2008,2009,2009,2009,2009,2009,2009,2009,2009,2009,2009,2009,2009,2010,2010],"month":[1,2,3,4,5,6,7,8,9,10,11,12,1,2,3,4,5,6,7,8,9,10,11,12,1,2,3,4,5,6,7,8,9,10,11,12,1,2,3,4,5,6,7,8,9,10,11,12,1,2,3,4,5,6,7,8,9,10,11,12,1,2,3,4,5,6,7,8,9,10,11,12,1,2,3,4,5,6,7,8,9,10,11,12,1,2,3,4,5,6,7,8,9,10,11,12,1,2,3,4,5,6,7,8,9,10,11,12,1,2,3,4,5,6,7,8,9,10,11,12,1,2],"rate":[4.5,4.4,4.3,3.7,3.8,4.1,4.2,4.1,3.8,3.6,3.7,3.7,4.7,4.6,4.5,4.2,4.1,4.7,4.7,4.9,4.7,5,5.3,5.4,6.3,6.1,6.1,5.7,5.5,6,5.9,5.7,5.4,5.3,5.6,5.7,6.5,6.4,6.2,5.8,5.8,6.5,6.3,6,5.8,5.6,5.6,5.4,6.3,6,6,5.4,5.3,5.8,5.7,5.4,5.1,5.1,5.2,5.1,5.7,5.8,5.4,4.9,4.9,5.2,5.2,4.9,4.8,4.6,4.8,4.6,5.1,5.1,4.8,4.5,4.4,4.8,5,4.6,4.4,4.1,4.3,4.3,5,4.9,4.5,4.3,4.3,4.7,4.9,4.6,4.5,4.4,4.5,4.8,5.4,5.2,5.2,4.8,5.2,5.7,6,6.1,6,6.1,6.5,7.1,8.5,8.9,9,8.6,9.1,9.7,9.7,9.6,9.5,9.5,9.4,9.7,10.6,10.4]}');

            // Offset so that positive is above-average and negative is below-average.
            var mean = data.rate.reduce(function (p, v) { return p + v; }, 0) / data.rate.length;

            // Transpose column values to rows.
            data = data.rate.map(function (rate, i) {
                return [Date.UTC(data.year[i], data.month[i] - 1), rate - mean];
            });

            // Render the chart.
            svg.data([data]).call(chart);



            return this;
        }
    });
    return HorizonView;
});
