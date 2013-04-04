define([
    './view',
    './api',
    './owners',
    './trackers',
    './stats',
    'underscore',
    'buttons'
], function (View, ApiView, OwnersView, TrackersView, StatsView, _) {
    'use strict';

    var CampaignView = View.extend({
        events: {
            'click .btn.owners, .btn.api, .btn.trackers, .btn.stats': 'toggleViews'
        },
        initialize: function () {
            this.template = _.template($('#campaign_template').html());
            this.model.child('name').on('value', this.render, this);
        },
        toggleViews: function () {
            setTimeout(_.bind(function () {
                if (this.$('.btn.trackers').hasClass('active')) {
                    this.trackersView && this.trackersView.$el.show();
                } else {
                    this.trackersView && this.trackersView.$el.hide();
                }
                if (this.$('.btn.api').hasClass('active')) {
                    this.apiView && this.apiView.$el.show();
                } else {
                    this.apiView && this.apiView.$el.hide();
                }
                if (this.$('.btn.owners').hasClass('active')) {
                    this.ownersView && this.ownersView.$el.show();
                } else {
                    this.ownersView && this.ownersView.$el.hide();
                }
                if (this.$('.btn.stats').hasClass('active')) {
                    this.statsView && this.statsView.$el.show();
                    this.statsView && this.statsView.resize();
                } else {
                    this.statsView && this.statsView.$el.hide();
                }
            }, this));
        },
        destroy: function () {
            this.model.child('name').off('value', this.render, this);
            this.apiView.destroy();
            this.apiView.remove();
            this.ownersView.destroy();
            this.ownersView.remove();
            this.trackersView.destroy();
            this.trackersView.remove();
            this.statsView.destroy();
            this.statsView.remove();
        },
        render: function () {
            console.log('render campaign');
            var name = '';
            this.model.child('name').once('value', function (valueSnapshot) {
                name = valueSnapshot.val();
            });
            this.$el.html(this.template({
                name: name,
            }));

            this.apiView = new ApiView({
                model: this.model
            });
            this.ownersView = new OwnersView({
                model: this.model
            });
            this.trackersView = new TrackersView({
                model: this.model
            });
            this.statsView = new StatsView({
                model: this.model
            });


            this.assign(this.apiView, '.well.api');
            this.assign(this.ownersView, '.well.owners');
            this.assign(this.trackersView, '.well.trackers');
            this.assign(this.statsView, '.well.stats');
            this.toggleViews();
            return this;
        }
    });
    return CampaignView;
});
