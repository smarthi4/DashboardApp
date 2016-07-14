var populated = false;
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var sprintsInMonth = { "January": 3, "February": 2, "March": 2, "April": 2, "May": 2, "June": 2, "July": 2, "August": 2, "September": 3, "October": 2, "November": 2, "December": 2 };
var check = function () {
    if (populated) {
        $('#monthVelocity').val($("#monthVelocity option:last").val());

        displayFirstData();
    } else {
        setTimeout(check, 100);
    }
}

function updateOpacity() {
    var opacity = document.getElementById("movingAverageOpacity").value;
    d3.selectAll(".avg")
        .transition().duration(100)
        .style("opacity", opacity);
}

function updatePathOpacity() {
    var opacity = document.getElementById("pathOpacity").value;
    d3.selectAll(".line")
        .transition().duration(100)
        .style("opacity", opacity);
    d3.selectAll(".dataPoint")
        .transition().duration(100)
        .style("opacity", opacity);
}

function updateTranslation() {
    var endSprint = $('option:selected', document.getElementById("monthVelocity")).attr('sprintnum');
    var mo = document.getElementById("monthVelocity").value.match("[^0-9]+")[0];
    if (sprintsInMonth[mo] == 2) {
        document.getElementById("monthToSprintTranslation").innerHTML = "Sprints: " + (+endSprint - 1) + ", " + endSprint;
    } else {
        document.getElementById("monthToSprintTranslation").innerHTML = "Sprints: " + (+endSprint - 2) + ", " + (+endSprint - 1) + ", " + endSprint;
    }
}

function switchToMonth() {
    document.getElementById("sprintVelocity").hidden = true;
    document.getElementById("sprintVelocityText").hidden = true;
    document.getElementById("monthVelocity").hidden = false;
    document.getElementById("monthVelocityText").hidden = false;
    document.getElementById("monthToSprintTranslation").hidden = false;
    updateTranslation();
}

function switchToSprint() {
    document.getElementById("sprintVelocity").hidden = false;
    document.getElementById("sprintVelocityText").hidden = false;
    document.getElementById("monthVelocity").hidden = true;
    document.getElementById("monthVelocityText").hidden = true;
    document.getElementById("monthToSprintTranslation").hidden = true;
}
var MyAppUrlSettings = {
    MyUsefulUrl: '@Url.Action("OnMessageUnsized","Home")'
}

function Query() {
    $.ajax({
        url: MyAppUrlSettings.MyUsefulUrl,
        type: 'GET',
        dataType: 'json',
        cache: false,
        error: function () {
            alert('Error occured');
        },
        success: callback
    });

    function callback() {
        alert("success");
    }
}


function populateData() {
    var startYear = 2015;
    var add = 0;

    var mo = "April"
    var sprintsLeft = sprintsInMonth[mo] - 1;

    d3.csv("../data - Copy.csv", function (error, dataset) {
        var m = d3.nest().key(function (d) { return d.sprint; }).entries(dataset);
        for (var i = 0; i < m.length; i++) {
            $('#sprintVelocity').append($('<option>', { value: +m[i].key })
            .text("Sprint " + m[i].key));

            if (sprintsLeft == 0) {
                $('#monthVelocity').append($('<option>', { value: mo + (startYear + add) })
                    .text(mo + " " + (startYear + add))
                    .attr("sprintNum", m[i].key))

                mo = months[(months.indexOf(mo) + 1) % 12];
                sprintsLeft = sprintsInMonth[mo];
                if (mo == "January") {
                    add += 1;
                }
            }
            sprintsLeft--;
        }

        populated = true;
    });
    Query();
    check();
}


function displayFirstData() {
    document.getElementById("addMultipleVel").checked = true;
    var curr, max;
    var temp = 0;
    $('#sprintVelocity > option').each(function () {
        curr = +$(this).val();
        max = Math.max(temp, curr);
        temp = curr;
    })
    document.getElementById("sprintVelocity").value = max;

    var dropdown = document.getElementById("scrumTeamVelocity");
    for (var i = 0; i < dropdown.options.length; i++) {
        dropdown.value = dropdown.options[i].value;
        displayVelocity();
    }
    document.getElementById("scrumTeamVelocity").value = "All";
}


function showTeamHistoryVel() {
    clearAddedVel();
    document.getElementById("addMultipleVel").checked = true;
    var dropdown;
    if (document.getElementById("viewByMonthRadio").checked) {
        dropdown = document.getElementById("monthVelocity");
    } else {
        dropdown = document.getElementById("sprintVelocity");
    }
    var temp = dropdown.value;
    for (var i = 0; i < dropdown.options.length; i++) {
        dropdown.value = dropdown.options[i].value;
        displayVelocity();
    }
    dropdown.value = temp;
}

function showTimePeriodVel() {
    clearAddedVel();
    document.getElementById("addMultipleVel").checked = true;
    var dropdown = document.getElementById("scrumTeamVelocity");
    var temp = dropdown.value;
    for (var i = 0; i < dropdown.options.length; i++) {
        dropdown.value = dropdown.options[i].value;
        displayVelocity();
    }
    dropdown.value = temp;
}

function checkBoxClearAddedVel() {
    if (document.getElementById("addMultipleVel").checked) {
        return;
    } else {
        clearAddedVel();
    }
}

function clearAddedVel() {
    d3.selectAll("#velocitySvg").remove();
}

var tooltip = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden")
    .style("border-radius", "10px")
    .style("padding", "7px")
    .style("text-align", "center")
    .style("background-color", "rgba(150,150,150,0.75)")
    .style("border-right", "4px solid gray")
    .style("border-bottom", "4px solid gray");


var margin = { top: 30, right: 20, bottom: 70, left: 100 },
    width = 1000 - margin.left - margin.right,
    height = 570 - margin.top - margin.bottom;

var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(10);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

var percentLine = d3.svg.line()
    .x(function (d) { return x(d.sprint); })
    .y(function (d) { return y(d.percent); });


var prevPrevVal = 0;
var prevVal = 0;
var curVal = 0
var movingAverageLine = d3.svg.line()
.x(function (d, i) { return x(d.sprint); })
.y(function (d, i) {
    if (i == 0) {
        prevPrevVal = y(d.percent);
        prevVal = y(d.percent);
        curVal = y(d.percent);
    } else if (i == 1) {
        prevPrevVal = prevVal;
        prevVal = curVal;
        curVal = (prevVal + y(d.percent)) / 2.0;
    } else {
        prevPrevVal = prevVal;
        prevVal = curVal;
        curVal = (prevPrevVal + prevVal + y(d.percent)) / 3.0;
    }
    return curVal;
})
.interpolate("basis");

var color = d3.scale.category10();



displayGraph();

function displayVelocity() {
    var teamVal = document.getElementById("scrumTeamVelocity").value;
    var sprintVal = document.getElementById("sprintVelocity").value;
    var monthVal = document.getElementById("monthVelocity").value;
    var viewByMonth = document.getElementById("viewByMonthRadio").checked;
    var addMultipleVal = document.getElementById("addMultipleVel").checked;

    var w = 175;
    var h = 175;
    var percentCutoff = 0.9;
    var bordercolor = "green";
    var strokewidth = "3px";
    var startYear = 2015;
    var add = 0;
    var mo = "April"
    var sprintsLeft = sprintsInMonth[mo];

    d3.csv("../data - Copy.csv", function (error, dataset) {
        dataset.forEach(function (d) {
            committed: +d.committed;
            completed: +d.completed;
            d.percent = d.completed / d.committed * 100;
            d.prevSprint = (dataset.filter(function (e) {
                return (e.sprint == +d.sprint - 1 && e.team == teamVal);
            }))[0];
            d.nextSprint = (dataset.filter(function (e) {
                return (e.sprint == +d.sprint + 1 && e.team == teamVal);
            }))[0];
            sprint: "Sprint " + d.sprint;
            storiesadded: +d.storiesadded;
            pointsadded: +d.pointsadded;
            failedtoquantify: +d.failedtoquantify;
            if (d.prevSprint == null) {
                add = 0;
                mo = "April";
                sprintsLeft = sprintsInMonth[mo];
            }
            if (sprintsLeft == 1) {
                d.month = mo + (startYear + add);
            }

            if (sprintsLeft == 0) {
                sprintsLeft = sprintsInMonth[mo];
                mo = months[(months.indexOf(mo) + 1) % 12];

                if (mo == "January") {
                    add += 1;
                }
            }

            sprintsLeft--;
            d.mo = mo;

        });
        if (!addMultipleVal) {
            d3.select("#velocitySvg").remove();
        }

        var completedR = 100;
        var committedR;

        var circleSvg = d3.select("#velocityVis").append("svg")
                                    .attr("id", "velocitySvg")
                                    .attr("width", w)
                                    .attr("height", h)

        var defs = circleSvg.append("defs");

        var filter = defs.append("filter")
            .attr("id", "drop-shadow")
            .attr("height", "130%");

        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 5)
            .attr("result", "blur");

        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 5)
            .attr("dy", 5)
            .attr("result", "offsetBlur");



        var feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");

        var filter2 = defs.append("filter")
            .attr("id", "drop-shadow2")
            .attr("height", "130%");

        filter2.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 2)
            .attr("result", "blur");

        filter2.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 3)
            .attr("dy", 3)
            .attr("result", "offsetBlur");



        var feMerge2 = filter2.append("feMerge");

        feMerge2.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMerge2.append("feMergeNode")
            .attr("in", "SourceGraphic");

        var borderPath = circleSvg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", h)
            .attr("width", w)
            .style("stroke", bordercolor)
            .style("fill", "none")
            .style("stroke-width", strokewidth);


        var circles = circleSvg
            .selectAll("circle")
            .data(dataset
                .filter(function (d) {
                    if (viewByMonth) {
                        return (d.month == monthVal && d.team == teamVal);
                    } else {
                        return (d.sprint == sprintVal && d.team == teamVal);
                    }
                })

             )
            .enter();


        var c1 = circles.append("circle")
            .attr("r", function (d) {
                if (viewByMonth) {
                    if (sprintsInMonth[d.mo] == 3) {
                        if (d.committed + d.prevSprint.committed + d.prevSprint.prevSprint.committed > 50) {
                            committedR = 50;
                        } else {
                            committedR = d.committed + d.prevSprint.committed + d.prevSprint.prevSprint.committed;
                        }
                    } else {
                        if (d.committed + d.prevSprint.committed > 50) {
                            committedR = 50;
                        } else {
                            committedR = d.committed + d.prevSprint.committed;
                        }
                    }

                } else {
                    if ((d.committed) > 50) {
                        committedR = 50;
                    } else {
                        committedR = d.committed;
                    }
                }
                return committedR;

            })
            .attr("cx", 30)
            .attr("cy", 85)
            .attr("fill", "darkgray")
            .style("filter", "url(#drop-shadow)")

        circles.append("circle")
            .filter(function (d) {
                if (viewByMonth) {
                    return (d.month == monthVal && d.team == teamVal);
                } else {
                    return (d.sprint == sprintVal && d.team == teamVal);
                }
            })
            .attr("r", function (d) {
                if (viewByMonth) {
                    if (sprintsInMonth[d.mo] == 3) {
                        console.log(d.mo, d.prevSprint, d.sprint, d.nextSprint);
                        var num = +d.completed + +d.prevSprint.completed + +d.nextSprint.completed;
                        var denom = +d.committed + +d.prevSprint.committed + +d.nextSprint.committed;
                        completedR = ((num) / (denom)) * committedR;
                    } else {
                        completedR = ((+d.completed + +d.prevSprint.completed) * committedR / (+d.committed + +d.prevSprint.committed));
                    }
                } else {
                    completedR = (d.completed * committedR / d.committed);
                }
                return completedR;
            })
            .attr("cx", 30)
            .attr("cy", 85)
            .style("filter", "url(#drop-shadow2)")
            .attr("fill", function (d) {
                if (viewByMonth) {
                    if (sprintsInMonth[d.mo] == 3) {
                        if (((+d.completed + +d.prevSprint.completed + +d.nextSprint.completed) / (+d.committed + +d.prevSprint.committed + +d.nextSprint.committed)) > percentCutoff) {
                            return "green";
                        } else {
                            return "red";
                        }
                    } else {
                        if (((+d.completed + +d.prevSprint.completed) / (+d.committed + +d.prevSprint.committed)) > percentCutoff) {
                            return "green";
                        } else {
                            return "red";
                        }
                    }
                } else {
                    if (d.completed / d.committed > percentCutoff) {
                        return "green";
                    } else {
                        return "red";
                    }
                }

            });

        circles.append("text")
           .attr("x", 95)
           .attr("y", 90)
           .attr("cursor", "pointer")
           .attr("font-family", "sans-serif")
           .attr("fill", function (d) {
               if (viewByMonth) {
                   if (sprintsInMonth[d.mo] == 3) {
                       if (((+d.completed + +d.prevSprint.completed + +d.nextSprint.completed) / (+d.committed + +d.prevSprint.committed + +d.nextSprint.committed)) > percentCutoff) {
                           return "#006400";
                       } else {
                           return "#8B0000";
                       }
                   } else {
                       if (((+d.completed + +d.prevSprint.completed) / (+d.committed + +d.prevSprint.committed)) > percentCutoff) {
                           return "#006400";
                       } else {
                           return "#8B0000";
                       }
                   }
               } else {
                   if (d.completed / d.committed > percentCutoff) {
                       return "#006400";
                   } else {
                       return "#8B0000";
                   }
               }

           })
           .attr("font-size", "30px")
           .text(function (d) {
               var retStr;
               if (viewByMonth) {
                   if (sprintsInMonth[d.mo] == 3) {
                       var num = +d.completed + +d.prevSprint.completed + +d.nextSprint.completed;
                       var denom = +d.committed + +d.prevSprint.committed + +d.nextSprint.committed;
                       retStr = Math.round((num / denom) * 100) + "%";
                   } else {
                       retStr = Math.round(((+d.completed + +d.prevSprint.completed) / (+d.committed + +d.prevSprint.committed)) * 100) + "%";
                   }
               } else {
                   retStr = Math.round(d.completed / d.committed * 100) + "%";
               }
               return retStr;
           })
           .on("mouseover", function (d) {
               tooltip.transition()
                   .style("visibility", "visible");
               tooltip.html(function () {
                   if (viewByMonth) {
                       if (sprintsInMonth[d.mo] == 3) {
                           var num = +d.completed + +d.prevSprint.completed + +d.nextSprint.completed;
                           var denom = +d.committed + +d.prevSprint.committed + +d.nextSprint.committed;
                           return "<strong>Committed: </strong>" + (denom) + "<br/> <strong>Completed: </strong>" + (num) + "<br/>" + Math.round(((num) / (denom)) * 10000) / 100 + "% <br/> <strong style=\"color:red\">" + d.storiesadded + " Stories Added Mid-Sprint</strong><br/><strong style=\"color:darkred\">(" + d.pointsadded + " Point(s) and " + d.failedtoquantify + " Other Stories)</strong>";
                       } else {
                           var num = +d.completed + +d.prevSprint.completed;
                           var denom = +d.committed + +d.prevSprint.committed;
                           return "<strong>Committed: </strong>" + (denom) + "<br/> <strong>Completed: </strong>" + (num) + "<br/>" + Math.round(((num) / (denom)) * 10000) / 100 + "% <br/> <strong style=\"color:red\">" + d.storiesadded + " Stories Added Mid-Sprint</strong><br/><strong style=\"color:darkred\">(" + d.pointsadded + " Point(s) and " + d.failedtoquantify + " Other Stories)</strong>";
                       }
                   } else {
                       return "<strong>Committed: </strong>" + d.committed + "<br/> <strong>Completed: </strong>" + d.completed + "<br/>" + Math.round(d.percent * 100) / 100 + "% <br/> <strong style=\"color:red\">" + d.storiesadded + " Stories Added Mid-Sprint</strong><br/><strong style=\"color:darkred\">(" + d.pointsadded + " Point(s) and " + d.failedtoquantify + " Other Stories)</strong>";
                   }
               })
           })
            .on("mousemove", function () { return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 30) + "px"); })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("visibility", "hidden");
            })

        circles.append("text")
           .attr("x", 160)
           .attr("y", 160)
           .style("text-anchor", "end")
           .attr("font-family", "sans-serif")
           .attr("fill", function (d) {
               if (d.prevSprint != null) {
                   if (d.percent - d.prevSprint.percent >= 0) {
                       return "#006400";
                   } else {
                       return "#8B0000";
                   }
               }
           })
           .attr("font-size", "15px")
           .text(function (d) {
               if (d.prevSprint != null) {
                   if (viewByMonth) {
                       if (sprintsInMonth[d.mo] == 3) {
                           if (d.prevSprint.prevSprint.prevSprint != null && d.prevSprint.prevSprint.prevSprint.prevSprint != null) {
                               var monthPercent = ((+d.completed + +d.prevSprint.completed + +d.prevSprint.prevSprint.completed) / (+d.committed + +d.prevSprint.committed + +d.prevSprint.prevSprint.committed));
                               var lastMonthPercent = ((+d.prevSprint.prevSprint.prevSprint.completed + +d.prevSprint.prevSprint.prevSprint.prevSprint.completed) / (+d.prevSprint.prevSprint.prevSprint.committed + +d.prevSprint.prevSprint.prevSprint.prevSprint.committed));
                               return Math.round((monthPercent - lastMonthPercent) * 100) + "%";
                           } else {
                               return "Prior month not found";
                           }
                       } else {
                           if (d.prevSprint.prevSprint != null && d.prevSprint.prevSprint.prevSprint != null) {
                               var monthPercent = ((+d.completed + +d.prevSprint.completed) / (+d.committed + +d.prevSprint.committed));
                               var lastMonthPercent = ((+d.prevSprint.prevSprint.completed + +d.prevSprint.prevSprint.prevSprint.completed) / (+d.prevSprint.prevSprint.committed + +d.prevSprint.prevSprint.prevSprint.committed));
                               return Math.round((monthPercent - lastMonthPercent) * 100) + "%";
                           } else {
                               return "Prior month not found";
                           }
                       }


                   } else {
                       return Math.round(d.percent - d.prevSprint.percent) + "% ";
                   }
               }
               else {
                   return "No data for prior sprint";
               }
           })


        circles.append("text")
           .attr("x", 5)
           .attr("y", 20)
           .attr("font-family", "sans-serif")
           .attr("fill", "black")
           .attr("font-size", "15px")
           .text(function (d) {
               if (viewByMonth) {
                   var retStr = teamVal + " || " + monthVal;
               } else {
                   var retStr = teamVal + " || " + sprintVal;
               }
               return retStr;
           })
    })
}

function displayGraph() {

    var lineGraph = d3.select("#velocityVisGraph").append("svg")
                            .attr("id", "velocityLineGraphSvg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                            .attr("transform",
                                  "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("../data - Copy.csv", function (error, dataset) {
        dataset = dataset.filter(function (d) {
            return d.sprint >= 104;
        })

        dataset.forEach(function (d) {
            committed: +d.committed;
            completed: +d.completed;
            d.percent = Math.round(d.completed / d.committed * 100);
            sprint: "Sprint " + d.sprint;
        });


        x.domain([104, 116]);

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
                .attr("x", (legendSpace / 5) + i * legendSpace)
                .attr("y", height + (margin.bottom / 1.5) + 5)
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


    });
}