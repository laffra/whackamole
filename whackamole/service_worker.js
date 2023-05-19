chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.pageAction.show(tabId);
});

chrome.runtime.onMessage.addListener(function(request, sender, response) {
    if (request.kind === 'log')
        console.log(request.message);
});