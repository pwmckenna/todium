define([
    './view',
    './login',
    './logout',
    './user',
    './eventGraph',
    './transferGraph'
], function(View, LoginView, LogoutView, UserView, EventGraphView, TransferGraphView) {
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
                if(this.eventGraphView) {
                    this.eventGraphView.destroy();
                    this.eventGraphView = null;   
                }
                if(this.transferGraphView) {
                    this.transferGraphView.destroy();
                    this.transferGraphView = null;
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
                if(!this.eventGraphView) {
                    this.eventGraphView = new EventGraphView({
                        model: this.model.firebase
                    });
                }
                if(!this.transferGraphView) {
                    this.transferGraphView = new TransferGraphView({
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
            if(this.eventGraphView) {
                this.assign(this.eventGraphView, '.eventGraphView');
            }
            if(this.transferGraphView) {
                this.assign(this.transferGraphView, '.transferGraphView');
            }
            this.assign(this.loginView, '.login');
            this.assign(this.logoutView, '.logout');

            return this;
        }
    });
    return AppView;
});