// This code handles hiding ads on web pages.

(function WhackAMole() {
    /*
    * Gets the domain of the current page. 
    */
    var domain = document.location.hostname;

    /*
    * Initializes the showAdOverride variable to false. This is used to override hiding ads when the ad hider is clicked.
    */
    var showAdOverride = false;

    /*
    * The CSS styles for the wrapper <div> element.
    */
    const WRAPPER_CSS = {
        overflow: 'hidden',
        display: 'block',
        height: '14px',
        textAlign: 'center',
        cursor: 'pointer',
    };
    
    /*
    * The CSS styles for the wrapper <div> element label.  
    */
    const WRAPPER_LABEL_CSS = {
        display: 'block',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'gray',
        lineHeight: '10px',
        padding: 1,
        width: '14px',
        margin: 'auto',
        borderRadius: 9,
        fontSize: '8px',
        fontFamily: 'arial',
        color: 'grey',
        backgroundColor: 'lightyellow',
        cursor: 'pointer',
    };

    /*
    * Creates a wrapper <div> element to hide the ad (mole) element.
    * @param {object} mole - The jQuery object representing the ad element to be hidden.
    * @param {function} handler - The click event handler function for the wrapper. 
    * When the wrapper is clicked, it will call this handler function.
    * @returns {object} The jQuery object representing the generated wrapper <div> element.
    */
    function createWrapper(mole, handler) {
        return $('<whackamole>')
            .css(WRAPPER_CSS)
            .on("click", handler)
            .append(
                $('<div>')
                    .css(WRAPPER_LABEL_CSS)
                    .text("ad")
            );
    }

    /*
    * Updates the CSS styles of all <whackamole> wrapper elements.
    * This is called whenever the page is modified to ensure the wrappers 
    * have the correct styling.
    */
    function updateWrappers() {
        $('whackamole').css(WRAPPER_CSS)
    }

    /*
    * Hides the ad (mole) element by replacing it with a wrapper element.
    *
    * @param {object} mole - The jQuery object representing the ad element to be hidden.
    * @param {string} selector - The CSS selector used to find the ad element. 
    *
    * Checks if the ad element has a width, height, and has not already been hidden.
    * Gets the URL of the ad element to check if it is from the same domain. 
    * 
    * If not from the same domain, hides the ad by:
    * - Setting the 'whacked' attribute to true to indicate it has been hidden.
    * - Getting the hostname from the URL and defaulting it to an empty string.
    * - Iterating up the DOM tree with .parent() until an element with more than 1 child is found.
    * - Creating a wrapper <div> to hide the ad using the createWrapper() function.
    * - Replacing the ad element with the wrapper element.
    * - Appending the ad element to the wrapper element. 
    * - Logging that the ad was replaced with a wrapper.
    * 
    * If the ad is clicked, the wrapper is replaced with the ad element and 
    * its position style is reset after 1 second.
    */
    function hide(mole, selector) {
        if (mole.width() && mole.height() && !mole.attr('whacked')) {
            var url = mole.attr('src') || mole.attr('data') || mole.attr('href') || '';
            if (!url || !sameDomain(url)) {
                log('hide ' + mole.attr("title") + " " + mole.attr("src") + " " + selector);
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
                log('replaced with wrapper' + selector);
            }
        }
    }

    /*
    * Returns jQuery object representing YouTube video ads currently on the page.
    * 
    * @returns {object} jQuery object representing YouTube video ads.
    */
    function ads() {
        return $('.video-ads').filter(function () {
            return $(this).css("display") !== "none" && !$(this).text().match("Ad in ");
        });
    }

    /*
    * Manages YouTube video ads.
    * 
    * Calls closeYoutubeAd() to close any open YouTube video ads.
    * Checks if there are currently any YouTube video ads on the page using ads(). 
    * If ads are present, calls silenceYoutubeAd() to hide the ad and mute the video.
    * If no ads are present, calls unSilenceYoutubeAd() to unmute the video and remove the ad hider.
    */
    function manageYoutubeAd() {
        if (!domain.match("youtube.com")) return;
        closeYoutubeAd();
        if (ads().length) {
            silenceYoutubeAd();
        } else {
            unSilenceYoutubeAd();
        }
    }

    /* 
    * Hide the Youtube video ad and mute the video.
    */
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
                    width: width * 2,
                    paddingLeft: Math.max(0, width/2 - 200),
                    height: height * 2,
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

    /*
    * Returns the status of the current YouTube ad.
    * 
    * @returns {string} The status of the current YouTube ad, or "Loading Ad..." if no ad information can be found.
    * 
    * Gets the text from the ad itself, and formats the result.
    * If ad information is found, returns the status.  Otherwise, returns "Loading Ad...".
    */
    function getAdInfo() {
        const status = [ $(".ytp-ad-simple-ad-badge").text(), $(".ytp-ad-duration-remaining").text() ].join(" ").trim();
        return status ? (status + " · Click to show Ad.    (<i style='font-size: 20px'>whackamole</i>)") : "Loading Ad...";
    }

    /* 
    * Unhide the Youtube video ad and unmute the video.
    */
    function unSilenceYoutubeAd() {
        if (!$("#whackamole-black").length) return;
        $("#whackamole-black").remove();
        $('button[title="Unmute (m)"]').click();
        $("button[title='Play (k)']").click();
    }

    /* 
    * Closes any open YouTube video ads.
    *
    * Finds all 'div' elements containing the text 'Skip Ad' and clicks them. 
    * After 200ms, finds the 'Play' button and clicks it.
    * Also finds any 'ytp-ad-overlay-close-button' buttons and clicks them.
    * This ensures any YouTube video ads are closed so the video can play.
    */
    function closeYoutubeAd() {
        $('div:contains("Skip Ad")').each(function () {
            $(this).click();
            setTimeout(function () {
                $('button[title="Play (k)"]').click();
            }, 200);
        });
        $("button.ytp-ad-overlay-close-button").click();
    }

    /*
    * Hides elements matching the child selector that are descendants of elements 
    * matching the parentSelector.
    * 
    * @param {string} parentSelector - The CSS selector for the parent elements.
    * @param {object} child - The jQuery object representing the child elements to hide.
    * 
    * Finds all child elements and highlights them yellow.
    * Gets the closest parent element matching the parentSelector for each child.
    * Checks if that parent element has already been hidden. If so, returns.
    * Otherwise, calls hide() to hide the parent element.
    * Sets the 'whacked' attribute to true on the parent element to indicate it has been hidden.
    */
    function hide_matching(parentSelector, child) {
        child.each(function() {
            $(this).css('background', 'yellow');
            const mole = $(this).closest(parentSelector);
            if (mole.attr("whacked")) return;
            hide(mole, `hide matching ${child}`);
            mole.attr('whacked', true);
        })
    }

    /*
    * Hides elements matching the selector.
    * 
    * @param {string} selector - The CSS selector for the elements to hide.
    *
    * Finds all elements matching the selector and calls hide() to hide each element.
    */
    function hide_selector(selector) {
        $(selector).each(function() { hide($(this), selector); });
    }

    /*
    * Hides elements matching the child selector that are descendants of elements 
    * matching the parentSelector.
    * 
    * @param {string} child - The CSS selector for the child elements to hide.
    * @param {string} parent - The CSS selector for the parent elements.
    *
    * Finds all child elements and gets the closest parent element matching the parent selector for each child.
    * Checks if that parent element has already been hidden. If not, calls hide() to hide the parent element.
    * Sets the 'whacked' attribute to true on the parent element to indicate it has been hidden.
    */
    function hide_closest(child, parent) {
        $(child).each(function() {
            $(this).closest(parent).each(function() {
                hide($(this), `closest ${parent}/${child}`);
            })
        });
    }
    
    /*
    * Hides iframe elements other than LinkedIn document viewers.
    * 
    * @param {object} iframe - The jQuery object representing the iframe element.
    * @param {string} src - The src attribute of the iframe element.
    *  
    * Finds all iframe elements on the page and checks if their src attribute contains 'media.licdn.com'.
    * If not, calls hide() to hide the iframe element.
    */
    function hide_iframes() {
        $('iframe').not('[src*="media.licdn.com"]').each(function() { hide($(this), "iframe:" + $(this).attr("src")); });
    }

    /*
    * Hides ads and promotional content on the current page.
    * 
    * @param {string} domain - The domain of the current page.
    *
    * Hides elements known to represent ads. Closes most iframes.
    *
    * Hides inline ads on Facebook, LinkedIn, and Twitter.
    *
    * Hides YouTube video ads.
    */
    function run() {
        log("whackamole: run: " + domain);
        hide_closest('[aria-label*="Sponsored"]', '[data-pagelet]');
        hide_closest('.ad-container', '.ad-container');
        hide_closest('[id^="google_ad_"', 'div');

        hide_iframes();

        hide_selector('.taboola');
        hide_selector('ad-taboola');
        hide_selector('.video-ads');
        hide_selector('.OUTBRAIN');
        hide_selector('.advertoriallist');
        hide_selector('.js-stream-ad');
        hide_selector('.col--advertisement');
        hide_selector('[id*="sponsored"]');
        hide_selector('[data-analytics*="outbrain"]');

        if (domain.match("facebook.com")) {
            hide_matching('div[aria-describedby]', $('use').filter(function(){
                return $($(this).attr("href")).text() === 'Sponsored' || $($(this).attr("xlink:href")).text() === 'Sponsored';
            }));
        }

        if (domain.match("linkedin.com")) {
            hide_matching('.ember-view', $('span').filter(function(){
                return $(this).text() === 'Promoted';
            }));
        }

        if (domain.match("twitter.com")) {
            hide_matching('article', $('span').filter(function(){
                return $(this).text() === 'Promoted';
            }));
        }

        manageYoutubeAd();
        updateWrappers();
    }

    /*
    * Returns whether the URL is from the same domain as the current page.
    * 
    * @param {string} url - The URL to check.
    * @returns {boolean} True if the URL is from the same domain, false otherwise.
    * 
    * Compares the hostname from the URL with the current page's hostname.
    */
    function sameDomain(url) {
        var hostname = url.split('/')[2];
        if (url.charAt(0) != '/' && hostname) {
            var segments = hostname.split('.').reverse();
            var page_segments = document.location.hostname.split('.').reverse();
            return segments[0] == page_segments[0] && segments[1] == page_segments[1];
        }
    }

    var timer = setTimeout(function() { }, 1);

    /*
    * Called when the DOM is modified. Clears any existing timeout and sets a new 1ms timeout to call run().
    * This ensures run() is called very soon after any DOM changes, but not immediately, which could impact performance.
    * 
    * @param {number} timer - The ID of the existing timeout.
    */
    function whack() {
        clearTimeout(timer);
        timer = setTimeout(run, 1);
    }

    /*
    * Checks if the current domain is not localhost. 
    * If not, gets the disabled status for all domains from storage.
    * If all domains are not disabled, gets the disabled status for the current domain from storage.
    * If the current domain is not disabled, adds a DOMSubtreeModified event listener to call whack() 
    * and calls run() to hide ads on the page.
    * 
    * @param {string} domain - The domain of the current page.
    */
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

/*
* Logs a message to the console in the background page.
*/
function log(message) {
    chrome.runtime.sendMessage({kind: "log", message });
}
