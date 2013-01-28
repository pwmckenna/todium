define([
    'jquery',
    'underscore',
    './view'
], function($, _, View) {
    'use strict';
    var clip = new ZeroClipboard.Client();
    clip.setHandCursor(true);
    clip.addEventListener('complete', function(client, text) {
        var linkElem = $(clip.domElement).next();
        var link = linkElem.attr('placeholder');
        linkElem.attr('placeholder',' Copied to clipboard!');
        setTimeout(function() {
            linkElem.attr('placeholder', linkElem.attr('url'));
        }, 1000);
    });

    var bytesToSize = function(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    var TrackerView = View.extend({
        events: {
            'mouseover .copy': 'onCopy'
        },
        initialize: function() {
            this.url = '...';
            this.template = _.template($('#tracker_template').html());
            this.model.on('value', function(valueSnapshot) {
                var val = valueSnapshot.val();
                val.transferred = bytesToSize(val.transferred);
                this.$el.html(this.template(val));
            }, this);
        },
        onCopy: function(ev) {
            console.log('onCopy', this.url);
            clip.setText(this.url);

            var elem = this.$('.copy')[0];
            if(clip.div) {
                clip.receiveEvent('mouseout', null);
                clip.reposition(elem);
            } else {
                clip.glue(elem)
            }
            clip.receiveEvent('mouseover', null);
        },
        render: function() {
            return this;
        }
    });
    return TrackerView;
});