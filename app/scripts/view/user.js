define([
    './view',
    './campaign',
    'md5'
], function (View, CampaignView, md5) {
    'use strict';

    var UserView = View.extend({
        events: {
            'click .addCampaign': 'onAddCampaign'
        },
        initialize: function () {
            this.template = _.template($('#user_template').html());
            this.model.child('email').set(this.options.email);
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
            var id = md5(this.model.root().child('campaigns').push().name());
            var secret = md5(this.model.root().child('campaigns').push().name());

            var update = {};
            var owners = {};
            owners[this.options.id] = this.options.email;
            update[id] = {
                name: name,
                secret: secret,
                owners: owners
            };
            this.model.root().child('campaigns').update(update);
            this.model.child('campaigns').push().set(id);
        },
        render: function () {
            var trackers = this.$('.campaigns').children().detach();
            this.$el.html(this.template({
                email: this.options.email
            }));
            this.$('.campaigns').append(trackers);
        }
    });
    return UserView;
});
