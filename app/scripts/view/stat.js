define([
    './view',
    'chart'
], function (View, Chart) {
    'use strict';
    var StatView = View.extend({
        initialize: function () {
            this.url = '...';
            this.template = _.template($('#stat_template').html());
            this.model.child('stats').on('value', this.onValue, this);
        },
        destroy: function () {
            this.model.child('stats').off('value', this.onValue, this);
        },
        onValue: function (valueSnapshot) {
            console.log('onValue', valueSnapshot.val());
            this.val = valueSnapshot.val();
            this.render();
        },
        resize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(this.template());


            var width = this.$el.get(0).offsetWidth;
            var height = this.$el.get(0).offsetHeight;
            console.log(width, height);
            this.$('canvas').attr('width', width);
            this.$('canvas').attr('width', width);
            this.$('canvas').css('width', width);
            this.$('canvas').css('height', height);


            var value = null;
            this.model.child('stats').once('value', function (valueSnapshot) {
                value = valueSnapshot.val();
            });
            console.log('charting data', value);

            // var canvas = this.$('canvas');
            // var ctx = canvas.get(0).getContext('2d');
            // var chart = new Chart(ctx);

            // var data = {
            //     // labels : ["January","February","March","April","May","June","July"],
            //     // datasets : [
            //     //     {
            //     //         fillColor : "rgba(220,220,220,0.5)",
            //     //         strokeColor : "rgba(220,220,220,1)",
            //     //         pointColor : "rgba(220,220,220,1)",
            //     //         pointStrokeColor : "#fff",
            //     //         data : [65,59,90,81,56,55,40]
            //     //     },
            //     //     {
            //     //         fillColor : "rgba(151,187,205,0.5)",
            //     //         strokeColor : "rgba(151,187,205,1)",
            //     //         pointColor : "rgba(151,187,205,1)",
            //     //         pointStrokeColor : "#fff",
            //     //         data : [28,48,40,19,96,27,100]
            //     //     }
            //     // ]
            // };
            // var options = {
            //     scaleShowLabels: false,
            //     scaleOverlay: false,
            //     pointDot: false
            // };
            // chart.Line(data, options);
            return this;
        }
    });
    return StatView;
});
