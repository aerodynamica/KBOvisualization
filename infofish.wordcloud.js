/*
 * Functions for the wordcloud visualisation
 *
 */

 // Check if variables already defined somewhere, otherwise default value
 var cwidth = (typeof width !== 'undefined')? width : window.innerWidth/4 - 50;
 var cheight = (typeof height !== 'undefined')? height : window.innerWidth/4 - 50;

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

        //Entering words
        cloud.enter()
            .append("text")
            .style("font-family", "Impact")
            .style("fill", function(d) { return catDict.get(d.category); })
            .attr("text-anchor", "middle")
            .attr('font-size', 1)
            .text(function(d) { return d.text; });

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

            words = words.filter(isValidWord);

            words = words.slice(0,maxWords);

            var scale = d3.scale.linear()
                    .domain(d3.extent(words,function(d) { return d.size; }))
                    .range([15,60]);

            d3.layout.cloud().size([cwidth, cheight])
                .words(words)
                .padding(5)
                .rotate(0) //function() { return ~~(Math.random() * 2) * 45; })
                .font("Impact")
                .fontSize(function(d) { return scale(d.size); })
                .on("end", draw)
                .start();

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



function drawWordCloudLegend() {
    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    var li = {
        w: 120, h: 30, s: 3, r: 3
    };
    var legend = d3.select("#wordCloudLegend")
            .append("svg:svg")
            .attr("width", (li.w + li.s) * 2)
            .attr("height", (li.h + li.s) * catDict.size());

    var g = legend.selectAll("g")
            .data(catDict.keys())
            .enter()
            .append("svg:g")
            .attr("transform", function (d, i) {
                return "translate(0," + i* (li.h+li.s) + ")";
            })
            .style("opacity", function(d){
                return catVis.get(d) ? 1 : 0.3;
                }
                )
                .on("click", function (d) {
                    d3.select(this).style("opacity", function(d){
                            return catVis.get(d) ? 0.3 : 1;
                    });
                    toggleCategory(d);
                });

    g.append("svg:rect")
                .attr("rx", li.r)
                .attr("ry", li.r)
                .attr("width", function (d) {
                return li.w;
                })
                .attr("height", li.h)
                .style("cursor", "pointer")
                .style("fill", function (d) {
                    return catDict.get(d);
                });

    g.append("svg:text")
            .attr("x", li.w / 2)
            .attr("y", li.h / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .style("cursor", "pointer")
            .text(function (d) {
                return d;
            });
}

function toggleCategory(cat){
    var current = catVis.get(cat);
    catVis.set(cat,!current);
    updateCloud(currentActivity);
}
