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

require(['jquery', 'model/authentication', 'view/app', 'buttons'], function ($, AuthenticationModel, AppView) {
    'use strict';
    $(document).ready(function () {
        var lt = function (name) {
            var d = $.Deferred();
            $.get('/templates/_' + name + '.html', function (res) {
                d.resolve(res);
            });
            return d.promise();
        };
        var loadTemplates = function () {
            var templates = ['api', 'app', 'campaign', 'login', 'logout', 'owners', 'tracker', 'trackers', 'user'];
            var reqs = $.map(templates, lt);
            return $.when.apply($, reqs).then(function () {
                for (var i = 0; i < arguments.length; i++) {
                    $('body').append(arguments[i]);
                }
            });
        };

        loadTemplates().then(function () {
            var authentication = new AuthenticationModel();
            $('body').append(new AppView({
                model: authentication
            }).render().el);
        });
    });
});
