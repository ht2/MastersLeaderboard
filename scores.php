<?php
	error_reporting(E_ALL);
	ini_set('display_errors', '1');

	$url = 'http://www.masters.com/en_US/xml/gen/scores/scores.flash.xml';
	$ch = curl_init();    // initialize curl handle
	curl_setopt($ch, CURLOPT_URL,$url); // set url to post to
	curl_setopt($ch, CURLOPT_RETURNTRANSFER,1); // return into a variable
	curl_setopt($ch, CURLOPT_TIMEOUT, 4); // times out after 4s
	$result = curl_exec($ch); // run the whole process
	
	header('Content-type: text/xml');
	echo $result; //contains response from server 
?>