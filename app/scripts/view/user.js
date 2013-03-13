define([
    './view',
    './campaign'
], function (View, CampaignView) {
    'use strict';

    var UserView = View.extend({
        events: {
            'click .addCampaign': 'onAddCampaign'
        },
        initialize: function () {
            this.template = _.template($('#user_template').html());
            this.views = {};
            setTimeout(_.bind(function () {
                this.model.child('campaigns').on('child_added', this.onCampaignAdded, this);
                this.model.child('campaigns').on('child_removed', this.onCampaignRemoved, this);
            }, this));
        },
        destroy: function () {
            this.model.child('campaigns').off('child_added', this.onCampaignAdded, this);
            this.model.child('campaigns').off('child_removed', this.onCampaignRemoved, this);
            _.each(this.views, function (view) {
                view.destroy();
                view.remove();
            });
            this.views = {};
        },
        onCampaignAdded: function (dataSnapshot) {
            console.log('onCampaignAdded', dataSnapshot.val());
            var id = dataSnapshot.val();
            var campaign = this.model.root().child('campaigns').child(id);
            var view = new CampaignView({
                model: campaign
            });
            this.views[id] = view;
            this.$('.campaigns').append(view.render().el);
        },
        onCampaignRemoved: function (dataSnapshot) {
            console.log('onCampaignRemoved', dataSnapshot.val());
            var id = dataSnapshot.val();
            var view = this.views[id];
            view.remove();
            delete this.views[id];
        },
        onAddCampaign: function () {
            var button = this.$('.btn');
            if (button.hasClass('disabled')) {
                return;
            }
            button.addClass('disabled');
            setTimeout(function () {
                button.removeClass('disabled');
            }, 3000);

            var name = this.$('.campaignName').val();
            if (!name) {
                return;
            }
            this.$('.campaignName').val('');
            //this is actually not that random...replace with a hash of random data
            var random = this.model.root().child('campaigns').push().name();
            var campaign = this.model.root().child('campaigns').push({
                name: name,
                secret: random
            });
            this.model.child('campaigns').push().set(campaign.name());
        },
        render: function () {
            var trackers = this.$('.campaigns').children().detach();
            this.$el.html(this.template());
            this.$('.campaigns').append(trackers);
        }
    });
    return UserView;
});
