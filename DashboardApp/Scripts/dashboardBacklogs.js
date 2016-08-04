function updateBacklog() {
    resetBacklog();

    var teamVal = document.getElementById("backLogSelect").value;
    if (teamVal == "All") {
        $.ajax({
            url: '/Home/GetAllUnsized',
            type: 'GET',
            dataType: 'json',
            cache: false,
            error: function () {
                alert('Error occured');
            },
            success: function (data) {
                addUnsized(data);
            }
        });

        $.ajax({
            url: '/Home/GetAllSized',
            type: 'GET',
            dataType: 'json',
            cache: false,
            error: function () {
                alert('Error occured');
            },
            success: function (data) {
                addSized(data, teamVal);
                document.getElementById("loading").hidden = true;
                document.getElementById("loaderBacklog").hidden = true;
                document.getElementById("backLogSelect").disabled = false;
                document.getElementById("backLogBtn").disabled = false;
            }
        });
    } else {
        $.ajax({
            url: '/Home/GetUnsized',
            type: 'GET',
            data: { team: teamVal },
            dataType: 'json',
            cache: false,
            error: function () {
                alert('Error occured');
            },
            success: function (data) {
                addUnsized(data);
                document.getElementById("loading").hidden = true;
                document.getElementById("loaderBacklog").hidden = true;
                document.getElementById("backLogSelect").disabled = false;
            }
        });

        $.ajax({
            url: '/Home/GetSized',
            type: 'GET',
            data: { team: teamVal },
            dataType: 'json',
            cache: false,
            error: function () {
                alert('Error occured');
            },
            success: function (data) {
                addSized(data, teamVal);
            }
        });
    }
}

function resetBacklog() {
    document.getElementById("unsizedStoriesDisp").innerText = "";
    document.getElementById("storyPointsInBacklog").innerHTML = "";

    document.getElementById("backLogSelect").disabled = true;
    document.getElementById("backLogBtn").disabled = true;
    document.getElementById("loading").hidden = false;
    document.getElementById("loaderBacklog").hidden = false;
}