define([
    'underscore',
    './view',
    './owner',
    'md5',
    'typeahead'
], function (_, View, OwnerView, md5, typeahead) {
    'use strict';

    var OwnersView = View.extend({
        events: {
            'submit form': 'submit'
        },
        initialize: function () {
            _.bindAll(this, 'typeahead');
            this.template = _.template($('#owners_template').html());
            this.views = {};
            this.model.child('owners').on('child_added', this.onOwnerAdded, this);
            this.model.child('owners').on('child_removed', this.onOwnerRemoved, this);
        },
        destroy: function () {
            this.model.child('owners').off('child_added', this.onOwnerAdded, this);
            this.model.child('owners').off('child_removed', this.onOwnerRemoved, this);
            _.each(this.views, function (view) {
                view.destroy();
                view.remove();
            });
            this.views = {};
        },
        submit: function (e) {
            e.preventDefault();
            var email = this.$('input[type=text]').val();
            var valid = this.$('li[data-value="' + email + '"]').length > 0;

            if (valid) {
                var hash = md5(email);
                this.model.child('owners').child(hash).transaction(_.bind(function () {
                    //lets set up the users's campaigns to reflect that they are now an owner
                    this.model.root().child('users').child(hash).child('campaigns').push().set(this.model.name());
                    //don't forget to actually set the owners email for this campaign
                    return email;
                }, this), function (error, committed, snapshot) {
                    console.log('Was there an error? ' + error);
                    console.log('Did we commit the transaction? ' + committed);
                    console.log('The final value is: ' + snapshot.val());
                });
            } else {
                console.error('invalid user email address');
            }
            //this.model.child('owners').child(md5(
        },
        typeahead: function (query, process) {
            this.model.root().child('users').once('value', function (valueSnapshot) {
                var emails = _.map(valueSnapshot.val(), function (user) {
                    return user.email;
                });
                process(emails);
            }, this);
        },
        onOwnerAdded: function (dataSnapshot) {
            console.log('onOwnerAdded', dataSnapshot.val());
            var email = dataSnapshot.val();
            var owner = this.model.root().child('users').child(md5(email));
            var view = new OwnerView({
                model: owner
            });
            this.views[email] = view;
            this.$('.owners').append(view.render().el);
        },
        onOwnerRemoved: function (dataSnapshot) {
            console.log('onOwnerRemoved', dataSnapshot.val());
            var email = dataSnapshot.val();
            var view = this.views[email];
            view.remove();
            delete this.views[email];
        },
        render: function () {
            this.$el.html(this.template({}));
            _.each(this.views, function (view) {
                this.$('.owners').append(view.render().el);
            }, this);
            typeahead.call(this.$('input'), {
                source: this.typeahead
            });
            return this;
        }
    });
    return OwnersView;
});
