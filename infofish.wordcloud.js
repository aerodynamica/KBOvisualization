/*
 * Functions for the wordcloud visualisation
 *
 */

 // Check if variables already defined somewhere, otherwise default value
 var cwidth = (typeof width !== 'undefined')? width : window.innerWidth/2 - 100;
 var cheight = (typeof height !== 'undefined')? height : window.innerWidth/4 - 250;

var currentActivity;
var maxWords = 100;

var catDict = d3.map();
catDict.set("voornaam man",d3.rgb("#1f77b4"));
catDict.set("voornaam vrouw",d3.rgb("#e377c2"));
catDict.set("voornaam",d3.rgb("#8177bb"));
catDict.set("rechtsvorm",d3.rgb("#ff7f0e"));
catDict.set("land",d3.rgb("#2ca02c"));
catDict.set("ander",d3.rgb("#7f7f7f"));

var catVis = d3.map();
catVis.set("voornaam man",true);
catVis.set("voornaam vrouw",true);
catVis.set("voornaam",true);
catVis.set("rechtsvorm",false);
catVis.set("land",true);
catVis.set("ander",true);



// Encapsulate the word cloud functionality
function wordCloud() {
//cwidth = $("#wordcloudAndLegend").width() - 40;

    //Construct the word cloud's SVG element
    var svg = d3.select("#wordcloud").append("svg")
        .attr("width", cwidth)
        .attr("height", cheight)
        .append("g")
        .attr("transform", "translate("+cwidth/2+","+cheight/2+")");



    //Draw the word cloud
    function draw(words) {
        var cloud = svg.selectAll("g text")
                        .data(words, function(d) { return d.text; });
                
        var tip = d3.tip()
         .attr('class', 'd3-tip')
         .html(function(d) { return "<em>"+d.text+"</em><br/>Categorie: "+d.category+"<br/>Aantal: "+d.count.toLocaleString(); })
         .direction('e')
         .offset([0,10]);

        svg.call(tip);

        //Entering words
        cloud.enter()
            .append("text")
            .style("font-family", "Impact")
            //.style("font-weight", "600")
            .style("fill", function(d) { return catDict.get(d.category); })
            .attr("text-anchor", "middle")
            .attr('font-size', 1)
            .text(function(d) { return d.text; })
            .on("mouseover", tip.show)
              .on("mouseout", tip.hide);

        //Entering and existing words
        cloud.transition()
                .duration(1000)
                //.style("font-size", function(d) { return d.size*scale; })
                .attr('font-size', function(d) { return d.size; })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .style("fill-opacity", 1);

        //Exiting words
        cloud.exit()
            .transition()
            .duration(500)
            .style('fill-opacity', 1e-6)
            .attr('font-size', 1)
            .remove();
    }

    //Use the module pattern to encapsulate the visualisation code. We'll
    // expose only the parts that need to be public.
    return {
        //Recompute the word cloud for a new set of words. This method will
        // asycnhronously call draw when the layout has been computed.
        //The outside world will need to call this function, so make it part
        // of the wordCloud return value.
        update: function(words) {
            var start = new Date().getTime();
            
            words = words.filter(isValidWord);
            
            var stop = new Date().getTime();
            //console.log("filtered words cloud in "+(stop-start)+" ms");

            words = words.slice(0,maxWords);

            var scale = d3.scale.linear()
                    .domain(d3.extent(words,function(d) { return d.count; }))
                    .range([15,60]);

            d3.layout.cloud().size([cwidth, cheight])
                .words(words)
                .padding(5)
                .rotate(0)
                .font("Impact")
                //.fontWeight("600")
                .fontSize(function(d) { return scale(d.count); })
                .on("end", draw)
                .start();
        
            var stop = new Date().getTime();
            //console.log("updated word cloud in "+(stop-start)+" ms");

        }
    }
}

function updateCloud(activity){
    currentActivity = activity;
    d3.json("data/wordclouds/"+activity+".json", function (error, words) {
        if (error)
            throw error;
        wordcloud.update(words);
    });
}

function isValidWord(word) {
    return catVis.get(word.category);
}


$(document).on("click", "#wordCloudLegend li", function(){
    var cat = $(this).attr('data-key');
    toggleCategory(cat);
    $(this).find('i').toggleClass("fa-circle fa-circle-o");
});

$(document).ready(function(){
    function formatCategory(string) {
        string = string.replace("voornaam", "naam");
        if(string == "naam") string = "Naam unisex";
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    var selected = '<i class="fa fa-circle"></i>',
        select = '<i class="fa fa-circle-o"></i>';
    $.each(catDict.keys(), function(index, val){
        var circle = catVis.get(val)? "fa-circle" : "fa-circle-o"
        var content = '<i class="fa '+circle+'" style="color:'+catDict.get(val)+'"></i> '+formatCategory(val);
        $("#wordCloudLegend").append('<li data-key="'+val+'">'+content+'</li>');
    });
});

function toggleCategory(cat){
    var current = catVis.get(cat);
    catVis.set(cat,!current);
    updateCloud(currentActivity);
}
