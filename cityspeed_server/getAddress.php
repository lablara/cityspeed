<?php
set_time_limit(0);
date_default_timezone_set('America/Bahia');

$API_KEYS = explode(' ', 'API_KEYS_GOOGLE');

function getDataFromGMaps($id, $lat, $long, $API_KEY){
	$url = "https://maps.googleapis.com/maps/api/geocode/json?region=pt-BR&latlng=$lat,$long&key=".$API_KEY;
	$json = file_get_contents($url);
	$result = json_decode($json, true);
	$location = array('id' => $id, 'street' => '', 'city' => '', 'state' => '', 'country' => '');
	if($result['status'] == 'OK'){
		foreach ($result['results'][0]['address_components'] as $component) {
			switch ($component['types']) {
		      case in_array('street_address ', $component['types']):
		        $location['street'] = $component['long_name'];
		        break;
		      case (in_array('route', $component['types']) && $location['street'] == ''):
		        $location['street'] = $component['long_name'];
		        break;
		      case in_array('locality', $component['types'] ):
		        $location['city'] = $component['long_name'];
		        break;
		      case in_array('administrative_area_level_2', $component['types']):
		        $location['city'] = $component['long_name'];
		        break;		        
		      case in_array('administrative_area_level_1', $component['types']):
		        $location['state'] = $component['long_name'];
		        break;
		      case in_array('country', $component['types']):
		        $location['country'] = $component['long_name'];
		        break;
		    }
		}
	}else if($result['status'] == 'ZERO_RESULTS'){
		$location['street'] =  $location['city'] = $location['state'] = $location['country'] = 'ZERO_RESULTS';
	}else{
		return false;
	}
	return $location;
}

function getDataToProcess($conn){
	$data = [];
	$result = pg_query($conn, 'SELECT id, ST_X(location) AS lng, ST_Y(location) AS lat FROM user_data WHERE processed_address = 0 LIMIT 1');
	if(!$result) die("ERROR_QUERY");
	while($row = pg_fetch_array($result)){
			$data[] = $row;			
	}
	return $data;
}

function insertDataPostgres($conexao, $data){
	if($data && !empty($data['state']) && !empty($data['city']) && !empty($data['country'])){
	   $query = "INSERT INTO location_data (id_user_data, street, city, state, country) VALUES (". $data['id']. ", '". pg_escape_string(substr($data['street'], 0, 255)) ."', '". pg_escape_string($data['city']) ."', '". pg_escape_string($data['state']) ."', '". pg_escape_string($data['country']) ."');";
       $result = pg_query($conexao, $query);
       if(!$result){
       		die($query);
       }
	}else{
		$result = pg_query($conexao, 'UPDATE user_data SET processed_address = 1 WHERE id = '.$data['id']);
	}
}

require('conexao.php');
error_log("Initiated");
//$TOTAL = 5;
$TOTAL = 10000;
for($i = 0; $i < $TOTAL && count($API_KEYS) > 0; $i++){
	$data = getDataToProcess($conn);
	if(count($data) > 0){
		$item = $data[0];
		$API_KEY = is_numeric($item['id']) ? $API_KEYS[($item['id'] + 0) % count($API_KEYS)] : $API_KEYS[rand(0, count($API_KEYS))];
		$location = getDataFromGMaps($item['id'], $item['lat'], $item['lng'], $API_KEY);
		if($location == false){
			echo($item['id'].': OVER_QUERY_LIMIT in '.$API_KEY.'<br/>');
			error_log($item['id'].': OVER_QUERY_LIMIT in '.$API_KEY);
			$API_KEYS = array_merge(array_diff($API_KEYS, array($API_KEY)));
		}
		else if($location['country'] == 'ZERO_RESULTS'){			
			echo $item['id'].': ZERO_RESULTS in '.$API_KEY.'<br/>';
			insertDataPostgres($conn, $location);
		}else{
			echo $item['id'].': OK in '.$API_KEY.'<br/>';
			insertDataPostgres($conn, $location);		
		}
	}else{
		error_log("Breaked caused by few amount");
		break;
	}
}
error_log("Finished");
pg_close($conn);