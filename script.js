let currentSong = new Audio();
let prevbtn = document.querySelector("#previous");
let playbtn = document.querySelector("#play");
let nextbtn = document.querySelector("#next");
let songinfo = document.querySelector(".songinfo");
let hamburger = document.querySelector("#brgr");
let sidebar = document.querySelector(".left-box");
let playbar = document.querySelector(".playbar");
let currFolder;


hamburger.addEventListener("click", () => {
    if (sidebar.style.display === "block") {
        sidebar.style.display = "none";
    } else {
        sidebar.style.display = "block";
    }
    // if (sidebar.style.opacity === "0") {
    //     sidebar.style.display = "1";
    // } else {
    //     sidebar.style.display = "0";
    // }

    // sidebar.style.width = sidebar.style.width === "0px" ? "20vw" : "0px";
    // playbar.style.width = playbar.style.width === "100%" ? "80vw" : "100%";
});
document.addEventListener('touchstart', function (e) {
    console.log(e.target);
    if (!sidebar.contains(e.target)) {
        sidebar.style.display = 'none';
    }
});
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://192.168.34.217:61612/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".mid-portion").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <span class="material-symbols-outlined">
                music_note
            </span>
            <div class="song-info">
                <div class="song-name">${song.replaceAll("%20", " ")}</div>
                <div class="artist-name">Kshitiz</div>
            </div>
            <div class="playnow">
                <span class="material-symbols-outlined">
                    play_arrow
                </span>
            </div>
        </li>
        `;
    }
    Array.from(document.querySelector(".mid-portion").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".song-info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".song-info").firstElementChild.innerHTML.trim());
            songinfo.innerHTML = e.querySelector(".song-info").firstElementChild.innerHTML.trim();
        });
    })
}

const playMusic = (track, pause = false) => {

    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        playbtn.innerHTML = "pause";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track.replaceAll(".mp3", ""));
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";

}

async function displayAlbums() {
    let a = await fetch(`http://192.168.34.217:61612/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container");
    let array =  Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/songs/")[1];
            // console.log(folder)
            let a = await fetch(`http://192.168.34.217:61612/songs/${folder}/info.json`);
            let response = await a.text();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `
            <div data-folder="${folder}" class="card">
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h3>${response.title}</h3>
                <p>${response.description}</p>
                <div class="play">
                    <span class="material-symbols-outlined" style="color: black; font-weight: bold;
                    font-size: 25x;">
                        play_arrow
                    </span>
                </div>
            </div>
            `
        }
    };
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener('click', async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            // console.log(songs)
        }, false);
    })
}

async function main() {
    await getSongs("songs/tame-impala");

    playMusic(songs[0], true);

    displayAlbums();


    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playbtn.innerHTML = "pause";
        } else {
            currentSong.pause();
            playbtn.innerHTML = "play_arrow";
        }
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === " ") {
            if (currentSong.paused) {
                currentSong.play();
                playbtn.innerHTML = "pause";
            } else {
                currentSong.pause();
                playbtn.innerHTML = "play_arrow";
            }
        }
    }, false)

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration * percent) / 100);
        // console.log(percent , currentSong.currentTime , currentSong.duration);
    });


    currentSong.addEventListener("ended", () => {
        let currentSongIndex = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
        if (currentSongIndex === songs.length - 1) {
            currentSongIndex = -1;
        }
        playMusic(songs[currentSongIndex + 1]);
    });

    prevbtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    });

    nextbtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    });

}
main();

console.log();