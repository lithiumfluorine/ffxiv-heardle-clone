const startDay = 19100;
const timeouts = [1000, 2000, 4000, 8000, 12000, 16000];
const data_path = "./data.json";

const cyrb53 = function(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};

function oopsie(args) {
    document.querySelector("#main-text-box").innerHTML = "Oopsie! Something broke. Try again, I guess...?";
    console.error(args);
}

function event_setup() {
    document.querySelector("#play-button").onclick = function() {
        document.querySelector("#audio-elem").play();
        setTimeout(function() {
            let player = document.querySelector("#audio-elem");
            player.pause();
            player.currentTime = 0;
        }, 1000);
    };
}

function load_song(data) {
    console.log(data.length);
    window.songs = data;
    // select today's song
    // yes I know this isn't perfect, but it works...
    let day = Math.floor(new Date() / 86400000); 
    console.log(day);
    let hash = cyrb53('' + day, 1);
    let song = hash % data.length;
    console.log("Today's song:", data[song]);
    console.log("Today's number: " + (day - startDay + 1));

    let player = document.querySelector("#audio-elem");
    player.src = data[song]["path"];
    player.preload = "auto";

    event_setup();
}

fetch(data_path, { credentials: "include" })
    .then(resp => resp.json())
    .then(data => load_song(data))
    .catch(console.error);
