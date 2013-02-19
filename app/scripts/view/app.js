define([
    './view',
    './login',
    './logout',
    './user'
], function (View, LoginView, LogoutView, UserView) {
    'use strict';

    var AppView = View.extend({
        initialize: function () {
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
        onUser: function () {
            if (this.model.get('user')) {
                if (!this.userView) {
                    this.userView = new UserView({
                        model: this.model
                    });
                }
            } else {
                if (this.userView) {
                    this.userView.destroy();
                    this.userView = null;
                }
            }
            this.render();
        },
        render: function () {
            this.$el.html(this.template());

            if (this.userView) {
                this.assign(this.userView, '.user');
            }
            this.assign(this.loginView, '.login');
            this.assign(this.logoutView, '.logout');

            return this;
        }
    });
    return AppView;
});