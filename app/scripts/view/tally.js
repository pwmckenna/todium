define([
    './view',
    'backbone',
    'underscore'
], function (View, Backbone, _) {
    'use strict';

    var getReadableFileSizeString = function (fileSizeInBytes) {
        var i = -1;
        var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
        do {
            fileSizeInBytes = fileSizeInBytes / 1024;
            i++;
        } while (fileSizeInBytes > 1024);

        return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
    };

    var StatsView = View.extend({
        initialize: function () {
            this.template = _.template($('#tally_template').html());

            this.stats = new Backbone.Model();
            this.stats.on('change:torrents', this.render, this);
            this.stats.on('change:downloads', this.render, this);
            this.stats.on('change:transferred', this.render, this);

            this.model.child('trackers').on('child_added', this.onTrackerAdded, this);
        },
        destroy: function () {
            this.model.child('trackers').off('child_added', this.onTrackerAdded, this);
        },
        onTrackerAdded: function (dataSnapshot) {
            console.log('onTrackerAdded', dataSnapshot.val());
            var trackerName = dataSnapshot.val();
            var tracker = this.model.root().child('trackers').child(trackerName);
            this.stats.set('torrents', (this.stats.get('torrents') || 0) + 1);
            tracker.child('stats').once('value', function (valueSnapshot) {
                var val = valueSnapshot.val();
                if (val && val.hasOwnProperty('completed') && _.keys(val.completed).length > 0) {
                    var torrentSize = Math.max.apply(this, _.map(val.completed, function (obj) {
                        return obj.downloaded;
                    }));
                    var numDownloads = val.hasOwnProperty('started') ? _.keys(val.started).length : 0;
                    this.stats.set('downloads', (this.stats.get('downloads') || 0) + numDownloads);
                    this.stats.set('transferred', (this.stats.get('transferred') || 0) + numDownloads * torrentSize);
                }
            }, this);
        },
        render: function () {

            this.$el.html(this.template({
                torrents: this.stats.get('torrents') || 0,
                downloads: this.stats.get('downloads') || 0,
                transferred: getReadableFileSizeString(this.stats.get('transferred') || 0)
            }));
            return this;
        }
    });
    return StatsView;
});
