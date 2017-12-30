(function WhackAMole() {
    var domain = document.location.hostname;
    
    function hide() {
        var mole = $(this);
        if (!mole.attr('whacked')) {
            var url = mole.attr('src') || mole.attr('data') || mole.attr('href') || '';
            if (!url || !sameDomain(url)) {
                console.log('Whackamole: whacked ' + url);
                mole.attr('whacked', true);
                var hostname = url && url.split('/')[2];
                if (!hostname || hostname.indexOf('.') == -1) hostname = '';
                while (mole.parent().children().length == 1) { mole = mole.parent(); }
                var wrapper = $('<div>')
                    .css('overflow', 'hidden')
                    .css('margin-top', '-2px')
                    .css('margin-left', '-2px')
                    .css('width', '2px')
                    .css('height', '2px');
                mole.replaceWith(wrapper);
                wrapper.append(mole);
            } else {
                console.log('Whackamole: cannot whack ' + url);
            }
        }
    }

    function hide_nested(parentClass, tagName, content) {
        $('.' + parentClass + ' ' + tagName).each(function() {
            var text = getComputedStyle(this,':after').content + ' ' + $(this).text();
            if (text.indexOf(content) != -1) {
                $(this).closest('.' + parentClass).each(hide);
            }
        })
    }

    function run() {
        $('iframe').each(hide);
        $('.taboola').each(hide);
        $('.OUTBRAIN').each(hide);
        $('.advertoriallist').each(hide);
        $('.js-stream-ad').each(hide);
        $('.col--advertisement').each(hide);
        $('.ad-container').closest('.ad-container').each(hide);
        hide_nested('userContentWrapper', 'span', 'Suggested Post');
        hide_nested('userContentWrapper', 'a', 'Travel List Challenge');
        hide_nested('userContentWrapper', 'a', 'Sponsored');
        hide_nested('ego_section', 'a', 'Sponsored');
        hide_nested('tweet', 'a', 'Promoted');
        hide_nested('ember-view', 'span', 'Promoted');
    }
    
    function sameDomain(url) {
        var hostname = url.split('/')[2];
        if (url.charAt(0) != '/' && hostname) {
            var segments = hostname.split('.').reverse();
            var page_segments = document.location.hostname.split('.').reverse();
            return segments[0] == page_segments[0] && segments[1] == page_segments[1];
        }
    }

    var timer = setTimeout(function() { }, 1);

    function whack() {
        clearTimeout(timer);
        timer = setTimeout(run, 1);
    }

    chrome.storage.sync.get(domain, function(disabled) {
        if (domain != 'localhost' && !disabled[domain]) {
            document.body.addEventListener('DOMSubtreeModified', whack);
            run();
        }
    });
})();
