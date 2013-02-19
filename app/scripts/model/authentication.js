define([], function () {
    'use strict';
    var AuthenticationModel = Backbone.Model.extend({
        initialize: function () {
            this.firebase = new Firebase('https://featuredcontent.firebaseIO.com/');
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
            if (!error) {
                this.set('user', user);

                if (user) {
                    //store the access token so that we can add rss feed links to todium on behalf of the user
                    this.firebase.child('users').child(user.provider).child(user.id).update({
                        'token': user.firebaseAuthToken
                    });
                }
            } else {
                console.log(error);
            }
        }
    });
    return AuthenticationModel;
});