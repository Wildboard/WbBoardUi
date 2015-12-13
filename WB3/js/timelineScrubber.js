$(function () {

    var ns = "TIMELINE SCRUBBER JS";
    console.log(ns);

    var timelineScrubber = document.getElementById('timelineScrubber');

    timelineScrubber.addEventListener("MSPointerDown", onScrubberDown, true);
    //timelineScrubber.addEventListener("MSGestureChange", onScrubberMove, false);
    timelineScrubber.addEventListener("MSPointerUp", onScrubberUp, true);
    timelineScrubber.addEventListener("MSPointerCancel", onScrubberUp, true);
    timelineScrubber.addEventListener("MSLostPointerCapture", onScrubberUp, true);

    function onScrubberDown(e) {
        timelineScrubber.gestureObject = new MSGesture();
        timelineScrubber.gestureObject.target = timelineScrubber;
        timelineScrubber.gestureObject.pointerType = e.pointerType;
        timelineScrubber.addEventListener("MSGestureChange", onScrubberMove, false);
        timelineScrubber.addEventListener("MSInertiaStart", onScrubberInertia, false)
        timelineScrubber.gestureObject.pointerType === e.pointerType;
        timelineScrubber.gestureObject.addPointer(e.pointerId);

        timelineScrubber.fingerOffset = e.pageY - $("#timelineScrubber").offset().top
    }
    function onScrubberInertia(e) {
        //if user swipes the timelineScrubber, DO NOT continue to apply scrubb in inertia movement.
        e.currentTarget.gestureObject.stop();
    }
    function onScrubberMove(e) {
        var maxHeight = $(window).height()

        if (e.currentTarget.getAttribute("id") == "timelineScrubber") {
            var currentXform = new MSCSSMatrix(e.currentTarget.style.transform);
            var scrubberOffsetTop = $("#timelineScrubber").position().top
            if ((scrubberOffsetTop < (maxHeight - 90) && e.translationY > 0) || (scrubberOffsetTop > -10 && e.translationY < 0)) {
                e.currentTarget.style.transform = currentXform.translate(e.offsetX, e.offsetY).
                       translate(0, e.translationY).
                       translate(-e.offsetX, -e.offsetY);
            } else {
                //Now we hit bottom margin, it's time to scroll the dates div, while we keep scrubber in it's bottom position
                //increase the timelineDates Div scroll by the e.translationY value (whichcan be positive or negative leading to a scroll up or down)
                var currentTimelineDatesScroll = $("#timelineDates").scrollTop()
                $("#timelineDates").scrollTop(currentTimelineDatesScroll + 10 * e.translationY)
            }

            //calculcate scrubber Position in relation to timelineDates dates containers and set scrubber text accordingly
            try {
                calculateScrubberPosition()
            } catch (e) {
            }
        }


    }
    function calculateScrubberPosition() {
        var viewDate
        var scrollToFlyer = false
        //for eachdate entry, calculate timelineScrubber Position and set apropriate text
        $('.dates').each(function () {
            if ($("#timelineScrubber").position().top >= $(this).position().top - $(this).height() / 3) {
                $("#timelineScrubber").text($(this).text());
                viewDate = $(this).text();
                return;
            }
        })
        //scrolls flyers simultaniously
        $('.flyer').each(function () {
            //var posted = $(this).find('.posted').text()
            var posted = $(this).find('.posted').prop("sortDate");
            //Trace.log("SORT DATE ON FLYERS " + posted);
            
            if (posted == viewDate && !scrollToFlyer) {
                //Trace.log("posted: " + posted + " id " + $(this).prop("itemID"))
                scrollToFlyer = true;
                var thisID = ".selectorClass" + $(this).prop("itemID")
                //Trace.log(">>>>>>this= " + $(this).position().top + " - " + $(thisID).position().top);
                //Trace.log("offset: "+$(this).offset().top+ "- "+$("#container").offset().top)
               // $(thisID).css("background", "#ff0000");
                
                $("#container").scrollTo($(thisID));
               
                
                return;
            }
        });
    }
    function onScrubberUp(e) {
        //clean out gestures
        document.getElementById("timelineScrubber").gestureObject = null
        document.getElementById("timelineScrubber").removeEventListener("MSGestureChange", onScrubberMove, false);
        document.getElementById("timelineScrubber").removeEventListener("MSInertiaStart", onScrubberInertia, false)
        //newY = calculate position to snap timelineScrubber
        CELL_HEIGHT = 90;
        //we should not use "y" because we have a previous matrix transform
        var y = $("#timelineScrubber").position().top;
        var newY = Math.round(y / CELL_HEIGHT) * CELL_HEIGHT

        $("#timelineScrubber").css({ "transform": new MSCSSMatrix() })
        $("#timelineScrubber").css({ "top": newY })
    }

    WinJS.Namespace.define("TimelineScrubber",
        {

        }
    );
})