$(function () {
    var _totalFlyersReady = 0
    //do layout to reposition the grid after the images have loaded, otherwise flyer will end up one on top on another
    $(".gridSkin").css("width", Config.width);
    $(".gridSkin").css("max-width", Config.grid_maxWidth);
    $(".detailsSkin").css("width", Config.details_width);
    $(".detailsSkin").css("max-width", Config.details_maxwidth);
    //THIs will resize the image to keep its width as the flyer width
    // $(".mainImg").css("max-width", (Config.grid_maxWidth - 20) + "px");
    $(".mainImg").css("max-width", (Config.grid_maxWidth - 20) + "px");

    $(".mainImgVert").css("width", (Config.details_image_width) + "px");
    $(".mainImgVert").css("max-width", (Config.details_image_width) + "px");
    function doLayout(f) {
        if (_totalFlyersReady >= Config.flyers.length) {
            for (var i = 0; i < Config.flyers.length; i++) {
                Menu.Action.filterToGrid(Config.flyers);
            }
        } _totalFlyersReady++
    }
    function quickFadeFlyers(type, time) {
        var len = Config.flyers.length;
        for (var i = 0; i < len; i++) {
            //$(thisID).css('transition', 'transform 0.3s, left 0.3s, top 1s');
            var el = Config.flyers[i] //jquery object
            if (el) {
                if (type == "in") {
                    //el.fadeIn(time);
                    el.animate({ opacity: 1 }, time, 'linear');
                } else {
                    el.animate({ opacity: 0.1 }, time, 'linear');
                    //el.fadeOut(time);
                }
            }
        }
    }
    //gesture control
    var itemArea = document.getElementById('container');
    itemArea.addEventListener("MSPointerDown", onTableTopPointerDown, true);
    itemArea.addEventListener("MSPointerUp", onTableTopPointerUp, true);
    itemArea.addEventListener("MSPointerCancel", onTableTopPointerUp, true);

    itemArea.gestureObject = new MSGesture(); // expando on element: tracks the itemArea gesture
    itemArea.gestureObject.target = itemArea;
    itemArea.gestureObject.pointerType = null;  // expando on gesture: filter against mixed pointer types
    itemArea.targetedContacts = [];           // expando on element: list of contacts that target the container
    itemArea.topmostZ = 10;
    //gesture control for vertical View
    var itemAreaVert = document.getElementById('containerVertical');
    itemAreaVert.addEventListener("MSPointerDown", onTableTopPointerDown, true);
    itemAreaVert.addEventListener("MSPointerUp", onTableTopPointerUp, true);
    itemAreaVert.addEventListener("MSPointerCancel", onTableTopPointerUp, true);

    itemAreaVert.gestureObject = new MSGesture(); // expando on element: tracks the itemArea gesture
    itemAreaVert.gestureObject.target = itemArea;
    itemAreaVert.gestureObject.pointerType = null;  // expando on gesture: filter against mixed pointer types
    itemAreaVert.targetedContacts = [];           // expando on element: list of contacts that target the container
    itemAreaVert.topmostZ = 10;
    function onTableTopPointerDown(e) {
        if (e.currentTarget.gestureObject == null || e.currentTarget.gestureObject.pointerType == null) {               // First contact!
            e.currentTarget.gestureObject = new MSGesture();
            e.currentTarget.gestureObject.target = e.currentTarget;
            e.currentTarget.msSetPointerCapture(e.pointerId);
            e.currentTarget.gestureObject.pointerType = e.pointerType;
            e.currentTarget.gestureObject.addPointer(e.pointerId);
            if (e.target === e.currentTarget) {
                e.target.targetedContacts.push(e.pointerId);
                //added here so we do another check of timeline dates selection
                //calculateTopFlyersDate()
            }
        }
        else if (e.currentTarget.gestureObject.pointerType === e.pointerType) { // Subsequent contact of similar type!
            e.currentTarget.msSetPointerCapture(e.pointerId);
            e.currentTarget.gestureObject.addPointer(e.pointerId);
            if (e.target === e.currentTarget) {
                e.target.targetedContacts.push(e.pointerId);
                //added here so we do another check of timeline dates selection
                // calculateTopFlyersDate()
            }
        }
        else {                                                                  // Subsequent contact of different type!
            return;
        }
        if (e.target.hasOwnProperty("itemID")) {
            if (Config._currentView != "grid") {
                var targetedItem = document.getElementsByClassName('selectorClassVert' + e.target.itemID).item(0);
            }
            else {
                var targetedItem = document.getElementsByClassName('selectorClass' + e.target.itemID).item(0);
                //Trace.log("targetedItem- " + targetedItem)
            }
        }

        if (e.target != e.currentTarget && targetedItem && !targetedItem.gestureObject) {
            //  First contact on this element!
            targetedItem.gestureObject = new MSGesture();
            targetedItem.gestureObject.target = targetedItem;
            targetedItem.gestureObject.pointerType = e.pointerType;
            if (Config._currentView != "grid") {
                targetedItem.addEventListener("MSGestureTap", onPieceGestureTap, false);
                targetedItem.addEventListener("MSGestureEnd", onPieceGestureEnd, false);
            } else {
                targetedItem.addEventListener("MSGestureChange", onPieceGestureChange, false);
                targetedItem.addEventListener("MSGestureEnd", onPieceGestureEnd, false);
                targetedItem.addEventListener("MSGestureTap", onPieceGestureTap, false);
                targetedItem.addEventListener("MSGestureHold", onPieceGestureHold, false);
            }
            targetedItem.gestureObject.pointerType === e.pointerType;
            targetedItem.gestureObject.addPointer(e.pointerId);
            targetedItem.parentElement.topmostZ += 1;
            targetedItem.style.zIndex = targetedItem.parentElement.topmostZ;
            //CLear Inactivity Timer
            clearTimeout(Config.inactivitySnapTimer);

        }
        else if (targetedItem != null) {
            if (targetedItem.gestureObject.pointerType == e.pointerType) {    // Subsequent contact of same kind!
                targetedItem.gestureObject.addPointer(e.pointerId);
                //
                //  To pop the element to the top, we just keep track of the topmostZ index, increment it by one,
                //  and assign that value to the target element.  This would eventually wrap around or overflow.
                //  A better algorithm here would test topmostZ against some threshold and, when it is hit, take 
                //  time to remap the zIndex's back to 0 .. n.
                //
                targetedItem.parentElement.topmostZ += 1;
                targetedItem.style.zIndex = targetedItem.parentElement.topmostZ;
            }
        }
        else {

        }

    }
    function onPieceGestureTap(e) {
        if (e.currentTarget.innerHTML.indexOf("Fall Lecture Series") > -1) {
            return;
        }
        //Trace.log("TAP " + e.target + " displayState= " + e.target.displayState)
        var thisID = ".selectorClass" + e.target.itemID
        var gridID = thisID+" .gridSkin"
        var fullID = thisID + " .detailsSkin"
       // updateFlyerObjectProp(e.target.itemID, "displayState","grid" )
        if (Config.getFlyerForItemID(e.target.itemID).displayState == "grid") {
            $(thisID).css("max-width", Config.details_maxwidth)
            $(thisID).css("width", "700px")
            $(gridID).hide();
            $(fullID).fadeIn(500, function () { Config.getFlyerForItemID(e.target.itemID).displayState = "details"; })
        } else {
            $(thisID).css("width", Config.grid_maxWidth)
            $(thisID).css("max-width", Config.grid_maxWidth)
            
            $(gridID).fadeIn(400, function () { Config.getFlyerForItemID(e.target.itemID).displayState = "grid"; });
            $(fullID).hide()
        }
       // var fullID = ".selectorClassVert" + e.target.itemID
       // $(gridID).animate({ opacity: 0 }, 100, function () {$(gridID).css("display","none") });
       // $(fullID).animate({ opacity: 1 }, 100);
    }
    function onPieceGestureTap_DEPRECATED(e) {
        if (Config._currentView != "horizontalStripe") {
            var thisID = ".selectorClass" + e.target.itemID
            Menu.Action.layoutHorizontalGrig($(thisID), Config.filterFlyers);
            Config._currentView = "horizontalStripe";

        } else {
            var thisID = ".selectorClassVert" + e.target.itemID
            var len = Config.flyers.length;
            $("#containerVertical").scrollTo($(thisID), 300, { offset: 0 - Config.details_maxheight / 2 })
            for (var i = 0; i < len; i++) {
                var el = Config.flyers[i] //jquery object
                var sel = '.selectorClassVert' + Config.flyers[i].prop("itemID");
                $(sel).css('background', 'url(/images/bg-flyer.png) repeat;');

            }
            $(thisID).css("background", "#c69e3e");
        }
        cleanUpTileGesture(e.target);
    }
    function getOffset(el) {
        var _x = 0;
        var _y = 0;
        while (el && !isNaN(el.offsetLeft) && !isNan(el.offsetTop)) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
        }
        return { top: _y, left: _x }
    }
    function onPieceGestureChange(e) {

        var thisID = ".selectorClass" + e.target.itemID;
        $(thisID).css('transition', 'none');
        //    Bail out if the itemArea container is being manipulated
        if (e.target.parentElement.targetedContacts && e.target.parentElement.targetedContacts.length !== 0) {
            return;
        }
        //bail out if flyer goes "under the rug" (under timeline or premium area)
        // //Trace.log(">[hittest]"+ document.msElementsFromPoint)
        if (document.msElementsFromPoint) {
            //return;
            var hitTargets = document.msElementsFromRect(window.outerWidth - 660, 0, 660, window.outerHeight);
            for (var i = 0; i < hitTargets.length; i++) {

                // //Trace.log("doc w: " + document.body.clientWidth + " h: " + document.body.clientHeight)
                // //Trace.log("window w: " + window.outerWidth+ " h: " + window.outerHeight)
                if ((hitTargets[i].itemID != undefined) && e.target.itemID == hitTargets[i].itemID) {
                    //Trace.log($(thisID).offset().left + " vs " + (window.outerWidth - 660));

                    var myoffset_top = $(thisID).offset().top
                    var myoffset_left = $(thisID).offset().left-50
                    //offset({ top: 10, left: 30 });
                    // e.target.bounds = true;
                   // e.target.style.backgroundColor = "red";
                    
                    $(thisID).css('transition', 'background 1s, transform 0.3s');
                    $(thisID).css('background', '#cccccc');
                    e.target.style.transform = new MSCSSMatrix(e.target.style.transform)
                    //Trace.log("animate to :"+($(thisID).offset().left-50))
                    $(thisID).animate({ left: "-=60" }, 300, function () { $(thisID).css('background', '#717780'); });
                    // e.target.removeEventListener("MSGestureChange", onPieceGestureChange);
                    cleanUpTileGesture(e.target);
                    return


                }
            }
        }
        //CHECK OUT HIT TEST FOR NODE JS PHONE COLORS:
        //check if flyer hit "green" square of node.js class
        //Trace.log(">[hittest]"+ document.msElementsFromPoint)
        if (document.msElementsFromPoint && Config.nodeActiveColors.length>0) {
            //object.msElementsFromRect(left, top, width, height, retVal)
            //next line gets tect fot entire#nodeColors div,but we need formula for a specific child of #nodeColor
            //var hitTargets = document.msElementsFromRect(0, window.outerHeight - 100, window.outerWidth, 100);
            if (typeof e.target.emittedSignal == "undefined") {
                e.target.emittedSignal = false;
            }
            // Trace.log("  ongesture emittedSignal  " + e.target.emittedSignal)
            Config.nodeActiveColors['red'] = 1;
            for (var za in Config.nodeActiveColors) {
	      var colorElement=null;
	      if (Config.MULTICOLOR) {
		       colorElement = $('.'+Config.nodeActiveColors[za]);
	      } else {
		      colorElement = $('#downArrowIcon');
	      }
	   //   console.log(colorElement.html());
	      // var hitRectElement = $('#nodeColors', colorElement) this isbroken, user colorElement
                                           
	      var offsetLeft = colorElement.offset().left;
	      var eltWidth = colorElement.width();

	      var offsetTop = colorElement.offset().top;
	      var eltHeight = colorElement.height();

	      console.log("Looking for hit targets (left, top, width, height) = (" + offsetLeft + "," + offsetTop + "," + eltWidth + "," + eltHeight + ")"); 
	      var hitTargets = document.msElementsFromRect(offsetLeft, offsetTop, eltWidth, eltHeight);
	      var thisID = ".selectorClass" + e.target.itemID;
	      var flyerOffset = $(thisID).offset();
	      console.log("Flyer at: " + flyerOffset.left + "x" + flyerOffset.top );
	      if (hitTargets) {
		    // console.log("Found: " + hitTargets.length);
		for (var i = 0; i < hitTargets.length; i++) {
		   //  console.log("Comparing " + hitTargets[i].itemID + " to " + e.target.itemID);
		  if (hitTargets[i].itemID != undefined && e.target.itemID == hitTargets[i].itemID) {
		    // Trace.log("HIT TEST $('#nodeColors) " + hitTargets[i].itemID);
		      if (!e.target.emittedSignal) {
		          e.stopImmediatePropagation();
		          Trace.log("-----Emit ---" + $(thisID).html());
		                        e.target.emittedSignal = true;
		          // Step 22.
		                        e.stopPropagation();
		                        e.stopImmediatePropagation();
		                        var data = {};
                                data.color = Config.nodeActiveColors[za];
				                data.flyerId = e.target.itemID;
                                data.flyerHtml = $(thisID).html();
                                data.flyerJsonObj = Config.flyersIdToJson[data.flyerId];
                                data.flyerJsonStr = JSON.stringify(data.flyerJsonObj);
                                console.log("Dragged:  "+ data.flyerJsonStr);
                                
                                var videoFlyers = $(thisID).find('#videoFlyer');
                                if (videoFlyers) {
                                    videoFlyer = videoFlyers[0];
                                    videoFlyer.pause();
                                }
                                
                                Config.socket.emit("boardFlyerDragged", data);

                                var origPos = $(thisID).prop('wbOrigPos');
                                var curPos = $(thisID).position();
                                console.log("--------------------------------------------------");
                                console.log("I need to move to " + origPos.left + ":" + origPos.top + " from " +
                                        curPos.left + ":" + curPos.top);
                           //     console.log($(thisID).css('position'));

                                if (true) {
                                    console.log(e.detail + " vs " + e.MSGESTURE_FLAG_END);
                                    // Create fake event so we can reuse onPieceGestureHold.
                                    var e2 = {
                                        detail: e.MSGESTURE_FLAG_END,
                                        MSGESTURE_FLAG_END : e.MSGESTURE_FLAG_END,
                                        target : e.target
                                    };
                                    console.log(e2.detail + " vs " + e.MSGESTURE_FLAG_END);
                                    $(thisID).effect("pulsate", { times: 1 }, 1000);
                                    $(thisID).promise().done(function () {
                                        onPieceGestureHold(e, true);
                                    });
                                } else {
                                   $(thisID).fadeOut(1800, "swing");
                                }
                                 console.log("--------------------------------------------------");
				                Trace.log("after emit e.target.emittedSignal  " + e.target.emittedSignal)
				  }
		    
		  }
		}
	      }
            }
        }

        e.target.bounds = false;
        //  Update the transform on this element; similar to itemArea transform above, except we
        //  do support rotation on the pieces.
        var currentXform = new MSCSSMatrix(e.target.style.transform);
        //  Keep scale from getting too small (else user can lose track of it!) delta
        var currentScale = Math.sqrt(currentXform.m11 * currentXform.m22 - currentXform.m12 * currentXform.m21);
        var origLeft = $(thisID).position().left;
        //0.4 is the minumum allowed scale down or ther flyer will get way too small???
        if (e.scale * currentScale >= 0.4) {
          
                e.target.style.transform = currentXform.translate(e.offsetX, e.offsetY).
                translate(e.translationX, e.translationY).
                rotate(e.rotation * 180 / Math.PI).
                scale(e.scale).
                translate(-e.offsetX, -e.offsetY);
        }
        else {
            e.target.style.transform = currentXform.translate(e.offsetX, e.offsetY).
            translate(e.translationX, e.translationY).
            rotate(e.rotation * 180 / Math.PI).
            translate(-e.offsetX, -e.offsetY);
        }
    }

    function onPieceGestureHold(e, ignoreFlagEnd) {//reset to initial grid position
        var thisID = ".selectorClass" + e.target.itemID;
        //  Change the tile color
        if (e.detail == '1' || ignoreFlagEnd) {
            if (ignoreFlagEnd) {
                // We are faking this from the drag-to-phone method. So make this longer...
                $(thisID).css('transition', 'background 1s, transform 0.3s');
            } else {
                $(thisID).css('transition', 'background 1s, transform 0.3s');
            }
            $(thisID).css('background', '#f1c40f');
            e.target.style.transform = new MSCSSMatrix()
        }
        console.log("Comparing " + e.detail + " to " + e.MSGESTURE_FLAG_END);

        if (e.detail == e.MSGESTURE_FLAG_END || ignoreFlagEnd) {
          //  console.log(e.MSGESTURE_FLAG_END);
            $(thisID).css('transition', 'none');
            var currentXform = new MSCSSMatrix(e.target.style.transform);
            var origWidth = $(thisID).width();
            var origLeft = $(thisID).position().left - currentXform.e;
            var origTop = $(thisID).position().top - currentXform.f;
            //e.target.style.transform = "";
            //e.target.style.transform = e.target.startingTransform;


            origLeft = ($(thisID).position().left * currentXform.a + $(thisID).position().top * currentXform.c - 1 * currentXform.e) + $("#container").scrollLeft()
            origTop = ($(thisID).position().top * currentXform.b + $(thisID).position().top * currentXform.d - 1 * currentXform.f) + $("#container").scrollTop()
            $(thisID).animate({ width: (origWidth - 20) + 'px', left: (origLeft + 10) + "px", top: (origTop + 10) + "px" }, 200, function () {
            $(thisID).animate({ width: origWidth, left: origLeft + "px", top: origTop + "px" }, 280);
             $(thisID).css('background', '#717780');
            });
            cleanUpTileGesture(e.target);
        }

        //  As for the itemArea container, Tap is like End from a cleanup perspective:

    }

    function onTableTopPointerUp(e) {

        //  Called on either pointer up or pointer cancel (which can easily happen to touch if a pen comes in range,
        //  for example.)  Remove the contact from the list of contacts that target the container.

        var itemArea;
        if (e.target === e.currentTarget) {  // pointer up on the itemArea
            itemArea = e.target;
            //HANDLE SCROLLING FLYERS MATCHING DATES after a short interval. cause user usually swipes
            clearTimeout(Config.timelineTimeout);
            Config.timelineTimeout = setTimeout(calculateTopFlyersDate, 500);

        }
        else {                               // pointer up on a tile, but it may have originally gone down on the tabletop!
            //i'm not sure this parentElement is correct. BECAUSE the pointer on "flyer+id" is actually triggering upon touching the image or textfieldinside the "flyer" div...
            //TODO verify
            if (Config._currentView != "grid") {
                var thisID = "selectorClassVert" + e.target.itemID
                itemArea = document.getElementsByClassName(thisID);
            }
            else {
                var thisID = "selectorClass" + e.target.itemID
                //var thisID = e.target.getAttribute('id')
                itemArea = document.getElementsByClassName(thisID);
                //e.target.parentElement
            }
        }

        if (itemArea.targetedContacts) {
            var i = itemArea.targetedContacts.indexOf(e.pointerId);
            if (i !== -1) {
                itemArea.targetedContacts.splice(i, 1);
            }
        }
    }
    function onPieceGestureEnd(e) {
        Trace.log("::::Gesture end");
        e.target.emittedSignal = false;
        Trace.log("after END emittedSignal  " + e.target.emittedSignal)
        //  Clean up gesture handling; not necessary with only four pieces, but
        //  important if this were scaled to a real puzzle app. Just release the
        //  reference and the gesture object itself will eventually be garbage collected.
        cleanUpTileGesture(e.target);

    }
    function calculateTopFlyersDate() {
        
        if (Config._currentView != "grid") {

            return;
        }

        //see quick demo on http://jsfiddle.net/yHH7C/23/
        var base = $('#container').offset().top;
        var offs = [];
        $('#container .flyer').each(function () {
            var $this = $(this);
            var thisID=$this.prop("itemID");
            offs.push({
                offset: $this.offset().top - base,
                height: $this.height() - 50,
                // id: $this.attr('itemID'),
                id: $this.itemID,
                posted: $(".selectorClass" + thisID).find('.gridSkin .posted').prop("sortDate")
               // posted: $(".selectorClass" + thisID).find('.gridSkin .posted').text()
            });
            ////Trace.log(thisID + "dates " + $(".selectorClass" + thisID).find('.gridSkin .posted').text())
        });
        //removed code calculations from .scroll event, because stuff was flickering a lot.TOO MUCH MOVEMENT!!!
        //  $("#container").scroll(function () {
        var y = $('#container').scrollTop()

        for (var i = 0; i < offs.length; ++i) {
            if (y < offs[i].offset || y > offs[i].offset + offs[i].height) {
                //trace("continue " + offs[i].offset + " - " + offs[i].height);
                continue;

            }
            if (offs[i].posted != Config.selectedDate) {
                //Trace.log("OFFS posted: " + offs[i].posted);
                Timeline.scrollToDate(offs[i].posted)
            }
            return;
        }
    }


    function resetView() {
        //Trace.log("Resetting view " );
        if (Config._currentView != "grid") {
            //Trace.log("--------layoutHorizontalGrig");
            Menu.Action.layoutHorizontalGrig(null, Config.filterFlyers)
        } else {
            //Trace.log("---------filterToGrid");
            Menu.Action.filterToGrid(Config.filterFlyers)
        }
    }

    function cleanUpTileGesture(elt) {
        if (Config._currentView != "grid") {
            var thisID = ".selectorClassVert" + elt.itemID;
        }
        else {
            var thisID = ".selectorClass" + elt.itemID;
        }
        //Trace.log(Config._currentView+" . "+$(thisID).position().top)
        $(thisID).css('transition', 'none');
        if (elt.gestureObject != null) {
            elt.gestureObject.target = null;       // Clear target so the gesture object can be garbage collected
            elt.gestureObject = null;
        }
        elt.removeEventListener("MSGestureChange", onPieceGestureChange);
        //elt.removeEventListener("MSGestureEnd", onPieceGestureEnd);
        elt.removeEventListener("MSGestureTap", onPieceGestureTap);
        clearInterval(Config.inactivitySnapTimer);
        Config.inactivitySnapTimer = setTimeout(resetView, Config.inactivity_time)

    }
    WinJS.Namespace.define("Flyers",
         {
             doLayout: doLayout
         }
     );

})
