function getParameters(){
    let dict = [];
    window.location.search.substring(1).split('&').map(el => {
        let arr = el.split('=');
        dict[arr[0]] = arr[1];
        //return {key: arr[0], value: arr[1]}
    });
    return dict;
}