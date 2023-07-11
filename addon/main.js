const determineWorth = (costMap, title) => {
    let spent = costMap[`${title} Pack`];
    //fall back to just the title if title + pack is not there
    if (!spent) {
        spent = costMap[title];
    }
    if (spent) {
        return spent;
    } else {
        console.log(`Unable to find value for '${title}'`)
    }
}

const parseBadges = (costMap) => {
    var postedByDivs = document.querySelectorAll("div.posted-by");

    for (let i = 0; i < postedByDivs.length; i++) {
        const name = postedByDivs[i].querySelector('span.profile-link>a').textContent;
        const badges = postedByDivs[i].querySelector("div.badges.clearfix");

        if (!badges) {
            continue;
        }
        let moneySpent = 0;

        const packs = badges.querySelectorAll("div.badge");
        packs.forEach(p => {
            const title = p.querySelector("img").getAttribute("title");
            if (title.endsWith("Supporter")) {
                let cost = determineWorth(costMap, title);
                if (cost) {
                    moneySpent += cost;
                    p.style.border = "2px dotted green"
                } else {
                    p.style.border = "2px solid red"
                }
            }
        });


        let span = document.createElement("span");
        span.textContent = `${moneySpent} $`;
        span.style.color = "red"
        span.style.fontSize = "16px";
        badges.parentElement.appendChild(span)
    }
}
const init = () => {
    const url = browser.runtime.getURL("resources/packs.json");
    fetch(url)
        .then(x => x.json())
        .then(badges => parseBadges(badges.packs));
};

init()
