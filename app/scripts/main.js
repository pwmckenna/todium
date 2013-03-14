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
        buttons: 'components/bootstrap/js/bootstrap-button'
    },
    shim: {
        buttons: {
            deps: ['jquery'],
            exports: '$.fn.button'
        },
        underscore: {
            exports: '_'
        }
    }
});

require(['model/authentication', 'view/app', 'buttons'], function (AuthenticationModel, AppView) {
    'use strict';
    window.authentication = new AuthenticationModel();
    $('body').append(new AppView({
        model: window.authentication
    }).render().el);
});
