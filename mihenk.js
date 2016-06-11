/*
Copyright (C) 2016 Ömer Güvenir

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

//Değişkenler
var mihenk = {};
var dset = [];
var xdata;
var ydata;
var ranges = [
    {
        "x_labels": ["1", "2", "3", "4", "6", "8"],
        "y_labels": []
    }
];
var grafik;
var margin = { top: 10, right: 90, bottom: 90, left: 90 },
    width = 700.51 + margin.left + margin.right,
    height = 500.51 - margin.top - margin.bottom;
var format = d3.format(".2f");//Virgülden sonra iki basamak

//Grafikler
mihenk.barchart = function(veri) {
    xdata = veri.xdata;
    ydata = veri.ydata;
    convert(xdata, ydata);
    //ranges = veri.ranges;
    grafik = veri.opt;
    if (dset !== undefined) {
        barchart();
    }
};

mihenk.barhorizontal = function(veri) {
    xdata = veri.xdata;
    ydata = veri.ydata;
    convert(xdata, ydata);
    //ranges = veri.ranges;
    grafik = veri.opt;
    if (dset !== undefined) {
        //console.log("vetical")
        barhorizontal();
    }
};

mihenk.box = function(veri) {
    dset = veri.data;
    grafik = veri.opt;
    if (dset !== undefined) {
        boxchart();
    }
}

mihenk.error = function(veri) {
    dset = veri.data;
    grafik = veri.opt;
    if (dset !== undefined) {
        error();
    }
}

mihenk.line = function(veri) {
    xdata = veri.xdata;
    ydata = veri.ydata;
    convert(xdata, ydata);
    //dset = veri.data;
    grafik = veri.opt;
    if (dset !== undefined) {
        line();
    }
}

//BarChart
function barchart() {
    //
    var xmin, xmax, ymin, ymax;
    xmin = dset[0].x;
    xmax = dset[0].x;
    ymin = dset[0].y;
    ymax = dset[0].y;

    for (t = 0; t < dset.length; t++) {
        if (dset[t].x < xmin) {
            xmin = dset[t].x;
        }
        if (dset[t].y < ymin) {
            ymin = dset[t].y;
        }
        if (dset[t].x > xmax) {
            xmax = dset[t].x;
        }
        if (dset[t].y > ymax) {
            ymax = dset[t].y;
        }
    }
    //console.log(xmin, xmax, '|', ymin, ymax);
    ranges[0].x_range = [xmin - 1, xmax + 1];
    ranges[0].y_range = [ymin - 1, ymax + 1];
    //
    var x = d3.scale.linear()
        .domain(ranges[0]["x_range"])
        .range([0, width]);

    var x1 = d3.scale.ordinal()
        .domain(ranges[0]["x_range"])
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .domain(ranges[0]["y_range"])
        .range([0, height]);

    var z = d3.scale.category10();

    //y ekseni için scale
    var y2 = d3.scale.linear()
        .domain(ranges[0]["y_range"])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .innerTickSize(-height)
        .outerTickSize(0)
        //.tickFormat(function(d,i){return grafik.x_labels[i]})
        .tickPadding(10);

    var yAxis = d3.svg.axis()
        .scale(y2)
        .orient("left")
        .innerTickSize(-width)
        .outerTickSize(0)
        //.tickFormat(function(d,i){return ranges[0]["y.labels"][i]})
        .tickPadding(10);

    var zoom = d3.behavior.zoom()
        .x(x)
        .y(y2)
        .scaleExtent([1, 5])
        .on("zoom", zoomed);

    d3.select("#" + grafik.div_id).select("svg").remove();//Önceki var olan grafiği siliyor
    var svg = d3.select("#" + grafik.div_id).append("svg")
        .attr("viewBox", "0 0 " + (width + margin.right + margin.left) + " " + (height + margin.top + margin.bottom))
        .append("svg:g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var axisy = svg.append("g")
        .attr("class", "y axis")
        //.tickFormat(ranges[0]["y.labels"])
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr("dy", ".71em")
        .attr("x", -height / 3)
        .style("text-anchor", "end")
        .text(grafik.ylab);

    var axisx = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width / 2 + 10)//xAxias deki label değerinin yeri için buraya bak
        .attr("y", 60)
        .style("text-anchor", "end")
        .text(grafik.xlab);//Json üzerinden bu değeri değiştir

    //Zoom ve label ların ayarlanması    
    if (grafik.zoom === true && grafik.x_labels.length === 0 && grafik.y_labels.length === 0) {
        //console.log(grafik.x_labels.length, grafik.y_labels.length);
        svg.call(zoom);
    } else {
        //console.log(grafik.x_labels.length, xdata.length);
        if (grafik.x_labels.length !== 0) {
            xAxis.tickFormat(function(d, i) { return grafik.x_labels[i]; });
            svg.select(".x.axis").call(xAxis);
        }
        if (grafik.y_labels.length !== 0) {
            yAxis.tickFormat(function(d, i) { return grafik.y_labels[i]; });
            svg.select(".y.axis").call(yAxis);
        }
    }

    var svg2 = svg.append("svg").attr("height", height).attr("width", width);

    var g = svg.append("g").attr("width", width).attr("height", height);

    var bar = svg2.selectAll("rect")
        .data(dset)
        .enter()
        .append("rect")
        .style("fill", function(d, i) {
            if (grafik.color.length !== 0) {
                if (grafik.color.length < xdata.length) {
                    return grafik.color[i % grafik.color.length];
                } else {
                    return grafik.color[i];
                }

            } else {
                return z(i);
            }
        })
        .attr("id", "bar")
        .attr("opacity", "0.7")
        .attr("y", height)
        .on("mousemove", over)
        .on("mouseout", out);

    bar.transition()
        .duration(500)
        .attr("width",/*(width-margin.left)/dset.length(width / dset.length) / 2*/x1.rangeBand() / dset.length)
        .attr("height", function(d, i) { return y(d.y); })
        .attr("x", function(d, i) { return x(d.x) - (x1.rangeBand() / dset.length) / 2; })
        .attr("y", function(d, i) { return height - y(d.y); })
    /*Çıktı için gerekli düzenlemeler*/
    d3.selectAll(".tick")
        .attr("font", "15px sans-serif")
        .attr("fill", "#333")
        //.attr("stroke", "#333")
        .attr("shape-rendering", "crispEdges")
        .attr("opacity", 0.1);

    d3.selectAll(".axis.text")
        .attr("text-anchor", "end")
        .attr("font", "12px Arial")

    d3.selectAll("text")
        .attr("fill", "#777");

    d3.selectAll(".tick line")
        //.style("stroke-dasharray", ("5, 5"))
        .attr("stroke", "#333")
        .attr("opacity", "0.1")

    d3.select(".x.axis path")
        .attr("fill", "none")
        .attr("stroke", "#6B6B6B")
        .attr("shape-rendering", "crispEdges")

    d3.select(".y.axis path")
        .attr("fill", "none")
        .attr("stroke", "#6B6B6B")
        .attr("shape-rendering", "crispEdges")
    /*--------------------------------*/
    //tooltip
    var div = d3.select("#"+grafik.div_id).append("div")
        .attr("class", "barv tooltip")
        .style("opacity", 0);
    div.append('div')
        .attr('class', 'labell');
    div.append('div')
        .attr('class', 'count');
    div.append('div')
        .attr('class', 'percent');
    // hover fonksiyonları
    function over(d, i, j) {
        d3.select(this)
            //.attr("stroke", "#C1C1C1");
            .attr("stroke", z(i));

        div.transition()
            .duration(500)
            .style("opacity", 1);
        div.select('.labell').html(grafik.ylab+" :" + d.y)                // Object.keys(dset[0]) bu değerler sabit mi ? 
        //div.select('.count').html(Object.keys(dset[0])[5]+":"+dset[i]["density"]); //
        div.select('.percent').html(grafik.xlab+" :" + format(d.x));//
        var mouseCoords = d3.mouse(
            //d3.select("#"+grafik.div_id).node().parentElement);
            d3.select("div.barv.tooltip").node().parentElement);
        div.transition()
            .duration(500)
            .style("opacity", 0.9)
            .style("display", "block")
            .style("left", mouseCoords[0] - 30 + "px")
            .style("top", mouseCoords[1] - 80 + "px");
    }
    function out(d, i, j) {
        d3.select(this)
            .transition(500)
            .attr({
                stroke: ""
            })
        div.transition()
            .duration(500)
            .style("opacity", 0);
    }
    function zoomed() {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);
        bar.attr("transform", "translate(" + d3.event.translate[0] + ",0)scale(" + d3.event.scale + ",1)");
        bar.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


}

//Bar Horizontal
function barhorizontal() {
    //
    var xmin, xmax, ymin, ymax;
    xmin = dset[0].x;
    xmax = dset[0].x;
    ymin = dset[0].y;
    ymax = dset[0].y;

    for (t = 0; t < dset.length; t++) {
        if (dset[t].x < xmin) {
            xmin = dset[t].x;
        }
        if (dset[t].y < ymin) {
            ymin = dset[t].y;
        }
        if (dset[t].x > xmax) {
            xmax = dset[t].x;
        }
        if (dset[t].y > ymax) {
            ymax = dset[t].y;
        }
    }
    //console.log(xmin, xmax, '|', ymin, ymax);
    ranges[0].x_range = [xmin - 1, xmax + 1];
    ranges[0].y_range = [ymin - 1, ymax + 1];
    //
    var x = d3.scale.linear()
        .domain(ranges[0]["x_range"])
        .range([0, width]);

    var x1 = d3.scale.ordinal()
        .domain(ranges[0]["x_range"])
        .rangeRoundBands([0, width], .1);

    var x2 = d3.scale.ordinal()
        .domain(ranges[0]["x_range"])
        .rangeRoundBands([0, width]);

    var y = d3.scale.linear()
        .domain(ranges[0]["y_range"])
        .range([0, height]);

    var z = d3.scale.category10();

    //y ekseni için scale
    var y2 = d3.scale.linear()
        .domain(ranges[0]["y_range"])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .innerTickSize(-height)
        .outerTickSize(0)
        //.tickFormat(function(d,i){return ranges[0]["x.labels"][i]})
        .tickPadding(10);

    var yAxis = d3.svg.axis()
        .scale(y2)
        .orient("left")
        .innerTickSize(-width)
        .outerTickSize(0)
        //.tickFormat(function(d,i){return ranges[0]["y.labels"][i]})
        .tickPadding(10);

    var zoom = d3.behavior.zoom()
        .x(x)
        .y(y2)
        .scaleExtent([1, 5])
        .on("zoom", zoomed);

    d3.select("#" + grafik.div_id).select("svg").remove();//Önceki var olan grafiği siliyor
    var svg = d3.select("#" + grafik.div_id).append("svg")
        .attr("viewBox", "0 0 " + (width + margin.right + margin.left) + " " + (height + margin.top + margin.bottom))
        .append("svg:g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    svg.append("g")
        .attr("class", "y axis")
        //.tickFormat(ranges[0]["y.labels"])
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr("dy", ".71em")
        .attr("x", -height / 3)
        .style("text-anchor", "end")
        .text(grafik.ylab);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width / 2 + 10)//xAxias deki label değerinin yeri için buraya bak
        .attr("y", 60)
        .style("text-anchor", "end")
        .text(grafik.xlab);//Json üzerinden bu değeri değiştir

    //Zoom ve label ların ayarlanması    
    if (grafik.zoom === true && grafik.x_labels.length === 0 && grafik.y_labels.length === 0) {
        //console.log(grafik.x_labels.length, grafik.y_labels.length);
        svg.call(zoom);
    } else {
        //console.log(grafik.x_labels.length, xdata.length);
        if (grafik.x_labels.length !== 0) {
            xAxis.tickFormat(function(d, i) { return grafik.x_labels[i]; });
            svg.select(".x.axis").call(xAxis);
        }
        if (grafik.y_labels.length !== 0) {
            yAxis.tickFormat(function(d, i) { return grafik.y_labels[i]; });
            svg.select(".y.axis").call(yAxis);
        }
    }
    var svg2 = svg.append("svg").attr("height", height).attr("width", width);

    var g = svg.append("g").attr("width", width).attr("height", height);

    var bar = svg2.selectAll("rect")
        .data(dset)
        .enter()
        .append("rect")
        .style("fill", function(d, i) {
            if (grafik.color.length !== 0) {
                if (grafik.color.length < xdata.length) {
                    return grafik.color[i % grafik.color.length];
                } else {
                    return grafik.color[i];
                }

            } else {
                return z(i);
            }
        })
        .attr("id", "bar")
        .attr("opacity", "0.7")
        .attr("width", 0)
        .on("mousemove", over)
        .on("mouseout", out);

    bar.transition()
        .duration(500)
        .attr("height",/*(width-margin.left)/dset.length(width / dset.length) / 2*/x1.rangeBand() / dset.length / 2)
        .attr("width", function(d, i) { return x(d.x); })
        .attr("x", function(d, i) { return x2(d.x); })
        .attr("y", function(d, i) { return height - y(d.y) - height / dset.length / 4; });
    /*Çıktı için gerekli düzenlemeler*/
    d3.selectAll(".tick")
        .attr("font", "15px sans-serif")
        .attr("fill", "#333")
        //.attr("stroke", "#333")
        .attr("shape-rendering", "crispEdges")
        .attr("opacity", 0.1);

    d3.selectAll(".axis.text")
        .attr("text-anchor", "end")
        .attr("font", "12px Arial")

    d3.selectAll("text")
        .attr("fill", "#777");

    d3.selectAll(".tick line")
        //.style("stroke-dasharray", ("5, 5"))
        .attr("stroke", "#333")
        .attr("opacity", "0.1")

    d3.select(".x.axis path")
        .attr("fill", "none")
        .attr("stroke", "#6B6B6B")
        .attr("shape-rendering", "crispEdges")

    d3.select(".y.axis path")
        .attr("fill", "none")
        .attr("stroke", "#6B6B6B")
        .attr("shape-rendering", "crispEdges")
    d3.selectAll(".domain")
        .attr("fill", "none")
        .attr("stroke", "#6B6B6B")
        .attr("shape-rendering", "crispEdges")
    /*--------------------------------*/
    //tooltip
    var div = d3.select("#"+grafik.div_id).append("div")
        .attr("class", "barh tooltip")
        .style("opacity", 0);
    div.append('div')
        .attr('class', 'labell');
    div.append('div')
        .attr('class', 'count');
    div.append('div')
        .attr('class', 'percent');
    // hover fonksiyonları
    function over(d, i, j) {
        d3.select(this)
            //.attr("stroke", "#C1C1C1");
            .attr("stroke", z(i));

        div.transition()
            .duration(500)
            .style("opacity", 1);
        div.select('.labell').html(grafik.ylab+" :" + d.y)                // Object.keys(dset[0]) bu değerler sabit mi ? 
        //div.select('.count').html(Object.keys(dset[0])[5]+":"+dset[i]["density"]); //
        div.select('.percent').html(grafik.xlab+" :" + format(d.x));//
        var mouseCoords = d3.mouse(
            d3.select("div.barh.tooltip").node().parentElement);
        div.transition()
            .duration(500)
            .style("opacity", 0.9)
            .style("display", "block")
            .style("left", mouseCoords[0] - 30 + "px")
            .style("top", mouseCoords[1] - 80 + "px");
    }
    function out(d, i, j) {
        d3.select(this)
            .transition(500)
            .attr({
                stroke: ""
            })
        div.transition()
            .duration(500)
            .style("opacity", 0);
    }
    function zoomed() {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);
        bar.attr("transform", "translate(" + d3.event.translate[0] + ",0)scale(" + d3.event.scale + ",1)");
        bar.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


}

//Box plot
function boxchart() {
    //
    var xmin, xmax, ymin, ymax;
    //console.log(dset);
    xmin = dset[0].x;
    xmax = dset[0].x;
    ymin = dset[0].ymin;
    ymax = dset[0].ymax;

    for (t = 0; t < dset.length; t++) {
        if (dset[t].x < xmin) {
            xmin = dset[t].x;
        }
        if (dset[t].ymin < ymin) {
            ymin = dset[t].ymin;
        }
        if (dset[t].x > xmax) {
            xmax = dset[t].x;
        }
        if (dset[t].ymax > ymax) {
            ymax = dset[t].ymax;
        }
    }
    //console.log(xmin, xmax, '|', ymin, ymax);
    ranges[0].x_range = [xmin - 1, xmax + 1];
    ranges[0].y_range = [ymin - 1, ymax + 1];
    //
    var margin = { top: 10, right: 90, bottom: 90, left: 90 },
        width = 700.51 + margin.left + margin.right,
        height = 500.51 - margin.top - margin.bottom;
    var c1, c2, c3, c4, c5;

    var format = d3.format(".2f");

    var x1 = d3.scale.ordinal()
        .domain(ranges[0]["x_range"])
        .rangeRoundBands([0, width], .1);

    var x = d3.scale.linear()
        .domain(ranges[0]["x_range"])
        .range([0, width]);


    var y = d3.scale.linear()
        .domain(ranges[0]["y_range"])
        .range([0, height]);

    var z = d3.scale.category20();

    //y ekseni için scale
    var y2 = d3.scale.linear()
        .domain(ranges[0]["y_range"])
        .range([height, 0]);


    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .innerTickSize(-height)
        .outerTickSize(0)
        //.tickFormat(function(d,i){return ranges[0]["x.labels"][i]})
        .tickPadding(10);

    var yAxis = d3.svg.axis()
        .scale(y2)
        .orient("left")
        .innerTickSize(-width)
        .outerTickSize(0)
        //.tickFormat(function(d,i){return ranges[0]["y.labels"][i]})
        .tickPadding(10);

    var zoom = d3.behavior.zoom()
    				.x(x)
    				.y(y2)
    				.scaleExtent([1, 5])
    				.on("zoom", zoomed);

    d3.select("#" + grafik.div_id).select("svg").remove();
    var svg = d3.select("#"+grafik.div_id).append("svg")
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", "0 0 " + (width + margin.right + margin.left) + " " + (height + margin.top + margin.bottom))
        .append("svg:g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    //.call(d3.behavior.zoom().x(x).y(y2).scaleExtent([1, 10]).on("zoom", zoomed));

    svg.append("g")
        .attr("class", "y axis")
        //.tickFormat(ranges[0]["y.labels"])
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr("dy", ".71em")
        .attr("x", -height / 3)
        .style("text-anchor", "end")
        .text(grafik.ylab);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width / 2 + 10)//xAxias deki label değerinin yeri için buraya bak
        .attr("y", 60)
        .style("text-anchor", "end")
        .text(grafik.xlab);//Json üzerinden bu değeri değiştir 

    var y3 = d3.scale.linear()
        .domain(ranges[0]["y_range"])
        .range([height, 0]);
    //Zoom ve label ların ayarlanması    
    if (grafik.zoom === true && grafik.x_labels.length === 0 && grafik.y_labels.length === 0) {
        //console.log(grafik.x_labels.length, grafik.y_labels.length);
        svg.call(zoom);
    } else {
        //console.log(grafik.x_labels.length, xdata.length);
        if (grafik.x_labels.length !== 0) {
            xAxis.tickFormat(function(d, i) { return grafik.x_labels[i]; });
            svg.select(".x.axis").call(xAxis);
        }
        if (grafik.y_labels.length !== 0) {
            yAxis.tickFormat(function(d, i) { return grafik.y_labels[i]; });
            svg.select(".y.axis").call(yAxis);
        }
    }
    var svg2 = svg.append("svg").attr("height", height).attr("width", width);

    //Dikey çizgiler
    for (var t = 0; t < dset.length; t++) {
        var line = svg2.append("line")
            .attr("stroke", function(d, i) {
                if (grafik.color.length !== 0) {
                    return "#333";

                } else {
                    return z(t);
                }
            })
            .attr("id", "boxline")
            .attr("opacity", 0.5)
            .attr("x1", x(dset[t].x))
            .attr("x2", x(dset[t].x))
            .attr("y1", height - y(dset[t].ymin))
            .attr("y2", height - y(dset[t].ymax))
    }

    //Yatay Çizgiler

    for (var t = 0; t < dset.length; t++) {
        var line = svg2.append("line")
            .attr("stroke", function(d, i) {
                if (grafik.color.length !== 0) {
                    return "#333";

                } else {
                    return z(t);
                }
            })
            .attr("id", "boxline")
            .attr("opacity", 0.5)
            .attr("x1", x(dset[t].x) - (x1.rangeBand() / dset.length) / 2)
            .attr("x2", x(dset[t].x) + x1.rangeBand() / dset.length / 2)
            .attr("y1", height - y(dset[t].middle))
            .attr("y2", height - y(dset[t].middle))
    }



    var bar = svg2.selectAll("rect")
        .data(dset)
        .enter()
        .append("rect")
        .style("fill", function(d, i) {
            if (grafik.color.length !== 0) {
                if (grafik.color.length < xdata.length) {
                    return grafik.color[i % grafik.color.length];
                } else {
                    return grafik.color[i];
                }

            } else {
                return z(i);
            }
        })
        .attr("id", "bar")
        //.attr("stroke","#333")
        .attr("opacity", "0.7")
        .attr("width",/*(width-margin.left)/dset.length--x.rangeBand()/dset.length*/x1.rangeBand() / dset.length)
        .attr("height", function(d, i) { return y(d.upper) - y(d.lower); })
        .attr("x", function(d, i) { return x(d.x) - (x1.rangeBand() / dset.length) / 2; })
        .attr("y", function(d, i) { return height - y(d.upper); })
        .on("mousemove", over)
        .on("mouseout", out);

    /*Çıktı için gerekli düzenlemeler*/
    d3.selectAll(".tick")
        .attr("font", "15px sans-serif")
        .attr("fill", "#333")
        //.attr("stroke", "#333")
        .attr("shape-rendering", "crispEdges")
        .attr("opacity", 0.1);

    d3.selectAll(".axis.text")
        .attr("text-anchor", "end")
        .attr("font", "12px Arial")

    d3.selectAll("text")
        .attr("fill", "#777");

    d3.selectAll(".tick line")
        //.style("stroke-dasharray", ("5, 5"))
        .attr("stroke", "#333")
        .attr("opacity", "0.1")

    d3.select(".x.axis path")
        .attr("fill", "none")
        .attr("stroke", "#6B6B6B")
        .attr("shape-rendering", "crispEdges")

    d3.select(".y.axis path")
        .attr("fill", "none")
        .attr("stroke", "#6B6B6B")
        .attr("shape-rendering", "crispEdges")
    d3.selectAll(".domain")
        .attr("fill", "none")
        .attr("stroke", "#6B6B6B")
        .attr("shape-rendering", "crispEdges")
    /*--------------------------------*/
    //tooltip
    var div = d3.select("#"+grafik.div_id).append("div")
        .attr("class", "box tooltip2")
        .style("opacity", 0);
    div.append('div')
        .attr('class', 'labell labell');
    div.append('div')
        .attr('class', 'labelll labell');
    div.append('div')
        .attr('class', 'labellll labell');
    div.append('div')
        .attr('class', 'count labell');
    div.append('div')
        .attr('class', 'percent labell');
    // hover fonksiyonları
    function over(d, i, j) {
        d3.select(this)
            //.transition(100)
            .attr("stroke", z(i))
        //.attr("stroke-width",0.5);

        div.transition()
            .duration(500)
            .style("opacity", 1);
        div.select('.labell').html("Max :" + d.ymax);
        div.select('.labelll').html("Q3 :" + d.upper);
        div.select('.labellll').html("Median :" + d.middle);
        div.select('.count').html("Q1 :" + d.lower);
        div.select('.percent').html("Min :" + d.ymin);
        var mouseCoords = d3.mouse(
            d3.select("div.box.tooltip2").node().parentElement);
        div.transition()
            .duration(500)
            .style("opacity", 0.9)
            .style("display", "block")
            .style("left", mouseCoords[0] - 40 + "px")
            .style("top", mouseCoords[1] - 120 + "px");
    }


    function out(d, i, j) {
        d3.select(this)
            .transition(500)
            .attr({
                stroke: "none"
            })
        //.attr("stroke","#333");

        div.transition()
            .duration(500)
            .style("opacity", 0);

        svg2.selectAll(".test").attr("opacity", 0).style("display", "none");
        svg2.selectAll(".circles").attr("opacity", 0).style("display", "none");

    }

    function zoomed() {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);

        bar.attr("transform", "translate(" + d3.event.translate[0] + ",0)scale(" + d3.event.scale + ",1)");
        bar.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        d3.selectAll("#boxline").attr("transform", "translate(" + d3.event.translate[0] + ",0)scale(" + d3.event.scale + ",1)");
        d3.selectAll("#boxline").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
}

//Error Bar
function error() {
    //
    var xmin, xmax, ymin, ymax;
    //console.log(dset);
    xmin = dset[0].x;
    xmax = dset[0].x;
    ymin = dset[0].ymin;
    ymax = dset[0].ymax;

    for (t = 0; t < dset.length; t++) {
        if (dset[t].x < xmin) {
            xmin = dset[t].x;
        }
        if (dset[t].ymin < ymin) {
            ymin = dset[t].ymin;
        }
        if (dset[t].x > xmax) {
            xmax = dset[t].x;
        }
        if (dset[t].ymax > ymax) {
            ymax = dset[t].ymax;
        }
    }
    //console.log(xmin, xmax, '|', ymin, ymax);
    ranges[0].x_range = [xmin - 1, xmax + 1];
    ranges[0].y_range = [ymin - 1, ymax + 1];
    //
    var margin = { top: 10, right: 90, bottom: 90, left: 90 },
        width = 700.51 + margin.left + margin.right,
        height = 500.51 - margin.top - margin.bottom;
    var c1, c2, c3, c4, c5;

    var format = d3.format(".2f");

    var x1 = d3.scale.ordinal()
        .domain(ranges[0]["x_range"])
        .rangeRoundBands([0, width], .1);

    var x = d3.scale.linear()
        .domain(ranges[0]["x_range"])
        .range([0, width]);


    var y = d3.scale.linear()
        .domain(ranges[0]["y_range"])
        .range([0, height]);

    var z = d3.scale.category20();

    //y ekseni için scale
    var y2 = d3.scale.linear()
        .domain(ranges[0]["y_range"])
        .range([height, 0]);


    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .innerTickSize(-height)
        .outerTickSize(0)
        //.tickFormat(function(d,i){return ranges[0]["x.labels"][i]})
        .tickPadding(10);

    var yAxis = d3.svg.axis()
        .scale(y2)
        .orient("left")
        .innerTickSize(-width)
        .outerTickSize(0)
        //.tickFormat(function(d,i){return ranges[0]["y.labels"][i]})
        .tickPadding(10);

    var zoom = d3.behavior.zoom()
    				.x(x)
    				.y(y2)
    				.scaleExtent([1, 5])
    				.on("zoom", zoomed);
    d3.select("#" + grafik.div_id).select("svg").remove();
    var svg = d3.select("#"+grafik.div_id).append("svg")
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", "0 0 " + (width + margin.right + margin.left) + " " + (height + margin.top + margin.bottom))
        .append("svg:g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    //.call(d3.behavior.zoom().x(x).y(y2).scaleExtent([1, 10]).on("zoom", zoomed));

    svg.append("g")
        .attr("class", "y axis")
        //.tickFormat(ranges[0]["y.labels"])
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr("dy", ".71em")
        .attr("x", -height / 3)
        .style("text-anchor", "end")
        .text(grafik.ylab);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width / 2 + 10)//xAxias deki label değerinin yeri için buraya bak
        .attr("y", 60)
        .style("text-anchor", "end")
        .text(grafik.xlab);//Json üzerinden bu değeri değiştir 

    var y3 = d3.scale.linear()
        .domain(ranges[0]["y_range"])
        .range([height, 0]);
    //Zoom ve label ların ayarlanması    
    if (grafik.zoom === true && grafik.x_labels.length === 0 && grafik.y_labels.length === 0) {
        //console.log(grafik.x_labels.length, grafik.y_labels.length);
        svg.call(zoom);
    } else {
        //console.log(grafik.x_labels.length, xdata.length);
        if (grafik.x_labels.length !== 0) {
            xAxis.tickFormat(function(d, i) { return grafik.x_labels[i]; });
            svg.select(".x.axis").call(xAxis);
        }
        if (grafik.y_labels.length !== 0) {
            yAxis.tickFormat(function(d, i) { return grafik.y_labels[i]; });
            svg.select(".y.axis").call(yAxis);
        }
    }
    var svg2 = svg.append("svg").attr("height", height).attr("width", width);

    //Error bar 
    var svg2 = svg.append("svg").attr("height", height).attr("width", width);
    for (var a = 0; a < dset.length; a++) {
        svg2.append("line")
            .attr("id", "errorline")
            .attr("x1", function(d) { return x(dset[a].x); })
            .attr("x2", function(d) { return x(dset[a].x); })
            .attr("y1", height - y(dset[a].ymin))
            .attr("y2", height - y(dset[a].ymax))
            .attr("stroke", z(0));
        //Alt çizgi
        svg2.append("line")
            .attr("id", "errorline")
            .attr("x1", function(d) { return x(dset[a].x) - 10; })
            .attr("x2", function(d) { return x(dset[a].x) + 10; })
            .attr("y1", height - y(dset[a].ymin))
            .attr("y2", height - y(dset[a].ymin))
            .attr("stroke", z(0));
        //Üst Çizgi
        svg2.append("line")
            .attr("id", "errorline")
            .attr("x1", function(d) { return x(dset[a].x) - 10; })
            .attr("x2", function(d) { return x(dset[a].x) + 10; })
            .attr("y1", height - y(dset[a].ymax))
            .attr("y2", height - y(dset[a].ymax))
            .attr("stroke", z(0));

        //Path


    }
    for (var b = 0; b < dset.length - 1; b++) {
        svg2.append("line")
            .attr("id", "errorline")
            .attr("x1", function(d) { return x(dset[b].x); })
            .attr("x2", function(d) { return x(dset[b + 1].x); })
            .attr("y1", height - y(dset[b].y))
            .attr("y2", height - y(dset[b + 1].y))
            .style("stroke-dasharray", ("3, 3"))
            .attr("stroke", z(0));
    }

    var circles = svg2.selectAll("circle")
        .data(dset)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.x); })
        .attr("cy", function(d) { return height - y(d.y); })
        .attr("r", 5)
        .attr("fill", function(d, i) {
            if (grafik.color.length !== 0) {
                if (grafik.color.length < xdata.length) {
                    return grafik.color[i % grafik.color.length];
                } else {
                    return grafik.color[i];
                }

            } else {
                return "tomato";
            }
        })
        .on("mouseover", over)
        .on("mouseout", out);

    /*Çıktı için gerekli düzenlemeler*/
    d3.selectAll(".tick")
        .attr("font", "15px sans-serif")
        .attr("fill", "#333")
        //.attr("stroke", "#333")
        .attr("shape-rendering", "crispEdges")
        .attr("opacity", 0.1);

    d3.selectAll(".axis.text")
        .attr("text-anchor", "end")
        .attr("font", "12px Arial")

    d3.selectAll("text")
        .attr("fill", "#777");

    d3.selectAll(".tick line")
        //.style("stroke-dasharray", ("5, 5"))
        .attr("stroke", "#333")
        .attr("opacity", "0.1")

    d3.select(".x.axis path")
        .attr("fill", "none")
        .attr("stroke", "#6B6B6B")
        .attr("shape-rendering", "crispEdges")

    d3.select(".y.axis path")
        .attr("fill", "none")
        .attr("stroke", "#6B6B6B")
        .attr("shape-rendering", "crispEdges")
    d3.selectAll(".domain")
        .attr("fill", "none")
        .attr("stroke", "#6B6B6B")
        .attr("shape-rendering", "crispEdges")
    /*--------------------------------*/    
    //tooltip
    var div = d3.select("#"+grafik.div_id).append("div")
        .attr("class", "error tooltip")
        .style("opacity", 0);
    div.append('div')
        .attr('class', 'labell');
    div.append('div')
        .attr('class', 'count');
    div.append('div')
        .attr('class', 'percent');
    // hover fonksiyonları
    function over(d, i, j) {
        d3.select(this)
            .transition(500)
            .attr("r", 7);

        div.transition()
            .duration(500)
            .style("opacity", 1);
        div.select('.labell').html("Upper :" + format(d.ymax));
        div.select('.count').html("Mean :" + format(d.y));
        div.select('.percent').html("Lower :" + format(d.ymin));
        var mouseCoords = d3.mouse(
            d3.select("div.error.tooltip").node().parentElement);
        div.transition()
            .duration(500)
            .style("opacity", 0.9)
            .style("display", "block")
            .style("left", mouseCoords[0] - 40 + "px")
            .style("top", mouseCoords[1] - 80 + "px");
    }


    function out(d, i, j) {
        d3.select(this)
            .transition(500)
            .attr("r", 5);
        //.attr("stroke","#333");

        div.transition()
            .duration(500)
            .style("opacity", 0);

        svg2.selectAll(".test").attr("opacity", 0).style("display", "none");
        svg2.selectAll(".circles").attr("opacity", 0).style("display", "none");

    }

    function zoomed() {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);

        circles.attr("transform", "translate(" + d3.event.translate[0] + ",0)scale(" + d3.event.scale + ",1)");
        circles.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        d3.selectAll("#errorline").attr("transform", "translate(" + d3.event.translate[0] + ",0)scale(" + d3.event.scale + ",1)");
        d3.selectAll("#errorline").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
}

//Line Plot
function line() {
    //
    var xmin, xmax, ymin, ymax;
    xmin = dset[0].x;
    xmax = dset[0].x;
    ymin = dset[0].y;
    ymax = dset[0].y;

    for (t = 0; t < dset.length; t++) {
        if (dset[t].x < xmin) {
            xmin = dset[t].x;
        }
        if (dset[t].y < ymin) {
            ymin = dset[t].y;
        }
        if (dset[t].x > xmax) {
            xmax = dset[t].x;
        }
        if (dset[t].y > ymax) {
            ymax = dset[t].y;
        }
    }
    //console.log(xmin, xmax, '|', ymin, ymax);
    ranges[0].x_range = [xmin - 1, xmax + 1];
    ranges[0].y_range = [ymin - 1, ymax + 1];
    //
    var margin = { top: 10, right: 90, bottom: 90, left: 90 },
        width = 700.51 + margin.left + margin.right,
        height = 500.51 - margin.top - margin.bottom;
    var c1, c2, c3, c4, c5;

    var format = d3.format(".2f");

    var x1 = d3.scale.ordinal()
        .domain(ranges[0]["x_range"])
        .rangeRoundBands([0, width], .1);

    var x = d3.scale.linear()
        .domain(ranges[0]["x_range"])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain(ranges[0]["y_range"])
        .range([0, height]);

    var z = d3.scale.category20();

    //y ekseni için scale
    var y2 = d3.scale.linear()
        .domain(ranges[0]["y_range"])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .innerTickSize(-height)
        .outerTickSize(0)
        //.tickFormat(function(d,i){return ranges[0]["x.labels"][i]})
        .tickPadding(10);

    var yAxis = d3.svg.axis()
        .scale(y2)
        .orient("left")
        .innerTickSize(-width)
        .outerTickSize(0)
        //.tickFormat(function(d,i){return ranges[0]["y.labels"][i]})
        .tickPadding(10);

    var zoom = d3.behavior.zoom()
    				.x(x)
    				.y(y2)
    				.scaleExtent([1, 5])
    				.on("zoom", zoomed);
    d3.select("#" + grafik.div_id).select("svg").remove();
    var svg = d3.select("#"+grafik.div_id).append("svg")
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", "0 0 " + (width + margin.right + margin.left) + " " + (height + margin.top + margin.bottom))
        .append("svg:g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    //.call(d3.behavior.zoom().x(x).y(y2).scaleExtent([1, 10]).on("zoom", zoomed));

    svg.append("g")
        .attr("class", "y axis")
        //.tickFormat(ranges[0]["y.labels"])
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr("dy", ".71em")
        .attr("x", -height / 3)
        .style("text-anchor", "end")
        .text(grafik.ylab);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width / 2 + 10)//xAxias deki label değerinin yeri için buraya bak
        .attr("y", 60)
        .style("text-anchor", "end")
        .text(grafik.xlab);//Json üzerinden bu değeri değiştir 

    var y3 = d3.scale.linear()
        .domain(ranges[0]["y_range"])
        .range([height, 0]);
    //Zoom ve label ların ayarlanması    
    if (grafik.zoom === true && grafik.x_labels.length === 0 && grafik.y_labels.length === 0) {
        //console.log(grafik.x_labels.length, grafik.y_labels.length);
        svg.call(zoom);
    } else {
        //console.log(grafik.x_labels.length, xdata.length);
        if (grafik.x_labels.length !== 0) {
            xAxis.tickFormat(function(d, i) { return grafik.x_labels[i]; });
            svg.select(".x.axis").call(xAxis);
        }
        if (grafik.y_labels.length !== 0) {
            yAxis.tickFormat(function(d, i) { return grafik.y_labels[i]; });
            svg.select(".y.axis").call(yAxis);
        }
    }
    var svg2 = svg.append("svg").attr("height", height).attr("width", width);

    //Çizgiler
    for (var a = 0; a < dset.length - 1; a++) {
        svg2.append("line")
            .attr("id", "lline")
            .attr("x1", function(d) { return x(dset[a].x); })
            .attr("x2", function(d) { return x(dset[a + 1].x); })
            .attr("y1", height - y(dset[a].y))
            .attr("y2", height - y(dset[a + 1].y))
            .attr("stroke", function(d) { return "tomato" })
            .attr("opacity", 0.7);
    }
    svg2.append("line")
        .attr("class", "xlines")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", height)
        .attr("opacity", 0.3)
        .attr("stroke", "red");

    var xval, yval;
    var xset = new Array, xlset = new Array;
    var sss = svg2.append("text");
    var ttt = svg2.append("text");
    var rrr = svg2.append("rect");
    for (var f = 0; f < dset.length; f++) {
        xset.push(x1(dset[f].x));
    }

    function redrawline(cx, cy) {
        var fark = (xset[1] - xset[0]) / 2;
        for (var e = 0; e < xset.length; e++) {
            if (cx > xset[e] - fark && cx < xset[e] + fark) {
                over(dset[e], e);
                d3.selectAll('.xlines')
                    .attr("x1", xset[e])
                    .attr("y1", 0)
                    .attr("x2", xset[e])
                    .attr("y2", height)
                    .style("display", "block");
                sss.attr("x", function() { return x1(dset[e].x) + 15 })
                    .attr("y", function() { return height - y(dset[e].y); })
                    .attr("opacity", 1)
                    .text(format(dset[e].y))
                    .attr("id", "test")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "10px")
                    .attr("fill", "#333");

                /*rrr.attr("x",function() { return x1(dset[e].x)-15 })
                   .attr("y",function() { return height;})
                     .attr("width",30)
                     .attr("position","absolute")
                     .attr("height",13)
                   .attr("opacity", 0.3)
                   .attr("fill","#333");*/

                ttt.attr("x", function() { return x1(dset[e].x) - 15 })
                    .attr("y", function() { return height + 10; })
                    .attr("opacity", 1)
                    .text(dset[e].dateLabels)
                    .attr("id", "test")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "10px")
                    .attr("fill", "black");
            } else {
                out(dset[e], e);

            }
        }
    }

    var circles = svg2.selectAll("circle")
        .data(dset)
        .enter()
        .append("circle")
        .attr("id", function(d, i) { return "c" + i; })
        .attr("cx", function(d) { return x(d.x); })
        .attr("cy", function(d) { return height - y(d.y); })
        .attr("opacity", 1)
        .attr("r", 5)
        .attr("fill", function(d, i) {
            if (grafik.color.length !== 0) {
                if (grafik.color.length < xdata.length) {
                    return grafik.color[i % grafik.color.length];
                } else {
                    return grafik.color[i];
                }

            } else {
                return z(0);
            }
        })
        .on("mouseover", over)
        .on("mouseout", out);

    /*Çıktı için gerekli düzenlemeler*/
    d3.selectAll(".tick")
        .attr("font", "15px sans-serif")
        .attr("fill", "#333")
        //.attr("stroke", "#333")
        .attr("shape-rendering", "crispEdges")
        .attr("opacity", 0.1);

    d3.selectAll(".axis.text")
        .attr("text-anchor", "end")
        .attr("font", "12px Arial")

    d3.selectAll("text")
        .attr("fill", "#777");

    d3.selectAll(".tick line")
        //.style("stroke-dasharray", ("5, 5"))
        .attr("stroke", "#333")
        .attr("opacity", "0.1")

    d3.select(".x.axis path")
        .attr("fill", "none")
        .attr("stroke", "#6B6B6B")
        .attr("shape-rendering", "crispEdges")

    d3.select(".y.axis path")
        .attr("fill", "none")
        .attr("stroke", "#6B6B6B")
        .attr("shape-rendering", "crispEdges")
    d3.selectAll(".domain")
        .attr("fill", "none")
        .attr("stroke", "#6B6B6B")
        .attr("shape-rendering", "crispEdges")
    /*--------------------------------*/
    //tooltip
    var div = d3.select("#"+grafik.div_id).append("div")
        .attr("class", "line tooltip")
        .style("opacity", 0);
    div.append('div')
        .attr('class', 'labell');
    div.append('div')
        .attr('class', 'count');
    div.append('div')
        .attr('class', 'percent');
    // hover fonksiyonları
    function over(d, i, j) {
        d3.select(this)
            .transition(500)
            .attr("r", 7);
        div.transition()
            .duration(500)
            .style("opacity", 1);
        div.select('.labell').html(grafik.ylab+" :" + format(d.y));
        div.select('.count').html(grafik.xlab+" :" + format(d.x));
        var mouseCoords = d3.mouse(
            d3.select("div.line.tooltip").node().parentElement);
        div.transition()
            .duration(500)
            .style("opacity", 0.9)
            .style("display", "block")
            .style("left", mouseCoords[0] - 30 + "px")
            .style("top", mouseCoords[1] - 80 + "px");
    }


    function out(d, i, j) {
        d3.select(this)
            .transition(500)
            .attr("r", 5);
        //.attr("stroke","#333");

        div.transition()
            .duration(500)
            .style("opacity", 0);

        svg2.selectAll(".test").attr("opacity", 0).style("display", "none");
        svg2.selectAll(".circles").attr("opacity", 0).style("display", "none");

    }

    function zoomed() {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);

        circles.attr("transform", "translate(" + d3.event.translate[0] + ",0)scale(" + d3.event.scale + ",1)");
        circles.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        d3.selectAll("#lline").attr("transform", "translate(" + d3.event.translate[0] + ",0)scale(" + d3.event.scale + ",1)");
        d3.selectAll("#lline").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
}


//Verilerin uygun formata getirilmesi
function convert(xdata, ydata) {
    dset = [];
    if (xdata.length === ydata.length) {
        for (i in xdata) {
            dset.push({ "x": xdata[i], "y": ydata[i] });
        }
    }
    //console.log("convert", dset);
}


//saveSvgasPNG  --- https://github.com/exupero/saveSvgAsPng

(function() {
  var out$ = typeof exports != 'undefined' && exports || typeof define != 'undefined' && {} || this;

  var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

  function isElement(obj) {
    return obj instanceof HTMLElement || obj instanceof SVGElement;
  }

  function requireDomNode(el) {
    if (!isElement(el)) {
      throw new Error('an HTMLElement or SVGElement is required; got ' + el);
    }
  }

  function isExternal(url) {
    return url && url.lastIndexOf('http',0) == 0 && url.lastIndexOf(window.location.host) == -1;
  }

  function inlineImages(el, callback) {
    requireDomNode(el);

    var images = el.querySelectorAll('image'),
        left = images.length,
        checkDone = function() {
          if (left === 0) {
            callback();
          }
        };

    checkDone();
    for (var i = 0; i < images.length; i++) {
      (function(image) {
        var href = image.getAttributeNS("http://www.w3.org/1999/xlink", "href");
        if (href) {
          if (isExternal(href.value)) {
            console.warn("Cannot render embedded images linking to external hosts: "+href.value);
            return;
          }
        }
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var img = new Image();
        href = href || image.getAttribute('href');
        if (href) {
          img.src = href;
          img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            image.setAttributeNS("http://www.w3.org/1999/xlink", "href", canvas.toDataURL('image/png'));
            left--;
            checkDone();
          }
          img.onerror = function() {
            console.log("Could not load "+href);
            left--;
            checkDone();
          }
        } else {
          left--;
          checkDone();
        }
      })(images[i]);
    }
  }

  function styles(el, selectorRemap) {
    var css = "";
    var sheets = document.styleSheets;
    for (var i = 0; i < sheets.length; i++) {
      try {
        var rules = sheets[i].cssRules;
      } catch (e) {
        console.warn("Stylesheet could not be loaded: "+sheets[i].href);
        continue;
      }

      if (rules != null) {
        for (var j = 0; j < rules.length; j++) {
          var rule = rules[j];
          if (typeof(rule.style) != "undefined") {
            var match, selectorText;

            try {
              selectorText = rule.selectorText;
            } catch(err) {
              console.warn('The following CSS rule has an invalid selector: "' + rule + '"', err);
            }

            try {
              if (selectorText) {
                match = el.querySelector(selectorText);
              }
            } catch(err) {
              console.warn('Invalid CSS selector "' + selectorText + '"', err);
            }

            if (match) {
              var selector = selectorRemap ? selectorRemap(rule.selectorText) : rule.selectorText;
              css += selector + " { " + rule.style.cssText + " }\n";
            } else if(rule.cssText.match(/^@font-face/)) {
              css += rule.cssText + '\n';
            }
          }
        }
      }
    }
    return css;
  }

  function getDimension(el, clone, dim) {
    var v = (el.viewBox && el.viewBox.baseVal && el.viewBox.baseVal[dim]) ||
      (clone.getAttribute(dim) !== null && !clone.getAttribute(dim).match(/%$/) && parseInt(clone.getAttribute(dim))) ||
      el.getBoundingClientRect()[dim] ||
      parseInt(clone.style[dim]) ||
      parseInt(window.getComputedStyle(el).getPropertyValue(dim));
    return (typeof v === 'undefined' || v === null || isNaN(parseFloat(v))) ? 0 : v;
  }

  function reEncode(data) {
    data = encodeURIComponent(data);
    data = data.replace(/%([0-9A-F]{2})/g, function(match, p1) {
      var c = String.fromCharCode('0x'+p1);
      return c === '%' ? '%25' : c;
    });
    return decodeURIComponent(data);
  }

  out$.svgAsDataUri = function(el, options, cb) {
    requireDomNode(el);

    options = options || {};
    options.scale = options.scale || 1;
    var xmlns = "http://www.w3.org/2000/xmlns/";

    inlineImages(el, function() {
      var outer = document.createElement("div");
      var clone = el.cloneNode(true);
      var width, height;
      if(el.tagName == 'svg') {
        width = options.width || getDimension(el, clone, 'width');
        height = options.height || getDimension(el, clone, 'height');
      } else if(el.getBBox) {
        var box = el.getBBox();
        width = box.x + box.width;
        height = box.y + box.height;
        clone.setAttribute('transform', clone.getAttribute('transform').replace(/translate\(.*?\)/, ''));

        var svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
        svg.appendChild(clone)
        clone = svg;
      } else {
        console.error('Attempted to render non-SVG element', el);
        return;
      }

      clone.setAttribute("version", "1.1");
      if (!clone.getAttribute('xmlns')) {
        clone.setAttributeNS(xmlns, "xmlns", "http://www.w3.org/2000/svg");
      }
      if (!clone.getAttribute('xmlns:xlink')) {
        clone.setAttributeNS(xmlns, "xmlns:xlink", "http://www.w3.org/1999/xlink");
      }
      clone.setAttribute("width", width * options.scale);
      clone.setAttribute("height", height * options.scale);
      clone.setAttribute("viewBox", [
        options.left || 0,
        options.top || 0,
        width,
        height
      ].join(" "));

      var fos = clone.querySelectorAll('foreignObject > *');
      for (var i = 0; i < fos.length; i++) {
        fos[i].setAttributeNS(xmlns, "xmlns", "http://www.w3.org/1999/xhtml");
      }

      outer.appendChild(clone);

      var css = styles(el, options.selectorRemap);
      var s = document.createElement('style');
      s.setAttribute('type', 'text/css');
      s.innerHTML = "<![CDATA[\n" + css + "\n]]>";
      var defs = document.createElement('defs');
      defs.appendChild(s);
      clone.insertBefore(defs, clone.firstChild);

      var svg = doctype + outer.innerHTML;
      var uri = 'data:image/svg+xml;base64,' + window.btoa(reEncode(svg));
      if (cb) {
        cb(uri);
      }
    });
  }

  out$.svgAsPngUri = function(el, options, cb) {
    requireDomNode(el);

    out$.svgAsDataUri(el, options, function(uri) {
      var image = new Image();
      image.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        var context = canvas.getContext('2d');
        if(options && options.backgroundColor){
          context.fillStyle = options.backgroundColor;
          context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.drawImage(image, 0, 0);
        var a = document.createElement('a'), png;
        try {
          png = canvas.toDataURL('image/png');
        } catch (e) {
          if ((typeof SecurityError !== 'undefined' && e instanceof SecurityError) || e.name == "SecurityError") {
            console.error("Rendered SVG images cannot be downloaded in this browser.");
            return;
          } else {
            throw e;
          }
        }
        cb(png);
      }
      image.onerror = function(error) {
        console.error('There was an error loading the data URI as an image', error);
      }
      image.src = uri;
    });
  }

  function download(name, uri) {
    var a = document.createElement('a');
    a.download = name;
    a.href = uri;
    document.body.appendChild(a);
    a.addEventListener("click", function(e) {
      a.parentNode.removeChild(a);
    });
    a.click();
  }

  out$.saveSvg = function(el, name, options) {
    requireDomNode(el);

    options = options || {};
    out$.svgAsDataUri(el, options, function(uri) {
      download(name, uri);
    });
  }

  out$.saveSvgAsPng = function(el, name, options) {
    requireDomNode(el);

    options = options || {};
    out$.svgAsPngUri(el, options, function(uri) {
      download(name, uri);
    });
  }

  // if define is defined create as an AMD module
  if (typeof define !== 'undefined') {
    define(function() {
      return out$;
    });
  }
})();
