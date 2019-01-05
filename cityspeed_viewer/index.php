<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>CitySpeed</title>
    <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
	<link rel="icon" href="images/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" type="text/css" media="screen" href="css/bootstrap.min.css" /-->
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">

    <link rel="stylesheet" href="css/jquery-ui.min.css" />
    <link rel="stylesheet" href="css/jquery-ui.theme.min.css" />
    <link rel="stylesheet" href="css/jquery-ui.structure.min.css" />
    <link rel="stylesheet" href="css/jquery-ui.multidatespicker.css" />
    <link rel="stylesheet" href="css/bootstrap-formhelpers.min.css" />
    <link rel="stylesheet" href="css/bootstrap-combobox.css"/>
    <link rel="stylesheet" href="css/estilo.css?shva=<?php echo md5_file('css/estilo.css') ?>" />
	<link rel="stylesheet" href="https://www.amcharts.com/lib/3/plugins/export/export.css" type="text/css" media="all" />

    <script type="text/javascript" src="js/lib/jquery-3.2.1.min.js"></script>
    <script type="text/javascript" src="js/lib/jquery-ui.min.js"></script>
   	<script type="text/javascript" src="js/lib/bootstrap.min.js"></script>
   	<script type="text/javascript" src="js/lib/bootstrap-combobox.js"></script>
	<script type="text/javascript" src="js/lib/jquery-ui.multidatespicker.js"></script>
	<script type="text/javascript" src="js/lib/bootstrap-formhelpers.min.js"></script>
	
	<script src="https://www.amcharts.com/lib/3/amcharts.js"></script>
	<script src="https://www.amcharts.com/lib/3/serial.js"></script>
	<script src="https://www.amcharts.com/lib/3/plugins/export/export.min.js"></script>
	<script src="https://www.amcharts.com/lib/3/themes/light.js"></script>
	<script src="https://www.amcharts.com/lib/3/lang/pt.js"></script>	

	<script type="text/javascript" src="js/lang.js?shva=<?php echo md5_file('js/lang.js') ?>"></script>
	<script type="text/javascript" src="js/script.js?shva=<?php echo md5_file('js/script.js') ?>"></script>
	<script type="text/javascript">

		var map, heatmap, locations, marker, circle, HeatMapData, filterActive = false, lastSearch, lang;
	    
	    $(function () {	    	
	    	if (<?php echo (isset($_GET['lang']) && $_GET['lang'] == 'ENG') ? 'true' : 'false' ?>)
	    		lang = language.eng;
	    	else
	    		lang = language.ptb;

	        $('#filter-dates').multiDatesPicker({		    
			    onSelect: function(){
			    	$('.filter-dates-count').text($('#filter-dates').multiDatesPicker('getDates').length > 0 ? '(' + $('#filter-dates').multiDatesPicker('getDates').length + ')' : '');
			    }
	        })

	        $('#detail-dates').multiDatesPicker({
			    onSelect: function(){
			    	$('.detail-dates-count').text($('#detail-dates').multiDatesPicker('getDates').length > 0 ? '(' + $('#detail-dates').multiDatesPicker('getDates').length + ')' : '');
			    }
	        });
			loadLanguage(lang);
	        $(".combobox").combobox();
	        addChangeEvent();
			getValuesAddress('country');

	    });  
	    
	</script>
  </head>
  <body>
  	<div class="container">
	    <div class="panel panel-info">
			<div class="panel-heading"><strong>CitySpeed</strong><div onclick="changeLanguage(<?php echo (isset($_GET['lang']) && $_GET['lang'] == 'ENG') ? "'pt'" : "'en'" ?>)" style="float:right; cursor: pointer;"><img src="images/<?php echo (isset($_GET['lang']) && $_GET['lang'] == 'ENG') ? 'pt' : 'en' ?>.png" /></div></div>
			<div class="panel-body">
				<div class="row" style="margin-bottom: 15px">
				    <div class="col-sm-3">
				    	<select class="form-control combobox" id="country" reflect="state|city|street" dependency="state">
				    		<option value="" selected disabled lang="country"></option>					    							    		
				    	</select>
				    </div>
				    <div class="col-sm-3">
				    	<select class="form-control combobox" disabled id="state" reflect="city|street" dependency="city">
				    		<option value="" selected disabled lang="state"></option>					    							    		
				    	</select>
					</div>
					
					<div class="col-sm-3">
				    	<select class="form-control combobox" disabled id="city" reflect="street" dependency="street">
				    		<option value="" selected disabled lang="city"></option>				    							    		
				    	</select>
					</div>
					
					<div class="col-sm-3">
				    	<select class="form-control combobox" disabled id="street">
				    		<option value="" selected disabled lang="street"></option>					    							    		
				    	</select>				    	
					</div>
				</div>			    
			    <div class="row">
				    <div class="col-sm-3">
					    <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#multiCollapse" lang="selectDataInterval" aria-expanded="false" aria-controls="multiCollapse"></button>
					</div>
				    <div class='col-sm-4'>
				        <div class="form-inline">
				        	<div style="width:50px; display: inline-block;">
								<button id="filter-marker" type="button" class="btn" onclick="toogleMarkerButton()">
								  <span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span>
								</button>
						    </div>
				            <input type="number" min="1" class="form-control" id="filter-radius" disabled="true" lang="radius" placeholder="">
				        </div>
				    </div>		    
					<div class='col-sm-5'>
						<button type="submit" style="width: 150px" class="btn btn-primary" lang="filter" onclick="processFilter()"></button>
						<button type="submit" id="log-button" class="btn btn-danger" onclick="showLogs()" lang="log"></button>
					</div>
				</div>	
		    	<div class="row">					
					<div class="collapse" style="width:330px" id="multiCollapse">
						<div class="well">
							<div class="row">
								<div class="col-sm-12" style="padding-left: 5px!important">
									<div class="date-title" lang="dataAnalysis"></div>
									<div id="filter-dates"></div>
							        <div class="row" style="margin-top:15px">
							        	<div class="col-sm-5">
							        		<div id="filter-start-time" data-time="00:00" class="bfh-timepicker"></div>
							        	</div>
							        	<div class="col-sm-5">
							        		<div id="filter-end-time" data-time="23:59" class="bfh-timepicker"></div>
							        	</div>
							        	<div class="col-sm-2">
							        		<div class="filter-dates-count"></div>
							        	</div>							        	
							        </div>	
							    </div>
							</div>
						</div>
					</div>
				</div>			    
			</div>
		</div>	
		<div class="panel panel-default">
		  <div class="panel-body">	
		  	<div id="cs-map"></div>	   
		  </div>
		</div>	    
	</div>
    <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=API_KEY&libraries=visualization&callback=initMap&language=<?php echo (isset($_GET['lang']) && $_GET['lang'] == 'ENG') ? 'en' : 'pt' ?>">
    </script>
  </body>
</html>

<div class="modal fade" id="logModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
      </div>
      <div class="modal-body">
      </div>
    </div>
  </div>
</div>