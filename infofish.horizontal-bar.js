function juridicalForms() {

    var margin = {top: 20, right: 20, bottom: 30, left: 0};
    var width = window.innerWidth/4 - margin.left - margin.right;
    var barHeight = 20;

    var nbForms = 12;

    
    

    function draw(data, color) {
         var start = new Date().getTime();
        
        data.sort(function(a, b) { return b.count - a.count; });
        //data.sort(function(a,b) {return (a.count < b.count) ? 1 : 0;} );
        var data = data.slice(0, nbForms);

        var barchart = d3.select("#barchart svg")
                
        if(barchart.empty()){
            d3.select("#barchart").append("svg")
                            .attr("width", width)
                            .attr("height", barHeight * nbForms);
        }
                           

        var scale = d3.scale.linear()
                .domain([0, d3.max(data, function(d) { return d.count; })] )
                .range([0,500]);
        
        

          var bar = barchart.selectAll("g")
             .data(data, function(d) {return d.form;});
            /* .transition().duration(1000)*/
             
          
          bar.transition().duration(1000)
             .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });   
     
          bar.select("rect")
             /*.transition().duration(1000)*/
             .attr("width", function(d) { return scale(d.count); })
             /*.attr("height", barHeight - 1)
             .attr("class", "bar")*/
             .style("fill", color);
            /* .append("svg:title")
             .text(function(d) { return "Vestigingseenheden: "+d.count+"\nBedrijfsvorm: "+d.form; });*/
     
          bar.select("text")
             /*.attr("x", 0)
             .attr("y", barHeight / 2)
             .attr("dy", ".35em")
             .attr("transform", "translate(" + 5 + ", 0)")*/
             .text(function(d) {
                 var maxlength = width/7
                 if(d.form.length > maxlength)
                    return d.form.slice(0, maxlength)+"... ("+d.count+")";
                  return d.form+" ("+d.count+")"; });
           /*  .append("svg:title")
             .text(function(d) { return "Vestigingseenheden: "+d.count+"\nBedrijfsvorm: "+d.form; });*/
     
   
        var enter = bar.enter().append("g");
                       
        enter/*.transition().duration(1000)*/
                        .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });
                        
        enter.append("rect")   
            /* .transition().duration(1000)*/
             .attr("width", function(d) { return scale(d.count); })
            .attr("height", barHeight - 1)
             .attr("class", "bar")
             .style("fill", color);
             /*.append("svg:title")
             .text(function(d) { return "Vestigingseenheden: "+d.count+"\nBedrijfsvorm: "+d.form; });*/
     
         enter.append("text")
             .attr("x",0)
             .attr("y", barHeight / 2)
             .attr("dy", ".35em")
             .attr("transform", "translate(" + 5 + ", 0)")
             .text(function(d) {
                 var maxlength = width/7
                 if(d.form.length > maxlength)
                    return d.form.slice(0, maxlength)+"... ("+d.count+")";
                  return d.form+" ("+d.count+")"; });
            /* .append("svg:title")
             .text(function(d) { return "Vestigingseenheden: "+d.count+"\nBedrijfsvorm: "+d.form; });*/
        
        
        
     
     
        bar.exit().remove();
        
        var stop = new Date().getTime();
        
        console.log("drew bar chart in "+(stop-start)+" ms");
        
       
     
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
