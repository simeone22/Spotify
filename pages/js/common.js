const playControllerIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" class="size-6"><path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" /></svg>';
const pauseControllerIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>';
const playControllerIconWS =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6"><path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" /></svg>';
const pauseControllerIconWS =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>';

const playIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" /></svg>';
const pauseIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>';
const nextIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" stroke-width="1.5" class="size-8"><path stroke-linecap="round" transform="translate(0, -4.5)" stroke-linejoin="round" d="M21 7.5M13 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811Z" /></svg>';
const prevIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" stroke-width="1.5" class="size-8" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" transform="matrix(-1,0,0,1,0,0)"><path stroke-linecap="round" transform="translate(0, -4.5)" stroke-linejoin="round" d="M21 7.5M13 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811Z"></path></svg>';
const volumeIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>';
const mutedVolumeIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>';

let audioPlayer = getAudioPlayer();

function getAudioPlayer() {
    let data = localStorage.getItem("audioSettings");
    const audioPlayer = document.createElement("audio");
    audioPlayer.type = "audio/mpeg";

    audioPlayer.ontimeupdate = async () => {
        localStorage.setItem(
            "audioSettings",
            JSON.stringify({
                src: audioPlayer.src,
                currentTime: audioPlayer.currentTime,
                paused: audioPlayer.paused,
                loop: audioPlayer.loop,
                volume: audioPlayer.volume,
                muted: audioPlayer.muted,
            })
        );
    };

    if (data === null) {
        localStorage.setItem(
            "audioSettings",
            JSON.stringify({
                src: audioPlayer.src,
                currentTime: audioPlayer.currentTime,
                paused: audioPlayer.paused,
                loop: audioPlayer.loop,
                volume: audioPlayer.volume,
                muted: audioPlayer.muted,
            })
        );
    } else {
        data = JSON.parse(data);
        audioPlayer.src = data.src;
        audioPlayer.currentTime = data.currentTime;
        audioPlayer.loop = data.loop;
        audioPlayer.volume = data.volume;
        audioPlayer.muted = data.muted;
        audioPlayer.onended = () => {
            let data = localStorage.getItem("tracks");
            if (data === null) {
                audioPlayer.src = "";
                return;
            }
            tracks = JSON.parse(data);
            let cIdx = tracks.findIndex(
                (el) =>
                    el.SongID ===
                    audioPlayer.src.split("/").pop().split(".mp3")[0]
            );
            cIdx++;
            if (cIdx >= tracks.length) cIdx = 0;
            audioPlayer.src = `/media/audio/songs/${tracks[cIdx].SongID}.mp3`;
            audioPlayer.play();
        };
        if (!data.paused) {
            audioPlayer.play();
        }
    }
    return audioPlayer;
}

function getParameters() {
    let dict = [];
    window.location.search
        .substring(1)
        .split("&")
        .map((el) => {
            let arr = el.split("=");
            dict[arr[0]] = arr[1];
            //return {key: arr[0], value: arr[1]}
        });
    return dict;
}
function getDuration(timeS, shortForm = false) {
    const periods = { hours: 0, minutes: 0, seconds: 0 };
    if (timeS / 3600 >= 1) {
        periods.hours = Math.floor(timeS / 3600);
        timeS -= periods.hours * 3600;
    }
    if (timeS / 60 >= 1) {
        periods.minutes = Math.floor(timeS / 60);
        timeS -= periods.minutes * 60;
    }
    periods.seconds = timeS;
    let returnString = "";

    if (periods.hours > 0) {
        if (shortForm === true)
            returnString = `${periods.hours}:${periods.minutes
                .toString()
                .padStart(2, "0")}`;
        else
            returnString = `${periods.hours} hours ${periods.minutes
                .toString()
                .padStart(2, "0")} minutes`;
    } else {
        if (shortForm === true)
            returnString = `${periods.minutes}:${periods.seconds
                .toString()
                .padStart(2, "0")}`;
        else
            returnString = `${periods.minutes} minutes ${periods.seconds
                .toString()
                .padStart(2, "0")} seconds`;
    }

    return returnString;
}

function getDate(timestamp) {
    return new Date(timestamp).toLocaleDateString();
}

function songCard(
    orderId,
    id,
    name,
    publishers,
    albumName,
    albumId,
    publicationDate,
    duration
) {
    let element = document.createElement("div");
    const source = `/media/audio/songs/${id}.mp3`;

    element.className = "songContainer";

    let el = document.createElement("div");
    el.className = "orderId";

    let btn = document.createElement("button");
    btn.innerHTML = (audioPlayer.src.endsWith(source) && !audioPlayer.paused) ? pauseIcon : playIcon;
    btn.className = "playButton";

    if (audioPlayer.src.endsWith(source)) {
        element.classList.add("playing");
    }

    audioPlayer.addEventListener("change", () => {
        btn.innerHTML = playIcon;
    });

    audioPlayer.addEventListener("play", () => {
        if(!audioPlayer.src.endsWith(source)) return;
        btn.innerHTML = pauseIcon;
    });

    audioPlayer.addEventListener("pause", () => {
        if(!audioPlayer.src.endsWith(source)) return;
        btn.innerHTML = playIcon;
    });

    btn.onclick = () => {
        let oldPlaying = document.querySelector(".playing");
        if (oldPlaying !== null) {
            oldPlaying.querySelector(".playButton").innerHTML = playIcon;
            oldPlaying.classList.remove("playing");
        }
        element.classList.add("playing");

        if (audioPlayer.src.endsWith(source)) {
            if (!audioPlayer.paused) {
                btn.innerHTML = playIcon;
                audioPlayer.pause();
            } else {
                btn.innerHTML = pauseIcon;
                audioPlayer.play();
            }
        } else {
            console.log("new play");
            //btn.innerHTML = pauseIcon;
            audioPlayer.src = source;
            //audioPlayer.play();
            playPlaylist();
        }
    };
    el.appendChild(btn);
    let sp = document.createElement("span");
    sp.innerText = orderId;
    el.appendChild(sp);
    element.appendChild(el);
    el = document.createElement("div");
    let img = document.createElement("img");
    img.src = `/media/images/songs/${id}.png`;
    el.className = "title";
    el.appendChild(img);
    let div = document.createElement("div");
    div.appendChild(document.createTextNode(name));
    sp = document.createElement("span");
    for (publisher of publishers) {
        let pub = document.createElement("a");
        pub.innerText = publisher.name;
        pub.href = `/user?id=${publisher.id}`;
        sp.appendChild(pub);
        sp.appendChild(document.createTextNode(", "));
    }
    sp.removeChild(sp.lastChild);
    div.appendChild(sp);
    el.appendChild(div);
    element.appendChild(el);
    el = document.createElement("div");
    el.className = "album";
    let link = document.createElement("a");
    link.innerText = albumName;
    link.href = `/playlist?id=${albumId}`;
    el.appendChild(link);
    element.appendChild(el);
    el = document.createElement("div");
    el.className = "publicationDate";
    el.innerText = getDate(publicationDate);
    element.appendChild(el);
    el = document.createElement("div");
    el.className = "duration";
    el.innerText = getDuration(duration, true);
    element.appendChild(el);
    element.onclick = () => {
        let selected = document
            .querySelector("#songsContainer")
            .querySelector(".selected");
        if (selected !== null) selected.classList.remove("selected");
        element.classList.add("selected");
    };
    return element;
}

function squaredPlaylist(id, name) {
    let element = document.createElement("div");

    element.className = "playlistContainer";

    let el = document.createElement("div");

    let btn = document.createElement("button");
    btn.innerHTML = playControllerIcon;
    btn.className = "playButton";

    audioPlayer.addEventListener("play", () => {
        btn.innerHTML = pauseControllerIcon;
    });

    audioPlayer.addEventListener("pause", () => {
        btn.innerHTML = playControllerIcon;
    });

    let currentSong = 0;

    const verifySong = async () => {
        let res = await fetch(`/api/get-playlist-data?playlistId=${id}`);
        if (res.status === 404) {
            //TODO: error
            return;
        }
        const data = await res.json();

        const songs = data.songs;

        const song = songs.find((song) =>
            audioPlayer.src.endsWith(`/media/audio/songs/${song.SongID}.mp3`)
        );
        return song;
    };

    verifySong().then((song) => {
        if (song !== undefined) {
            if (!audioPlayer.paused) btn.innerHTML = pauseControllerIcon;
            else btn.innerHTML = playControllerIcon;
        } else btn.innerHTML = playControllerIcon;
    });

    btn.onclick = async () => {
        const song = await verifySong();

        if (song !== undefined) {
            if (!audioPlayer.paused) {
                btn.innerHTML = playControllerIcon;
                audioPlayer.pause();
            } else {
                btn.innerHTML = pauseControllerIcon;
                audioPlayer.play();
            }
        } else {
            btn.innerHTML = pauseControllerIcon;
            audioPlayer.ended = () => {
                currentSong++;
                if (currentSong >= songs.length) {
                    audioPlayer.src = `/media/audio/songs/${songs[currentSong]._id}.mp3`;
                }
            };
            audioPlayer.src = `/media/audio/songs/${songs[currentSong]._id}.mp3`;
            audioPlayer.play();
        }
    };
    el.appendChild(btn);
    element.appendChild(el);
    el = document.createElement("a");
    let img = document.createElement("img");
    img.src = `/media/images/playlists/${id}.png`;
    el.className = "title";
    el.appendChild(img);
    el.appendChild(document.createTextNode(name));
    el.href = `/playlist?id=${id}`;
    element.appendChild(el);
    return element;
}

function audioController() {
    const element = document.createElement("div");
    element.classList.add("audioController");
    let div = document.createElement("div");
    div.classList.add("songDisplay");
    const image = document.createElement("img");
    div.appendChild(image);
    const divTit = document.createElement("div");
    const tit = document.createElement("a");
    divTit.appendChild(tit);
    const sp = document.createElement("span");
    divTit.appendChild(sp);
    div.appendChild(divTit);
    const setSongInfo = async () => {
        const songId = audioPlayer.src.split("/").pop().split(".mp3")[0];
        let res = await fetch(`/api/get-song-data?songId=${songId}`);
        if (res.status === 404) {
            //TODO: error
            return;
        }
        const song = await res.json();
        sp.innerHTML = "";
        for (let publisher of song.publishers) {
            res = await fetch(
                `/api/get-user-data?userId=${publisher.PublisherID}`
            );

            if (res.status === 404) {
                //TODO: error
                return;
            }
            const publisherInfo = await res.json();
            let pub = document.createElement("a");
            pub.innerText = publisherInfo.Name;
            pub.href = `/user?id=${publisherInfo._id}`;
            sp.appendChild(pub);
            sp.appendChild(document.createTextNode(", "));
        }
        sp.removeChild(sp.lastChild);
        image.src = `/media/images/songs/${song._id}.png`;
        tit.innerText = song.Name;
        tit.href = `/playlist?id=${song.AlbumID}`;
    };
    setSongInfo();

    audioPlayer.addEventListener("play", setSongInfo);
    let btn = document.createElement("button");
    btn.innerHTML = prevIcon;
    btn.className = "moveSong";
    // div.appendChild(btn);
    element.appendChild(div);
    div = document.createElement("div");
    div.classList.add("controls");
    let controlsButtons = document.createElement("div");
    controlsButtons.classList.add("controlsButtons");
    btn = document.createElement("button");
    btn.innerHTML = prevIcon;
    btn.className = "moveSong";
    controlsButtons.appendChild(btn);
    const playbtn = document.createElement("button");
    playbtn.innerHTML = audioPlayer.paused ? playControllerIconWS : pauseControllerIconWS;
    playbtn.addEventListener("click", () => {
        if (audioPlayer.paused) audioPlayer.play();
        else audioPlayer.pause();
    });
    audioPlayer.addEventListener("pause", (e) => {
        playbtn.innerHTML = playControllerIconWS;
    });
    audioPlayer.addEventListener("play", (e) => {
        playbtn.innerHTML = pauseControllerIconWS;
    });
    playbtn.className = "playButton";
    controlsButtons.appendChild(playbtn);
    btn = document.createElement("button");
    btn.innerHTML = nextIcon;
    btn.className = "moveSong";
    btn.addEventListener("click", (e) => {
        if (audioPlayer.onended) {
            audioPlayer.onended();
        } else {
            audioPlayer.currentTime = audioPlayer.duration;
            audioPlayer.src = "";
        }
    });
    controlsButtons.appendChild(btn);
    div.appendChild(controlsButtons);
    controlsButtons = document.createElement("div");
    controlsButtons.classList.add("controlsTime");
    controlsButtons.appendChild(timeController());
    div.appendChild(controlsButtons);
    element.appendChild(div);
    div = document.createElement("div");
    div.classList.add("miscControl");
    const volumeButton = document.createElement("button");
    volumeButton.innerHTML = audioPlayer.muted ? mutedVolumeIcon : volumeIcon;
    volumeButton.addEventListener("click", () => {
        audioPlayer.muted = !audioPlayer.muted;
        volumeButton.innerHTML = audioPlayer.muted
            ? mutedVolumeIcon
            : volumeIcon;
    });
    volumeButton.className = "volumeButton";
    div.appendChild(volumeButton);
    div.appendChild(volumeController());
    element.appendChild(div);
    return element;
}

function volumeController() {
    let slider = document.createElement("input");
    slider.type = "range";
    slider.classList.add("slider");
    slider.min = 0;
    slider.max = 1;
    slider.step = 0.01;
    slider.value = audioPlayer.volume;
    slider.addEventListener("input", () => (audioPlayer.volume = slider.value));
    audioPlayer.addEventListener(
        "volumechange",
        () => (slider.value = audioPlayer.volume)
    );
    return slider;
}

function timeController() {
    const element = document.createElement("div");
    const minVal = document.createElement("span");
    minVal.classList.add("minVal");
    minVal.innerText = "0:00";
    element.appendChild(minVal);
    let slider = document.createElement("input");
    slider.type = "range";
    slider.classList.add("slider");
    slider.value = 0;
    audioPlayer.addEventListener("timeupdate", () => {
        slider.value = audioPlayer.currentTime;
        let secondsValue = slider.value;
        let minutes = Math.floor(secondsValue / 60);
        minVal.innerText = `${minutes}:${(secondsValue - minutes * 60)
            .toString()
            .padStart(2, "0")}`;
    });
    element.appendChild(slider);
    let maxVal = document.createElement("span");
    maxVal.classList.add("maxVal");
    maxVal.innerText = "0:00";
    const onplay = () => {
        slider.max = audioPlayer.duration;
        let secondsValue = audioPlayer.duration;
        let minutes = Math.floor(secondsValue / 60);
        maxVal.innerText = `${minutes}:${Math.floor(secondsValue - minutes * 60)
            .toString()
            .padStart(2, "0")}`;
    };
    audioPlayer.addEventListener("loadedmetadata", () => {
        onplay();
    });
    audioPlayer.addEventListener("play", onplay);
    slider.addEventListener("input", () => {
        audioPlayer.currentTime = slider.value;
    });
    onplay();
    element.appendChild(maxVal);
    return element;
}

//setTimeout(() => window.location.reload(), 1000);
