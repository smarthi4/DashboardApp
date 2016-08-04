var checkRelQ = function () {
    if (populatedRelQ) {
        displayFirstDataRelQ();
    } else {
        setTimeout(checkRelQ, 100);
    }
}

function displayFirstDataRelQ() {
    document.getElementById("addMultipleRelQ").checked = true;

    $('#sprintReleaseQ option:last').prop('selected', true);

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

    clearAddedRelQ();
    document.getElementById("addMultipleRelQ").checked = true;
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

function displayReleaseQModal(d) {
    var modal = document.getElementById('myModal')
    if (d.lastYearMonth) {
        var allPercentChange = Math.round(((d.monthDefects - d.lastYearMonth.monthDefects) / d.monthDefects) * 10000) / 100;
        var urgentPercentChange = Math.round(((d.monthUrgentDefects - d.lastYearMonth.monthUrgentDefects) / d.monthUrgentDefects) * 10000)/100;

        if (allPercentChange < 0) {
            var allColor = "darkgreen";
            allPercentChange = "<span class=\"downarrow\">&#8686;</span> " + allPercentChange;
        } else {
            var allColor = "red";
            allPercentChange = "<span class=\"uparrow\">&#8686</span> " + allPercentChange;
        }
        if (urgentPercentChange < 0) {
            var urgentColor = "darkgreen";
            urgentPercentChange = "<span class=\"downarrow\">&#8686</span> " + urgentPercentChange;
        } else {
            var urgentColor = "red";
            urgentPercentChange = "<span class=\"uparrow\">&#8686</span> " + urgentPercentChange;
        }
        document.getElementById('modal-text').innerHTML = "<strong style=\"font-size:16px;\">  " + reformatMonthVal(d.lastYearMonth.month) + "</strong><br/><p style = \"font-weight:600;color:" + allColor + "\"> Defects: " + d.lastYearMonth.monthDefects + "<p style = \"font-weight:600;font-size:24px;color:" + allColor + "\"<br/> YOY: " + allPercentChange + "%</p>" +
             "<br/><p style = \"font-weight:600;color:" + urgentColor + "\">Urgent Defects: " + d.lastYearMonth.monthUrgentDefects+ "<p style = \"font-weight:600;font-size:24px;color:" + allColor + "\"<br/> YOY: " + urgentPercentChange + "%</p>";
    } else {
        document.getElementById('modal-text').innerHTML = "<strong style=\"color:#55555\"> No data found for previous month. </strong>";
    }
    modal.style.display = "block";
}



function displayReleaseQ() {
    var teamVal = document.getElementById("scrumTeamReleaseQ").value;
    var monthVal = document.getElementById("sprintReleaseQ").value;
    var addMultipleVal = document.getElementById("addMultipleRelQ").checked;

    var w = 150;
    var h = 200;
    var bordercolor = "gray";
    var strokewidth = "5px";
    var startYear = 2015;
    var add = 0;
    var mo = "April"
    var sprintsLeft = sprintsInMonth[mo];

    d3.csv(pathToCsv, function (error, dataset) {
        dataset.forEach(function (d) {
            sprint: "Sprint " + d.sprint;
            team: d.team;
            urgent: d.urgentdefects;
            all: d.alldefects;
            d.prevSprint = (dataset.filter(function (e) {
                return (e.sprint == +d.sprint - 1 && e.team == teamVal);
            }))[0];
            d.nextSprint = (dataset.filter(function (e) {
                return (e.sprint == +d.sprint + 1 && e.team == teamVal);
            }))[0];
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
            if (d.prevSprint) {
                if (d.prevSprint.prevSprint && sprintsInMonth[d.mo] == 3) {
                    d.monthDefects = +d.alldefects + +d.prevSprint.alldefects + +d.prevSprint.prevSprint.alldefects;
                } else {
                        d.monthDefects = +d.alldefects + +d.prevSprint.alldefects;
                }
            } else {
                d.monthDefects = +d.alldefects;
            }
            

            if (sprintsInMonth[d.mo] == 3) {
               d.monthUrgentDefects =  +d.urgentdefects + +d.prevSprint.urgentdefects + +d.nextSprint.urgentdefects;
            } else {
                if (d.prevSprint) {
                    d.monthUrgentDefects = +d.urgentdefects + +d.prevSprint.urgentdefects;
                } else {
                    d.monthUrgentDefects = +d.urgentdefects;
                }
            }
            if (d.month) {
                var digit = +(d.month.charAt(d.month.length - 1));
                var lastYear = d.month.substr(0, d.month.length-1) + (digit -1);

                d.lastYearMonth = (dataset.filter(function (e) {
                    return (e.month == lastYear && e.team == teamVal);
                }))[0];
            }
           
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
                .filter(function (d) { return (d.month == monthVal && d.team == teamVal); })
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
                    if (d.monthDefects > 10) {
                        return "#E77471";
                    } else if (d.monthDefects > 10) {
                        return "pink";
                    }
                    else {
                        return "none";
                    }
                }
                else if (d.monthDefects > 5) {
                    return "pink";
                } else {
                    return "none";
                }
            })
        .style("strokewidth", strokewidth);

        var d1 = defects.append("circle")
            .attr("r", function (d) {
                if (d.monthDefects > 40) {
                    allR = 40
                } else {
                    allR = d.monthDefects;
                }
                return allR;
            })
            .attr("cx", 75)
            .attr("cy", 75)
            .attr("cursor", "pointer")
            .attr("fill", "orange")
            .on("click", function (d) {
                displayReleaseQModal(d)
            });



        defects.append("circle")
            .filter(function (d) { return (d.month == monthVal && d.team == teamVal); })
            .attr("r", function (d) {
                if (d.monthUrgentDefects > 40) {
                    urgentR = 40;
                } else {
                    urgentR = d.monthUrgentDefects;
                }
                return urgentR;
            })
            .attr("cx", 75)
            .attr("cy", 75)
            .attr("cursor", "pointer")
            .attr("fill", "red")
            .on("click", function (d) {
                displayReleaseQModal(d)
            });


        defects.append("foreignObject")
           .attr("x", "0")
           .attr("y", function (d) {
               if ((d.monthDefects == 0) && (d.monthUrgentDefects == 0)) {
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
                if (d.monthUrgentDefects > 0) {
                    return "red";
                } else if (d.monthDefects > 0) {
                    return "#FF4500";
                } else {
                    return "green";
                }
            })
            .html(function (d) {
                if ((d.monthUrgentDefects == 0) && (d.monthDefects == 0)) {
                    return "<h4 style=\"text-align:center\"><span style=\"font-size:50px\">&#10004</span><br>No defects found</h4>"
                } else {
                    return "<h4 style=\"text-align:center;font-size:15px;font-weight:bold;\">Urgent Defect(s): " + d.monthUrgentDefects + "<br>Total Defect(s): " + d.monthDefects + "</h4>";
                }
            })


        defects.append("text")
           .attr("x", 3)
           .attr("y", 20)
           .attr("font-family", "sans-serif")
           .attr("fill", "black")
           .attr("font-size", "15px")
           .attr("font-weight", 700)
           .text(function (d) {
               var retStr = teamVal;
               return retStr;
           })

        defects.append("text")
           .attr("x", 3)
           .attr("y", 40)
           .attr("font-family", "sans-serif")
           .attr("fill", "black")
           .attr("font-size", "14px")
           .text(function () {
               return reformatMonthVal(monthVal);
           })
    })
};

function reformatMonthVal(monthVal) {;
    return monthVal.replace(/[^a-z]/gi, "") + " " + monthVal.replace(/\D/g, "");
}