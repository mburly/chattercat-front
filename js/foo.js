function loadUpdatesLog() {
    var xhr = new XMLHttpRequest();
    console.log('hi');
    // var channel = id.split("-")[0];
    channel = "hasanabi";
    xhr.open("POST", "php/updates.php", false);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    var jsonPayload = '{"channel" : "' + channel + '"}';
    xhr.send(jsonPayload);
    console.log(JSON.parse(xhr.responseText));
}