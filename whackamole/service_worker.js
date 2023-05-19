/*
* Listens for tabs being updated. When a tab is updated, shows the page action icon for that tab.
*
* @param {number} tabId - The ID of the tab that was updated.
* @param {object} changeInfo - Information about the update to the tab.
* @param {object} tab - Details about the updated tab.
*/
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.pageAction.show(tabId);
});


/*
* Listens for messages from the content script. When a 'log' message is received, logs the message to the console. 
*
* @param {object} request - The message received from the content script.
* @param {object} sender - Details about the sender of the message.
* @param {function} response - A function to call to send a response.
*/
chrome.runtime.onMessage.addListener(function(request, sender, response) {
    if (request.kind === 'log')
        console.log(request.message);
});