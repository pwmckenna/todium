define([
    'underscore',
    './view',
    'md5',
    'typeahead',
    'underscore'
], function (_, View, md5, typeahead) {
    'use strict';

    var OwnersView = View.extend({
        events: {
            'submit form': 'submit'
        },
        initialize: function () {
            _.bindAll(this, 'typeahead');
            this.template = _.template($('#owners_template').html());
            this.model.child('owners').on('value', this.render, this);
        },
        destroy: function () {
            this.model.child('owners').off('value', this.render, this);
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
        render: function () {
            console.log('render owners');
            var owners = [];
            this.model.child('owners').once('value', function (ownersSnapshot) {
                owners = ownersSnapshot.val();
            });

            this.$el.html(this.template({
                owners: _.map(owners, function (email) {
                    var hash = md5(email.trim());
                    return {
                        image: '//www.gravatar.com/avatar/' + hash + '?s=32&d=mm',
                        email: email
                    };
                })
            }));
            typeahead.call(this.$('input'), {
                source: this.typeahead
            });
            return this;
        }
    });
    return OwnersView;
});
