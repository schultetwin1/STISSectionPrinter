console.log("service worker!");

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        const title = request.title;
        const firstid = request.chapterids.shift();
        const url = `https://techinfo.subaru.com/stis/doc/htmlDiagnostics/19_FORESTER_G8240BE_V42/contents/data/print/${firstid}.html?print=wait`;

        chrome.tabs.create({
            url: url
        }).then((tab) => {
            console.log(`Created Tab ${tab.id}`);
            chrome.tabs.onUpdated.addListener(function listener(tabIdUpdated, info) {
                if (tabIdUpdated === tab.id && info.status === 'complete') {
                    chrome.tabs.sendMessage(tab.id,
                        {
                            type: "TO_PAGE",
                            chapterids: request.chapterids,
                            title: title,
                        }
                    );
                    chrome.tabs.onUpdated.removeListener(listener);
                }
            })
        });
    }
  );