define(['firebase', 'auth'], function (Firebase, FirebaseAuthClient) {
    'use strict';
    var AuthenticationModel = Backbone.Model.extend({
        initialize: function () {
            this.firebase = new Firebase('https://todium.firebaseIO.com/');
            this.auth = new FirebaseAuthClient(this.firebase, _.bind(this.onLogin, this));
        },
        login: function (provider) {
            this.auth.login(provider);
        },
        logout: function () {
            this.auth.logout();
        },
        onLogin: function (error, user) {
            console.log('onLogin', error, user);
            this.set('user', user);
            if (error) {
                console.log(error);
            }
        }
    });
    return AuthenticationModel;
});
