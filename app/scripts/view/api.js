define([
    './view'
], function (View) {
    'use strict';

    var ApiView = View.extend({
        initialize: function () {
            this.template = _.template($('#api_template').html());
            this.model.child('secret').on('value', this.render, this);
        },
        destroy: function () {
            this.model.child('secret').off('value', this.render, this);
        },
        render: function () {
            var secret = '';
            this.model.child('secret').once('value', function (secretSnapshot) {
                secret = secretSnapshot.val();
            })
            this.$el.html(this.template({
                id: this.model.name(),
                secret: secret
            }));
            return this;
        }
    });
    return ApiView;
});
