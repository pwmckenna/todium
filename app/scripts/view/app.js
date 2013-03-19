define([
    './view',
    './login',
    './logout',
    './user',
    'md5'
], function (View, LoginView, LogoutView, UserView, md5) {
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
            this.model.on('change:user', this.onUser, this);
        },
        onUser: function () {
            if (this.model.get('user') && !this.userView) {
                var email = this.model.get('user').email;
                var id = md5(email);
                this.userView = new UserView({
                    model: this.model.firebase.child('users').child(id),
                    email: email,
                    id: id
                });
            } else if (!this.model.get('user') && this.userView) {
                this.userView.destroy();
                this.userView = null;
            }
            this.render();
        },
        render: function () {
            console.log('render app');
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
