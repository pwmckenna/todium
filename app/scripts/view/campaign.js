define([
    './view',
    './api',
    './owners',
    './trackers'
], function (View, ApiView, OwnersView, TrackersView) {
    'use strict';

    var CampaignView = View.extend({
        initialize: function () {
            this.template = _.template($('#campaign_template').html());
            this.views = {};
            this.apiView = new ApiView({
                model: this.model
            });
            this.ownersView = new OwnersView({
                model: this.model
            });
            this.trackersView = new TrackersView({
                model: this.model
            });
            this.model.child('name').on('value', this.render, this);
        },
        destroy: function () {
            this.model.child('name').off('value', this.render, this);
            this.apiView.destroy();
            this.apiView.remove();
            this.ownersView.destroy();
            this.ownersView.remove();
            this.trackersView.destroy();
            this.trackersView.remove();
        },
        render: function () {
            var trackers = this.$('.trackers').children().detach();

            var name = '';
            this.model.child('name').once('value', function (valueSnapshot) {
                name = valueSnapshot.val();
            });
            this.$el.html(this.template({
                name: name,
            }));
            this.assign(this.apiView, '.api');
            this.assign(this.ownersView, '.owners');
            this.assign(this.trackersView, '.trackers');
            return this;
        }
    });
    return CampaignView;
});
