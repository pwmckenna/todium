define([
    'underscore',
    './view'
], function (_, View) {
    'use strict';
    var LoginView = View.extend({
        events: {
            'click .signup_form .btn': 'onClickSignUp',
            'click .login_form .btn': 'onClickLogin'
        },
        initialize: function () {
            this.template = _.template($('#login_template').html());
            this.model.on('change:user', this.render, this);
        },
        onClickSignUp: function () {
            var email = this.$('.signup_well .email').val();
            var password = this.$('.signup_well .password1').val();
            if (password !== this.$('.signup_well .password2').val()) {
                console.error('mismatch passwords!');
                return;
            }
            this.signUp(email, password);
        },
        signUp: function (email, password) {
            var auth = this.model.auth;
            auth.createUser(email, password, _.bind(function (error) {
                if (error) {
                    console.error(error);
                    return;
                } else {
                    this.login(email, password);
                }
            }, this));
        },
        onClickLogin: function () {
            var email = this.$('.login_well .email').val();
            var password = this.$('.login_well .password').val();
            this.login(email, password);
        },
        login: function (email, password) {
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
