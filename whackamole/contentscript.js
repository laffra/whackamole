(function WhackAMole() {

  var count = 0;
  var domain = document.location.hostname;

  function run() {
    count += 1;
    if (count % 100 == 1) console.log('WhackAMole: ran ' + count + ' times on ' + domain);

    function hide() {
      var mole = $(this);
      if (!mole.attr('whacked')) {
        var url = mole.attr('src') || mole.attr('data') || mole.attr('href') || '';
        if (!url || !sameDomain(url)) {
          mole.attr('whacked', true);
          var hostname = url && url.split('/')[2];
          if (!hostname || hostname.indexOf('.') == -1) hostname = '';
          console.log('WhackAMole: ' + mole.prop('tagName') + ' ' + hostname);
          while (mole.parent().children().length == 1) { mole = mole.parent(); }
          mole.css('visibility', 'hidden');
          var wrapper = $('<div>')
              .css('width', '0')
              .css('height', '0');
          if (mole.prop('tagName') == 'OBJECT')
            wrapper
              .text('Whacked Flash Content')
              .css('width', '110px')
              .css('height', '26px')
              .css('background', 'lightyellow')
              .css('font-size', '10px')
              .css('text-align', 'left')
              .css('padding-left', '2px')
              .css('border', '1px solid #333')
              .css('cursor', 'pointer')
              .click(function() {
                var wrapper = $(this);
                var mole = $(wrapper.children()[0]);
                wrapper.replaceWith(mole);
                mole.css('visibility', 'visible');
              })
              .attr('title', 'Whacked ' + mole.prop('tagName') + ' ' + url);
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
    $('iframe').each(hide);
    $('object').each(hide);
    $('a[href*="doubleclick"]').each(hide);
    $('a[href*="/campaign/landing.php"]').parent().parent().parent().parent().each(hide);
    $('span:contains("Suggested Post")').parent().parent().parent().parent().each(hide);
    $('img[src*="googlesindication"]').each(hide);
    $('.ad-container').each(hide);
  };

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

  if (!domain.endsWith('.google.com')) {
    chrome.storage.sync.get(domain, function(disabled) {
      if (!disabled[domain]) {
        document.body.addEventListener('DOMSubtreeModified', whack);
        run();
      }
    });
  }

})();
