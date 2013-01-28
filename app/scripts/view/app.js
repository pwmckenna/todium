define([
    'jquery',
    'underscore',
    './view',
    './login',
    './user'
], function($, _, View, LoginView, UserView) {
    'use strict';
    var AppView = View.extend({
        initialize: function() {
            this.template = _.template($('#app_template').html());

            this.loginView = new LoginView({
                model: this.model
            });
            this.userView = new UserView({
                model: this.model
            });
        },
        render: function() {
            this.$el.html(this.template());

            this.assign(this.userView, '.user');                
            this.assign(this.loginView, '.login');

            return this;
        }
    });
    return AppView;
});