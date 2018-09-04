var all_link = document.getElementById('all_link');
var site_link = document.getElementById('site_link');
var support = document.getElementById('support');
var domain = '???';
var disabled = {};

function setSiteLinkText() {
  var action = disabled[domain] ? "Enable" : "Disable";
  site_link.innerText = action + " Whack-a-mole for " + domain;
}

function setAllLinkText() {
  var action = disabled['*'] ? "Enable" : "Disable";
  all_link.innerText = action + " Whack-a-mole";
}

function runInTab(fn) {
  var options = {'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT};
  chrome.tabs.query(options, function(tabs){ fn(tabs[0]); });
}

runInTab(function(tab) {
  chrome.storage.sync.get('*', function(result) {
    disabled['*'] = result['*'] == true;
    setAllLinkText()
    if (!disabled['*']) {
      domain = tab.url.split('/')[2];
      chrome.storage.sync.get(domain, function (result) {
        disabled[domain] = result[domain] == true;
        setSiteLinkText();
      })
    }
  })
});

all_link.addEventListener("click", function() {
  toggle('*');
});

site_link.addEventListener("click", function () {
  toggle(domain);
});

function toggle(target) {
  disabled[target] = disabled[target] != true;
  chrome.storage.sync.set(disabled, function() {
    runInTab(function(tab) {
      chrome.tabs.executeScript(tab.id, {code: 'window.location.reload();'});
      window.close();
    });
  });
}

support.addEventListener("click", function() {
  runInTab(function(tab) {
    chrome.tabs.executeScript(tab.id, {code: 'window.open("http://chrislaffra.com/whackamole");'});
    window.close();
  });
});
