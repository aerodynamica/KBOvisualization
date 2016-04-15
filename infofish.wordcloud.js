/*
 * Functions for the wordcloud visualisation
 *
 */

 // Check if variables already defined somewhere, otherwise default value
 var cwidth = (typeof width !== 'undefined')? width : window.innerWidth/2 - 100;
 var cheight = (typeof height !== 'undefined')? height : window.innerWidth/2 - 100;

// Encapsulate the word cloud functionality
function wordCloud() {

    var fill = d3.scale.category20c();

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
            .style("fill", function(d) { return fill(d.category); })
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
            //words = words.filter(isValidWord);

            var scale = d3.scale.linear()
                    .domain(d3.extent(words,function(d) { return d.size; }))
                    .range([15,100]);

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
    d3.json("data/wordclouds/"+activity+".json", function (error, names) {
        if (error)
            throw error;
        wordcloud.update(names);
    });
}

function isValidWord(word) {
    invalidwords = ["bvba","nv","sa","sprl","vzw","asbl"];
    return !(invalidwords.indexOf(word.text) > -1);
}
