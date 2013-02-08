define([
    './view',
    './login',
    './logout',
    './user',
    './stats'
], function(View, LoginView, LogoutView, UserView, StatsView) {
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
            this.onUser();
            this.model.on('change:user', this.onUser, this);
        },
        onUser: function() {
            if(this.model.get('user')) {
                if(this.statsView) {
                    this.statsView.destroy();
                    this.statsView = null;   
                }
                if(!this.userView) {
                    this.userView = new UserView({
                        model: this.model
                    });
                }
            } else {
                if(this.userView) {
                    this.userView.destroy();
                    this.userView = null;   
                }
                if(!this.statsView) {
                    this.statsView = new StatsView({
                        model: this.model.firebase
                    });
                }
            }
            this.render();
        },
        render: function() {
            this.$el.html(this.template());

            if(this.userView) {
                this.assign(this.userView, '.user');
            }
            if(this.statsView) {
                this.assign(this.statsView, '.stats');
            }
            this.assign(this.loginView, '.login');
            this.assign(this.logoutView, '.logout');

            return this;
        }
    });
    return AppView;
});