var link = document.getElementById('link');
var domain = '???';
var disabled = {};

function setLinkText() {
  var action = disabled[domain] ? "Enable" : "Disable";
  link.innerText = action + " Whack-a-mole for " + domain;
}

function runInTab(fn) {
  var options = {'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT};
  chrome.tabs.query(options, function(tabs){ fn(tabs[0]); });
}

runInTab(function(tab) {
  domain = tab.url.split('/')[2];
  chrome.storage.sync.get(domain, function(result) {
    disabled[domain] = result[domain] == true;
    setLinkText();
  })
});

link.addEventListener("click", function() {
  disabled[domain] = disabled[domain] != true;
  chrome.storage.sync.set(disabled, function() {
    runInTab(function(tab) { 
      chrome.tabs.executeScript(tab.id, {code: 'window.location.reload();'});
      window.close();
    });
  });
});
