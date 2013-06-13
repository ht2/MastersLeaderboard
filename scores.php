<?php
	error_reporting(E_ALL);
	ini_set('display_errors', '1');

	$url = 'http://www.usopen.com/en_US/xml/gen/scores/scores.low.json';
	/*
        $ch = curl_init();    // initialize curl handle
	curl_setopt($ch, CURLOPT_URL,$url); // set url to post to
	curl_setopt($ch, CURLOPT_RETURNTRANSFER,1); // return into a variable
	curl_setopt($ch, CURLOPT_TIMEOUT, 4); // times out after 4s
	$result = curl_exec($ch); // run the whole process
	*/
	header('Content-type: application/json');
        
        
    stream_context_create();
    $fp = fopen($url, 'r');
    fpassthru($fp);
    fclose($fp);
    //readfile($url);
	//echo $result; //contains response from server 
	exit();
?>