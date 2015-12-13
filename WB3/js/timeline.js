(function () {

    var ns = "TIMELINE   JS";

    function isExistingDate(datePosted) {
        for (var i = 0; i < Config.dates.length; i++) {
            //trace(i+" isExistingDate " + datePosted + " date= " + dates.date);
            existing = Config.dates[i].date;
            if (existing == datePosted) {
                return true;
            }

        }
        return false;
    }
    function showTimeline(param) {
        if (param == true) {
            $("#timelineView").css("display", "block");
        } else {
            $("#timelineView").css("display", "none");
        }
    }
    function scrollToDate(datePosted) {
        //Trace.log("Timeline should auto scroll to :" + datePosted);
        $('.dates').each(function () {

            if ($(this).text() == datePosted) {
                //scroll to date
                Config.selectedDate = datePosted;
                //$(this).addClass('selected');
                $('#timelineDates').scrollTo($(this));

                document.getElementById("timelineScrubber").style.transform = new MSCSSMatrix();

                $('#timelineScrubber').text($(this).text());
                $('#timelineScrubber').css('top', $(this).position().top);

            } else {
                $(this).removeClass('selected');

            }
        }
        )
    }

    WinJS.Namespace.define("Timeline",
        {
            isExistingDate: isExistingDate,
            showTimeline: showTimeline,
            scrollToDate:scrollToDate
        }
    );
})()