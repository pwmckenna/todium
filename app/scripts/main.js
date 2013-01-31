require.config({
    shim: {
        "underscore": {
            exports: "_"
        },
        // Backbone
        "backbone": {

           // Depends on underscore/lodash and jQuery
           "deps": ["underscore", "jquery"],

          // Exports the global window.Backbone object
          "exports": "Backbone"

        },
        "humane": {
          "exports": "humaneDate"
        }
    },

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
 
require(['model/authentication', 'view/app'], function(AuthenticationModel, AppView) {
  window.authentication = new AuthenticationModel();
  var view = new AppView({
    model: authentication
  });
  $('body').append(view.render().el);
});