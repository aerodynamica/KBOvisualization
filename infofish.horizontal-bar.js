function juridicalForms() {

    var margin = {top: 20, right: 10, bottom: 30, left: 10};
    var width = $("#barchart").width();
    var barHeight = 15;
    var nbForms = 5;


    function draw(data, color) {
        color = "#EEEEEE";
         var start = new Date().getTime();
        
        // Dynamically change the title
        if(data.length < 1) 
            $("#barchart").prev().find("span").html("Onbekende berijfsvorm");
        else if(data.length < 2) 
            $("#barchart").prev().find("span").html("Enige bedrijfsvorm");
        else if(data.length < 5) 
            $("#barchart").prev().find("span").html("Top "+data.length+" bedrijfsvormen");

        // Sort according to count & cut to max top list
        data.sort(function(a, b) { return b.count - a.count; });
        var data = data.slice(0, nbForms);

        // Start building barchart
        $("#barchart").html('');
        var barchart = d3.select("#barchart")
                         .append("svg")
                         .attr("width", width)
                         .attr("height", barHeight * nbForms);;

        // Hover tip message    
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .html(function(d) { return d.form + "<br/>Ondernemingen: "+d.count.toLocaleString(); })
            .direction('e')
            .offset([0,10])
            .direction('e');
          
        barchart.call(tip);
        
        var scale = d3.scale.linear()
                .domain([0, d3.max(data, function(d) { return d.count; })] )
                .range([0,500]);
        
        var bar = barchart.selectAll("g")
             .data(data, function(d) {return d.form;});

   
        var enter = bar.enter().append("g");    
        enter.attr("transform", function(d, i) { return "translate(5," + i * barHeight + ")"; });            
        enter.append("rect")
             .attr("width", function(d) { return scale(d.count); })
             .attr("height", barHeight - 1)
             .attr("class", "bar")
             .style("fill", color);
             /*.on("mouseover", tip.show)
             .on("mouseout", tip.hide);*/
        
         enter.append("text")
             .attr("x",0)
             .attr("y", barHeight / 2)
             .attr("dy", ".35em")
             .attr("transform", "translate(" + 0 + ", 0)")
             .text(function(d, i) {
                 var afkorting = d.form
                                  .replace("met", "")
                                  .replace("onder de vorm van", "q")
                                  .replace("onder vorm van", "q")
                                  .replace("RSZ", "x")
                                  .replace(" van", "")
                                  .replace(" of", "")
                                  .match(/\b(\w)/g);
                    if(afkorting.length > 1)
                        afkorting = afkorting.join('').replace("q", " ").replace("x", " RSZ ").toUpperCase();
                    else 
                        afkorting = afkorting[0]
                 var index = (i+1).toLocaleString()+". ";
                 return index+afkorting;
              })
             .on("mouseover", tip.show)
             .on("mouseout", tip.hide);
        
        bar.exit().remove();
     
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
