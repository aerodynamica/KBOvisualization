function juridicalForms() {

    var width = 500,
        barHeight = 20;

    function draw(data, color) {
        data.sort(function(a, b) { return b.count - a.count; });
        //data.sort(function(a,b) {return (a.count < b.count) ? 1 : 0;} );
        var data = data.slice(0, 5);

        d3.select("#barchart").html("");
        var barchart = d3.select('#barchart')
    						.append('svg')
                            .attr("width", width)
                            .attr("height", barHeight * data.length);

        //data = getTop(data);
        var scale = d3.scale.linear()
                .domain( d3.extent(data, function(d) { return d.count; }) )
                .range([0,500]);

         var bar = barchart.selectAll("g")
             .data(data)
           .enter().append("g")
             .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

         bar.append("rect")
             .attr("width", function(d) { return scale(d.count); })
             .attr("height", barHeight - 1)
             .attr("class", "bar")
             .style("fill", color)
             .append("svg:title")
             .text(function(d) { return "Companies: "+d.count+"\nCompany form: "+d.form; });

         bar.append("text")
             .attr("x", function(d) { return 0; })
             .attr("y", barHeight / 2)
             .attr("dy", ".35em")
             .text(function(d) { return d.form+" ("+d.count+")"; })
             .append("svg:title")
             .text(function(d) { return "Companies: "+d.count+"\nCompany form: "+d.form; });

    };

    return {
        update : function(data, color) {
            draw(data, color);
        }
    };
}

 function updateBars(activity, color){
     d3.json("data/juridicalforms/"+activity+".json", function (error, data) {
         if (error)
             throw error;
         juridicalForms.update(data, color);
     });
 }
