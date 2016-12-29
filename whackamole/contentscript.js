(function WhackAMole() {
    var domain = document.location.hostname;
    function hide() {
        var mole = $(this);
        if (!mole.attr('whacked')) {
            var url = mole.attr('src') || mole.attr('data') || mole.attr('href') || '';
            if (!url || !sameDomain(url)) {
                mole.attr('whacked', true);
                var hostname = url && url.split('/')[2];
                if (!hostname || hostname.indexOf('.') == -1) hostname = '';
                while (mole.parent().children().length == 1) { mole = mole.parent(); }
                mole.css('visibility', 'hidden').empty();
                var wrapper = $('<div>').css('width', '0').css('height', '0');
                mole.animate(
                    {width: '0px', height: '0px'},
                    1,
                    function() {
                        mole.replaceWith(wrapper);
                        wrapper.append(mole);
                    }
                );
            }
        }
    }
    var fbDivCount = 0;
    function run() {
        $('iframe').each(hide);
        $('img.img_ad').each(hide);
        $('object').each(hide);
        $('.rc-wc').each(hide);
        $('.trc_rbox_container').each(hide);
        $('.OUTBRAIN').each(hide);
        $('.cn__title:contains(Paid)').parent().parent().each(hide);
        $('.cn__title:contains(Content)').parent().parent().each(hide);
        $('.zn-header:contains(Paid)').parent().each(hide);
        $('a[href*="TravelListChallenge"]').parent().parent().parent().parent().parent().parent().each(hide);
        $('a[href*="doubleclick"]').each(hide);
        $('a[href*="/campaign/landing.php"]').parent().parent().parent().parent().each(hide);
        $('span:contains("Suggested Post")').parent().parent().parent().parent().each(hide);
        $('img[src*="googlesindication"]').each(hide);
        $('.ad-container').each(hide);
        if (domain == 'www.facebook.com') facebook();
    }
    function facebook() {
        $('#mainContainer #contentCol #rightCol').each(hide);
        $('#mainContainer #leftCol').each(hide);
        $('.fbChatSidebar').each(hide);
        $('#contentCol div').each(function() {
            var div = $(this);
            if (div.attr('data-fte') === '1') {
                if (!div.attr('whack-fb-col')) {
                    div.attr('whack-fb-col', '0');
                    div.attr('whack-fb-index', fbDivCount);
                    switch (fbDivCount % 3) {
                        case 1:
                            console.log('move to column 1: ' + fbDivCount)
                            $('#whack-col-1').append(div);
                            break
                        case 2:
                            console.log('move to column 2: ' + fbDivCount)
                            $('#whack-col-2').append(div);
                            break
                    }
                    fbDivCount++;
                }
            }
        });
    }
    if (domain == 'www.facebook.com') {
        function setup() {
            $('#whack-col-1').remove();
            $('#whack-col-2').remove();
            $('#mainContainer').append(
                $('<div>')
                    .attr('id', 'whack-col-1')
                    .css('position', 'absolute')
                    .css('overflow', 'hidden')
                    .css('top', '11px')
                    .css('left', '365px')
                    .css('width', '500px'),
                $('<div>')
                    .attr('id', 'whack-col-2')
                    .css('position', 'absolute')
                    .css('overflow', 'hidden')
                    .css('top', '11px')
                    .css('left', '880px')
                    .css('width', '500px')
            );
            $('#contentCol')
                .css('position', 'absolute')
                .css('overflow', 'hidden')
                .css('top', '0px')
                .css('width', '500px')
                .css('left', '-340px');
        }
        $("span:contains('More Stories')").trigger('click');
        setup();
        $(window).resize(setup);
        setInterval(facebook, 10000);
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
        timer = setTimeout(run, 10);
    }

    chrome.storage.sync.get(domain, function(disabled) {
        if (!disabled[domain]) {
            document.body.addEventListener('DOMSubtreeModified', whack);
            run();
        }
    });
})();
