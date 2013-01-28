define([
    'jquery',
    'underscore',
    './view',
    './login',
    './user'
], function($, _, View, LoginView, UserView) {
    'use strict';

    var bytesToSize = function(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
        if (bytes == 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return (bytes / Math.pow(1024, i)).toFixed(8) + ' ' + sizes[i];
    }

    var AppView = View.extend({
        initialize: function() {
            this.template = _.template($('#app_template').html());

            this.loginView = new LoginView({
                model: this.model
            });
            this.userView = new UserView({
                model: this.model
            });

            this.model.firebase.child('transferred').on('value', function(valueSnapshot) {
                var transferredDays = valueSnapshot.val();
                var total = 0;
                _.each(transferredDays, function(amount) {
                    total = amount;
                });
                
                this.$('.total').text(bytesToSize(total));
            }, this);
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