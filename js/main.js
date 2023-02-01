var state = "main";

loadStatus();
callIndex();
listeners();

function appendButtons(id)
{
    $('#' + id).append('<li><div class="action-group"><button>View all logs</button><button>Run profanity report</button></div></li>');
}

function callIndex() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    $.get("php/index.php", function(data, status) {
        var data = JSON.parse(data);
        hide("mainLoad");
        for(let i = 0; i < data["channels"].length; i++)
        {
            var channelName = data["channels"][i];
            var selectId = channelName + '-select';
            var infoId = channelName + '-info';
            if(data["live"][i] == true)
            {
                var streamStartDatetime = data[channelName]["streamStartDate"].split(' ');
                var streamStart = new Date(streamStartDatetime[0] + "T" + streamStartDatetime[1] + "Z");  // passing in ISO 8601 format
                var now = new Date();
                $('.channels').append('<li class="channel" id="channel-' + channelName + '"><span class="channel-select" id="' + selectId + '"><img class="channel-icon" src="pictures/' + channelName + '.png"><span class="channel-name live-channel">' + channelName + '</span></span><div class="selector main-selector" id="' + channelName + '-selector"></div></li>');
                $('.channels').append('<ul class="channel-info" id="' + infoId + '" style="display:none;"><li><span class="stream-title">' + data[channelName]['title'] + '</span></li>');
                $('#' + infoId).append('<li class="stream-info"><span class="info-property">Time live:</span><span class="info-value">' + msToTime(now-streamStart) + '</span></li>');
                $('#' + infoId).append('<li class="stream-info"><span class="info-property">Category:</span><span class="info-value">' + data[channelName]['category'] + '</span></li>');
                $('#' + infoId).append('<li class="stream-info"><span class="info-property">Messages sent:</span><span class="info-value">' + data[channelName]['numMessages'].toLocaleString("en-US") + '</span></li>');
                $('#' + infoId).append('<li class="stream-info"><span class="info-property">Unique chatters:</span><span class="info-value">' + data[channelName]['numChatters'].toLocaleString("en-US") + '</span></li>');
                $('#' + infoId).append('<li class="stream-info"><span class="info-property">New chatters:</span><span class="info-value">' + data[channelName]['newChatters'].toLocaleString("en-US") + '</span></li>');
                $('#' + infoId).append('</ul>');
                appendButtons(infoId);
            }
            else
            {
                $('.channels').append('<li class="channel"><span class="channel-select" id="' + selectId + '"><img class="channel-icon" src="pictures/' + channelName + '.png"><span class="channel-name">' + channelName + '</span></span></li>');
            }
        }
    });
}

function listeners() {
    $('body').on('click','.title',function(){
        if(state == "main") {
    
        }
        else {
            remove(state);
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            show("main");
            state = "main";
            document.title = "Home - Chattercat"
        }
    });
    
    $('body').on('click','.main-selector',function(){
        var id = $(this).attr('id').split('-')[0];
        if($('#' + id + '-info').css("display") == "none")
        {
            show(id + '-info');
            $(this).css("background-image","url('images/button-down.svg')");
        }
        else
        {
            hide(id + '-info');
            $(this).css("background-image","url('images/button-right.svg')");
        }
    });
    
    $('body').on('click','.session-selector',function(){
        var id = $(this).attr('id') + '-info';
        if($('#' + id).css("display") == "none")
        {
            show(id);
            $(this).css("background-image","url('images/button-down.svg')");
        }
        else
        {
            hide(id);
            $(this).css("background-image","url('images/button-right.svg')");
        }
    });
    
    $('body').on('click','.channel-select',function(){
        var id = $(this).attr('id').split('-')[0];
        loadChannelPage(id);
        state = "statsPage";
    });
    
    $('body').on('click','#mainExpandButton',function(){
        $('.channel-info').css("display", "block");
        $('.main-selector').css("background-image","url('images/button-down.svg')");
    });
    
    $('body').on('click','#mainCollapseButton',function(){
        $('.channel-info').css("display", "none");
        $('.main-selector').css("background-image","url('images/button-right.svg')")
    });
    
    $('body').on('click','#mainRefreshButton',function(){
        location.reload(true);
    });
    
    $('body').on('click','#sessionsExpandButton',function(){
        $('.session-info').css("display", "block");
        $('.session-selector').css("background-image","url('images/button-down.svg')")
    });
    
    $('body').on('click','#sessionsCollapseButton',function(){
        $('.session-info').css("display", "none");
        $('.session-selector').css("background-image","url('images/button-right.svg')")
    });
    
    $('body').on('click','.window-full-image',function(){
        window.location.href = $(this).attr("src");
    });
    
    $('body').on('click','.emote-tooltip',function(){
        var url = $(this).attr('src');
        window.open(url, '_blank');
    });
    
    $('body').on('click','.login-icon',function(){
        if(document.cookie == '') {
            showLoginPage();
        }
        else {
            $.get("php/validate.php", function(data, status) {
                var data = JSON.parse(data);
                if(data["error"] == "invalid token") {
                    document.cookie = "cc_admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    showLoginPage();
                }
                else
                {
                    if(data["error"] == "no login") {
                        showLoginPage();
                    }
                    else {
                        window.location.href = "housekeeping.html";
                    }
                }
            });
        }
    });
    
    $('body').on('click','#loginButton',function(){
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "php/login.php", false);
        xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
        var jsonPayload = '{"username" : "' + $('#username').val() + '","password" : "' + $('#password').val() + '"}';
        try {
            xhr.send(jsonPayload);
            var data = JSON.parse(xhr.responseText);
            if(data["error"] != "")
            {
                $('#login').append('<span class="bad-login">Invalid login. Please try again.</span>');
            }
            else
            {
                window.location.href = "housekeeping.html";
            }
        }
        catch(err) {
            console.log(err);
        }
    
    });
}

function loadChannelPage(id)
{
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    var channel = id.split("-")[0];
    var xhr = new XMLHttpRequest();
	xhr.open("POST", "php/stats.php", false);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    var jsonPayload = '{"channel" : "' + channel + '"}';
    try {
        xhr.send(jsonPayload);
        var data = JSON.parse(xhr.responseText);
        hide("main");
        document.title = channel + " - Chattercat"

        generateChannelPage();
        
        $('#chattersTitleBarText').append(channel + ' - Chatters');
        $('#emotesTitleBarText').append(channel + ' - Emotes');
        $('#messagesTitleBarText').append(channel + ' - Messages');
        $('#sessionsTitleBarText').append(channel + ' - Sessions');

        const chattersHead = '<div class="list-group-header">Top Chatters</div>';
        $('#chattersWindowBody').append(chattersHead);
        $('#chattersWindowBody').append('<ul id="chatterLeaderboard">');
        for(let i = 0; i < data["topChatterNames"].length; i++)
        {
            if(i == 0)
            {
                $('#chatterLeaderboard').append('<li class="rank"><span class="rank-number rank-1">1</span><span class="rank-1 rank-name"><span class="chatter-name">' + data["topChatterNames"][i] + '</span></span><span class="top-rank">' + data["topChatterCounts"][i].toLocaleString("en-US") + "</span></li>");
            }
            else if(i == 1)
            {
                $('#chatterLeaderboard').append('<li class="rank"><span class="rank-number rank-2">2</span><span class="rank-2 rank-name"><span class="chatter-name">' + data["topChatterNames"][i] + '</span></span><span class="top-rank">' + data["topChatterCounts"][i].toLocaleString("en-US") + "</span></li>");
            }
            else if(i == 2)
            {
                $('#chatterLeaderboard').append('<li class="rank"><span class="rank-number rank-3">3</span><span class="rank-3 rank-name"><span class="chatter-name">' + data["topChatterNames"][i] + '</span></span><span class="top-rank">' + data["topChatterCounts"][i].toLocaleString("en-US") + "</span></li>");
            }
            else
            {
                $('#chatterLeaderboard').append('<li class="rank"><span class="rank-number">' + (i+1) + '</span><span class="rank-name"><span class="chatter-name">' + data["topChatterNames"][i] + "</span></span><span>" + data["topChatterCounts"][i].toLocaleString("en-US") + "</span></li>");
            }
        }
        $('#chattersWindowBody').append('</ul>');
        $('#chattersWindowBody').append('<div class="list-group" id="recentChattersListGroup">');
        $('#recentChattersListGroup').append('<div class="list-group-header">Recent Chatters</div>');
        var groupCounter = 1;
        for(let i = 0; i < data["recentChatterNames"].length; i++)
        {
            if(i % 3 == 0)
            {
                if(i == 0)
                {
                    $('#recentChattersListGroup').append('<ul class="recent-chatters" id="recentChat' + groupCounter + '">');
                }
                else
                {
                    $('#recentChattersListGroup').append('</ul>');
                    groupCounter += 1;
                    $('#recentChattersListGroup').append('<ul class="recent-chatters" id="recentChat' + groupCounter + '">');
                }
            }
            $('#recentChat' + groupCounter).append('<li class="chatter-name">' + data["recentChatterNames"][i] + '</li>');
        }
        $('#chattersWindowBody').append('</ul>');
        $('#chattersWindowBody').append('</div>');
        $('#chattersWindowBody').append('</div>');
        $('#chattersStatusBar').append('<p class="status-bar-field"><span class="status-bar-right">Total chatters: ' + data["totalChatters"].toLocaleString("en-US") + '</span></p>')
        hide("chattersLoad");


        const emotesHead = '<div class="list-group-header">Top Emotes</div>';
        $('#emotesWindowBody').append(emotesHead);
        $('#emotesWindowBody').append("<ul>");
        for(let i = 0; i < data["topEmotePaths"].length; i++)
        {
            $('#emotesWindowBody').append('<li class="emote-item"><div class="tooltip-top"><img class="emote" src="../' + data["topEmotePaths"][i] + '"><span class="tooltiptext"><img class="emote-tooltip" id="' + data["topEmoteCodes"][i] + '-tooltip" src="../' + data["topEmotePaths"][i] + '"></span></div><div class="emote-name-section"><span class="emote-name">' + data["topEmoteCodes"][i] + '</span></div>' + data["topEmoteCounts"][i].toLocaleString("en-US") + '</li>');
        }
        $('#emotesWindowBody').append("</ul>");
        $('#emotesStatusBar').append('<p class="status-bar-field"><span class="status-bar-right">Total emotes: ' + data["totalEmotes"].toLocaleString("en-US") + '</span></p>');
        hide("emotesLoad");


        $('#messagesWindowBody').append('<div class="list-group-header">Recent Messages</div>');
        $('#messagesWindowBody').append('<ul>');
        for(let i = 0; i < data["recentMessageMessages"].length; i++)
        {
            var recentMessageDatetime = data["recentMessageDatetimes"][i].split(' ');
            var recentMessageTime = new Date(recentMessageDatetime[0] + "T" + recentMessageDatetime[1] + "Z");
            $('#messagesWindowBody').append('<li class="recent-messages"><span class="message-time">' + milToTime(recentMessageTime) + '</span><span class="message-name chatter-name">' + data["recentMessageNames"][i] + '</span>:<span class="message-message">' + data["recentMessageMessages"][i] + '</span></li>');
        }
        $('#messagesWindowBody').append('</ul>');
        if(data["recentSessionLengths"][0] == "null")
        {
            $('#messagesStatusBar').append('<p class="status-bar-field"><span class="status-bar-right">Messages this session: ' + data["recentSessionMessages"].toLocaleString("en-US") + '</span></p>');
            $('#messagesStatusBar').append('<p class="status-bar-field"><span class="status-bar-right">Total messages: ' + data["totalMessages"].toLocaleString("en-US") + '</span></p>');
                
        }
        else
        {
            $('#messagesStatusBar').append('<p class="status-bar-field"><span class="status-bar-right">Messages last session: ' + data["recentSessionMessages"].toLocaleString("en-US") + '</span></p>');
            $('#messagesStatusBar').append('<p class="status-bar-field"><span class="status-bar-right">Total messages: ' + data["totalMessages"].toLocaleString("en-US") + '</span></p>');
        }
        hide("messagesLoad");


        $('#sessionsWindowBody').append('<div class="list-group-header">Recent Sessions</div>');
        $('#sessionsWindowBody').append('<div class="action-group" id="sessionsActionGroup"><button class="action-button" id="sessionsExpandButton">Expand all</button><button class="action-button" id="sessionsCollapseButton">Collapse all</button></div>');
        $('#sessionsWindowBody').append('<ul>');
        var currentSessionId = data["recentSegmentSessions"][0];
        var segmentCount = 0;
        var numSegmentsThisSession = 1;
        for(let i = 0; i < data["recentSessionStartDatetimes"].length; i++)
        {
            var sessionStartDatetime = data["recentSessionStartDatetimes"][i].split(' ');
            sessionStartDatetime = new Date(sessionStartDatetime[0] + "T" + sessionStartDatetime[1] + "Z");
            sessionStartDatetime = milToDatetime(sessionStartDatetime);
            var sessionLength = data["recentSessionLengths"][i];
            if(sessionLength == "null")
            {
                sessionLength = "LIVE";
                $('#sessionsWindowBody').append('<li class="session-item"><i class="fas fa-calendar-days prefix-icon";"></i><span class="session-start-date">' + sessionStartDatetime["date"] + '</span><i class="fas fa-clock prefix-icon"></i><span class="session-start-time">' + sessionStartDatetime["time"] + '</span><div class="live prefix-icon"><div class="circle pulse live-length"></div></div><span class="session-length live-length">' + sessionLength + '</span><div class="selector session-selector" id="' + channel + '-session-' + (i+1) + '"></div></li>');
            }
            else
            {
                sessionLength = lengthToTime(sessionLength);
                $('#sessionsWindowBody').append('<li class="session-item"><i class="fas fa-calendar-days prefix-icon";"></i><span class="session-start-date">' + sessionStartDatetime["date"] + '</span><i class="fas fa-clock prefix-icon"></i><span class="session-start-time">' + sessionStartDatetime["time"] + '</span><i class="fas fa-timer prefix-icon"></i><span class="session-length">' + sessionLength + '</span><div class="selector session-selector" id="' + channel + '-session-' + (i+1) + '"></div></li>');
            }
            var sessionId = data["recentSegmentSessions"][segmentCount];
            $('#sessionsWindowBody').append('<div class="session-info" id="' + channel + '-session-' + (i+1) + '-info" style="display:none;">');
            while(sessionId == currentSessionId)
            {
                if(numSegmentsThisSession == 1)
                {
                    $('#' + channel + '-session-' + (i+1) + '-info').append('<li><span class="stream-title">' + data["recentSegmentTitles"][segmentCount] + '</span></li>');
                }
                var segmentLength = data["recentSegmentLengths"][segmentCount];
                if(segmentLength.length == 0)
                {
                    segmentLength = 'LIVE';
                    $('#' + channel + '-session-' + (i+1) + '-info').append('<li class="segment-info"><span class="category-name">' + data["recentSegmentCategories"][segmentCount] + '</span><span class="segment-length"><div class="live"><div class="circle pulse live-length"></div></div><span class="segmentLengthText live-length">' + segmentLength + '</span></span></li>');
                }
                else
                {
                    segmentLength = lengthToTime(segmentLength);
                    $('#' + channel + '-session-' + (i+1) + '-info').append('<li class="segment-info"><span class="category-name">' + data["recentSegmentCategories"][segmentCount] + '</span><span class="segment-length"><i class="fas fa-timer"></i><span class="segmentLengthText">' + segmentLength + '</span></span></li>');
                }
                segmentCount += 1;
                numSegmentsThisSession += 1;
                sessionId = data["recentSegmentSessions"][segmentCount];
            }
            currentSessionId = sessionId;
            numSegmentsThisSession = 1;
            $('#sessionsWindowBody').append('<div class="session-info">')

        }
        $('#sessionsWindowBody').append('</ul>');
        hide("sessionsLoad");

    }
    catch(err) {
        console.log(err);
    }
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

function showLoginPage() {
    if(state != "main") {
        remove(state);
    }
    else
    {
        hide(state);
    }
    var login_page = '<div class="window" id="login"><div class="title-bar window-blue"><div class="title-bar-text"><i class="fas fa-user"></i>Chattercat - Log in</div></div><div class="window-body"><label for="uname"><span class="login-text">Username:</span></label><input id="username" type="text" placeholder="Enter Username" name="uname" autocomplete="off" required><p><label for="psw"><span class="login-text">Password:</span></label><input id="password" type="password" placeholder="Enter Password" name="psw" autocomplete="off" required><button type="submit" id="loginButton">Login</button></div></div>';
    $('body').append(login_page);
    state = "login";
}

function hide(id) {
    $('#' + id).css("display", "none");
}

function show(id) {
    $('#' + id).css("display", "block");
}

function remove(id) {
    document.getElementById(id).remove();
}

function generateChannelPage()
{
    document.body.innerHTML += '<div class="window-group" id="statsPage"><div class="window window-group-member"><div class="title-bar"><div class="title-bar-text" id="chattersTitleBarText"><i class="fas fa-cat-space"></i></div></div><div class="window-body" id="chattersWindowBody"><div class="load" id="chattersLoad"><span class="loader"></span></div></div><div class="status-bar" id="chattersStatusBar"></div></div><div class="window window-group-member"><div class="title-bar member-2"><div class="title-bar-text" id="emotesTitleBarText"><i class="fas fa-cat-space"></i></div></div><div class="window-body" id="emotesWindowBody"><div class="load" id="emotesLoad"><span class="loader"></span></div></div><div class="status-bar" id="emotesStatusBar"></div></div><div class="window window-group-member"><div class="title-bar member-3"><div class="title-bar-text" id="messagesTitleBarText"><i class="fas fa-cat-space"></i></div></div><div class="window-body" id="messagesWindowBody"><div class="load"><span class="loader" id="messagesLoad"></span></div></div><div class="status-bar" id="messagesStatusBar"></div></div><div class="window window-group-member"><div class="title-bar member-4"><div class="title-bar-text" id="sessionsTitleBarText"><i class="fas fa-cat-space"></i></div></div><div class="window-body" id="sessionsWindowBody"><div class="load" id="sessionsLoad"><span class="loader"></span></div></div></div></div>';
}

// mil = military time
function milToTime(mil)
{
    var hours = mil.getHours();
    var minutes = mil.getMinutes();
    var seconds = mil.getSeconds();
    var meridiem = '';
    var ret = '';
    if(hours > 12)
    {
        ret += hours-12 + ':';
        meridiem = 'PM';
    }
    else
    {
        if(hours == 0)
        {
            hours += 12;
        }
        ret+= hours + ':';
        meridiem = 'AM';
    }
    if(minutes < 10)
    {
        ret += '0' + minutes;
    }
    else
    {
        ret += minutes;
    }
    // if(seconds < 10)
    // {
    //     ret += '0' + seconds + '';
    // }
    // else
    // {
    //     ret += seconds + '';
    // }
    ret += meridiem;
    return ret;
}

function milToDatetime(mil)
{
    var year = mil.getFullYear().toString().substring(2,4);
    var month = mil.getMonth()+1;
    var day = mil.getDate();
    var hours = mil.getHours();
    var minutes = mil.getMinutes();
    var seconds = mil.getSeconds();
    var meridiem = '';
    var ret = [];
    ret["date"] = month + '/' + day + '/' + year;
    ret["time"] = '';
    if(hours >= 12)
    {
        if(hours > 12)
        {
            ret["time"] += hours-12 + ':';
        }
        else
        {
            ret["time"] += hours + ':';
        }
        meridiem = 'PM';
    }
    else
    {
        if(hours == 0)
        {
            hours += 12;
        }
        ret["time"] += hours + ':';
        meridiem = 'AM';
    }
    if(minutes < 10)
    {
        ret["time"] += '0' + minutes + ':';
    }
    else
    {
        ret["time"] += minutes + ':';
    }
    if(seconds < 10)
    {
        ret["time"] += '0' + seconds + '';
    }
    else
    {
        ret["time"] += seconds + '';
    }
    ret["time"] += meridiem;
    return ret;
}

function msToTime(ms)
{
    var days = 0;
    var hours = 0;
    var minutes = 0;
    var ret = '';
    while(ms > 0)
    {
        while(ms >= 86400000)
        {
            days += 1;
            ms -= 86400000;
        }
        while(ms >= 3600000)
        {
            hours += 1;
            ms -= 3600000;
        }
        while(ms >= 60000)
        {
            minutes += 1;
            ms -= 60000;
        }
        if(days > 0)
        {
            ret += days + 'd ';
        }
        if(hours > 0)
        {
            ret += hours + 'h ';
        }
        ret += minutes + 'm';
        return ret;
    }
}

function lengthToTime(length)
{
    var ret = '';
    var time = length.split(':');
    var hours = parseInt(time[0]);
    var minutes = parseInt(time[1]);
    var seconds = parseInt(time[2]);
    var days = 0;
    if(hours >= 24)
    {
        while(hours >= 24)
        {
            days += 1;
            hours -= 24;
        }
    }
    if(days > 0)
    {
        ret += days + 'd ';
    }
    if(hours > 0)
    {
        ret += hours + 'h ';
    }
    if(minutes > 0)
    {
        if(seconds >= 30)
        {
            minutes += 1;
        }
        ret += minutes + 'm';
    }
    else
    {
        ret += seconds + 's';
    }
    return ret;
}


/**
 * Old school Window Loader with GSAP
 * @author Daphne Smit <hi@daphnesmit.nl>
 */
// const delay = 0.08
// const tl = new TimelineMax({ repeat: -1, repeatDelay: delay })

// tl
//   .to(".c-loader__block1", 0, { opacity: 0, delay }, delay)
//   .to(".c-loader__block11", 0, { x: 0, y: 24, delay }, delay)
//   .to(".c-loader__block12", 0, { x: -8, y: 40, delay }, delay)

//   .to(".c-loader__block1", 0, { opacity: 1, x: 24, y: 72, delay: delay * 2 },  delay * 2)
//   .to(".c-loader__block3", 0, { x: -8, y: 40, delay: delay * 2 }, delay * 2)
//   .to(".c-loader__block11", 0, { x: 8, y: 72, delay: delay * 2 }, delay * 2)

//   .to(".c-loader__block1", 0, { x: 24, y: 104, delay: delay * 3 }, delay * 3)
//   .to(".c-loader__block3", 0, { x: -8, y: 64, delay: delay * 3 }, delay * 3)
//   .to(".c-loader__block4", 0, { x: -24, y: 64, delay: delay * 3 }, delay * 3)

//   .to(".c-loader__block2", 0, { x: 8, y: 72, delay: delay * 4 }, delay * 4)
//   .to(".c-loader__block3", 0, { x: 16, y: 112, delay: delay * 4 }, delay * 4)
//   .to(".c-loader__block4", 0, { x: -24, y: 40, delay: delay * 4 }, delay * 4)

//   .to(".c-loader__block2", 0, { x: -8, y: 104, delay: delay * 5 }, delay * 5)
//   .to(".c-loader__block4", 0, { x: -24, y: 64, delay: delay * 5 }, delay * 5)
//   .to(".c-loader__block6", 0, { x: 0, y: 56, delay: delay * 5 }, delay * 5)

//   .to(".c-loader__block4", 0, { x: -48, y: 112, delay: delay * 6 }, delay * 6)
//   .to(".c-loader__block5", 0, { x: 16, y: 64, delay: delay * 6 }, delay * 6)
//   .to(".c-loader__block6", 0, { x: 0, y: 32, delay: delay * 6 }, delay * 6)

//   .to(".c-loader__block5", 0, { x: 32, y: 96, delay: delay * 7 }, delay * 7)
//   .to(".c-loader__block6", 0, { x: 0, y: 56, delay: delay * 7 }, delay * 7)
//   .to(".c-loader__block7", 0, { x: -16, y: 56, delay: delay * 7 }, delay * 7)

//   .to(".c-loader__block6", 0, { x: 8, y: 88, delay: delay * 8 }, delay * 8)
//   .to(".c-loader__block7", 0, { x: -16, y: 64, delay: delay * 8 }, delay * 8)
//   .to(".c-loader__block9", 0, { x: -8, y: 24, delay: delay * 8 }, delay * 8)

//   .to(".c-loader__block7", 0, { x: -24, y: 88, delay: delay * 9 }, delay * 9)
//   .to(".c-loader__block8", 0, { x: 8, y: 24, delay: delay * 9 }, delay * 9)
//   .to(".c-loader__block9", 0, { x: -8, y: 56, delay: delay * 9 }, delay * 9)

//   .to(".c-loader__block8", 0, { x: 8, y: 48, delay: delay * 10 }, delay * 10)
//   .to(".c-loader__block9", 0, { x: -8, y: 72, delay: delay * 10 }, delay * 10)
//   .to(".c-loader__block10", 0, { x: 0, y: 40, delay: delay * 10 }, delay * 10)

//   .to(".c-loader__block8", 0, { x: 8, y: 72, delay: delay * 11 }, delay * 11)
//   .to(".c-loader__block10", 0, { x: 0, y: 64, delay: delay * 11 }, delay * 11)


//   .to(".c-loader__svg", 0, { rotation: -45, delay: delay * 12 }, delay * 12)
//   .to(".c-loader__block1", 0, { rotation: -45, x: 20, y: 110, delay: delay * 12 }, delay * 12)
//   .to(".c-loader__block2", 0, { rotation: -45, x: -7, y: 110, delay: delay * 12 }, delay * 12)
//   .to(".c-loader__block3", 0, { rotation: -45, x: -23, y: 88, delay: delay * 12 }, delay * 12)
//   .to(".c-loader__block4", 0, { rotation: -45, x: -50, y: 110, delay: delay * 12 }, delay * 12)
//   .to(".c-loader__block5", 0, { rotation: -45, x: 23, y: 102, delay: delay * 12 }, delay * 12)
//   .to(".c-loader__block6", 0, { rotation: -45, x: 18, y: 102, delay: delay * 12 }, delay * 12)
//   .to(".c-loader__block7", 0, { rotation: -45, x: -20, y: 91, delay: delay * 12 }, delay * 12)
//   .to(".c-loader__block8", 0, { rotation: -45, x: 4, y: 72, delay: delay * 12 }, delay * 12)
//   .to(".c-loader__block9", 0, { rotation: -45, x: -12, y: 61, delay: delay * 12 }, delay * 12)
//   .to(".c-loader__block10", 0, { rotation: -45, x: 7, y: 75, delay: delay * 12 }, delay * 12)
//   .to(".c-loader__block11", 0, { rotation: -45, x: -15, y: 59, delay: delay * 12 }, delay * 12)
//   .to(".c-loader__block12", 0, { rotation: -45, x: -26, y: 27, delay: delay * 12 }, delay * 12)


//   .to(".c-loader__svg", 0, { rotation: -90, delay: delay * 13 }, delay * 13)
//   .to(".c-loader__block6", 0, { rotation: -45, x: 7, y: 80, delay: delay * 13 }, delay * 13)


//   .to(".c-loader__svg", 0, { rotation: -135, delay: delay * 14 }, delay * 14)
//   .to(".c-loader__block5", 0, { rotation: -45, x: 23, y: 69, delay: delay * 14 }, delay * 14)