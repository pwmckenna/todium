define(['firebase', 'auth', 'underscore', 'backbone'], function (Firebase, FirebaseAuthClient, _, Backbone) {
    'use strict';
    var AuthenticationModel = Backbone.Model.extend({
        initialize: function () {
            this.firebase = new Firebase('https://todium.firebaseIO.com/');
            this.auth = new FirebaseAuthClient(this.firebase, _.bind(this.onLogin, this));
        },
        login: function (provider) {
            console.log('login', provider, new Date().toString());
            this.auth.login(provider);
        },
        logout: function () {
            this.auth.logout();
        },
        onLogin: function (error, user) {
            console.log('onLogin', error, user, new Date().toString());
            this.set('user', user);
            if (error) {
                console.log(error);
            }
        }
    });
    return AuthenticationModel;
});
