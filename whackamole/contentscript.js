(function WhackAMole() {
    var domain = document.location.hostname;
    var color = "#FF0000"

    function createWrapper(mole, handler) {
        return $('<whackamole>')
            .css({
                overflow: 'hidden',
                display: 'block',
                width: mole.width(),
                height: '14px',
                fontSize: '10px',
                fontFamily: 'arial',
                textAlign: 'center',
                lineHeight: '14px',
                color: 'grey',
                cursor: 'pointer',
            })
            .text("ad")
            .on("click", handler)
    }

    function hide() {
        var mole = $(this);
        if (mole.width() && mole.height() && !mole.attr('whacked')) {
            var url = mole.attr('src') || mole.attr('data') || mole.attr('href') || '';
            if (!url || !sameDomain(url)) {
                log(' - hide ' + (url || 'iframe'));
                mole.attr('whacked', true);
                var hostname = url && url.split('/')[2];
                if (!hostname || hostname.indexOf('.') == -1) hostname = '';
                while (mole.parent().children().length == 1) { mole = mole.parent(); }
                var wrapper = createWrapper(mole, function() {
                    wrapper.replaceWith(mole);
                    setTimeout(function() {
                        mole.css({
                            position: 'initial',
                        })
                    },1000);
                });
                mole.replaceWith(wrapper);
                wrapper.append(mole);
            }
        }
    }

    function closeYoutubeAd() {
        $('div:contains("Skip Ad")').each(function () {
            $(this).click();
            setTimeout(function () {
                $('button[title="Play (k)"]').click();
            }, 200);
        });
        $("button.ytp-ad-overlay-close-button").click();
    }

    function hide_nested(parent, child, content, height) {
        $(parent + ' ' + child).each(function() {
            const mole = $(this).closest(parent);
            if (mole.attr("whacked")) return;
            var text = getComputedStyle(this,':after').content + ' ' + $(this).text();
            if (text.match(content)) {
                if (height) {
                    const originalHeight = mole.height();
                    const wrapper = createWrapper(mole, function() {
                        mole.css('height', originalHeight);
                    });
                    mole
                        .css('height', height)
                        .append(wrapper
                            .css("width", mole.width())
                            .css("position", "absolute")
                        )
                } else {
                    mole
                        .children()
                        .first()
                        .each(hide);
                }
                mole.attr('whacked', true);
            }
        })
    }

    function run() {
        $('iframe').each(hide);
        $('.taboola').each(hide);
        $('.video-ads').each(hide);
        $('.OUTBRAIN').each(hide);
        $('.advertoriallist').each(hide);
        $('.js-stream-ad').each(hide);
        $('.col--advertisement').each(hide);
        $('.ad-container').closest('.ad-container').each(hide);
        $('[id^="google_ad_"').closest('div').each(hide);

        hide_nested('.userContentWrapper', 'span', 'Suggested Post');
        hide_nested('.userContentWrapper', 'a', 'Travel List Challenge');
        hide_nested('.userContentWrapper', 'a', 'Sponsored');
        hide_nested('.ego_section', 'a', 'Sponsored');
        hide_nested('[role="complementary"]', 'span', 'Sponsored');
        hide_nested('[data-pagelet]', 'span', /S\w*p\w*o\w*n\w*s\w*o\w*r\w*e\w*d/);
        hide_nested('[data-pagelet]', 'span', "Suggested for you");
        hide_nested('.tweet', 'a', 'Promoted');
        hide_nested('article', 'span', 'Promoted', '14px');
        hide_nested('.ember-view', 'span', 'Promoted');

        closeYoutubeAd();
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

    if (domain != 'localhost') {
        chrome.storage.sync.get('*', function(disabled) {
            if (disabled['*']) return;
            chrome.storage.sync.get(domain, function(disabled) {
                if (disabled[domain]) return;
                document.body.addEventListener('DOMSubtreeModified', whack);
                run();
            });
        });
    }
})();

function log(message) {
    chrome.runtime.sendMessage({kind: "log", message });
}
