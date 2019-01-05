<?php
	header('Content-Type: application/json');
	require_once('conexao.php');
	$cols = explode('|', 'country|state|city|street');
	$where_address = '';
	$type = $_POST['type'];
	foreach ($_POST['address'] as $key => $value) {
		if(!empty($value) && in_array($key, $cols))
			$where_address .= (" AND $key = '".str_replace("'", "''", $value)."'");
	}
	$sql = "SELECT DISTINCT $type FROM location_data WHERE $type != 'ZERO_RESULTS'" . $where_address . " ORDER BY 1";
	$result = pg_query($conn, $sql);
	
	if(!$result) {
		$sql = '';
		echo json_encode(array('error' => 'ERROR_QUERY_1', 'message' => pg_last_error($conn), 'other' => $sql));
		exit();
	}

	while ($row = pg_fetch_assoc($result))
		$response[] = $row["$type"];
	
    echo json_encode($response);
    pg_close($conn);