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
        typeahead: 'components/bootstrap/js/bootstrap-typeahead',
        firebase: 'vendor/firebase',
        auth: 'vendor/firebase-auth-client',
        chart: 'components/Chart.js/Chart',
        d3: 'components/d3/d3',
        horizon: 'vendor/horizon',
    },
    shim: {
        humane: {
            exports: 'humaneDate'
        },
        jquery: {
            exports: 'jQuery'
        },
        buttons: {
            deps: ['jquery'],
            exports: '$.fn.button'
        },
        typeahead: {
            deps: ['jquery'],
            exports: '$.fn.typeahead'
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
        },
        backbone: {
            exports: 'Backbone',
            deps: ['underscore']
        },
        d3: {
            exports: 'd3'
        },
        horizon: {
            exports: 'd3',
            deps: ['d3']
        },
        chart: {
            exports: 'Chart'
        }
    }
});

require(['jquery', 'model/authentication', 'view/app'], function ($, AuthenticationModel, AppView) {
    'use strict';
    $(document).ready(function () {
        var authentication = new AuthenticationModel();
        $('body').append(new AppView({
            model: authentication
        }).render().el);
    });
});
