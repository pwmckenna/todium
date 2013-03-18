define([
    './view',
    'chart'
], function (View) {
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

            return this;
        }
    });
    return StatView;
});
