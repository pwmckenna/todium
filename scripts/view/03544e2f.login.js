define([
    'jquery',
    'underscore',
    './view'
], function($, _, View) {
    'use strict';
    var LoginView = View.extend({
        events: {
            'click .facebook.btn': 'login',
            'click .github.btn': 'login',
            'click .twitter.btn': 'login',
            'click .logout.btn': 'logout'
        },
        initialize: function() {
            this.login_template = _.template($('#login_template').html());
            this.logout_template = _.template($('#logout_template').html());
            this.model.on('change:user', this.render, this);
        },
        login: function(ev) {
            var button = $(ev.currentTarget);
            if(button.hasClass('disabled')) {
                return;
            }
            button.addClass('disabled');
            var provider = '';
            if(button.hasClass('facebook')) {
                provider = 'facebook';
            } else if(button.hasClass('github')) {
                provider = 'github';
            } else if(button.hasClass('twitter')) {
                provider = 'twitter';
            } else {
                throw 'invalid login provider';
            }
            this.model.login(provider);
        },
        logout: function(ev) {
            var button = $(ev.currentTarget);
            if(button.hasClass('disabled')) {
                return;
            }
            button.addClass('disabled');
            this.model.logout();
        },
        render: function() {
            if(this.model.get('user')) {
                this.$el.html(this.logout_template());
            } else {
                this.$el.html(this.login_template());
            }            
            return this;
        }
    });
    return LoginView;
});