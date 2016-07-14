var populatedRelQ = false;

var checkRelQ = function () {
    if (populatedRelQ) {
        displayFirstDataRelQ();
    } else {
        setTimeout(checkRelQ, 100);
    }
}

function populateDataRelQ() {
    d3.csv("../data - Copy.csv", function (error, dataset) {
        var m = d3.nest().key(function (d) { return d.sprint; }).entries(dataset);
        for (var i = 0; i < m.length; i++) {
            if (m[i].key > 103) {
                $('#sprintReleaseQ').append($('<option>', { value: +m[i].key })
                .text("Sprint " + m[i].key));
            }

        }
        populatedRelQ = true;
    });
    checkRelQ();
}




function displayFirstDataRelQ() {
    document.getElementById("addMultipleRelQ").checked = true;
    var curr, max;
    var temp = 0;
    $('#sprintReleaseQ > option').each(function () {
        curr = +$(this).val();
        max = Math.max(temp, curr);
        temp = curr;
    })
    document.getElementById("sprintReleaseQ").value = max;

    var dropdown = document.getElementById("scrumTeamReleaseQ");
    for (var i = 0; i < dropdown.options.length; i++) {
        dropdown.value = dropdown.options[i].value;
        displayReleaseQ();
    }
    document.getElementById("scrumTeamReleaseQ").value = "All";
}

function showTeamHistoryRelQ() {
    clearAddedRelQ();
    document.getElementById("addMultipleRelQ").checked = true;
    var dropdown = document.getElementById("sprintReleaseQ");
    var temp = dropdown.value;
    for (var i = 0; i < dropdown.options.length; i++) {
        dropdown.value = dropdown.options[i].value;
        displayReleaseQ();
    }
    dropdown.value = temp;
}

function showSprintRelQ() {
    clearAddedRelQ();
    document.getElementById("addMultipleVel").checked = true;
    var dropdown = document.getElementById("scrumTeamReleaseQ");
    var temp = dropdown.value;
    for (var i = 0; i < dropdown.options.length; i++) {
        dropdown.value = dropdown.options[i].value;
        displayReleaseQ();
    }
    dropdown.value = temp;
}


function checkBoxClearAddedRelQ() {
    if (document.getElementById("addMultipleRelQ").checked) {
        return;
    } else {
        clearAddedRelQ();
    }
}

function clearAddedRelQ() {
    d3.selectAll("#releaseQSvg").remove();
}

function displayReleaseQ() {
    var teamVal = document.getElementById("scrumTeamReleaseQ").value;
    var sprintVal = document.getElementById("sprintReleaseQ").value;
    var addMultipleVal = document.getElementById("addMultipleRelQ").checked;

    var w = 150;
    var h = 200;
    var bordercolor = "gray";
    var strokewidth = "5px";

    d3.csv("../data - Copy.csv", function (error, dataset) {
        dataset.forEach(function (d) {
            sprint: "Sprint " + d.sprint;
            team: d.team;
            urgent: d.urgentdefects;
            all: d.alldefects;
        });

        if (!addMultipleVal) {
            d3.select("#releaseQsvg").remove();;
        }

        var allR;
        var urgentR;

        var defectsSvg = d3.select("#releaseQVis").append("svg")
                                    .attr("id", "releaseQSvg")
                                    .attr("width", w)
                                    .attr("height", h);

        var defects = defectsSvg
            .selectAll("circle")
            .data(dataset
                .filter(function (d) { return (d.sprint == sprintVal && d.team == teamVal); })
             )
            .enter();

        var borderPath = defects.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", w)
            .attr("width", h)
            .style("stroke", bordercolor)
            .style("fill", function (d) {
                if (d.team == "All") {
                    if (d.urgentdefects > 10) {
                        return "#E77471";
                    } else if (d.alldefects > 10) {
                        return "pink";
                    }
                    else {
                        return "none";
                    }
                }
                else if (d.alldefects > 5) {
                    return "pink";
                } else {
                    return "none";
                }
            })
        .style("strokewidth", strokewidth);

        var d1 = defects.append("circle")
            .attr("r", function (d) {
                if ((d.alldefects) > 40) {
                    allR = 40;
                    return 40;
                } else {
                    allR = Math.min(d.alldefects * 10, 40);
                    return allR;
                }
            })
            .attr("cx", 75)
            .attr("cy", 75)
            .attr("fill", "orange")

        defects.append("circle")
            .filter(function (d) { return (d.sprint == sprintVal && d.team == teamVal); })
            .attr("r", function (d) {
                urgentR = ((d.urgentdefects / d.alldefects) * allR).toString();
                return urgentR;

            })
            .attr("cx", 75)
            .attr("cy", 75)
            .attr("fill", "red")

        defects.append("foreignObject")
           .attr("x", "0")
           .attr("y", function (d) {
               if ((d.urgentdefects == 0) && (d.alldefects == 0)) {
                   return "50";
               }
               else {
                   return "115";
               }
           })
            .attr("width", 150)
            .append("xhtml")
            .style("font", "12px 'Helvetica Neue'")
            .style("color", function (d) {
                if (d.urgentdefects > 0) {
                    return "red";
                } else if (d.alldefects > 0) {
                    return "orange";
                } else {
                    return "green";
                }
            })
            .html(function (d) {
                if ((d.urgentdefects == 0) && (d.alldefects == 0)) {
                    return "<h4 style=\"text-align:center\"><span style=\"font-size:50px\">&#10004</span><br>No defects found</h4>"
                } else {
                    return "<h4 style=\"text-align:center;font-size:15px;font-weight:bold\">Urgent Defect(s): " + d.urgentdefects + "<br>Total Defect(s): " + d.alldefects + "</h4>";
                }
            })

        defects.append("text")
           .attr("x", 20)
           .attr("y", 20)
           .attr("font-family", "sans-serif")
           .attr("fill", "black")
           .attr("font-size", "15px")
           .text(function (d) {
               var retStr = teamVal + " || " + sprintVal;
               return retStr;
           })

        //hover tooltips



    })
}