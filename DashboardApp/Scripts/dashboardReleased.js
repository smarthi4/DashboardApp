function updateReleased() {
    resetReleased();


    var teamVal = document.getElementById("releasedSelect").value;
    var monthVal = document.getElementById("monthReleased").value;

    var prevMonth = $('#monthReleased').find(":selected").prev().val();
    $.ajax({
        url: '/Home/GetReleasedStories',
        type: 'GET',
        data: { month: monthVal, team: teamVal },
        dataType: 'json',
        cache: false,
        error: function () {
            alert('Error occured');
        },
        success: function (data) {
            addRelStories(data);
            addPrevMonthStories(prevMonth, teamVal, data);
        }
    });

    $.ajax({
        url: '/Home/GetReleasedHotFixes',
        type: 'GET',
        data: { month: monthVal, team: teamVal },
        dataType: 'json',
        cache: false,
        error: function () {
            alert('Error occured');
        },
        success: function (data) {
            addRelHotFixes(data);
            addPrevMonthHotFixes(prevMonth, teamVal, data);
        }
    });
}

function addPrevMonthStories(prevMonth, teamVal, currData) {
    if (prevMonth.length > 0) {
        $.ajax({
            url: '/Home/GetReleasedStories',
            type: 'GET',
            data: { month: prevMonth, team: teamVal },
            dataType: 'json',
            cache: false,
            error: function () {
                alert('Error occured');
            },
            success: function (prevData) {
                var percent = Math.round((currData - prevData) / prevData * 10000) / 100;
                displayPrevMonthStories(prevData, percent);
            }
        });
    } else {
        document.getElementById("prevReleasedStories").innerHTML = "<h4 style=\"color:gray,font-style:italic\">No data found for previous month.<h4>";
        enableReleased();
    }

}

function addPrevMonthHotFixes(prevMonth, teamVal, currData) {
    if (prevMonth.length > 0) {
        $.ajax({
            url: '/Home/GetReleasedHotFixes',
            type: 'GET',
            data: { month: prevMonth, team: teamVal },
            dataType: 'json',
            cache: false,
            error: function () {
                alert('Error occured');
            },
            success: function (prevData) {
                var percent = Math.round((currData - prevData) / prevData * 10000) / 100;
                displayPrevMonthHotFixes(prevData, percent);
            }
        });
    } else {
        document.getElementById("prevReleasedHotfixes").innerHTML = "<h4 style=\"color:gray,font-style:italic\">No data found for previous month.<h4>";
    }
}

function displayPrevMonthStories(data, percent) {
    var color;
    if (percent > 0) {
        color = "green";
    } else {
        color = "red";
    }
    document.getElementById("prevReleasedStories").innerHTML = "<h4 style=\"font-style:italic;\">Stories Last Month: " + data + " (" + percent + "%)<h4>";
    document.getElementsByClassName("releasedContainer")[0].style.backgroundColor = "dark" + color;
    document.getElementsByClassName("releasedContainer")[0].style.color = "white";
    enableReleased();
}

function displayPrevMonthHotFixes(data, percent) {
    var color;
    if (percent > 0) {
        color = "green";
    } else {
        color = "red";
    }
    document.getElementById("prevReleasedHotFixes").innerHTML = "<h4 style=\"font-style:italic\">Hot Fixes Last Month: " + data + " (" + percent + "%)<h4>";
    document.getElementsByClassName("releasedContainer")[1].style.backgroundColor = "dark" + color;
    document.getElementsByClassName("releasedContainer")[1].style.color = "white";
    document.getElementById("loaderHotFixes").hidden = true;
}
