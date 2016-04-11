/*
 * Functions for the wordcloud visualisation
 *
 */

 // Dimensions of sunburst.
 // Check if variables already defined somewhere, otherwise default value
 var width = (typeof width !== 'undefined')? width : window.innerWidth/2 - 50;
 var height = (typeof height !== 'undefined')? height : window.innerWidth/2 - 50;
var radius = (Math.min(width, height) / 2) - 10;

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
            return 1;
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
    var path = mainGroup.datum(root).selectAll("path")
            .data(partition.nodes)
            .enter().append("path")
            .attr("d", arc)
            .style("fill", function (d) {
                if(typeof d.parent === 'undefined')
                    return "#ffffff";
                else if(d.parent.Code == "root") {
                    d.Color = color(d.Code);
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
            .on("click", click)
            .each(stash);
    // Add the mouseleave handler to the bounding circle.
    d3.select("#container").on("mouseleave", mouseleave);
    // Get total size of the tree = value of root node from partition.
    totalSize = path.node().__data__.value;
    function click(d) {
        updateCloud(d.Code);
        updateBars(d.Code, d.Color);
        node = d;
        isChanging = true;
        path.transition()
                .duration(500)
                .attrTween("d", arcTweenZoom(d))
                .each("end", function () {
                    isChanging = false;
                });
    }
    // Fade all but the current sequence, and show it in the breadcrumb trail.
    function mouseover(d) {
        tip.html(d.Description);
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
        updateBreadcrumbs(sequenceArray, percentageString);
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
            updateBreadcrumbs(sequenceArray, percentageString);
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
function updateBreadcrumbs(nodeArray, percentageString) {
    // Data join; key function combines name and depth (= position in sequence).
    var g = d3.select("#trail")
            .selectAll("g")
            .data(nodeArray, function (d) {
                return d.Code + d.depth;
            });
    // Add breadcrumb and label for entering nodes.
    var entering = g.enter().append("svg:g");
    entering.append("svg:polygon")
            .attr("points", breadcrumbPoints)
            .style("fill", function (d) {
                return color(d.Code);
            });
    entering.append("svg:text")
            .attr("x", (b.w + b.t) / 2)
            .attr("y", b.h / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.Code;
            });
    // Set position for entering and updating nodes.
    g.attr("transform", function (d, i) {
        return "translate(" + i * (b.w + b.s) + ", 0)";
    });
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
    return path;
}
function drawLegend() {
    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    var li = {
        w: 75, h: 30, s: 3, r: 3
    };
    var rootChildren = node.children;
    var legend = d3.select("#legend")
            .append("svg:svg")
            .attr("width", (li.w + li.s) * 2)
            .attr("height", (li.h + li.s) * rootChildren.length);
    var g = legend.selectAll("g")
            .data(rootChildren)
            .enter()
            .append("svg:g")
            .attr("transform", function (d, i) {
                return "translate(" + (i % 2) * (li.w + li.s) + "," + ((i / 2) | 0) * (li.h + li.s) + ")";
            });
    g.append("svg:rect")
            .attr("rx", li.r)
            .attr("ry", li.r)
            .attr("width", li.w)
            .attr("height", li.h)
            .style("fill", function (d) {
                return color(d.Code);
            });
    g.append("svg:text")
            .attr("x", li.w / 2)
            .attr("y", li.h / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.Code;
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
