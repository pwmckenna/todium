define([
    'underscore',
    './view',
    'md5'
], function (_, View, md5) {
    'use strict';

    var OwnersView = View.extend({
        initialize: function () {
            this.template = _.template($('#owners_template').html());
            this.model.child('owners').on('value', this.render, this);
        },
        destroy: function () {
            this.model.child('owners').off('value', this.render, this);
        },
        render: function () {
            var owners = [];
            this.model.child('owners').once('value', function (ownersSnapshot) {
                owners = ownersSnapshot.val();
            });

            var images = _.map(owners, function (email) {
                var hash = md5(email.trim());
                return '//www.gravatar.com/avatar/' + hash + '?s=32&d=mm';
            });

            this.$el.html(this.template({
                images: images
            }));
            return this;
        }
    });
    return OwnersView;
});
