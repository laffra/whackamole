// popup.js

// This code handles enabling/disabling the extension for all sites or the current site, and provides a link to the extension support page.

// Get element references
var all_link = document.getElementById("all_link");
var site_link = document.getElementById("site_link");
var support = document.getElementById("support");

// Initialize variables
var domain = "???";
var disabled = {};

// Set the text for the current site link based on whether the domain is disabled or not
function setSiteLinkText() {
  var action = disabled[domain] ? "Enable" : "Disable";
  site_link.innerText = action + " Whack-a-mole for " + domain;
}

// Set the text for all sites based on whether all domains are disabled or not 
function setAllLinkText() {
  var action = disabled["*"] ? "Enable" : "Disable";
  all_link.innerText = action + " Whack-a-mole";
}

// Run a function in the active tab
function runInTab(info, fn) {
  var options = { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT };
  console.log("runInTab", info, options);
  chrome.tabs.query(options, function (tabs) {
    console.log("run function", tabs[0]);
    fn(tabs[0]);
  });
}

// On popup load, get storage info and set link text
runInTab("setup", function (tab) {
  chrome.storage.sync.get("*", function (result) {
    disabled["*"] = result["*"] == true;
    setAllLinkText();
    if (!disabled["*"] && tab.url) {
      domain = tab.url.split("/")[2];
      chrome.storage.sync.get(domain, function (result) {
        disabled[domain] = result[domain] == true;
        setSiteLinkText();
      });
    }
  });
});

// Adds a click event listener to the all_link element. When clicked, it toggles all domains.
all_link.addEventListener("click", function () {
  toggle("*");
});

// Adds a click event listener to the site_link element. When clicked, it toggles the specific domains.
site_link.addEventListener("click", function () {
  toggle(domain);
});

// The reload() function executes a script in the active tab to reload the page. It then closes the popup window.
function reload() {
  runInTab("reload", function (tab) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        window.location.reload();
      },
      args: [],
    });
    window.close();
  });
}

// The toggle() function inverts the disabled[target] boolean. 
// It then sets this new value in Chrome storage. 
// If there is an error, it clears storage and tries setting the value again. 
// On success, it calls reload() to reload the tab.
function toggle(target) {
  disabled[target] = disabled[target] != true;
  chrome.storage.sync.set(disabled, function () {
    if (chrome.runtime.lastError) {
      chrome.storage.sync.clear(function () {
        chrome.storage.sync.set(disabled, function () {
          reload();
        });
      });
    } else {
      reload();
    }
  });
}

// Adds a click event listener to the support element. 
// When clicked, it opens support documentation in a new tab. 
// It then closes the popup window.
support.addEventListener("click", function () {
  runInTab("click", function (tab) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        window.open("http://chrislaffra.com/whackamole");
      },
      args: [],
    });
    window.close();
  });
});
