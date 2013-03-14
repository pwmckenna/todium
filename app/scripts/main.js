require.config({
    paths: {
        hm: 'vendor/hm',
        esprima: 'vendor/esprima',
        jquery: 'vendor/jquery.min',
        smoothie: 'vendor/smoothie',
        underscore: 'components/underscore/underscore-min',
        backbone: 'components/backbone/backbone-min',
        humane: 'components/Humane-Dates/humane',
        md5: 'vendor/md5',
        buttons: 'components/bootstrap/js/bootstrap-button',
        firebase: 'vendor/firebase',
        auth: 'vendor/firebase-auth-client'
    },
    shim: {
        buttons: {
            deps: ['jquery'],
            exports: '$.fn.button'
        },
        firebase: {
            exports: 'Firebase'
        },
        auth: {
            exports: 'FirebaseAuthClient',
            deps: ['firebase']
        },
        underscore: {
            exports: '_'
        }
    }
});

require(['jquery', 'model/authentication', 'view/app', 'buttons'], function ($, AuthenticationModel, AppView) {
    'use strict';
    $(document).ready(function () {
        var authentication = new AuthenticationModel();
        $('body').append(new AppView({
            model: authentication
        }).render().el);
    });
});
