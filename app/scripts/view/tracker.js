define([
    'jquery',
    'underscore',
    'humane',
    './view'
], function($, _, humane, View) {
    'use strict';

    var MAGNET_LINK_IDENTIFIER = 'magnet:?xt=urn:btih:';

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
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
        if (bytes == 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }


    var TrackerView = View.extend({
        events: {
            'mouseover .copy': 'onCopy'
        },
        initialize: function() {
            this.url = '...';
            this.template = _.template($('#tracker_template').html());
            this.model.on('value', this.onValue, this);
        },
        destroy: function() {
            this.model.off('value', this.onValue, this);
        },
        onValue: function(valueSnapshot) {
            console.log('onValue', valueSnapshot.val());
            var val = valueSnapshot.val();
            var url;

            var tracker = 'http://tracker.todium.com/' + this.model.name() + '/announce';

            if(val.src.indexOf(MAGNET_LINK_IDENTIFIER) === 0) {
                url = val.src + '&tr=' + tracker;
            } else {
                url = 'http://editor.todium.com/?tracker=' + tracker + '&torrent=' + val.src;
            }

            val.transferred = val.transferred === 0 ? 0 : bytesToSize(val.transferred);
            val.time = humane(new Date(val.time));
            val.url = url;
            this.$el.html(this.template(val));
            this.url = url;
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