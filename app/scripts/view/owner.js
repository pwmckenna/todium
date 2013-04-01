define([
    'underscore',
    './view',
    'md5',
    'tooltip',
    'humane'
], function (_, View, md5, tooltip, humane) {
    'use strict';

    var OwnerView = View.extend({
        className: 'pull-left',
        initialize: function () {
            this.template = _.template($('#owner_template').html());
            this.model.on('value', this.render, this);
        },
        destroy: function () {
            this.model.off('child_added', this.addOwner, this);
        },
        render: function () {
            this.model.once('value', _.bind(function (ownerSnapshot) {
                var owner = ownerSnapshot.val();
                var image = '//www.gravatar.com/avatar/' + md5(owner.email) + '?s=32&d=mm';
                var email = owner.email;
                var joined = humane(owner.hasOwnProperty('joined') ? new Date(owner.joined) : new Date());
                var visited = owner.hasOwnProperty('visited') ? humane(new Date(owner.visited)) : 'unknown';
                this.$el.html(this.template({
                    image: image,
                    email: email,
                    joined: joined,
                    visited: visited
                }));
                this.$('img').tooltip();
            }, this));

            return this;
        }
    });
    return OwnerView;
});
