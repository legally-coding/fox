var validFoxStreams = ["FOX", "FOXDEP", "FS1", "FS2"];
var liveGames = [];
var loaded = 0;

document.querySelector("#view").onclick = function () {
    if(loaded)return;
    this.style.display = 'none';
    this.style.cursor = 'default';
    loaded = 1;
    loadEvents();
}


async function loadEvents() {
    let response = await fetch("https://api.foxsports.com/bifrost/v1/topevents/broadcast/eventschedule?apikey=jE7yBJVRNAwdDesMgTzTXUUSx1It41Fq", { cache: "reload" });
    let games = await response.json();
    liveGames = games = games.events.filter((g) => {
        console.log(g?.tvStations.some((t) => { return validFoxStreams.indexOf(t) > -1 }));
        return /*g?.eventStatus == 1 && */g?.tvStations.some((t) => { return validFoxStreams.indexOf(t) > -1 }) && (new Date(g.eventTime)).getTime() - Date.now() < 600000;
    });

    document.querySelector(".game-list").style.display = "block";
    if(!games.length)return document.querySelector("#view").style.display = 'block', document.querySelector("#view").innerText = 'no games on now sorry mate';
    
    console.log(games);

    games.forEach(g => initLiveGames(g));

    
}

function initLiveGames(game) {
    var el = document.createElement("div");
    el.innerText = game.title;
    el.onclick = ()=>{createStreamLinks(game)};
    document.querySelector(".game-list").appendChild(el);
}

function createStreamLinks(game) {
    getStreamIds(game);
}

async function getStreamIds(game) {
    var screenLink = game.entityLink.contentUri;
    let response = await fetch('https://api3.fox.com/v2.0/screens/foxsports-detail/' + screenLink, {
        headers: {
            "x-api-key": "cf289e299efdfa39fb6316f259d1de93",
        },
    });
    game = await response.json();

    console.log(game);

    let streams = [];
    game.panels.member[0].items.member.forEach((s)=>s.airingType == "live" ? streams.push([s.trackingData.properties.assetName,s.id]) : 1);


    console.log(streams);

    document.querySelector(".game-list").innerHTML = '';
    streams.forEach(s=>linkStreamLinks(s));
    
}

function linkStreamLinks(stream){
    var el = document.createElement("div");
    el.innerText = stream[0];
    el.onclick = ()=>{redirect(stream[1])};

    document.querySelector(".game-list").appendChild(el);
}

function redirect(streamid){
    console.log(streamid);
    window.location.href = '../watch/?stream='+streamid;
}
