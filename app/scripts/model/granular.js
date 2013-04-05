define(['underscore', 'backbone'], function (_, Backbone) {
    var GranularModel = Backbone.Model.extend({
        constructor: function (firebase) {
            Backbone.Model.prototype.constructor.apply(this, {});
            this.firebase = firebase;
            this.trackerValueReceived = new Backbone.Model();
            var started = new Backbone.Model();
            var stopped = new Backbone.Model();
            var completed = new Backbone.Model();

            this.set({
                started: started,
                stopped: stopped,
                completed: completed
            });

            this.firebase.child('trackers').on('child_added', this.onTrackerAdded, this);
            this.firebase.child('trackers').on('child_removed', this.onTrackerRemoved, this);
        },
        onTrackerValue: function (trackerName, valueSnapshot) {
            this.trackerValueReceived.set(trackerName, true);
            var val = valueSnapshot.val();
            if (val) {
                if (val.hasOwnProperty('started')) {
                    this.get('started').set(trackerName, val.started, {
                        silent: true
                    });
                }

                if (val.hasOwnProperty('stopped')) {
                    this.get('stopped').set(trackerName, val.stopped, {
                        silent: true
                    });
                }

                if (val.hasOwnProperty('completed')) {
                    this.get('completed').set(trackerName, val.completed, {
                        silent: true
                    });
                }
            }

            //if (_.every(this.trackerValueReceived.values(), _.identity)) {
                this.trigger('change');
            //}
        },
        onTrackerAdded: function (dataSnapshot) {
            console.log('onTrackerAdded', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            var tracker = this.firebase.root().child('trackers').child(trackerName);
            this.trackerValueReceived.set(trackerName, false);
            tracker.child('stats').on('value', _.partial(this.onTrackerValue, trackerName), this);
        },
        onTrackerRemoved: function (dataSnapshot) {
            console.log('onTrackerRemoved', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            console.log(trackerName);
        }
    })
    return GranularModel;
});