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
            returnString = `${periods.hours}:${periods.minutes.toString().padStart(2, '0')}`;
        else returnString = `${periods.hours} hours ${periods.minutes.toString().padStart(2, '0')} minutes`;
    } else {
        if (shortForm === true)
            returnString = `${periods.minutes}:${periods.seconds.toString().padStart(2, '0')}`;
        else
            returnString = `${periods.minutes} minutes ${periods.seconds.toString().padStart(2, '0')} seconds`;
    }

    return returnString;
}

function songCard(id, name, duration) {
    let element = document.createElement("div");
    let el = document.createElement("img");
    el.src = `/media/images/songs/${id}.png`;
    element.appendChild(el);
    el = document.createElement("h3");
    el.innerText = name;
    element.appendChild(el);
    element.appendChild(el);
    el = document.createElement("span");
    el.innerText = getDuration(duration, true);
    element.appendChild(el);
    return element;
}
