function getValuesAddress(type) {		
    var address = {
    	country : $('select#country').val(),
    	state : $('select#state').val(),
    	city : $('select#city').val(),
    	street : $('select#street').val()
   	};
	$.post('filter-address.php', {type: type, address: address}, function(response){
		processResponseAddress(type, response);
	}, 'json');
}

function changeLanguage(lang){
	if(lang == 'en')
		location.href = 'http://cityspeed.adsonvinicius.com.br?lang=ENG';
	else
		location.href = 'http://cityspeed.adsonvinicius.com.br?lang=PTB';
}

function addChangeEvent(){
	$("select.combobox").on("change", function (e) {	   
		if($(this).attr('reflect')){
			var elm = $(this).attr('reflect').split('|');
			for (var i = 0; i < elm.length; i++) {
				$("#"+elm[i]).data('combobox').clearTarget();
				$("#"+elm[i]).data('combobox').clearElement();
				$("#"+elm[i]).find('option:not(:disabled)').remove();
				$("#"+elm[i]).data('combobox').refresh();
				$("#"+elm[i]).data('combobox').disable();
			}
		}
		if(($(this).val() != null) && $(this).attr('dependency')){
			getValuesAddress($(this).attr('dependency'));
		}		
	});
}

function processResponseAddress(type, response) {
	var listItems = "";
    for (var i = 0; i < response.length; i++) {
        listItems += '<option value="' + response[i] + '">' + response[i] + "</option>";
    }
    $("#"+type).find('option:not(:disabled)').remove();
 	$("#"+type).append(listItems);
 	$("#"+type).data('combobox').enable();
 	$("#"+type).data('combobox').refresh();
}

function getWeight(speed, max_speed, min_speed){
	if(isNaN(speed) || isNaN(max_speed) || isNaN(min_speed)) 
		return 0;
	
	var weight = Number((parseFloat(speed) - parseFloat(min_speed)) / (parseFloat(max_speed) - parseFloat(min_speed))).toFixed(2);
	
	if(weight < 0) 
		return 0;

	weight = weight > 1 ? 1 : parseFloat(weight);
	heatmapWeight = 10 - (weight * 10);
	console.log("Speed: "+speed+" | Max Speed: "+max_speed +" | Min Speed: "+ min_speed+" -> "+ (Math.ceil(heatmapWeight)));
	return Math.ceil(heatmapWeight);
}


function formatDateLog(date){
	return date.substr(6,2)+'/'+ date.substr(4,2) +'/'+ date.substr(0,4);
}


function formatSpeed(speed){
	return isNaN(speed) ? 0 : Number(speed).toFixed(2).replace('.',',');
}

function initMap() {
	resetForm();
	var bounds = new google.maps.LatLngBounds();
	map = new google.maps.Map(document.getElementById('cs-map'), {
		mapTypeId: 'satellite',
		streetViewControl: false
	});

	
	if(HeatMapData && HeatMapData.length > 0){
		heatmap = new google.maps.visualization.HeatmapLayer({
			data: HeatMapData
		});

		heatmap.setMap(map);
		//heatmap.set('maxIntensity', 100); 
		//heatmap.set('dissipating', true); heatmap.set('opacity', 0.9);
		for(i=0; i < HeatMapData.length; i++)
			bounds.extend(HeatMapData[i].location);

		map.fitBounds(bounds);
		map.panToBounds(bounds);

	}else{
		map.setCenter(new google.maps.LatLng(0, 0));
		map.setZoom(2);
	}

	map.addListener('click', function(e) {	
		if(filterActive){
			removeMarkerFilter();
			if($.trim($('#filter-radius').val()) != ''  && !isNaN($('#filter-radius').val()))
				placeMarker(e.latLng, map);
			else {
				alert(lang.radiusError);
				filterActive = true;
			}
		}
	});
}


function loadLanguage(lang){
	$('[lang]').each(function(i, j){
		switch($(this).prop("tagName").toUpperCase()) {
			case 'OPTION': $(this).text(lang[$(this).attr('lang')]); break;
			case 'INPUT': $(this).attr('placeholder', lang[$(this).attr('lang')]); break;
			case 'BUTTON': $(this).text(lang[$(this).attr('lang')]); break;
			case 'DIV': $(this).text(lang[$(this).attr('lang')]); break;
			default: console.log('NOT_APPLICABLE');
		}
	});

	for(var i in lang.multipicker){
		$("#filter-dates").datepicker('option',i, lang.multipicker[i]);
		$('#detail-dates').datepicker('option',i, lang.multipicker[i]);
	}
}

function placeMarker(position, map) {
	marker = new google.maps.Marker({
		position: position,
		map: map,
		icon: {
	   		path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
	        fillColor: 'white',
		    fillOpacity: 1,
		    scale: 5,
		    strokeColor: 'white',
		    strokeOpacity: 0,
		    strokeWeight: 0
	    }
	});
	updateRadius();
}

var request = null;

function processFilter(){
	$('#multiCollapse').collapse('hide');

	var filterDates = [];

    $.each( $('#filter-dates').multiDatesPicker('getDates'), function(i, j){
    	filterDates.push({'startAt' : (j + ' ' + $('#filter-start-time input').val() + ':00'), 'endAt' :  (j + ' ' + $('#filter-end-time input').val()+ ':00')});
    });

	var latitude = marker ? marker.getPosition().lat() : '';	    	
	var longitude = marker ? marker.getPosition().lng() : '';
	var radius = (marker && $.trim($('#filter-radius').val()) != ''  && !isNaN($('#filter-radius').val())) ? $('#filter-radius').val() : '';
	var address = {
    	country : $('select#country').val(),
    	state : $('select#state').val(),
    	city : $('select#city').val(),
    	street : $('select#street').val(),
   	};
   	
	lastSearch =  {'filterDates' : filterDates, 'latitude' : latitude, 'longitude' : longitude, 'radius' : radius, 'address': address};
	
	openloading();
	$('#logModal').modal('toggle');
	if(request != null)
		request.abort();
	
	request = $.post('filter-data.php', lastSearch, function(response){
		closeloading();
		$('#logModal').modal('toggle');		
		processResponse(response);
	}, 'json');
}

function processLogResponse(response){
	$('.modal-dialog').addClass('expand-modal');
	$('.modal-body').html('<div id="chartdiv" style="height: 350px; width: 700px"></div>');

	var chart = AmCharts.makeChart("chartdiv", {
	    "type": "serial",
	    "language": "pt",
	    "theme": "light",
	    "allLabels": [{
		    "text": "Velocidade Média x Dia",
		    "align": "center",
		    "bold": true,
		    "size": 16,
		    "y": 12
		}],
	    "marginRight": 60,
	    "marginLeft": 60,
	    "marginTop": 45,

	    "mouseWheelZoomEnabled":false,
	    "dataDateFormat": "YYYY-MM-DD",
	    "valueAxes": [{
	        "id": "v1",
	        "axisAlpha": 0,
	        "position": "left",
	        "ignoreAxisWidth":true,
	        "title": "Km/h"
	    }],
	    "graphs": [{
	        "id": "g1",
	        "balloon":{
	          "drop":false,
	          "adjustBorderColor":false,
	          "color":"#ffffff"
	        },
	        "bullet": "round",
	        "bulletBorderAlpha": 1,
	        "bulletColor": "#FFFFFF",
	        "bulletSize": 3,
	        "hideBulletsCount": 50,
	        "lineThickness": 1,
	        "title": "red line",
	        "useLineColorForBulletBorder": true,
	        "valueField": "value",
	        "balloonText": "<span style='font-size:12px;'>[[value]] km/h ([[points]] pontos)</span>"
	    }],
	    
	    "chartCursor": {
	        "pan": true,
	        "valueLineEnabled": true,
	        "valueLineBalloonEnabled": true,
	        "cursorAlpha":1,
	        "cursorColor":"#258cbb",
	        "limitToGraph":"g1",
	        "valueLineAlpha":0.2,
	        "valueZoomable":false
	    },
	    
	    "categoryField": "date",
	    "categoryAxis": {
	        "parseDates": true,
	        "dashLength": 1,
	        "minorGridEnabled": false,
	        "title" : "Período (Dia)"
	    },
	    "export": {
	        "enabled": true,
	        "menu": [{
	            "format": "JSON",
	            "label": "Exportar dados",
	            "title": "Export JSON File",
	          }]
	    },
	    "dataProvider": getDataForChart(response)
	});	
	
	chart.addListener("rendered", renderedChart);

	function renderedChart() {
	}
}

function formatDate(data){
	return data.substr(0,4) + '-' + data.substr(4,2) + '-' + data.substr(6,2);
}

function getDataForChart(response){
    var ret = [];
    $.each(response.filterLogs, function(i, k){
		ret.push({ 'date' : k.data, 'value' : parseFloat(k.average_speed).toFixed(2) , 'points' : k.points});
	});
	return ret;  
}

function processResponse(response){
	closeloading();
	HeatMapData = Array();
	$.each(response.data, function(i, k){
		if(k.device_speed > 0){
			var weight = getWeight(k.device_speed, response.max_speed, response.min_speed);
			HeatMapData.push({location : new google.maps.LatLng(parseFloat(k.latitude), parseFloat(k.longitude)), weight : weight});
		}
	});
	if(HeatMapData.length > 0){
		$('#log-button').show();
	}else{
		$('#log-button').hide();
	}

	initMap();
}

function removeMarkerFilter(){
	if(marker) marker.setMap(null);	
	if(circle) circle.setMap(null);
	marker = circle = null;			
	filterActive = false;
}

function resetForm(){
	$('#filter-marker').removeClass('btn-danger');
    $('#filter-radius').prop('disabled', true);
    $('#filter-radius').val('');   
    removeMarkerFilter();
}

function openloading(){
	$('.modal-dialog').removeClass('expand-modal');
	$('.modal-header').hide();
	$('.modal-body').html('<div align="center"><h3>'+lang.searching+'</h3><img src="images/ajaxloadingbar.gif"/></div>');
}

function closeloading(){
	$('.modal-header').show();
}

function showLogs(){
	openloading();	
	$('#logModal').modal('toggle');
	if(lastSearch){
		$.post('filter-logs.php', lastSearch, function(response){
			processLogResponse(response);
		}, 'json');
	}else{
		$('.modal-body').html('<div align="center"><h2>'+lang.logError+'</h2></div>');
		$('#logModal').modal('toggle');
	}
}

function SortArrayByData(a, b){
  return ((a.data < b.data) ? -1 : ((a.data > b.data) ? 1 : 0));
}

function toogleMarkerButton(){
	$('#multiCollapse').collapse('hide');
	
	if($('#filter-marker').hasClass('btn-danger')){
    	resetForm();
    }else{
    	$('#filter-marker').addClass('btn-danger');
    	$('#filter-radius').prop('disabled', false);
    	$('#filter-radius').focus();
    	filterActive = true;
    }
}

function updateRadius(){
	if(!isNaN($('#filter-radius').val())){			
		circle = new google.maps.Circle({
			map: map,
			radius: parseInt($('#filter-radius').val()),
			fillColor: '#AA0000',
			strokeColor: '#FF0000',
		    strokeOpacity: 0,
		    strokeWeight: 0
		});
		circle.bindTo('center', marker, 'position');
	}else{
		alert(lang.radiusError);
	}
}