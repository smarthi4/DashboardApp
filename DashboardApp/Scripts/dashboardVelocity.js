var populated = false;
var populatedRelQ = false;
var populatedMonths = false;
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var sprintsInMonth = { "January": 3, "February": 2, "March": 2, "April": 2, "May": 2, "June": 2, "July": 2, "August": 2, "September": 3, "October": 2, "November": 2, "December": 2 };
var monthSprints = {};

var endSprint;

var onMessageAveragePoints;
var onCampusAveragePoints;
var onBoardAveragePoints;
var onRecordAveragePoints;

var check = function () {
    if (populated) {
        endSprint = $("#sprintVelocity option:last").val();
        $('#monthVelocity').val($("#monthVelocity option:last").val());
        $('#monthReleased').val($("#monthReleased option:last").val());
        displayFirstData();
        updateReleased();
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
    endSprint = $('option:selected', document.getElementById("monthVelocity")).attr('sprintnum');
    var mo = document.getElementById("monthVelocity").value.match("[^0-9]+")[0];
    if (sprintsInMonth[mo] == 2) {
        document.getElementById("monthToSprintTranslation").innerHTML = "Sprints: " + (+endSprint - 1) + ", " + endSprint;
    } else {
        document.getElementById("monthToSprintTranslation").innerHTML = "Sprints: " + (+endSprint - 2) + ", " + (+endSprint - 1) + ", " + endSprint;
    }
}


function populateData() {
    var startYear = 2015;
    var add = 0;

    var mo = "April"
    var sprintsLeft = sprintsInMonth[mo] - 1;

    d3.csv(pathToCsv, function (error, dataset) {
        var m = d3.nest().key(function (d) { return d.sprint; }).entries(dataset);
        for (var i = 0; i < m.length; i++) {
            $('#sprintVelocity').append($('<option>', { value: +m[i].key })
            .text("Sprint " + m[i].key));

            if (sprintsLeft == 0) {
                $('#monthVelocity').append($('<option>', { value: mo + (startYear + add) })
                    .text(mo + " " + (startYear + add))
                    .attr("sprintNum", m[i].key))
                $('#monthReleased').append($('<option>', { value: mo + (startYear + add) })
                    .text(mo + " " + (startYear + add))
                    .attr("sprintNum", m[i].key))
                $('#sprintReleaseQ').append($('<option>', { value: mo + (startYear + add) })
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
        populatedRelQ = true;
    });
    check();
    updateBacklog();
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

function showTeamRecentHistoryVel() {
    clearAddedVel();
    document.getElementById("addMultipleVel").checked = true;
    var dropdown;
    if (document.getElementById("viewByMonthRadio").checked) {
        dropdown = document.getElementById("monthVelocity");
    } else {
        dropdown = document.getElementById("sprintVelocity");
    }
    var temp = dropdown.value;
    for (var i = dropdown.options.length - 13; i < dropdown.options.length; i++) {
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
    .style("background-color", "rgba(150,150,150,0.85)")
    .style("border-right", "4px solid gray")
    .style("border-bottom", "4px solid gray");


var check2 = function () {
    if (populatedMonths) {
        console.log("getting last months");
        monthsInGraph = getLastMonths(endSprint - 12, endSprint);
        displayGraph();
    } else {
        setTimeout(check2, 2000);
    }
}


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

    d3.csv(pathToCsv, function (error, dataset) {
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
            comments: d.sprintComments;
            if (d.prevSprint == null) {
                add = 0;
                mo = "April";
                sprintsLeft = sprintsInMonth[mo];
            }
            if (sprintsLeft == 1) {
                d.month = mo + (startYear + add);
                if (!(monthSprints[d.sprint])) {
                    monthSprints[d.sprint] = d.month;
                }
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
        populatedMonths = true;
        

        if (!addMultipleVal) {
            d3.select("#velocitySvg").remove();
        }

        var completedR = 100;
        var committedR;

        var circleSvg = d3.select("#velocityVis").append("svg")
                                    .attr("id", "velocitySvg")
                                    .attr("width", w)
                                    .attr("height", h)

        addShadows(circleSvg);

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
                   var scrumMasterComments = "";
                   if (d.sprintComments.length > 0) {
                       scrumMasterComments = "<strong> Comments On Sprint: " + d.sprintComments + "</strong>";
                   }
                   if (viewByMonth) {
                       if (sprintsInMonth[d.mo] == 3) {
                           var num = +d.completed + +d.prevSprint.completed + +d.nextSprint.completed;
                           var denom = +d.committed + +d.prevSprint.committed + +d.nextSprint.committed;
                           return "<strong>Committed: </strong>" + (denom) + "<br/> <strong>Completed: </strong>" + (num) + "<br/>" + Math.round(((num) / (denom)) * 10000) / 100 + "%";
                       } else {
                           var num = +d.completed + +d.prevSprint.completed;
                           var denom = +d.committed + +d.prevSprint.committed;
                           return "<strong>Committed: </strong>" + (denom) + "<br/> <strong>Completed: </strong>" + (num) + "<br/>" + Math.round(((num) / (denom)) * 10000) / 100 + "%";
                       }
                   } else {
                       return "<strong>Committed: </strong>" + d.committed + "<br/> <strong>Completed: </strong>" + d.completed + "<br/>" + Math.round(d.percent * 100) / 100 + "%";
                   }
               })
           })
            .on("mousemove", function () { return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 30) + "px"); })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("visibility", "hidden");
            })
            .on("click", function (d) {
                var scrumMasterComments = "";
                if (d.sprintComments.length > 0) {
                    scrumMasterComments = "<strong> Comments On Sprint: " + d.sprintComments + "</strong>";
                }
                var modal = document.getElementById('myModal')
                document.getElementById('modal-text').innerHTML = "<strong style=\"color:red\">" + d.storiesadded + " Stories Added Mid-Sprint</strong><br/><strong style=\"color:darkred\">(" + d.pointsadded + " Point(s) and " + d.failedtoquantify + " Other Stories)</strong><br/><strong>" + scrumMasterComments;
                modal.style.display = "block";
               
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

function closeModal() {
    var modal = document.getElementById('myModal');
    modal.style.display = "none";
}

window.onclick = function (event) {
    var modal = document.getElementById('myModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function getPercent(committed, completed) {
    return Math.round(completed / committed * 100);
}

check2();

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function (d) {
      return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
  })

