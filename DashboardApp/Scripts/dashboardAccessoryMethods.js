function resetReleased() {
    document.getElementById("releasedStories").innerHTML = "";
    document.getElementById("releasedHotFixes").innerHTML = "";
    document.getElementById("prevReleasedStories").innerHTML = "";
    document.getElementById("prevReleasedHotFixes").innerHTML = "";

    document.getElementsByClassName("releasedContainer")[0].style.color = "black";
    document.getElementsByClassName("releasedContainer")[1].style.color = "black";
    document.getElementsByClassName("releasedContainer")[0].style.backgroundColor = "lightgray";
    document.getElementsByClassName("releasedContainer")[1].style.backgroundColor = "lightgray";

    document.getElementById("loaderStories").hidden = false;
    document.getElementById("loaderHotFixes").hidden = false;

    document.getElementById("releasedSelect").disabled = true;
    document.getElementById("monthReleased").disabled = true;
    document.getElementById("monthReleasedBtn").disabled = true;
    document.getElementById("loadingReleased").hidden = false;
}


function enableReleased()
{
    document.getElementById("loadingReleased").hidden = true;
    document.getElementById("monthReleased").disabled = false;
    document.getElementById("releasedSelect").disabled = false;
    document.getElementById("loaderStories").hidden = true;
    document.getElementById("monthReleasedBtn").disabled = false;
}

function addRelStories(data) {
    document.getElementById("releasedStories").innerHTML = "<h3>Released Stories: " + data + "</h3>";
}

function addRelHotFixes(data) {
    document.getElementById("releasedHotFixes").innerHTML = "<h3>Released Hot Fixes: " + data + "</h3>";
}

function addUnsized(data) {
    document.getElementById("unsizedStoriesDisp").innerHTML = "<h3 style=\"padding-left:25px\">Unsized Stories: " + data + "</h3>";
}

function addSized(data, team) {
    onMessageBacklogSP = data;
    var avgPoints;
    if (team == "onCampus") {
        avgPoints = onCampusAveragePoints;
    } else if (team == "onMessage") {
        avgPoints = onMessageAveragePoints;
    } else if (team == "onBoard") {
        avgPoints = onBoardAveragePoints;
    } else if (team == "onRecord") {
        avgPoints = onRecordAveragePoints;
    } else {
        avgPoints = onCampusAveragePoints + onMessageAveragePoints + onBoardAveragePoints + onRecordAveragePoints;
    }

    document.getElementById("storyPointsInBacklog").innerHTML = "<h3 style=\"padding-left:25px\">Story Points In Backlog: " + data +
        "<h3><h4 style=\"padding-left:50px;color:gray;font-style:italic\">Latest Average of Story Points Completed: " + avgPoints.toFixed(2) +
      "<br/>Sprints To Complete Sized Backlog: " + (data / avgPoints).toFixed(2);
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

function addShadows(circleSvg) {
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
}
