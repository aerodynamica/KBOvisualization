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
            $("#barchart").prev().find("span").html("Geen bekende berijfsvormen");
        else if(data.length < 2) 
            $("#barchart").prev().find("span").html("Enige bedrijfsvorm");
        else if(data.length < 5) 
            $("#barchart").prev().find("span").html("Top "+data.length+" bedrijfsvormen");

        // Sort according to count & cut to max top list
        data.sort(function(a, b) { return b.count - a.count; });
        var data = data.slice(0, nbForms);

        // Start building barchart
        var barchart = d3.select("#barchart svg");
        if(barchart.empty()) {
            barchart = d3.select("#barchart")
                         .append("svg")
                         .attr("width", width)
                         .attr("height", barHeight * nbForms);
        }

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


        bar.transition().duration(1000)     
            .attr("transform", function(d, i) { return "translate(5," + i * barHeight + ")"; });         
          
        bar.select("rect")      
            .transition().duration(1000) 
            .attr("width", function(d) { return scale(d.count); })     
            .style("fill", color);      
          
        bar.select("text")    
            .text(function(d, i) {
                 return (i+1).toLocaleString()+". "+afkorting(d.form);
              });
   
        var enter = bar.enter().append("g")
                .on("mouseover", tip.show)
             .on("mouseout", tip.hide);;    
        enter.attr("transform", function(d, i) { return "translate(5," + i * barHeight + ")"; });            
        enter.append("rect")
             .attr("width", function(d) { return scale(d.count); })
             .attr("height", barHeight - 1)
             .attr("class", "bar")
             .style("fill", color);
        
         enter.append("text")
             .attr("x",0)
             .attr("y", barHeight / 2)
             .attr("dy", ".35em")
             .attr("transform", "translate(" + 0 + ", 0)")
             .text(function(d, i) {
                 return (i+1).toLocaleString()+". "+afkorting(d.form);
              })
             
        
        bar.exit().remove();
     
    };

    function afkorting(input) {
        var afk = input
                  .replace("met", "")
                  .replace("onder de vorm van", "q")
                  .replace("onder vorm van", "q")
                  .replace("RSZ", "x")
                  .replace(" van", "")
                  .replace(" of", "")
                  .match(/\b(\w)/g);
        if(afk.length > 1)
            return afk.join('').replace("q", " ").replace("x", " RSZ ").toUpperCase();
        else 
            return afk[0]
    }

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
