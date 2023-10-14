// This script is executed in the environment of the host page. It does the
// following:
// 1) Finds the "Print" button in the top navigation bar
// 2) Adds a "Section" option to the print button
// 3) Sends a list of chapterids in the current section to build_manual.js to
//    build out the full section PDF

const print_button = document.getElementById("printsubmenu");

if (print_button) {
    var button = document.createElement("button");
    button.innerHTML = "Section";
    button.addEventListener("click", function() {
        const ol = get_tree_menu_ol();
        if (ol) {
            const chapterids = parse_chapterids_from_tree_menu(ol);
            const chapter_title = document.getElementById("titlesisec").innerText;
            const pubno = document.getElementById("pubno").innerText;
            chrome.runtime.sendMessage({title: `${pubno}:${chapter_title}`, chapterids: chapterids});
        } else {
            alert("Please select an item to print.");
        }
    });

    print_button.appendChild(button);
}

function get_tree_menu_ol() {
    const tree_menu = document.getElementById("treemenu");
    const ol = tree_menu?.querySelector('ol');
    return ol;
}

// Gets all the chapter ids from '#treemenu' on the right hand side
function parse_chapterids_from_tree_menu(ol) {
    const chapters = [];
    const chapter_title = document.getElementById("titlesisec").innerText;
    const pubno = document.getElementById("pubno").innerText;
    for (let li of ol.children) {
        chapters.push(parseChild(li));
    }
    const ids = []
    for (let chapter of chapters) {
        ids.push(...getChapterIds(chapter))
    }
    const chapterids = ids.map(id => id.substr(0,4)).filter((id, index, self) => self.indexOf(id) === index);
    return chapterids;
}

function parseChild(li) {
    const label = li.querySelector("label");
    if (label) {
        var child = {}
        child.name = label.innerText;
        child.id = label.getAttribute("data-id");
        if (!child.id) {
            child.children = [];
            let ol = li.querySelector("ol");
            if (ol) {
                for (let li of ol.children) {
                    child.children.push(parseChild(li))
                }
            }
        }
        return child
    }
}

function getChapterIds(sections) {
    var ids = [];
    if (sections.children) {
        for (let child of sections.children) {
            ids.push(...getChapterIds(child));
        } 
    } else {
        ids.push(sections.id)
    }

    return ids;
}
