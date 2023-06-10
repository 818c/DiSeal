chrome.runtime.onInstalled.addListener(function() {
  // Generate a unique device ID and store it
  const deviceID = Math.random().toString(36).substr(2, 9); // Generate a random alphanumeric string

  chrome.storage.local.set({ deviceID: deviceID }, function() {
    console.log('Device ID generated and stored:', deviceID);
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'getSettings') {
    chrome.storage.local.get(['enabled', 'refreshEnabled', 'delay', 'buydelay'], function(result) {
      sendResponse(result);
    });
    return true; // Enable asynchronous response
  }
  if (request.type === 'saveSettings' && request.settings) {
    chrome.storage.local.set(request.settings);
  }
});
