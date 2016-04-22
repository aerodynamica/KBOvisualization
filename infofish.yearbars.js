function barChartYears() {

    var margin = {top: 20, right: 20, bottom: 30, left: 0},
        bwidth = window.innerWidth/2 - 100 - margin.left - margin.right; //500 - margin.left - margin.right,
        bheight = 250 - margin.top - margin.bottom,
        parseDate = d3.time.format("%Y").parse;

    function draw(data, color) {

//Reform data to only year
/*
var tmp = [];
data.forEach(function(d){
    var key = d.year.split('-')[1];
    tmp[key] = (tmp[key] > 0)? tmp[key] + d.entCount : d.entCount
});
ddd = []; // reset data
tmp.forEach(function(i,v){
    ddd.push({"year": v, "count":i})
});
console.log(ddd);
*/
    d3.select("#barchart2").html("");
    var x = d3.time.scale()
        .domain([parseDate(data[0].year), d3.time.day.offset(parseDate(data[data.length - 1].year), 1)])
        .rangeRound([0, bwidth - margin.left - margin.right]);

    var y = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.entCount; })])
        .range([bheight - margin.top - margin.bottom, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(d3.time.format('%Y'));

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    var svg = d3.select('#barchart2').append('svg')
        .attr('class', 'chart')
        .attr('width', bwidth)
        .attr('height', bheight)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    svg.selectAll('.chart')
        .data(data)
      .enter().append('rect')
        .style("fill", color)
        .attr('x', function(d) { return x(parseDate(d.year)); })
        .attr('y', function(d) { return bheight - margin.top - margin.bottom - (bheight - margin.top - margin.bottom - y(d.entCount)) })
        .attr('width', function(d){
            return (data.length > 2000)? 3 : 10;
            })
        .attr('height', function(d) { return bheight - margin.top - margin.bottom - y(d.entCount) })
        .append("svg:title")
        .text(function(d) { return "Opgericht op " + d.year + "\nVestigingseenheden: "+d.entCount; });

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

 function updateYearBars(activity, color){
     d3.json("data/startdates/"+activity+".json", function (error, data) {
         if (error)
             throw error;
         barChartYears.update(data, color);
     });
 }
