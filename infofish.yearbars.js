var currentView = "est";

function barChartYears() {

    var margin = {top: 10, right: 20, bottom: 30, left: 20},
        bwidth = window.innerWidth/2 - margin.left - margin.right; //500 - margin.left - margin.right,
        bheight = 200 - margin.top - margin.bottom,
        parseDate = d3.time.format("%Y").parse;

    function draw(data, color) {
        if(typeof color === 'undefined') color = "#999";

    d3.select("#barchart2").html("");
    var x = d3.time.scale()
        .domain([parseDate(data[0].year), d3.time.day.offset(parseDate(data[data.length - 1].year), 1)])
        .rangeRound([0, bwidth - margin.left - margin.right]);

    var y = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return currentView=="est"? d.estCount : d.entCount; })])
        .range([bheight - margin.top - margin.bottom, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(d3.time.format('%Y'));

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    var svg = d3.select("#barchart2 svg");
    if(svg.empty()) {
        svg = d3.select('#barchart2').append('svg')
            .attr('class', 'chart')
            .attr('width', bwidth)
            .attr('height', bheight)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    }

    // Hover tip message    
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d) { 
            if(currentView=="est")
                return "Opgericht in " + d.year + "<br/>Vestigingseenheden: "+d.estCount.toLocaleString();
            else
                return "Opgericht in " + d.year + "<br/>Ondernemingen: "+d.entCount.toLocaleString();
        })
        .direction('e')
        .offset([0,10])
        .direction('n');
      
    svg.call(tip);

    svg.selectAll('.chart')
        .data(data)
        .enter().append('rect')
        .style("fill", color)
        .attr('x', function(d) { return x(parseDate(d.year)); })
        .attr('y', function(d) { return bheight - margin.top - margin.bottom - (bheight - margin.top - margin.bottom - y(currentView=="est"?d.estCount : d.entCount)) })
        .attr('width', function(d){   
            return (bwidth - margin.left - margin.right)/(data[data.length - 1].year-data[0].year+1)-1;
            })
        .attr('height', function(d) { return bheight - margin.top - margin.bottom - y(currentView=="est"?d.estCount : d.entCount) })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + (bheight - margin.top - margin.bottom) + ')')
        .call(xAxis);
    };

    return {
        update : function(data, color) {
            draw(data, color);
        }
    };
}
var currActivity = "root",
    currColor = "#999";

function updateYearBars(activity, color, current_view) {
    currentView = (typeof current_view == "undefined")? currentView : current_view;
    currColor = (typeof color == "undefined")? currColor : color;
    currActivity = (typeof activity == "undefined")? currActivity : activity;

    d3.json("data/startdates/"+currActivity+".json", function (error, data) {
        if (error)
            throw error;

        // Check only dates after 1900
        for(var i = data.length - 1; i >= 0; i--) {
            if(data[i].year < 1900) {
               data.splice(i, 1);
            }
        }
        barChartYears.update(data, currColor);
    });
}
