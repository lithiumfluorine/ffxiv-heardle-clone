const seed = 9;
const qs = str => document.querySelector(str);
const startDay = 19100;
const timeouts = [1000, 2000, 4000, 8000, 12000, 16000];
const data_path = "./data.json";
const max_guesses = 6;
let song_id;
let guess_number = 0;
let guesses = [];

let game_over = false;

const cyrb53 = function (str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

let messageTimeout;

function message(msg, timeout = 2000) {
    let write_msg = msg => (qs("#main-text-box").innerHTML = msg);
    write_msg(msg);
    clearTimeout(messageTimeout);
    if (timeout != -1)
        messageTimeout = setTimeout(_ => write_msg(""), timeout);
}

function oopsie(args) {
    message("Oopsie! Something broke. Try again, I guess...?");
    console.error(args);
}

function updateGuessList() {
    let elem = document.querySelector("#guess-list");
    for (let i = 0; i < guess_number; ++i) {
        let guess = guesses[i];
        let content;
        if (!!guess.skipped) {
            content = "Skipped!";
        } else {
            content = `${guess.title} ${(!!guess.correct) ? "✔️" : "❌"}`;
        }
        elem.children[i].innerHTML = content;
        if (guess.correct) {
            game_over = true;
            message("Congratulations!", -1);
            return;
        }
    }
    if (guess_number == 6) {
        game_over = true;
        message(`Unfortunately, you didn't figure out today's song:<br/>${window.songs[song_id].title}`, -1);
    }
}

// verify that a song exists in the loaded list
function checkExists(title) {
    for (let song of window.songs) {
        if (song.title === title) {
            return true;
        }
    }
    return false;
}



function makeGuess() {
    if (game_over) return;
    let inputBox = document.querySelector("#autoComplete");
    let input = inputBox.value;

    if (!checkExists(input)) {
        message("That song is not in the database.");
        return;
    }

    let guess = {
        skipped: false,
        title: input,
        correct: input == window.songs[song_id].title
    };
    guesses[guess_number] = guess;
    guess_number++;
    updateGuessList();
}

function skip() {
    if (game_over) return;
    if (guess_number == max_guesses - 1) {
        qs("#main-text-box").innerHTML = "You can't just give up!";
        return;
    }
    guesses[guess_number] = {
        skipped: true,
        title: "Skipped!",
        correct: false
    };
    guess_number++;
    updateGuessList();
}

function eventSetup() {
    // buttons
    qs("#skip-btn").onclick = skip;
    qs("#submit-btn").onclick = makeGuess;

    let audio = qs("#audio-elem");
    // play button
    qs("#play-button").onclick = function () {
        if (game_over) {
            audio.dataset.shouldPlay = true;
            audio.play();
            return;
        }
        audio.dataset.shouldPlay = true;
        audio.play();
        qs("#main-text-box").innerHTML = "Playing!";
        setTimeout(function () {
            audio.dataset.shouldPlay = true;
            audio.pause();
            audio.currentTime = 0;
            qs("#main-text-box").innerHTML = "Stopped!";
        }, timeouts[guess_number]);
    };
    // stop playback if we're not intentionally playing it.
    audio.onplay = function () {
        if (audio.dataset.shouldPlay) {
            return;
        } else {
            // NO CHEATING!! ...mostly. Probably.
            audio.pause();
            audio.currentTime = 0;
        }
    };
}

function autoCompleteSetup() {
    const autoCompJS = new autoComplete({
        data: {
            src: window.songs,
            keys: ["title"]
        }
    });
    autoCompJS.input.addEventListener("selection", function (event) {
        const feedback = event.detail;
        autoCompJS.input.blur();
        const selection = feedback.selection.value[feedback.selection.key];
        autoCompJS.input.value = selection;
    });
}

function loadSong(data) {
    console.log(data.length);
    window.songs = data;
    // select today's song
    // yes I know this isn't perfect, but it works...
    let day = Math.floor(new Date() / 86400000);
    console.log(day);
    let hash = cyrb53('' + day, seed);
    let song = hash % data.length;
    song_id = song;
    console.log("Today's song:", data[song]);
    console.log("Today's number: " + (day - startDay + 1));

    let player = qs("#audio-elem");
    player.src = data[song]["path"];
    player.load();

    eventSetup();
    autoCompleteSetup();
}

fetch(data_path, { credentials: "include" })
    .then(resp => resp.json())
    .then(data => loadSong(data))
    .catch(console.error);
