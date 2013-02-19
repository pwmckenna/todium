define([
    './view'
], function (View) {
    'use strict';
    var LogoutView = View.extend({
        events: {
            'click .logout.btn': 'logout'
        },
        initialize: function () {
            this.template = _.template($('#logout_template').html());
            this.model.on('change:user', this.render, this);
        },
        logout: function (ev) {
            var button = $(ev.currentTarget);
            if (button.hasClass('disabled')) {
                return;
            }
            button.addClass('disabled');
            this.model.logout();
        },
        render: function () {
            if (this.model.get('user')) {
                this.$el.html(this.template());
                this.$el.show();
            } else {
                this.$el.hide();
            }
            return this;
        }
    });
    return LogoutView;
});