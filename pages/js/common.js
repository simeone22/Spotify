const playIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" /></svg>';
const pauseIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>';

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
            })
        );
    } else {
        data = JSON.parse(data);
        audioPlayer.src = data.src;
        audioPlayer.currentTime = data.currentTime;
        audioPlayer.paused  = data.paused;
        audioPlayer.loop = data.loop;
        audioPlayer.volume = data.volume;
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
    btn.innerHTML = playIcon;
    btn.className = "playButton";
    
    if (audioPlayer.src.endsWith(source)) {
        element.classList.add("playing");
    }

    btn.onclick = () => {
        console.log(audioPlayer.src);

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
            btn.innerHTML = pauseIcon;
            audioPlayer.src = source;
            audioPlayer.play();
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
    el.appendChild(document.createTextNode(name));
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
//setTimeout(() => window.location.reload(), 1000);
