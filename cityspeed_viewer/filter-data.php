<?php
	ini_set('memory_limit', '1024M');
	header('Content-Type: application/json');

	function isValidTimestamp($ts){
		return !empty($ts) && preg_match('/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/', $ts);
	}


	function getWhereDateInterval($dates){
		$sql = '(';
		foreach ($dates as $date){
			if(isValidTimestamp($date['startAt']) && isValidTimestamp($date['endAt']))
			$sql .= ("(timestamp >= '" . $date['startAt'] . "' AND timestamp <= '" . $date['endAt']. "') OR ");
		}
		return substr($sql, 0, -4).')';
	}

	$where_address = 'true';
	$inner_join = 'INNER JOIN location_data l ON u.id = l.id_user_data ';
	$cols = explode('|', 'country|state|city|street');
	foreach ($_POST['address'] as $key => $value) {
		if(!empty($value) && in_array($key, $cols))
			$where_address .= (" AND $key = '".str_replace("'", "''", $value)."'");
	}
	$where_filter_dates = $where_detail_dates = $where_address;
	
	$response = array();

	if(!empty($_POST['filterDates']))
		$where_filter_dates .= ' AND '. getWhereDateInterval($_POST['filterDates']);	

	if(!empty($_POST['latitude']) && !empty($_POST['longitude']) && !empty($_POST['radius']) && is_numeric($_POST['latitude']) && is_numeric($_POST['longitude']) && is_numeric($_POST['radius'])) {
		$where_filter_dates .= ' AND ST_DWithin(location, ST_GeomFromText(\'POINT('.$_POST['longitude'].' '.$_POST['latitude'].')\', 4326)::geography, '.$_POST['radius'].')';
	}
	
	require_once('conexao.php');

	$sql = "SELECT MAX(CASE u.device_speed WHEN 0 THEN u.haversine_speed ELSE u.device_speed END) AS max_speed, MIN(CASE u.device_speed WHEN 0 THEN u.haversine_speed ELSE u.device_speed END) AS min_speed  FROM user_data u ".($where_address === 'true' ? '' : $inner_join)." WHERE (u.device_speed > 0 OR u.haversine_speed > 0) AND ". $where_filter_dates;

	$result = pg_query($conn, $sql);
	//die($sql);
	if(!$result) {
		$sql = '';
		echo json_encode(array('error' => 'ERROR_QUERY_1', 'message' => pg_last_error($conn), 'other' => $sql));
		exit();
	}
	
	$row = pg_fetch_assoc($result);
	$min_speed = is_numeric($row['min_speed']) ? round($row['min_speed'], 2) : 0;
	$max_speed = is_numeric($row['max_speed']) ? round($row['max_speed'], 2) : 0;

	$sql = "SELECT u.id, CASE u.device_speed WHEN 0 THEN u.haversine_speed ELSE u.device_speed END AS device_speed, ST_Y(u.location) AS latitude, ST_X(u.location) AS longitude, u.timestamp FROM user_data u ".($where_address === 'true' ? '' : $inner_join)." WHERE (u.device_speed > 0 OR u.haversine_speed > 0) AND ".$where_filter_dates;
	$result = pg_query($conn, $sql);

	if(!$result) {
		$sql = '';
		echo json_encode(array('error' => 'ERROR_QUERY_2', 'message' => pg_last_error($conn), 'other' => $sql));
		exit();
	}

	while ($row = pg_fetch_assoc($result))
		$response[] = $row;
	
    echo json_encode(array('fk' => $fk, 'min_speed' => $min_speed, 'max_speed' => $max_speed, 'data' => $response));
    pg_close($conn);