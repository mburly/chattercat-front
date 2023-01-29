if(document.cookie == "") {
    window.location.replace("index.html");
}

var state = "main";

window.onload = function() {
    startTime();
    loadStatus();
    loadConsole();
    init();
};
listeners();
setInterval(function(){
    loadMainData()
},10000);


function loadConsole() {
    $.get("php/admin.php", function(data, status) {
        console.log(data)
        var data = JSON.parse(data);
        if(data["error"] != "") {
            window.location.replace("index.html");
        }
        for(let i = 0; i < data["numConsoleMessages"]; i++) {
            var name = "console " + i;
            var type = "[INFO]";
            if(data[name]["consoleType"] == 1) {
                type = "[INFO]";
            }
            else {
                type = "[ERROR]";
            }
            $('#console').append('<li><span class="console-datetime">' + data[name]["consoleDatetime"] + '</span> <span class="console-channel-name">' + data[name]["consoleChannel"] + '</span> <span class="console-message-type-info">' + type + '</span> <span class="console-message">' + data[name]["consoleMessage"] + '</span></li>');
        }
        remove("consoleLoad");
    });

}

function init() {
    $.get("php/validate.php", function(data, status) {
        var data = JSON.parse(data);
        if(data["error"] == "invalid token" || data["error"] == "token expired") {
            document.cookie = "cc_admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.replace("index.html");
        }
        else
        {
            callChannels();
            callAdmin();
        }
    });
}

function callAdmin() {
    $.get("php/admin.php", function(data, status) {
        var data = JSON.parse(data);
        if(data["executeStart"] == "") {
            $('#runtime').text('offline');
        }
        else {
            var datetime = data["executeStart"].split(' ');
            var d = new Date(datetime[0] + 'T' + datetime[1]).toString().split(' GMT')[0].slice(0,-3);
            $('#runtime').text(d);
        }
        remove("usernameLoader");
        $('.username').text(data["username"]);
        remove("emotesLoggedLoader");
        $('#emotesLogged').text(data["numEmotes"].toLocaleString("en-US"));
        remove("channelsTrackedLoader");
        $('#channelsTracked').text(data["numChannels"].toLocaleString("en-US"));
        remove("messagesLoggedLoader");
        $('#messagesLogged').text(data["numMessages"].toLocaleString("en-US"));
        remove("numChannelsOnlineLoader");
        $('#channelsTracking').text(data["numChannelsOnline"].toLocaleString("en-US"));
        // $('#numTwitchEmotes').text(data["numTwitchEmotes"].toLocaleString("en-US"));
        // $('#numBTTVEmotes').text(data["numBTTVEmotes"].toLocaleString("en-US"));
        // $('#numFFZEmotes').text(data["numFFZEmotes"].toLocaleString("en-US"));
    });
}

function callChannels() {
    $.get("php/channels.php", function(data, status) {
        var data = JSON.parse(data);
        $('#streamsListTooltip').append('<strong>streams.txt</strong><ul>');
        for(let i = 0; i < data["streams"].length; i++) {
            var channelName = data["streams"][i];
            if(data["channels"].includes(channelName)) {
                $('#streamsListTooltip').append('<li class="stream-tracked"><i class="fas fa-check indicator"></i>' + channelName +'</li>');
            }
            else {
                $('#streamsListTooltip').append('<li class="stream-not-tracked"><i class="fas fa-xmark indicator"></i>' + channelName +'</li>');   
            }
        }
    });
}

function listeners() {
    $('body').on('click','.logo', function(){
        window.location.href = $(this).attr('src');
    });
    
    $('body').on('click','#logout', function(){
        document.cookie = "cc_admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "index.html";
    });
    
    $('body').on('click','#home', function(){
        window.location.href = "index.html";
    });
    
    $('body').on('click','#refresh',function(){
        location.reload(true);
    });
}

function loadMainData() {
    $.get("php/validate.php", function(data, status) {
        var data = JSON.parse(data);
        if(data["error"] == "invalid token" || data["error"] == "token expired") {
            document.cookie = "cc_admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.replace("index.html");
        }
        else
        {
            $.get("php/admin.php", function(data, status) {
                var data = JSON.parse(data);
                $('.username').text(data["username"]);
                $('#emotesLogged').text(data["numEmotes"].toLocaleString("en-US"));
                $('#channelsTracked').text(data["numChannels"].toLocaleString("en-US"));
                $('#messagesLogged').text(data["numMessages"].toLocaleString("en-US"));
                $('#channelsTracking').text(data["numChannelsOnline"].toLocaleString("en-US"));
                // $('#numTwitchEmotes').text(data["numTwitchEmotes"].toLocaleString("en-US"));
                // $('#numBTTVEmotes').text(data["numBTTVEmotes"].toLocaleString("en-US"));
                // $('#numFFZEmotes').text(data["numFFZEmotes"].toLocaleString("en-US"));
            });
        }
    });
}

function loadStatus() {
    $.get("php/status.php", function(data, status) {
        var data = JSON.parse(data);
        if(data["status"] == "online") {
            remove("statusLoader");
            $('#statusContainer').append('<span class="status online">online</span>');
        }
        else {
            remove("statusLoader");
            $('#statusContainer').append('<span class="status offline">offline</span>');
        }
    });
}

function remove(id) {
    document.getElementById(id).remove();
}

function startTime() {
    const today = new Date();
    let h = today.getUTCHours();
    let m = today.getUTCMinutes();
    let s = today.getUTCSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('clock').innerHTML =  h + ":" + m + ":" + s;
    setTimeout(startTime, 1000);
  }
  
  function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
  }