<?php
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

    $conn = new mysqli($host, $user, $password, "cc_forsen");
    if($conn->connect_error) {
        returnWithError($conn->connect_error);
    }
    else {
        $sql = "SELECT code, path FROM emotes";
        $result = $conn->query($sql);
        while($emote = $result->fetch_assoc())
        {
            echo $emote["code"];
            echo '<br>';
            echo $emote["path"];
            echo '<br>';
        }
    }

    returnInfo();
    
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
    
    function returnWithInfo($items)
    {
        $retVal = '{"results":[' . $items . '],"error":""}';
        sendResultInfoAsJson($retVal);
    }
    
    function returnInfo()
    {
        $retVal .= '"error":""}';
        sendResultInfoAsJson($retVal);
    }

?>