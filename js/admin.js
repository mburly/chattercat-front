if(document.cookie == "") {
    window.location.replace("index.html");
}

var state = "main";
window.onload = function() {
    startTime();
    loadStatus();
    loadAdmins();
    loadConsole();
	loadMainData();
    loadTools();
    init();
};
listeners();
setInterval(function(){
    loadMainData()
},5000);
// on focus, set window_focus = true.
$(window).focus(function() {
    window_focus = true;
});

// when the window loses focus, set window_focus to false
$(window).focusout(function() {
    window_focus = true;
});



class Counter {
	constructor(startDelay, endDelay) {
		this.startDelay = startDelay || 50;
		this.endDelay = endDelay || this.startDelay;
	}
	runCounter(objID, start, finish) {
		if (isNaN(start) || isNaN(finish)) {
			return;
		}
		if (finish - start === 0) {
			return;
		}
		const obj = document.getElementById(objID);
		let num = start;
		let delay = this.startDelay;
		let delayOffset = Math.floor((this.endDelay - this.startDelay) / (finish - start));
		let timerStep = function() {
			if (num <= finish) {
				obj.innerHTML = num.toLocaleString("en-US");
				delay += delayOffset;
				num += 1;
				setTimeout(timerStep, delay/3);
			}
		}
		timerStep();
	}
}


function loadConsole() {
    $.get("php/admin.php", function(data, status) {
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
        $('#emotesLogged').text(data["numEmotes"].toLocaleString("en-US"));
        $('#channelsTracked').text(data["numChannels"].toLocaleString("en-US"));
        $('#messagesLogged').text(data["numMessages"].toLocaleString("en-US"));
        $('#channelsTracking').text(data["numChannelsOnline"].toLocaleString("en-US"));
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

    $('body').on('click','#adminProfanityButton',function(){
        hide('mainAdminBody');
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
				var oldNum = parseInt(document.getElementById('messagesLogged').innerHTML.replaceAll(",",""));
				let countUp = new Counter();
				countUp.runCounter("messagesLogged",oldNum,data["numMessages"]);				
                $('#channelsTracking').text(data["numChannelsOnline"].toLocaleString("en-US"));
            });

        }
    });
}

function loadAdmins() {
    $.get("php/admins.php", function(data, status){
        var data = JSON.parse(data);
        for(let i = 0; i < data["usernames"].length; i++) {
            if(data["roles"][i] == 1) {
                var sa_icon = '<span class="fa-layers fa-fw prefix-icon-fixed"><i class="fas fa-certificate sa-icon"></i> <span class="fa-layers-text fa-inverse" data-fa-transform="right-8 up-1" style="font-weight:900;font-size:8px;">SA</span></span>';
                $('.admin-list').append('<li class="admin"><img src="images/user_offline.gif" title="user is offline">' + sa_icon + '<span class="admin-name">' + data["usernames"][i] + '</span></li>');
            }
            else {
                var a_icon = '<span class="fa-layers fa-fw fa-fw prefix-icon-fixed"><i class="fas fa-badge a-icon"></i><span class="fa-layers-text fa-inverse" data-fa-transform="right-6 up-1" style="font-weight:900;font-size:10px;color:white;">A</span></span>';
                $('.admin-list').append('<li class="admin"><img src="images/user_offline.gif" title="user is offline">' + a_icon + '<span class="admin-name">' + data["usernames"][i] + '</li>');
            }
        }
    });
    remove('adminLoader');
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

function loadTools() {
    $('#content-admin').append('<span class="admin-title"><img class="admin-tools-icon" src="images/admin-tools-icon.png"><span class="admin-title-text">Admin Actions</span></span><ul class="actions-list"><li class="admin-button"><button class="admin-action-button" id="adminProfanityButton">Profanity</button></li><li class="admin-button"><button class="admin-action-button" id="adminChannelsButton">Manage channels</button></li><li class="admin-button"><button class="admin-action-button" id="adminUsersButton">Manage users</button></li><li class="admin-button"><button class="admin-action-button" id="adminArchiveButton">Archive database</button></li></ul>');
}

function hide(id) {
    $('#' + id).css("display", "none");
}

function remove(id) {
	try {
		document.getElementById(id).remove();
	}
	catch(err) {
		console.log(err);
	}
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
