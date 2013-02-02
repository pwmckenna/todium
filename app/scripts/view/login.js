define([
    './view'
], function(View) {
    'use strict';
    var LoginView = View.extend({
        events: {
            'click .facebook.btn': 'login',
            'click .github.btn': 'login',
            'click .twitter.btn': 'login',
        },
        initialize: function() {
            this.template = _.template($('#login_template').html());
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
        render: function() {
            if(this.model.get('user')) {
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