define([
    './view',
    './api',
    './owners',
    './trackers',
    './stats',
    'buttons'
], function (View, ApiView, OwnersView, TrackersView, StatsView) {
    'use strict';

    var CampaignView = View.extend({
        events: {
            'click .btn.owners, .btn.api, .btn.trackers, .btn.stats': 'toggleViews'
        },
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
            this.statsView = new StatsView({
                model: this.model
            });
            this.model.child('name').on('value', this.render, this);
        },
        toggleViews: function () {
            var _this = this;
            setTimeout(function () {
                if (_this.$('.btn.trackers').hasClass('active')) {
                    _this.trackersView.$el.show();
                } else {
                    _this.trackersView.$el.hide();
                }
                if (_this.$('.btn.api').hasClass('active')) {
                    _this.apiView.$el.show();
                } else {
                    _this.apiView.$el.hide();
                }
                if (_this.$('.btn.owners').hasClass('active')) {
                    _this.ownersView.$el.show();
                } else {
                    _this.ownersView.$el.hide();
                }
                if (_this.$('.btn.stats').hasClass('active')) {
                    _this.statsView.$el.show();
                    _this.statsView.resize();
                } else {
                    _this.statsView.$el.hide();
                }
            });
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
            var name = '';
            this.model.child('name').once('value', function (valueSnapshot) {
                name = valueSnapshot.val();
            });
            this.$el.html(this.template({
                name: name,
            }));
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
