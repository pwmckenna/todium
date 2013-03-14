define([
    './view'
], function (View) {
    'use strict';

    var clip = new ZeroClipboard.Client();
    clip.setHandCursor(true);
    clip.addEventListener('complete', function () {
        var linkElem = $(clip.domElement).prev();
        linkElem.attr('value', ' Copied to clipboard!');
        setTimeout(function () {
            linkElem.attr('value', linkElem.attr('url'));
        }, 1000);
    });

    // var bytesToSize = function (bytes) {
    //     var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
    //     if (bytes === 0) {
    //         return 'n/a';
    //     }
    //     var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    //     return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    // };


    var TrackerView = View.extend({
        events: {
            'mouseover .copy': 'onCopy'
        },
        initialize: function () {
            this.url = '...';
            this.template = _.template($('#tracker_template').html());
            this.model.on('value', this.onValue, this);
        },
        destroy: function () {
            this.model.off('value', this.onValue, this);
        },
        onValue: function (valueSnapshot) {
            console.log('onValue', valueSnapshot.val());
            this.val = valueSnapshot.val();
            this.render();
        },
        onCopy: function () {
            console.log('onCopy', this.url);
            clip.setText(this.url);

            var elem = this.$('.copy')[0];
            if (clip.div) {
                clip.receiveEvent('mouseout', null);
                clip.reposition(elem);
            } else {
                clip.glue(elem);
            }
            clip.receiveEvent('mouseover', null);
        },
        render: function () {
            this.$el.html(this.template({
                src: this.val.src,
                time: humaneDate(new Date(this.val.time)),
                url: this.val.trackable
            }));
            this.url = this.val.trackable;

            return this;
        }
    });
    return TrackerView;
});
