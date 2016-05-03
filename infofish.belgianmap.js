var entitiesValue = function(){};
function drawBelgianMap() {


    /* Handlebars */
    Handlebars.registerHelper('euro', function(amount) {
        return amount;
    });

    Handlebars.registerHelper('percent', function(trend) {
        return trend;
    });

    var screenWidth = 1000;
    var mapWidth = 500;
	
	var min;
	var max;
    /*
    if(screenWidth>1006) { // 17px scrollbars!
        mapWidth = $('#main').width()-12;
    } else {
        mapWidth = $('#main').width();
    }*/

    $('#belmap').css('width', mapWidth);

    /* Basic parameters */
    var width = mapWidth-2;
    var height = width*0.82;
    var currentZoom = '00000';

    var gemeentes, projection, path;

    var zoomed = false;

    /* Map to find TopoJSON features by NIS code */
    var featureByNis = d3.map();

    /* Maps to keep data about towns */
    //var nisByName = d3.map();
    var dataByNis = d3.map();
    // Load in gemeenten info
    // Contains: Niscode (nis), Name (name), zipcode (zip), total population (inw), total area in km^2(opp)
    var nis2gemeente;
    d3.json('data/gemeenten.json', function(data) {nis2gemeente = data;});

    /* Prepare the svg we'll use throughout */
    var belmap = d3.select('#belmap')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

    var c = belmap.append('g');
    var g = c.append("g").attr('id', 'gemeentes');
    var l = belmap.append("g").attr('id', 'legende');

    /* Make scales for each show */
    var entityValueBreaks = [15000, 20000, 25000, 30000, 35000, 40000, 45000];

    /*
    var scaleStops = {
        ent: [150, , 10000, , 20000, , 40000],
        est: [100, , 10000, , 20000, , 40000]
    };*/

    entitiesValue = d3.scale.threshold()
        .domain(entityValueBreaks)
        .range(d3.range(8).map(function (i) { return "c" + i; }));
		
	var scaleFactor;
	var normalisationFactor;

    function drawMap(bel, error, firstDraw) {

        /* Prepare the map and the necessary functions */
        gemeentes = topojson.feature(bel, bel.objects.gemeentes);
        projection = d3.geo.mercator().center([4.48,50.525]).scale(width*15).translate([width / 2, height / 2]);
        path = d3.geo.path().projection(projection);

        /* Draw the towns */
        g.selectAll('.gemeente')
        .data(gemeentes.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', 'gemeente')
        .attr('id', function(d) { return('nis'+d.id);})
        .attr('dummy', function(d,i) { featureByNis.set(d.id, i) })
        .on('click', function(d) {zoomGemeente(d.id) })
         .append("svg:title")
            .text(function(d) {
                var establish = dataByNis.get(d.id) !==undefined? dataByNis.get(d.id).est : "0";
				var text = "";
				if(normalisationFactor == "normal")
					text = nis2gemeente[d.id+""].name+" heeft "+establish+" establishments";
				else if(normalisationFactor == "population")
					text = nis2gemeente[d.id+""].name+" heeft "+establish+" establishments per 10000 inwoners";
				else if(normalisationFactor == "area")
					text = nis2gemeente[d.id+""].name+" heeft "+establish+" establishments per 10 vierkante km";
                return text;
            });
        //.on('mouseover', function(d) { if(!zoomed) updateDetails(d.id); });

        /* Draw the different borders */
        var b = c.append('g').attr('id', 'grenzen');

        b.append("path")
        .datum(topojson.mesh(bel, bel.objects.gemeentes, function(a, b) { return a !== b; }))
        .attr("d", path)
        .attr("class", "gemeentegrens");

        b.append("path")
        .datum(topojson.mesh(bel, bel.objects.gemeentes, function(a, b) {
            return a.id.toString().substring(0,1) !== b.id.toString().substring(0,1);
        }))
        .attr("d", path)
        .attr("class", "provinciegrens");

        b.append("path")
        .datum(topojson.mesh(bel, bel.objects.gemeentes, function(a, b) {
            if(a.id.toString().substring(0,2)==='23' && b.id.toString().substring(0,2)==='25') return true;
            if(a.id.toString().substring(0,2)==='24' && b.id.toString().substring(0,2)==='25') return true;
            if(a.id.toString().substring(0,2)==='21' && b.id.toString().substring(0,2)==='23') return true;
            if(a.id.toString().substring(0,2)==='21' && b.id.toString().substring(0,2)==='24') return true;
            if(a.id.toString().substring(0,2)==='23' && b.id.toString().substring(0,2)==='21') return true;
        }))
        .attr("d", path)
        .attr("class", "provinciegrens");

        b.append("path")
        .datum(topojson.mesh(bel, bel.objects.gemeentes, function(a, b) { return a === b; }))
        .attr("d", path)
        .attr("class", "landsgrens");

        /* Fill/color the map */
        fillMap(firstDraw);
    }
	
	function log10(value){
		if(value == 0){
			return 0;
		}
		return Math.log(value) / Math.log(10);
	}

    function fillMap(firstDraw) {
		
			if(scaleFactor == "linear"){
				 belmap.selectAll('.gemeente')
					.attr('class', function(d) {
						//If at least 1 company, color
						var fillClass = dataByNis.get(d.id) !==undefined && dataByNis.get(d.id).est > 0? entitiesValue(dataByNis.get(d.id).est) : 'noinfo';
						//if(currentView=='hv') var fillClass = dataByNis.get(d.id).hv!='-' ? huizenValue(dataByNis.get(d.id).hv) : 'noinfo';
						return(fillClass+' gemeente');
					});
			}else if(scaleFactor == "logarithmic"){
				var heatmapColors = ["#398258", "#bd4934"];
				
				var colorScale = d3.scale.linear()
					.domain([log10(min), log10(max)])
					.range(heatmapColors);
					
				belmap.selectAll('.gemeente')
					.style("fill", function(d){
						return colorScale(dataByNis.get(d.id)?log10(dataByNis.get(d.id).est):0);
					});
			}

			d3.select('.gemeente#nis'+currentZoom).classed('zoomed', true);
			if(firstDraw) updateScale();		
    }

    function zoomGemeente(nis) {

        d3.select('.zoomed').remove();  // Remove any dummy towns
        g.selectAll('path').classed('gemeente', true); // Restore any previously removed gemeente classes
        d3.select('#nis'+nis).classed('gemeente', false); // Take the real town out of the flow

        if(featureByNis.get(nis)!==undefined) {
            c.append('path')
            .attr('class', 'gemeente')
            .attr('id', 'nis'+nis)
            .datum(gemeentes.features[featureByNis.get(nis)])
            .attr('d', path)
            .on('click', function() { zoomed ? resetMap() : reZoom(nis) });

            currentZoom = nis;
            zoomed=true;
            fillMap();

            var bounds = path.bounds((gemeentes.features[featureByNis.get(nis)]));
            c.transition().duration(1500).attr("transform",
                "translate(" + projection.translate() + ")"
                + "scale(" + .35 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height) + ")"
                + "translate(" + -(bounds[1][0] + bounds[0][0]) / 2 + "," + -(bounds[1][1] + bounds[0][1]) / 2 + ")");
        }
    }

    function reZoom(nis) {

        zoomed=true;
        $('#zoomOut').show();

        var bounds = path.bounds((gemeentes.features[featureByNis.get(nis)]));
        c.transition().duration(1500).attr("transform",
            "translate(" + projection.translate() + ")"
            + "scale(" + .35 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height) + ")"
            + "translate(" + -(bounds[1][0] + bounds[0][0]) / 2 + "," + -(bounds[1][1] + bounds[0][1]) / 2 + ")");
    }

    function resetMap() {
        c.transition().duration(750).attr("transform", "");
        $('#zoomOut').hide();
        zoomed=false;
    }

    function updateScale(scaleValues) {
        if(typeof scaleValues === 'undefined')
            scaleValues = entityValueBreaks;
        else {
            scaleValues = d3.range(8).map(function (i) { return Math.round(entitiesValue.invertExtent("c" + i)[1]); });
        }
        var info = '';
        var aspect = '';
        var scaleUnit = '';
        var scaleStop = {0: scaleValues[0], 2:scaleValues[2], 4:scaleValues[4], 6:scaleValues[6]};

        var data = {
            info: info,
            aspect: aspect,
            scaleUnit: scaleUnit,
            scaleStop: scaleStop,
            since: 1900
        }

        var scaleTemplate = $('#scaleTpl').html();
        var scaleRender = Handlebars.compile(scaleTemplate);
        $('.scaleAndTitle').html(scaleRender(data));
    }

    //resetMap();

    function updateMap(activity, firstDraw) {
        d3.json("data/municipalities/"+activity+".json", function (error, data) {
            if (error)
                throw error;
			
			var radios = document.getElementsByName( "belmap-scale" );
			for( i = 0; i < radios.length; i++ ) {
				if( radios[i].checked ) {
					scaleFactor = radios[i].value;
				}
			}
			
			//check which normalisation factor to use
			radios = document.getElementsByName( "belmap-normalize" );
			for( i = 0; i < radios.length; i++ ) {
				if( radios[i].checked ) {
					normalisationFactor = radios[i].value;
				}
			}	
			
			//d3.select("#colorLegendLowText")
			//	.text(min);
				
			//d3.select("#colorLegendHighText")
			//	.text(max);
			
			if(normalisationFactor == "normal"){
				max = d3.max(data, function(d) { return d.estCount; });
				min = d3.min(data, function(d) { return d.estCount; });
				
				data.forEach(function(d) {
					dataByNis.set(d.nis, {ent: d.entCount, est: d.estCount}); // Entities and establishments
				});
			}else if(normalisationFactor == "population"){
				max = d3.max(data, function(d) { return d.estCount / (nis2gemeente[d.nis].inw / 10000.0); });
				min = d3.min(data, function(d) { return d.estCount / (nis2gemeente[d.nis].inw / 10000.0); });
				
				data.forEach(function(d) {
					dataByNis.set(d.nis, {ent: d.entCount / (nis2gemeente[d.nis].inw / 10000.0), est: d.estCount / (nis2gemeente[d.nis].inw / 10000.0)}); // Entities and establishments
				});
			}else if(normalisationFactor == "area"){
				max = d3.max(data, function(d) { return d.estCount / (nis2gemeente[d.nis].opp / 10); });
				min = d3.min(data, function(d) { return d.estCount / (nis2gemeente[d.nis].opp / 10); });
				
				data.forEach(function(d) {
					dataByNis.set(d.nis, {ent: d.entCount / (nis2gemeente[d.nis].opp / 10), est: d.estCount / (nis2gemeente[d.nis].opp / 10)}); // Entities and establishments
				});
			}
			
			console.log(min);
			console.log(max);
			
			/*var entityValueBreaks = [];
			for(i = 1; i <= max; i+=Math.log(max/7)) {
				entityValueBreaks.push(Math.floor(i));
			}*/
			entitiesValue = d3.scale.quantize()
				//.domain(entityValueBreaks)
				.domain([min,max])
				.range(d3.range(8).map(function (i) { return "c" + i; }));

			updateScale(entitiesValue);

			/* Load the TopoJSON data */
			d3.json('data/bel.json', function(d) {drawMap(d, firstDraw);});
		});
    }

    return {
        update : function(activity, firstDraw) {
            updateMap(activity);
        }
    };
}

function redrawMap(activity, firstDraw){
	$("#belmap").html('');
	belgianMap = new drawBelgianMap();
	belgianMap.update(activity, firstDraw);
}
