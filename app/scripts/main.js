'use strict';

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
        tooltip: 'components/bootstrap/js/bootstrap-tooltip',
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
        tooltip: {
            deps: ['jquery'],
            exports: '$.fn.tooltip'
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

require(['jquery', 'firebase', 'model/authentication', 'view/app'], function ($, Firebase, AuthenticationModel, AppView) {
    Firebase.enableLogging(true);
    // var on = Firebase.prototype.on;
    // Firebase.prototype.on = function () {
    //     console.log('on', arguments);
    //     return on.apply(this, arguments);
    // };
    // var child = Firebase.prototype.child;
    // Firebase.prototype.child = function () {
    //     console.log('child', arguments);
    //     return child.apply(this, arguments);
    // };
    $(document).ready(function () {
        var authentication = new AuthenticationModel();
        $('body').append(new AppView({
            model: authentication
        }).render().el);
    });
});
