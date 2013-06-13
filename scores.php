<?php
	$url = 'http://www.usopen.com/en_US/xml/gen/scores/scores.low.json';
	
    $ch = curl_init();    // initialize curl handle
	curl_setopt($ch, CURLOPT_URL,$url); // set url to post to
	curl_setopt($ch, CURLOPT_RETURNTRANSFER,1); // return into a variable
	curl_setopt($ch, CURLOPT_TIMEOUT, 4); // times out after 4s
	$result = curl_exec($ch); // run the whole process
	
	header('Cache-Control: no-cache, must-revalidate');
	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
	header('Content-type: application/json');
	echo $result; //contains response from server 
	exit();
?>