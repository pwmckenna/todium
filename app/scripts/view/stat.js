define([
    './view',
    'underscore'
], function (View, _) {
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
            this.$('canvas').attr('width', width);
            this.$('canvas').attr('width', width);
            this.$('canvas').css('width', width);
            this.$('canvas').css('height', height);


            var value = null;
            this.model.child('stats').once('value', function (valueSnapshot) {
                value = valueSnapshot.val();
            });

            return this;
        }
    });
    return StatView;
});
