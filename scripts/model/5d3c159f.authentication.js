define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    'use strict';
    var AuthenticationModel = Backbone.Model.extend({
        initialize: function() {
            this.firebase = new Firebase('https://featuredcontent.firebaseIO.com/');
            this.auth = new FirebaseAuthClient(this.firebase);
        },
        login: function(provider) {
            this.auth.login(provider, _.bind(this.onLogin, this));
        },
        onLogin: function(error, token, user) {
            console.log('onLogin', error, token, user);
            if (!error) {
                // You can now do Firebase operations as an authenticated user...
                console.log('User ID: ' + user.id); // '1234'
                console.log('Provider: ' + user.provider); // 'facebook'
                this.set('user', user);
            } else {
                console.log(error);
            }
        }
    });
    return AuthenticationModel;
});