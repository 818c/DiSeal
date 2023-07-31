let enabled = false;
let refreshEnabled = false;
let delay = 400;
let buydelay = 50; // Default delay time in milliseconds
let refreshIntervalId;
let buyIntervalId;

function snipeitem() {
  const buyButton = document.querySelector('button.btn-growth-lg.btn-fixed-width-lg.PurchaseButton');
  const itemPrice = document.querySelector('div.item-price-value span.text');
  const getNowButton = document.querySelector('.modal-button');
  const quantityLeftMessage = document.querySelector('div.font-caption-body');

  if (enabled && buyButton && itemPrice && itemPrice.textContent === 'Free') {
    // Check if quantityLeftMessage exists and includes 'Quantity Left: 0/'
    // If it's not present, or if it doesn't include 'Quantity Left: 0/', proceed with the purchase
    if (!quantityLeftMessage || !quantityLeftMessage.textContent.includes('Quantity Left: 0/')) {
      buyButton.click();

      setTimeout(() => {
        if (getNowButton) {
          getNowButton.click();

          // Add an additional 5-second delay before clicking getNowButton again (if it's still available)
          setTimeout(() => {
            if (getNowButton) {
              getNowButton.click();
            }
          }, 5000);
        }
      }, 10);
    }
  }
}



function refreshItems() {
  const refreshButton = document.querySelector('span#refresh-details-button');

  if (refreshButton && refreshEnabled) {
    refreshButton.click();
  }
}

function startBuyInterval() {
  if (!buyIntervalId) {
    buyIntervalId = setInterval(snipeitem, buydelay); // Start the refresh action
  }
}

function stopBuyInterval() {
  if (buyIntervalId) {
    clearInterval(buyIntervalId); // Stop the refresh action
    buyIntervalId = null;
  }
}

chrome.storage.local.get(['deviceID'], function(result) {
  const deviceID = result.deviceID;

  if (deviceID) {
    // Device ID exists, enable the extension
    enabled = true;
    startBuyInterval();

    chrome.runtime.sendMessage({ type: 'saveSettings', settings: { enabled: enabled } });
  }
});

chrome.runtime.onMessage.addListener(function(request) {
  if (request.enabled !== undefined) {
    enabled = request.enabled;
    if (!enabled) {
      stopBuyInterval(); // Stop the buy action when disabled
      refreshIntervalId = null;
    } else if (enabled && !buyIntervalId) {
      startBuyInterval(); // Start the buy action if enabled
    }
    chrome.runtime.sendMessage({ type: 'saveSettings', settings: { enabled: enabled } });
  }
  if (request.buydelay !== undefined) {
    buydelay = request.buydelay;
    if (enabled && buyIntervalId) {
      clearInterval(buyIntervalId); // Clear the previous interval
      startBuyInterval(); // Start a new interval with the updated delay
    }
    chrome.runtime.sendMessage({ type: 'saveSettings', settings: { buydelay: buydelay } });
  }
  if (request.refreshEnabled !== undefined) {
    refreshEnabled = request.refreshEnabled;
    if (!refreshEnabled) {
      clearInterval(refreshIntervalId); // Stop the refresh action when disabled
      refreshIntervalId = null;
    } else if (refreshEnabled && !refreshIntervalId) {
      refreshIntervalId = setInterval(refreshItems, delay); // Start the refresh action if enabled
    }
    chrome.runtime.sendMessage({ type: 'saveSettings', settings: { refreshEnabled: refreshEnabled } });
  }
  if (request.delay !== undefined) {
    delay = request.delay;
    if (refreshEnabled && refreshIntervalId) {
      clearInterval(refreshIntervalId); // Clear the previous interval
      refreshIntervalId = setInterval(refreshItems, delay); // Start a new interval with the updated delay
    }
    chrome.runtime.sendMessage({ type: 'saveSettings', settings: { delay: delay } });
  }
});
