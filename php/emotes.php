<?php
    set_time_limit(0);
    ignore_user_abort(1);
    ob_start();
    $in = getRequestInfo();
    $configFile = fopen("../../conf.ini", "r") or die("Unable to open file!");
    $host = '';
    $user = '';
    $password = '';
    while(!feof($configFile)) {
        $line = fgets($configFile);
        if(strpos($line, "host =") !== false)
        {
            $host .= rtrim(explode("= ", $line)[1], "\r\n");
        }
        else if(strpos($line, "user =") !== false)
        {
            $user .= rtrim(explode("= ", $line)[1], "\r\n");
        }
        else if(strpos($line, "password =") !== false)
        {
            $password .= rtrim(explode("= ", $line)[1], "\r\n");
        }
    }
    fclose($configFile);

    $db = 'cc_' . $in["channel"];
    $conn = new mysqli($host, $user, $password, $db); 
    if($conn->connect_error) {
        returnWithError($conn->connect_error);
    }
    else {
        $sql = 'SELECT code, count, path, source FROM emotes ORDER BY source DESC, count DESC;';
        $result = $conn->query($sql);
        $codes = '';
        $paths = '';
        $sources = '';
        if($result->num_rows > 0) {
            while($emote = $result->fetch_assoc()) {
                $codes .= '"' . addcslashes($emote["code"], '"\\/') . '", ';
                $paths .= '"' . $emote["path"] . '", ';
                $sources .= '"' . $emote["source"] . '", ';
            }
            $codes = substr($codes, 0, -2);
            $paths = substr($paths, 0, -2);
            $sources = substr($sources, 0, -2);
            returnInfo($codes, $paths, $sources);
        }
        else {

        }
    }
    
    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson( $obj )
    {
        header('Content-Type: text/html');
        echo $obj;
    }

    function returnWithError( $err )
    {
        $retValue = '{"id":0,"error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }
    
    
    function returnInfo($codes, $paths, $sources)
    {
        $retVal = '{';
        $retVal .= '"codes":[' . $codes . '],';
        $retVal .= '"paths":[' . $paths . '],';
        $retVal .= '"sources":[' . $sources . '],"error":""}';
        sendResultInfoAsJson($retVal);
    }

?>