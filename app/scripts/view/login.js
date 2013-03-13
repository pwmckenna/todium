define([
    './view'
], function (View) {
    'use strict';
    var LoginView = View.extend({
        events: {
            'click .signup_form .btn': 'signUp',
            'click .login_form .btn': 'login'
        },
        initialize: function () {
            this.template = _.template($('#login_template').html());
            this.model.on('change:user', this.render, this);
        },
        signUp: function () {
            var email = this.$('.signup_well .email').val();
            var password = this.$('.signup_well .password1').val();
            if (password !== this.$('.signup_well .password2').val()) {
                console.error('mismatch passwords!');
                return;
            }
            var auth = this.model.auth;
            console.log('create user', email, password);
            auth.createUser(email, password, function (error, user) {
                if (error) {
                    console.error(error);
                    return;
                } else {
                    console.log('User Id: ' + user.id + ', Email: ' + user.email);
                    auth.login('password', {
                        email: user.email,
                        password: password,
                        rememberMe: true
                    });
                }

            });
        },
        login: function () {
            var email = this.$('.login_well .email').val();
            var password = this.$('.login_well .password').val();
            console.log('login', email, password);
            this.model.auth.login('password', {
                email: email,
                password: password,
                rememberMe: true
            });
        },
        render: function () {
            if (this.model.get('user')) {
                this.$el.hide();
            } else {
                this.$el.html(this.template());
                this.$el.show();
            }
            return this;
        }
    });
    return LoginView;
});
