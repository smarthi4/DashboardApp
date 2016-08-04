
var margin = { top: 30, right: 20, bottom: 100, left: 100 },
    width = 1000 - margin.left - margin.right,
    height = 570 - margin.top - margin.bottom;

var monthsInGraph = [];

function getLastMonths(sprStart, sprEnd) {
    var months = [];
    var startMo = monthSprints[sprStart];
    var endMo = monthSprints[sprEnd];
    while (!startMo) {
        sprStart += 1;
        startMo = monthSprints[sprStart];
    }
    while (!endMo) {
        sprEnd -= 1;
        endMo = monthSprints[sprEnd];
    }

    var startMoSpace = startMo.split(/[^0-9a-zA-Z]+/g).join(' ');
    var endMoSpace = endMo.split(/[^0-9a-zA-Z]+/g).join(' ');
    return diff(startMoSpace, endMoSpace);
}

function diff(from, to) {
    var arr = [];
    var datFrom = new Date('1 ' + from);
    var datTo = new Date('1 ' + to);
    var fromYear = datFrom.getFullYear();
    var toYear = datTo.getFullYear();
    var diffYear = (12 * (toYear - fromYear)) + datTo.getMonth();

    for (var i = datFrom.getMonth() ; i <= diffYear; i++) {
        arr.push(months[i % 12] + " " + Math.floor(fromYear + (i / 12)));
    }
    return arr;
}

function displayGraph() {
    var x = d3.scale.linear().range([0, width]);
    var x2 = d3.scale.ordinal()
        .domain(monthsInGraph)
        .rangePoints([50, width - margin.right]);
    var y = d3.scale.linear().range([height, 0]);


    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(10);

    var xAxis2 = d3.svg.axis().scale(x2)
        .orient("bottom").innerTickSize(-height).outerTickSize(15).ticks(6);


    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(6).tickFormat(function (d) { return d + "%"; });

    var percentLine = d3.svg.line()
        .x(function (d) { return x(d.sprint); })
        .y(function (d) { return y(d.percent); });


    var movingAverageLine = d3.svg.line()
    .x(function (d, i) { return x(d.sprint); })
    .y(function (d, i) { return y(d.movingAverage); })
    .interpolate("basis");

    var color = d3.scale.category10();

    var lineGraph = d3.select("#velocityVisGraph").append("svg")
                            .attr("id", "velocityLineGraphSvg")
                            .attr("width", width + margin.left + margin.right + 20)
                            .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                            .attr("transform",
                                  "translate(" + margin.left + "," + margin.top + ")");

    d3.csv(pathToCsv, function (error, fullDataset) {
        dataset = fullDataset.filter(function (d) {
            return d.sprint >= (endSprint - 12);
        })
        dataset.forEach(function (d, i) {
            committed: +d.committed;
            completed: +d.completed;
            d.percent = Math.round(d.completed / d.committed * 100);
            d.prevSprint = (fullDataset.filter(function (e) {
                return (e.sprint == +d.sprint - 1 && e.team == d.team);
            }))[0];
            d.prevPrevSprint = (fullDataset.filter(function (e) {
                return (e.sprint == +d.sprint - 2 && e.team == d.team);
            }))[0];
            sprint: "Sprint " + d.sprint;

            d.movingAverage = (getPercent(d.prevPrevSprint.committed, d.prevPrevSprint.completed) + getPercent(d.prevSprint.committed, d.prevSprint.completed) + d.percent) / 3.0;
            d.movingPointAverage = (+d.prevPrevSprint.completed + +d.prevSprint.completed + +d.completed) / 3.0;

            if (d.team == "onMessage") {
                onMessageAveragePoints = d.movingPointAverage;
            } else if (d.team == "onCampus") {
                onCampusAveragePoints = d.movingPointAverage;
            } else if (d.team == "onBoard") {
                onBoardAveragePoints = d.movingPointAverage;
            } else if (d.team == "onRecord") {
                onRecordAveragePoints = d.movingPointAverage;
            }
        }
        );

        x.domain([endSprint - 12, endSprint]);

        y.domain([d3.min(dataset, function (d) { return d.percent; }), d3.max(dataset, function (d) { return d.percent; })]);

        var dataNest = d3.nest()
            .key(function (d) { return d.team; })
            .entries(dataset);


        legendSpace = (width / dataNest.length);
        dataNest.forEach(function (d, i) {
            lineGraph.append("path")
                .attr("class", "line")
                .attr("fill", "none")
                .style("stroke", function () {
                    return d.color = color(d.key);
                })
                .attr("stroke-width", "3")
                .attr("id", 'tag' + d.key.replace(/\s+/g, ''))
                .attr("d", percentLine(d.values))
                .on("mouseover", function () {
                    d3.select(this).attr("stroke-width", "3").style("stroke", "red")
                })
                .on("mouseout", function () {
                    d3.select(this).attr("stroke-width", "3").style("stroke", color(d.key));
                })
            ;
            lineGraph.append("path")
                .attr("class", "avg")
                .attr("d", movingAverageLine(d.values))
                .attr("fill", "none")
                .style("stroke", function () {
                    return d.color = color(d.key);
                })
                .attr("stroke-width", "3")
                .style("stroke-opacity", "1.0")
                .attr("id", 'tag' + d.key.replace(/\s+/g, 'avg'));


            d.values.forEach(function (p) {
                lineGraph.append("circle")
                    .attr("id", 'tag' + d.key.replace(/\s+/g, ''))
                    .attr("class", "dataPoint")
                    .attr("r", 4)
                    .attr("cx", x(p.sprint))
                    .attr("cy", y(p.percent))
                    .append("title")
                    .text("Sprint " + p.sprint + ", " + p.percent + "% (" + p.completed + " of " + p.committed + ")");
            });

            lineGraph.append("text")
                .attr("x", (legendSpace / 5) + i * legendSpace + 25)
                .attr("y", height + (margin.bottom / 1.5) + 30)
                .attr("class", "legend")
                .style("fill", function () {
                    return d.color = color(d.key);
                })
                .attr("cursor", "pointer")
                .style("font-size", "22px")
                .style("font-weight", "bold")
                .on("click", function () {
                    var active = d.active ? false : true,
                    newOpacity = active ? "hidden" : "visible";
                    d3.selectAll("#tag" + d.key.replace(/\s+/g, ''))
                        .transition().duration(100)
                        .style("visibility", newOpacity);
                    d3.selectAll("#tag" + d.key.replace(/\s+/g, 'avg'))
                        .transition().duration(100)
                        .style("visibility", newOpacity);
                    d.active = active;
                })
                .text(d.key);
        });

        lineGraph.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        lineGraph.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        lineGraph.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(-50," + (height / 2) + ")rotate(-90)")
            .text("Percent Completed");

        lineGraph.append("g")
            .attr("class", "x axis2")
            .attr("transform", "translate(0, " + (+height + +30) + ")")
            .call(xAxis2);


        lineGraph.selectAll(".axis2 > path")
            .remove();
        lineGraph.selectAll(".axis2 > .tick")
             .attr("cursor", "pointer")
             .append("title")
                    .text(function (d) {
                        parts = d.split(' ');
                        var option = $('#monthVelocity ' + 'option[value=\'' + parts.join('') + '\']')
                        endSprint = option.attr('sprintnum');

                        var mo = parts[0];
                        if (sprintsInMonth[mo] == 2) {
                            return "Sprints: " + (+endSprint - 1) + ", " + endSprint;
                        } else {
                            return "Sprints: " + (+endSprint - 2) + ", " + (+endSprint - 1) + ", " + endSprint;
                        }
                    });
    });
}