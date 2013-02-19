require.config({
    paths: {
        hm: 'vendor/hm',
        esprima: 'vendor/esprima',
        jquery: 'vendor/jquery.min',
        smoothie: 'vendor/smoothie',
        underscore: 'components/underscore/underscore-min',
        backbone: 'components/backbone/backbone-min',
        humane: 'components/Humane-Dates/humane'
    }
});
 
require(['model/authentication', 'view/app'], function (AuthenticationModel, AppView) {
    'use strict';
    window.authentication = new AuthenticationModel();
    var view = new AppView({
        model: window.authentication
    });
    $('body').append(view.render().el);
});