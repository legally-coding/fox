var validFoxStreams = ["FOX", "FOXDEP", "FS1", "FS2"];
var liveGames = [];
var loaded = 0;

document.querySelector("#view").onclick = function () {
    if (loaded) return;
    this.style.display = 'none';
    this.style.cursor = 'default';
    loaded = 1;
    loadEvents();
}


async function loadEvents() {

    /*  old response

    let response = await fetch("https://api.foxsports.com/bifrost/v1/topevents/broadcast/eventschedule?apikey=jE7yBJVRNAwdDesMgTzTXUUSx1It41Fq", { cache: "reload" });
    let games = await response.json();
    liveGames = games = games.events.filter((g) => {
        console.log(g?.tvStations.some((t) => { return validFoxStreams.indexOf(t) > -1 }));
        return g?.tvStations.some((t) => { return validFoxStreams.indexOf(t) > -1 }) && (new Date(g.eventTime)).getTime() - Date.now() < 600000;
    });

    document.querySelector(".game-list").style.display = "block";
    if(!games.length)return document.querySelector("#view").style.display = 'block', document.querySelector("#view").innerText = 'no games on now sorry mate';
    
    console.log(games);

    */


    document.querySelector(".game-list").style.display = "block";
    let end_date = new Date();
    end_date.setSeconds(0, 0);
    let start_date = new Date(end_date);
    end_date.setMinutes(end_date.getMinutes() + 5);
    end_date = Math.floor(end_date.getTime() / 1000);
    start_date = Math.floor(start_date.getTime() / 1000);
    let response = await fetch(`https://api.fox.com/fs/product/curated/v1/sporting/keystone/detail/by_filters?callsign=BTN%2CBTN-DIGITAL%2CFOX%2CFOX-DIGITAL%2CFOXDEP%2CFOXDEP-DIGITAL%2CFS1%2CFS1-DIGITAL%2CFS2%2CFS2-DIGITAL%2CFSP%2CKCPQ-DT&end_date=${start_date + 5}&size=50&start_date=${start_date}&video_type=listing`, {
        "headers": {
            "x-fox-apikey": "cf289e299efdfa39fb6316f259d1de93",
        },
        cache: "reload"
    });
    let json = await response.json();
    let games = json.data.listings.items;

    games.forEach(g => initLiveGames(g));


}

function initLiveGames(game) {
    var el = document.createElement("div");
    el.innerText = game.title;
    // el.onclick = () => { createStreamLinks(game) }; old / former
    el.onclick = () => { redirect(game.entity_id) };
    document.querySelector(".game-list").appendChild(el);
}

function createStreamLinks(game) {
    getStreamIds(game);
}

async function getStreamIds(game) {
    /* old stream ids
    var screenLink = game.entityLink.contentUri;
    let response = await fetch('https://api3.fox.com/v2.0/screens/foxsports-detail/' + screenLink, {
        headers: {
            "x-api-key": "cf289e299efdfa39fb6316f259d1de93",
        },
    });
    game = await response.json();

    console.log(game);

    let streams = [];
    game.panels.member[0].items.member.forEach((s) => s.airingType == "live" ? streams.push([s.trackingData.properties.assetName, s.id]) : 1);


    console.log(streams);

    document.querySelector(".game-list").innerHTML = '';
    streams.forEach(s => linkStreamLinks(s));

    */

    document.querySelector(".game-list").innerHTML = '';

}

function linkStreamLinks(stream) {
    var el = document.createElement("div");
    el.innerText = stream[0];
    el.onclick = () => { redirect(stream[1]) };

    document.querySelector(".game-list").appendChild(el);
}

function redirect(streamid) {
    console.log(streamid);
    window.location.href = '../watch/?stream=' + streamid;
}
