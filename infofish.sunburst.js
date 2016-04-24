/*
 * Functions for the wordcloud visualisation
 *
 */

// Dimensions of sunburst.
// Check if variables already defined somewhere, otherwise default value
var width = (typeof width !== 'undefined')? width : window.innerWidth/2 - 100;
var height = (typeof height !== 'undefined')? height : window.innerWidth/2 - 100;
var radius = (Math.min(width, height) / 2) - 10;

var sectorDictSunburst = d3.map();
sectorDictSunburst.set("A",d3.rgb("#98df8a"));
sectorDictSunburst.set("B",d3.rgb("#aec7e8"));
sectorDictSunburst.set("C",d3.rgb("#7f7f7f"));
sectorDictSunburst.set("D",d3.rgb("#ffbb78"));
sectorDictSunburst.set("E",d3.rgb("#2ca02c"));
sectorDictSunburst.set("F",d3.rgb("#1f77b4"));
sectorDictSunburst.set("G",d3.rgb("#d62728"));
sectorDictSunburst.set("H",d3.rgb("#ff9896"));
sectorDictSunburst.set("I",d3.rgb("#9467bd"));
sectorDictSunburst.set("J",d3.rgb("#c5b0d5"));
sectorDictSunburst.set("K",d3.rgb("#8c564b"));
sectorDictSunburst.set("L",d3.rgb("#c49c94"));
sectorDictSunburst.set("M",d3.rgb("#e377c2"));
sectorDictSunburst.set("N",d3.rgb("#f7b6d2"));
sectorDictSunburst.set("O",d3.rgb("#ff7f0e"));
sectorDictSunburst.set("P",d3.rgb("#c7c7c7"));
sectorDictSunburst.set("Q",d3.rgb("#bcbd22"));
sectorDictSunburst.set("R",d3.rgb("#dbdb8d"));
sectorDictSunburst.set("S",d3.rgb("#17becf"));
sectorDictSunburst.set("T",d3.rgb("#9edae5"));
sectorDictSunburst.set("V",d3.rgb("#843c39"));

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = { w: 75, h: 30, s: 3, t: 10};
var x = d3.scale.linear()
        .range([0, 2 * Math.PI]);
var y = d3.scale.sqrt()
        .range([0, radius]);
var color = d3.scale.category20();

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;
var svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height);
var mainGroup = svg.append("g")
        .attr("id", "container")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
var partition = d3.layout.partition()
        .value(function (d) {
            return d.nbEstablishments;
        });

var arc = d3.svg.arc()
        .startAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
        })
        .endAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
        })
        .innerRadius(function (d) {
            return Math.max(0, y(d.y));
        })
        .outerRadius(function (d) {
            return Math.max(0, y(d.y + d.dy));
        });

// Basic setup of page elements.
initializeBreadcrumbTrail();
d3.select("#togglelegend").on("click", toggleLegend);
var isChanging = false;

// Keep track of the node that is currently being displayed as the root.
var node;
var path;
d3.json("activitiesAug.json", function (error, root) {
    if (error)
        throw error;
	
	node = root;
    // Bounding circle underneath the sunburst, to make it easier to detect
    // when the mouse leaves the parent g.
    mainGroup.append("svg:circle")
            .attr("r", radius)
            .style("opacity", 0);

    //tooltip
    var tip = d3.tip()
    .attr('class', 'd3-tip');

    svg.call(tip);
    // For efficiency, filter nodes to keep only those large enough to see.
    var nodes = partition.nodes(root)
            .filter(function (d) {
                return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
            });
    var uniqueNames = (function (a) {
        var output = [];
        a.forEach(function (d) {
            if (output.indexOf(d.Code) === -1) {
                output.push(d.Code);
            }
        });
        return output;
    })(nodes);
    // set domain of colors scale based on data
    color.domain(root.children.length);
    // make sure this is done after setting the domain
    drawLegend();
    updateBreadcrumbs([root], "", sunburstClick);

    path = mainGroup.datum(root).selectAll("path")
            .data(partition.nodes)
            .enter().append("path")
            .attr("d", arc)
            .style("fill", function (d) {
                if(typeof d.parent === 'undefined')
                    return "#ffffff";
                else if(d.parent.Code == "root") {
					d.Color = sectorDictSunburst.get(d.Code);
                    return d.Color;
                } else {
                    if(d.depth %2 == 0)
                        d.Color = d3.rgb(d.parent.Color).darker(d.Code %10 / 10);
                    else {
                        d.Color = d3.rgb(d.parent.Color).brighter(d.Code %10 / 10);
                    }
                    return d.Color;
                }
                /*
                var path = getAncestors(d);
                if (path[0]) {
                    console.log(path[0]);
                        //return color(path[0].Code);
                        console.log(d);
                        d.Color = color(d.parent.Color);
                        return d.Color;

                }
                else {
                    d.Color = color((d.children ? d : d.parent).Code);
                    return d.Color;
                }*/
            })
            .on("mouseover",mouseover)
            .on("mouseout", mouseout)
            .on("mousemove", mousemove)
            .on("click", sunburstClick)
            .each(stash);
    // Add the mouseleave handler to the bounding circle.
    d3.select("#container").on("mouseleave", mouseleave);
    // Get total size of the tree = value of root node from partition.
    totalSize = path.node().__data__.value;
	
	path.each(function(d){
		if(sunburstFilter == d.Code)
			sunburstClick(d);
	});
	
    // Fade all but the current sequence, and show it in the breadcrumb trail.
    function mouseover(d) {
        tip.html("<em>"+d.Description+"</em></br>"+d.nbEstablishments.toLocaleString()+" vestigingseenheden");
        tip.show();

        var percentage = (100 * d.value / totalSize).toPrecision(3);
        var percentageString = percentage + "%";
        if (percentage < 0.1) {
            percentageString = "< 0.1%";
        }
        //d3.select("#percentage")
        //	.text(percentageString);
        //d3.select("#explanation")
        //	.style("visibility", "");
        var sequenceArray = getAncestors(d);
        updateBreadcrumbs(sequenceArray, percentageString, sunburstClick);
        // Fade all the segments.
        d3.selectAll("path")
                .style("opacity", 0.3);
        // Then highlight only those that are an ancestor of the current segment.
        svg.selectAll("path")
                .filter(function (node) {
                    return (sequenceArray.indexOf(node) >= 0);
                })
                .style("opacity", 1);
    }
    function mousemove(d) {
        tip.show();
    }
    function mouseout(d) {
        tip.hide();
    }
    // Restore everything to full opacity when moving off the visualization.
    function mouseleave(d) {
        tip.hide();
        if (!isChanging) {
            var percentage = (100 * node.value / totalSize).toPrecision(3);
            var percentageString = percentage + "%";
            if (percentage < 0.1) {
                percentageString = "< 0.1%";
            }
            var sequenceArray = getAncestors(node);
            updateBreadcrumbs(sequenceArray, percentageString, sunburstClick);
            // Deactivate all segments during transition.
            d3.selectAll("path").on("mouseover", null);
            // Transition each segment to full opacity and then reactivate it.
            d3.selectAll("path")
                    .transition()
                    .duration(500)
                    .style("opacity", 1)
                    .each("end", function () {
                        d3.select(this).on("mouseover", mouseover);
                    });
            d3.select("#explanation")
                    .transition()
                    .duration(500)
                    .style("visibility", "hidden");
        }
    }
});

function sunburstClick(d) {
	updateCloud(d.Code);
	updateBars(d.Code, d.Color);
	updateYearBars(d.Code, d.Color);
	node = d;
	isChanging = true;
	path.transition()
			.duration(500)
			.attrTween("d", arcTweenZoom(d))
			.each("end", function () {
				isChanging = false;
			});
	var sequenceArray = getAncestors(d);
	updateBreadcrumbs(sequenceArray, "", self);
	window.history.replaceState({"pageTitle":"InfoFish - Visualisation"},"", "?sunburstfilter=" + d.Code);
}

// Setup for switching data: stash the old values for transition.
function stash(d) {
    d.x0 = d.x;
    d.dx0 = d.dx;
}
// When switching data: interpolate the arcs in data space.
function arcTweenData(a, i) {
    var oi = d3.interpolate({x: a.x0, dx: a.dx0}, a);
    function tween(t) {
        var b = oi(t);
        a.x0 = b.x;
        a.dx0 = b.dx;
        return arc(b);
    }
    if (i == 0) {
        // If we are on the first arc, adjust the x domain to match the root node
        // at the current zoom level. (We only need to do this once.)
        var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
        return function (t) {
            x.domain(xd(t));
            return tween(t);
        };
    } else {
        return tween;
    }
}
// When zooming: interpolate the scales.
function arcTweenZoom(d) {
    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), [d.y, 1]),
            yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
    return function (d, i) {
        return i ? function (t) {
            return arc(d);
        } : function (t) {
            x.domain(xd(t));
            y.domain(yd(t)).range(yr(t));
            return arc(d);
        };
    };
}
function initializeBreadcrumbTrail() {
    // Add the svg area.
    var trail = d3.select("#sequence").append("svg:svg")
            .attr("width", width)
            .attr("height", 50)
            .attr("id", "trail");
    // Add the label at the end, for the percentage.
    // No percentage
    /*trail.append("svg:text")
            .attr("id", "endlabel")
            .style("fill", "#000");*/
}
// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
    var points = [];
    points.push("0,0");
    points.push(b.w + ",0");
    points.push(b.w + b.t + "," + (b.h / 2));
    points.push(b.w + "," + b.h);
    points.push("0," + b.h);
    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
        points.push(b.t + "," + (b.h / 2));
    }
    return points.join(" ");
}
// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString, click) {
    // Data join; key function combines name and depth (= position in sequence).
    var lastClicked = "";
    var g = d3.select("#trail")
            .selectAll("g")
            .data(nodeArray, function (d) {
                return d.Code + d.depth;
            });
    // Add breadcrumb and label for entering nodes.
    var entering = g.enter().append("svg:g");
    entering.append("svg:polygon")
            .attr("points", function(d, i){
                return (typeof d.parent === 'undefined')? "0,0 25,0 35,15 25,30 0,30" : breadcrumbPoints(d, i);
            })
            .style("cursor", "pointer")
            .style("fill", function (d) {
                //return color(d.Code);
                if(typeof d.parent === 'undefined')
                    return "#E3E5EB";
                else if(d.parent.Code == "root") {
                    d.Color = sectorDictSunburst.get(d.Code);
                    return d.Color;
                } else {
                    if(d.depth %2 == 0)
                        d.Color = d3.rgb(d.parent.Color).darker(d.Code %10 / 10);
                    else {
                        d.Color = d3.rgb(d.parent.Color).brighter(d.Code %10 / 10);
                    }
                    return d.Color;
                }
            })
            .on("click", click)
            .append("svg:title")
            .text(function(d){return d.Description;});

    entering.append("svg:text")
            .attr("x", (b.w + b.t) / 2)
            .attr("y", b.h / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .style("cursor", "pointer")
            .style("fill", function(d,i){return d3.rgb((typeof d.parent === 'undefined')? "#333" : "#fff");})
            .text(function (d) {
                return (typeof d.parent === 'undefined')? "Alle secties" : d.Code;
            }).on("click", click)
            .append("svg:title")
            .text(function(d){return d.Description;});
    // Set position for entering and updating nodes.
    g.attr("transform", function (d, i) {
        if(typeof d.parent === 'undefined') return "translate(" + 0 + ", 10)";
        //if(typeof d.parent == 'root') return "translate(" + 27 + ", 10)";
        return "translate(" + (27 + i * (b.w + b.s) )+ ", 10)";
    });

    //d3.select("#trail").append("g").attr("id", "#endlabel");
    // Remove exiting nodes.
    g.exit().remove();
    // Now move and update the percentage at the end.

    d3.select("#trail").select("#endlabel")
            .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
            .attr("y", b.h / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(percentageString);
    // Make the breadcrumb trail visible, if it's hidden.
    d3.select("#trail")
            .style("visibility", "");
}
// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
    var path = [];
    var current = node;
    while (current.parent) {
        path.unshift(current);
        current = current.parent;
    }
    path.unshift(current);
    return path;
}
function drawLegend() {
    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    var li = {
        w: 75, h: 30, s: 3, r: 3
    };
    var rootChildren = node.children;
    var legend = d3.select("#legend")
            .append("svg")
            .attr("width", (li.w + li.s) * 2)
            .attr("height", (li.h + li.s) * rootChildren.length);
    var g = legend.selectAll("g")
            .data(rootChildren)
            .enter()
            .append("svg:g")
            .attr("transform", function (d, i) {
                return "translate(" + (i % 2) * (li.w + li.s) + "," + ((i / 2) | 0) * (li.h + li.s) + ")";
            });
    g.append("rect")
            .attr("rx", li.r)
            .attr("ry", li.r)
            .attr("width", li.w)
            .attr("height", li.h)
            .style("fill", function (d) {
                return color(d.Code);
            }).on("click", function(){console.log("click");});
    g.append("text")
            .attr("x", li.w / 2)
            .attr("y", li.h / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(function (d) {
                return "sadas"+d.Code;
            });
}
function toggleLegend() {
    var legend = d3.select("#legend");
    if (legend.style("visibility") == "hidden") {
        legend.style("visibility", "");
    } else {
        legend.style("visibility", "hidden");
    }
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

d3.selection.prototype.last = function() {
  var last = this.size() - 1;
  return d3.select(this[0][last]);
};
