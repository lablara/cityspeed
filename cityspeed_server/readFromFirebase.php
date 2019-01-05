<?php
date_default_timezone_set('America/Bahia');

function convertTimestamp($original){
	return date('Y-m-d H:i:s', strtotime($original));
}

function convertSpeed($original){
	return is_numeric($original) && $original > 0 ? round(($original * 3.6), 2) : 0;
}

function haversineGreatCircleDistance( $latitudeFrom, $longitudeFrom, $latitudeTo, $longitudeTo, $earthRadius = 6371000){
	$latFrom = deg2rad($latitudeFrom);
	$lonFrom = deg2rad($longitudeFrom);
	$latTo = deg2rad($latitudeTo);
	$lonTo = deg2rad($longitudeTo);

	$latDelta = $latTo - $latFrom;
	$lonDelta = $lonTo - $lonFrom;

	$angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) + cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
	return $angle * $earthRadius;
}

function calculateSpeed($distance, $t1, $t2){
	$interval = abs(strtotime($t2) - strtotime($t1));
	if($distance <= 0 || $interval <= 0) return 0;
	return round((($distance / $interval) * 3.6), 2);
}

function getDataFromFirebase($firebase, $device_id, $id_firebase){
	$data = [];
	if(!empty($device_id))
		$data = json_decode($firebase->get($device_id, array('orderBy' => '"$key"', 'startAt' => '"'.$id_firebase.'"')), TRUE);
	else
		$data = json_decode($firebase->get($device_id, array('orderBy' => '"$key"')), TRUE);
	return $data;
}

function getRootNodesFirebase($firebase){
	return json_decode($firebase->get('', array('shallow' => 'true')), TRUE);
}

function getFirebaseParameters($conexao, $root_nodes){
	$result = pg_query($conexao, 'SELECT MAX(id_firebase collate "C") as id_firebase, device_id FROM user_data GROUP BY device_id');
	if(!$result) die("ERROR_QUERY");
	while($row = pg_fetch_array($result)){
		if(array_key_exists($row['device_id'], $root_nodes)){
			$root_nodes[$row['device_id']] = $row['id_firebase'];			
		}
	}
	return $root_nodes;
}

function insertDataPostgres($conexao, $device_id, $id_firebase, $data){
	global $total_inserted_all;
	global $total_firebase;
	$total_inserted = 0;
	$errors = '';
	if($data && count($data) > 0){
		ksort($data);
		foreach ($data as $key => $value){
			if($value){
			   if(($key == $id_firebase) || isset($value['mock'])){ 
			   	  continue;
			   }
			   if(!is_array($value) || count($value) != 4){ 
			   	  continue;
			   }

			   $lastLatitude  = $hSpeed = $lastLongitude = $lastTimestamp = 0;
			   $timestamp = convertTimestamp($value['timestamp']);

			   $query = "INSERT INTO user_data (id_firebase, device_id, location, device_speed, haversine_speed, timestamp) VALUES ('$key', '$device_id', ST_SetSRID(ST_MakePoint({$value['longitude']}, {$value['latitude']}), 4326), ". convertSpeed($value['speed']).", ". $hSpeed .", '". $timestamp ."');";

		       if(pg_query($conexao, $query))
		       		$total_inserted++;
		       else
					$errors .= '{ Error in key: '.$key.' } ';

			   $lastLatitude = $value['latitude'];
			   $lastLongitude = $value['longitude'];
			   $lastTimestamp = $timestamp;
			}
			else{
				$errors .= '{ No value in key: '. $key.' } ';			
			}
		}
	}else{
		$errors .= ' { No data readed! } ';	
	}

	$total_inserted_all += $total_inserted;
	$total_firebase += count($data);
	echo 'DeviceID: '.$device_id.' [ '.'FireBaseRead: '. count($data). ' | PostgresInsert: '.$total_inserted.' | '. 'Errors: '.$errors.' ]<br/>';
}

require('conexao.php');
require 'firebase/firebaseLib.php';
$total_firebase = $total_inserted_all = 0;
$firebase = new Firebase\FirebaseLib('FIRBASE_DATABASE', 'FIREBASE_PASSWORD');
$root_nodes = getRootNodesFirebase($firebase);

if(empty($root_nodes)){
	error_log('Variable $root_nodes is empty!');
	exit;
}

$all_data = getFirebaseParameters($conn, $root_nodes);

foreach ( $all_data as $key => $value ) {
	$id_firebase = ($value === 1 || $value === true || (strlen($value) < 5)) ? false : $value;
	$device_data = getDataFromFirebase($firebase, $key, $id_firebase);
	insertDataPostgres($conn, $key, $id_firebase, $device_data);
}
echo '<br/>All FireBaseRead: '.$total_firebase.' | All PostgresInsert: '.$total_inserted_all;

pg_close($conn);