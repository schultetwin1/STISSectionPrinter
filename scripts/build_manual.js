// This script is used to render all the chapters for the section.
// It works in the following steps:
// 1) Gets a list of chapter ids sent via the service worker
// 2) For each chapter id, fetch the print page for it
// 3) For each fetch result, append the items in the `<body>` element to the
//    current page's `<body>` element

function render_next_chapter(chapterids) {
    if (!chapterids) {
        return;
    }

    if (chapterids.length === 0) {
        // Launch the print dialog when done
        window.print();
        return;
    }

    console.log(`${chapterids.length} chapters left`);

    const nextid = chapterids.shift();
    const url = new URL(window.location.href);
    const pathSegments = url.pathname.split('/');
    pathSegments[pathSegments.length - 1] = `${nextid}.html`;
    url.pathname = pathSegments.join('/');
    fetch(url)
        .then(response => {
            if (!response.ok) {
                console.log("Network response was not ok");
                return;
            }
            return response.text()
        })
        .then(data => {
            if (data) {
                let parser = new DOMParser();
                let doc = parser.parseFromString(data, 'text/html');
                document.body.append(...doc.body.children);
            }
            render_next_chapter(chapterids);
        })



}
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.type === "TO_PAGE") {
        document.title = request.title;
        render_next_chapter(request.chapterids)
      }
    }
  );