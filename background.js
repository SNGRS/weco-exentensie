// background.js

// Luisteren naar berichten van content scripts
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // De prijs ontvangen van het content script
        var prijs = request.prijs;
        //alert(prijs)
        console.log(request)

        // Een nieuw popupvenster openen met popup.html
        chrome.windows.create({
            type: 'popup',
            url: 'popup.html',
            width: 400,
            height: 425
        }, function (win) {
            // Wacht tot het venster geladen is en stuur de prijs naar het popupvenster
            chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
                if (tab.windowId === win.id && changeInfo.status === 'complete') {
                    chrome.tabs.sendMessage(tabId, { prijs: prijs });
                }
            });
        });
    }
);
