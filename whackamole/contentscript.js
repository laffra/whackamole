(function WhackAMole() {
    var domain = document.location.hostname;
    var showAdOverride = false;
    const WRAPPER_CSS = {
        overflow: 'hidden',
        display: 'block',
        height: '14px',
        fontSize: '10px',
        fontFamily: 'arial',
        textAlign: 'center',
        lineHeight: '14px',
        color: 'grey',
        cursor: 'pointer',
    };

    function createWrapper(mole, handler) {
        return $('<whackamole>')
            .css(WRAPPER_CSS)
            .text("ad")
            .on("click", handler);
    }

    function updateWrappers() {
        $('whackamole').css(WRAPPER_CSS)
    }

    function hide(mole, selector) {
        if (mole.width() && mole.height() && !mole.attr('whacked')) {
            var url = mole.attr('src') || mole.attr('data') || mole.attr('href') || '';
            if (!url || !sameDomain(url)) {
                log('hide ' + selector);
                mole.attr('whacked', true);
                var hostname = url && url.split('/')[2];
                if (!hostname || hostname.indexOf('.') == -1) hostname = '';
                while (mole.parent().children().length == 1) { mole = mole.parent(); }
                var wrapper = createWrapper(mole, function() {
                    log(`Show Ad - ${selector}`)
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

    function ads() {
        return $('.video-ads').filter(function () {
            return $(this).css("display") !== "none" && !$(this).text().match("Ad in ");
        });
    }

    function manageYoutubeAd() {
        if (!domain.match("youtube.com")) return;
        closeYoutubeAd();
        if (ads().length) {
            silenceYoutubeAd();
        } else {
            unSilenceYoutubeAd();
        }
    }

    function silenceYoutubeAd() {
        if (showAdOverride && ads().length) return;
        showAdOverride = false;
        $('button[title="Mute (m)"]').click();
        $('.video-ads').css("z-index", 100001);
        const width = $(window).width();
        const height = $(window).height();
        if (!$("#whackamole-black").length) {
            $("<div>")
                .attr("id", "whackamole-black")
                .css({
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: width,
                    paddingLeft: Math.max(0, width/2 - 200),
                    height: height,
                    lineHeight: height + "px",
                    overflow: "hidden",
                    zIndex: 100000,
                    fontFamily: "Arial",
                    fontSize: 32,
                    backgroundColor: "black",
                    color: "white",
                })
                .click(function() {
                    $(this).css({
                        left: $(this).width(),
                    });
                    showAdOverride = true;
                    unSilenceYoutubeAd();
                })
                .appendTo($("body"));
        }
        setTimeout(() => {
            $("#whackamole-black").html(getAdInfo());
        }, 1000);
    }

    function getAdInfo() {
        const status = [ $(".ytp-ad-simple-ad-badge").text(), $(".ytp-ad-duration-remaining").text() ].join(" ").trim();
        return status ? (status + " · Click to show Ad.    (<i style='font-size: 20px'>whackamole</i>)") : "Loading Ad...";
    }

    function unSilenceYoutubeAd() {
        if (!$("#whackamole-black").length) return;
        $("#whackamole-black").remove();
        $('button[title="Unmute (m)"]').click();
        $("button[title='Play (k)']").click();
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
                        .each(function() { hide($(this), `nested ${parent}/${child}/${content}`); });
                }
                mole.attr('whacked', true);
            }
        })
    }

    function hide_selector(selector) {
        $(selector).each(function() { hide($(this), selector); });
    }

    function hide_closest(child, parent) {
        $(child).each(function() {
            $(this).closest(parent).each(function() {
                hide($(this), `closest ${parent}/${child}`);
            })
        });
    }

    function run() {
        hide_closest('[aria-label*="Sponsored"]', '[data-pagelet]');
        hide_closest('.ad-container', '.ad-container');
        hide_closest('[id^="google_ad_"', 'div');

        hide_selector('iframe');
        hide_selector('.taboola');
        hide_selector('ad-taboola');
        hide_selector('.video-ads');
        hide_selector('.OUTBRAIN');
        hide_selector('.advertoriallist');
        hide_selector('.js-stream-ad');
        hide_selector('.col--advertisement');

        hide_nested('.userContentWrapper', 'span', 'Suggested Post');
        hide_nested('.userContentWrapper', 'a', 'Travel List Challenge');
        hide_nested('.userContentWrapper', 'a', 'Sponsored');
        hide_nested('.ego_section', 'a', 'Sponsored');
        hide_nested('[role="complementary"]', 'span', 'Sponsored');
        hide_nested('[data-pagelet]', 'span', "Suggested for you");
        hide_nested('.tweet', 'a', 'Promoted');
        hide_nested('article', 'span', 'Promoted', '14px');
        hide_nested('.ember-view', 'span', 'Promoted');

        manageYoutubeAd();
        updateWrappers();
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
