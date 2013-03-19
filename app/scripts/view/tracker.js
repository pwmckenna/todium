define([
    './view',
    'underscore'
], function (View, _) {
    'use strict';

    // var bytesToSize = function (bytes) {
    //     var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
    //     if (bytes === 0) {
    //         return 'n/a';
    //     }
    //     var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    //     return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    // };


    var TrackerView = View.extend({
        initialize: function () {
            this.template = _.template($('#tracker_template').html());
            this.model.on('value', this.onValue, this);
        },
        destroy: function () {
            this.model.off('value', this.onValue, this);
        },
        onValue: function (valueSnapshot) {
            this.val = valueSnapshot.val();
            this.render();
        },
        render: function () {
            var info_hash = '';
            var time = '';
            var url = '';
            this.model.once('value', function (valueSnapshot) {
                var val = valueSnapshot.val();
                info_hash = val.hasOwnProperty('info_hash') ? val.info_hash : '';
                time = val.hasOwnProperty('time') ? humaneDate(new Date(val.time)) : '';
                url = val.hasOwnProperty('trackable') ? val.trackable : '';
            });
            console.log('render tracker');
            this.$el.html(this.template({
                info_hash: info_hash,
                time: time,
                url: url
            }));

            return this;
        }
    });
    return TrackerView;
});
