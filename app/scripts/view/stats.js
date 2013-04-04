define([
    './view',
    './horizon',
    './ratio',
    './tally',
    'backbone',
    'underscore'
], function (View, HorizonView, RatioView, TallyView, Backbone, _) {
    'use strict';

    var median = function (values) {
        values.sort(function (a, b) {
            return a - b;
        });
        var half = Math.floor(values.length / 2);
        if (values.length % 2) {
            return values[half];
        } else {
            return (values[half - 1] + values[half]) / 2.0;
        }
    };

    var StatsView = View.extend({
        initialize: function () {
            this.template = _.template($('#stats_template').html());
            this.views = {};
            this.ratioView = new RatioView({
                model: this.model
            });
            this.tallyView = new TallyView({
                model: this.model
            });
            this.firstDateObserver = new (Backbone.Model.extend({

            }))();
            this.meanCompletedObserver = new (Backbone.Model.extend({
                initialize: function () {
                    this.mean = 0;
                    this.on('change', _.throttle(function () {
                        console.log('calculating mean');
                        var prev = this.mean;
                        var lens = _.values(this.toJSON());
                        this.mean = median(lens);
                        if (prev !== this.mean) {
                            this.trigger('mean');
                        }
                    }, 1000), this);
                },
                setCompleted: function (info_hash, completed) {
                    if (!this.has(info_hash) ||
                        this.get(info_hash) !== completed
                    ) {
                        this.set(info_hash, completed);
                    }
                },
                getMean: function () {
                    return this.mean;
                }
            }))();
            this.model.child('trackers').on('child_added', this.onTrackerAdded, this);
            this.model.child('trackers').on('child_removed', this.onTrackerRemoved, this);
            $(window).resize(_.bind(this.resize, this));
        },
        destroy: function () {
            this.model.child('trackers').off('child_added', this.onTrackerAdded, this);
            this.model.child('trackers').off('child_removed', this.onTrackerRemoved, this);
            _.each(this.views, function (view) {
                view.destroy();
                view.remove();
            });
            this.views = {};
            this.firstDateObserver.off();
        },
        resize: function () {
            console.log('resize');
            _.each(this.views, function (view) {
                view.resize();
            });
            this.ratioView.resize();
        },
        onTrackerAdded: function (dataSnapshot) {
            console.log('onTrackerAdded', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            setTimeout(_.bind(function () {
                var tracker = this.model.root().child('trackers').child(trackerName);
                var view = new HorizonView({
                    model: tracker,
                    firstDateObserver: this.firstDateObserver,
                    meanCompletedObserver: this.meanCompletedObserver
                });
                this.views[trackerName] = view;
                this.$('.horizons').append(view.render().el);
            }, this));
        },
        onTrackerRemoved: function (dataSnapshot) {
            console.log('onTrackerRemoved', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            var view = this.views[trackerName];
            view.remove();
            delete this.views[trackerName];
        },
        render: function () {
            var children = this.$('.horizons').children().detach();
            var name = '';
            this.model.child('name').once('value', function (valueSnapshot) {
                name = valueSnapshot.val();
            });
            this.$el.html(this.template({
                name: name,
            }));
            this.assign(this.tallyView, '.tally');
            this.assign(this.ratioView, '.ratio');
            this.$('.horizons').append(children);
            return this;
        }
    });
    return StatsView;
});
