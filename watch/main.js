let login;
let did;

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let awesomestreamid = params?.stream;
let cors = params?.cors;
let quality = params?.quality || "5";
let autoquality = params?.quality == "auto";

if (awesomestreamid) startVideo();


function getQuality(m3, currentGame) {
    m3 = m3.split("\n");
    console.log(m3);
    let m3u8;
    for (let i = 0; i < m3.length; i++) {
        if (m3[i].includes(`${quality}.m3u8`) || m3[i].includes(`h.m3u8`)) m3u8 = m3[i];
    }
    console.log(m3u8);
    //Sets the quality of the video
    playVideo(m3u8);
}

async function initLogin() {
    did = new DeviceUUID().get();
    let test = did;
    for (let i = 0; i < did.length; i++) {
        let code = did.charCodeAt(i);
        if (code >= 97 && code <= 122) {
            test = test.split("");
            test[i] = String.fromCharCode(Math.floor(Math.random() * 26) + 97)
            test = test.join("");
        } else if (!isNaN(did[i])) {
            test[i] = Math.floor(Math.random() * 10).toString();
        }
    }
    did = test;

    let response = await fetch("https://api3.fox.com/v2.0/login", {
        headers: {
            "content-type": "application/json",
            "x-api-key": "cf289e299efdfa39fb6316f259d1de93"
        },
        body: JSON.stringify({ deviceId: did }),
        method: "POST",
    });

    login = await response.json();

    let hehe = await fetch(`https://api3.fox.com/v2.0//previewpassmvpd?device_id=${did}&mvpd_id=TempPass_fbcfox_60min`, {
        headers: {
            "x-api-key": "cf289e299efdfa39fb6316f259d1de93"
        }
    });
    let data = await hehe.json();
    login.accessToken = data.accessToken;
    console.log(data);
    return data;
}





async function fetchm3files(currentGame) {
    let streamId = awesomestreamid;

    let payload = {
        capabilities: ["drm/widevine", "fsdk/yo/v3"],
        deviceWidth: 1536,
        deviceHeight: 800,
        maxRes: "720p",
        os: "windows",
        osv: "",
        provider: {
            freewheel: { did: login.deviceId },
            vdms: { rays: "" },
        },
        playlist: "",
        privacy: { us: "1---", lat: false },
        siteSection: null,
        streamType: "live",
        streamId: streamId,
        debug: { traceId: null },
    };

    let hehe = await fetch("https://api3.fox.com/v2.0/watch", {
        headers: {
            "content-type": "application/json",
            authorization: `Bearer ${login.accessToken}`,
            "x-api-key": "cf289e299efdfa39fb6316f259d1de93",
        },
        body: JSON.stringify(payload),
        method: "POST",
    });

    data = await hehe.json();

    let linkp = await fetch(data.url);
    let playerData = await linkp.json();

    if (playerData.prefix.includes('edge') && !cors) {
        console.log('me no likey');
        return fetchm3files();
    }

    if (autoquality) return playVideo(playerData.playURL);

    let m31 = await fetch(playerData.playURL);
    let text = await m31.text();

    console.log(text);

    getQuality(text, currentGame);
}





async function startVideo(game) {
    await initLogin();
    await fetchm3files()
}


async function playVideo(src) {
    let v = document.createElement('div');
    v.innerHTML = `<video controls autoplay muted></video>`;
    document.body.appendChild(v);

    var video = v.children[0];
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) return video.src = src;
    var hls = new Hls({
        manifestLoadingTimeOut: 20000,
        manifestLoadingMaxRetry: Infinity, // keep retrying forever
        manifestLoadingRetryDelay: 2000,
        manifestLoadingMaxRetryTimeout: 64000
    });
    hls.attachMedia(video);
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        console.log("video and hls.js are now bound together !");
        hls.loadSource(src);
        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
            console.log("manifest loaded, found " + data.levels.length + " quality level");
            // video.play();
        });
    });

    setTimeout(() => {
        hls.loadSource(src);
    }, 3000);
}



