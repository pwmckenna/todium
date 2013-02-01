define([
    'jquery',
    'underscore',
    './view',
    './login',
    './logout',
    './user',
    './stats'
], function($, _, View, LoginView, LogoutView, UserView, StatsView) {
    'use strict';

    var AppView = View.extend({
        initialize: function() {
            this.template = _.template($('#app_template').html());

            this.loginView = new LoginView({
                model: this.model
            });
            this.logoutView = new LogoutView({
                model: this.model
            });
            this.userView = new UserView({
                model: this.model
            });
            this.statsView = new StatsView({
                model: this.model
            });
            this.statsView.$el.hide();
        },
        render: function() {
            this.$el.html(this.template());

            this.assign(this.userView, '.user');                
            this.assign(this.loginView, '.login');
            this.assign(this.logoutView, '.logout');
            this.assign(this.statsView, '.stats');

            return this;
        }
    });
    return AppView;
});