//execute on documentready
$(function () {
    var ns = "MENU JS";
    console.log(ns);

    Windows.UI.ViewManagement.InputPane.getForCurrentView().addEventListener("showing", onInputPaneShowing);
    Windows.UI.ViewManagement.InputPane.getForCurrentView().addEventListener("hiding", onInputPaneHiding);


    //homebutton , on tap, reset to grod view, and show all flyers from feed (no filter)
    $('.searchAll').click(function () {
        //Trace.log("SearchALL");
        filterToGrid(Config.filterFlyers);
    });

    function getShortestCol() {
        return Config.arr.indexOf(Math.min.apply(Math, Config.arr));
    }


    function playVideo(p) {
        var p2 = p;
        p.play();
        //registerVideoEvents
       
        // WTF does bind not work here????
       // console.log(ondurationchange);
      /*  p.ontimeupdate = function (ev) {

          //  console.log("Current time: " + p.currentTime + " for player " + p.playerID);
            var f = Config.getFlyerForItemID(p.playerID);
            var f2 = Config.curFlyers[p.playerID];
            var j = Config.flyersIdToJson[p.playerID];
            var medAr = j.mediaArea[0];
            if (medAr && medAr.hasOwnProperty('curTime')) {
                j.mediaArea[0].curTime = p.currentTime;
            }
        
            
        };*/
    }

    //this is just for an example of converter conditional data binding
    function changeDuration(p) {
        p.time = p.time + 1;
        p.duration = p.duration + "1";
    };

    function filterToGrid(flyersArray) {
        //

        //Trace.log("APPLYING Filter to grid");
        //Trace.log(flyersArray.length);
        Timeline.showTimeline(true);
        if (typeof (flyersArray) === 'undefined') {
            flyersArray = Config.flyers;
        }
        resetALLFlyerView();
        Config.arr = [0, 0, 0, 0, 0];
        var _len = flyersArray.length;
        for (var i = 0; i < _len; i++) {
            var el = flyersArray[i]; //jquery object
            el.stop();

            var thisID = ".selectorClass" + $(el).prop("itemID");
            var gridID = thisID + " .gridSkin";
            var fullID = thisID + " .detailsSkin";
            // //Trace.log("i is "+i +"and itemID is "+el.prop("itemID"));
            
            //Trace.log(Config.getFlyerForItemID($(el).prop("itemID")).displayState)
            
            if (Config.getFlyerForItemID($(el).prop("itemID")).displayState != "grid") {
                $(thisID).css("width", Config.grid_maxWidth);
                $(thisID).css("max-width", Config.grid_maxWidth);

                $(gridID).fadeIn();
                Config.getFlyerForItemID($(el).prop("itemID")).displayState = "grid";
               
                $(fullID).hide();
            }

            var leftPos = getShortestCol() * (Config.grid_maxWidth + 20) + 20;
            el.fadeIn();
            el.animate({ opacity: 1, width: Config.grid_maxWidth + 'px', left: leftPos + "px", top: Config.arr[getShortestCol()] + "px" }, 380);
            Config.arr[getShortestCol()] = Config.arr[getShortestCol()] + el.height() + 20;
            el.css('transition', 'transform 0.3s');
            el.css('transform', new MSCSSMatrix());
            var origPos ={ left: leftPos, top: Config.arr[getShortestCol()]};
          //  console.log(origPos.left + "x" + origPos.top);
            el.prop("wbOrigPos", origPos);
            var videoFlyers = el.find('#videoFlyer');
            if (videoFlyers) {
                videoFlyer = videoFlyers[0];
                playVideo(videoFlyer);
            }
        }
        Config._currentView = "grid";
    }

    function resetALLFlyerView() {
        //this is to reset the flyer in simple view mode - without any details text etc;
        if (Config._currentView != "grid") {
            

            for (var i = 0; i < Config.flyers.length; i++) {
                var el = Config.flyers[i] //jquery object
                ////Trace.log("resetALLFlyerView " + el.attr('itemID'))
                $('#details' + el.attr('itemID')).css('width', Config.grid_maxWidth - 10);
                $("#detailsText" + el.attr('itemID')).css({ 'display': 'none', 'width': '45%' })
                $("#img_" + el.attr('itemID')).css({ 'width': '100%', "height": "auto", "float": "left", 'margin-left': '5px' })
                el.css('background', 'url(/images/bg-flyer.png) repeat;');
                el.css('height', "auto");
                el.css('max-height', "400px");
                el.css("max-width", Config.grid_maxWidth + "px")
            }
        }
    }
    function doMenuInitialDisplay() {
        var clicked = $('.searchAll');
        var selector = "*";

        $(".menu").each(function (index, domEle) {
            // domEle == this
            if ($(this).is(".searchAll")) {
                $(this).prev().css("background", "rgba(50,58,69,1)");
                $(this).css("background", "rgba(77,85,96,1)");
                $(this).next().css("background", "rgba(50,58,69,1)");
            } else if (!$(domEle).is(clicked.next())) {
                $(domEle).css("background", "rgba(50,58,69,1)");
               
            }
        });
        
        $(".menuHelp").css("background", "rgba(50,58,69,1)");
        $(".menuSearch").css("background", "rgba(50,58,69,1)");

    }
 
    function layoutHorizontalGrig(_selectedItem, flyersArray) {
        Timeline.showTimeline(false);
        $("#containerVertical").css('display', 'block');
        $("#container").css('display', 'none');
        //hide non filtered flyers from the original entire array
        for (var i = 0; i < Config.flyers.length; i++) {
            var sel = '.selectorClassVert' + Config.flyers[i].prop("itemID");
            $(sel).css('opacity', 0);
            $(sel).fadeOut(1);
        }
        var prevHeight = 0;
        var leftPos = ($(window).width() - Config.details_maxwidth) / 2 - $(".menu").outerWidth()
        for (var i = 0; i < flyersArray.length; i++) {
            el = flyersArray[i];
            var sel = '.selectorClassVert' + el.prop("itemID");
            $(sel).css('left', leftPos + "px");
            $(sel).css('top', (prevHeight) + "px");
            $(sel).fadeIn(10);
            $(sel).animate({ width: Config.details_maxwidth + 'px', opacity: 1 }, 680);
            prevHeight += (20 + $(sel).height());
        }
        //horizontal becomes vertical in this new version
        Config._currentView = "horizontalStripe";
    }


    function resetView() {
        // //Trace.log("_currentView ="+_currentView)
        if (Config._currentView != "grid") {
            layoutHorizontalGrig(null, Config.filterFlyers)
        } else {
            var ff = Config.filterFlyers;
            filterToGrid(Config.filterFlyers)
        }
        hideSearch();
        clearSearch();
        hideHelp();
    }

    function hideHelp() {
        $('#helpDivId').css('display', 'none');
    }

    $('#menuHelpId').click(function () {
        clearInterval(Config.inactivitySnapTimer);
        Config.inactivitySnapTimer = setTimeout(resetView, Config.inactivity_time)


        var disp = $('#helpDivId').css('display');
        if (disp == 'block') {
            hideHelp();
        } else {
            $('#helpDivId').css('position', 'absolute');
            
            $('#helpDivId').css('display', 'block');
            var menuPos = $('#menuHelpId').position();
            menuPos.left += 150;
            menuPos.top -= 200;
            $('#helpDivId').css(menuPos);
            $('#helpDivId').css('display', 'block');
        }
    });

    var lastSearchLength;

    var searchBoxOrigTop = -1;

    var searchBoxOrigLeft = -1;

    function moveAnimate(element, newParent, f) {
        element = $(element); //Allow passing in either a JQuery object or selector
        newParent = $(newParent); //Allow passing in either a JQuery object or selector
        var oldOffset = element.offset();
        element.appendTo(newParent);
        var newOffset = element.offset();

        var temp = element.clone().appendTo('body');
        temp.css('position', 'absolute')
                .css('left', oldOffset.left)
                .css('top', oldOffset.top)
                .css('zIndex', 1000);
        element.hide();
        temp.animate({ 'top': newOffset.top, 'left': newOffset.left }, 'slow', function () {
            element.show();
            temp.remove();
        },
        f());
    }

    var panelShowing = false;
    function onInputPaneShowing(e) {
        panelShowing = true;
        console.log("Showing.");
     e.ensuredFocusedElementInView = true;
        var origPos = $('#searchInputId0').offset();
        searchBoxOrigTop = origPos.top;
        searchBoxOrigLeft = origPos.left;
        console.log("Search box original top " + searchBoxOrigTop);
        var kbTop = e.occludedRect.y;
        console.log("Occluded rect: " + kbTop);
        var newTop = kbTop - 40;
        var newTopPx = newTop + "px";
        //     $('#searchInputId0').animate({ 'top': newTopPx, 'width' : '200px'  });
        $('#searchInputId0').css('top', newTopPx).css('width', '400px').css('size', 10).css('left', 750);

        $('html, body').scrollTop(0);
      //  moveAnimate($('#searchDivIdNormal'), $('#searchDivIdTop'), function () {
            
      //  });
     }
     function onInputPaneHiding(e) {
         hideSearch();
         panelShowing = false;
     }

    $('#searchInputId0').focus(function (e) {
      
    });

    $('#searchInputId0').click(function (e) {
       
    });

    $('#searchInputId0').bind('search', function (e) {
        console.log("Searching.");
    });


    $('#searchInputId0').on('focus blur change search clear input keyup mouseup click', function (e) {
        console.log("Lalalala: " + e.type + ": [" + $('#searchInputId0').val() + "]");
    });

    $('#searchInputId0').on('input', function (e) {
        console.log("Showing: " + panelShowing);
        if (!panelShowing) {
            // NO keyboard yet, nothing to do.
            return;
        }
        // We only care if this is a 'clear' button, so if value is empty.
        var val = $('#searchInputId0').val();
        if (val) {
            return;
        }
        onKeyUp(e);
    });

    $('#searchInputId0').keyup(onKeyUp);
    function onKeyUp(e) {
        clearInterval(Config.inactivitySnapTimer);
        Config.inactivitySnapTimer = setTimeout(resetView, Config.inactivity_time)

        var code = e.keyCode;
        var txt = $('#searchInputId0').val();

        if (lastSearchLength > 0 && txt.length <= 1) {
            // Field was cleared
            filterToGrid();
            lastSearchLength = txt.length;
            return;
        }
        if (txt.length <= 1) {
            lastSearchLength = txt.length;
            return;
        }
        if (txt.length == lastSearchLength) {
            return;
        }

        txt = txt.toLowerCase();
        lastSearchLength = txt.length;
        Config.filterFlyers = [];
        var cnt = 0;
        for (var i in Config.flyers) {

            var f = Config.flyers[i];
            var id = f.prop('itemID');
            var json = Config.flyersIdToJson[id];

            var textToSearch = Config.flyersIdToKeywords[id];
            cnt += 1;
            var found = false;
            for (var j in textToSearch) {
                var cand = textToSearch[j].substring(0, txt.length);
                if (cand == txt) {
                    found = true;
                    break;
                }
            }
            if (found) {
                 f.fadeIn(1);
            //    f.show();
                Config.filterFlyers.push(f);
            } else {
                   f.fadeOut(1);
            //    f.hide();
            }
        }
        console.log("Found " + Config.filterFlyers.length + " out of " + cnt + " for " + txt);
        filterToGrid(Config.filterFlyers);       
    };

    function clearSearch() {
        $('#searchInputId0').val("");
    }

    function hideSearch() {
       // $('#searchInputId0').val("");    
        var inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView();
        
        focused = false;
        if (searchBoxOrigTop > 0) {
            $('#searchInputId0').css('top', searchBoxOrigTop).css('left', searchBoxOrigLeft).css('width', '100px');
            $('#searchInputId0').hide();
            $('#searchInputId0').show();
            searchBoxOrigTop = -1;
            // Keep filtering!
            // filterToGrid();
        }
    }

    $('#searchCloseImgId').click(function () {
        hideSearch();
        filterToGrid();
    });

    $('#menuSearchId').click(function () {
        var disp = $('#searchDivId').css('display');
        if (disp == 'block') {
            hideSearch();
            filterToGrid();
        } else {
            $('#searchDivId').css('position', 'absolute');

            $('#searchDivId').css('display', 'block');
            var menuPos = $('#menuSearchId').position();
            menuPos.left += 50;
            menuPos.top = menuPos.top;
            
            $('#searchDivId').css(menuPos);
            $('#searchDivId').css('display', 'block');

            $('#searchInputId').focus();
        }
    });

    $('.menuArea .menu').click(function () {
        var clicked = $(this);
        var selector = $(this).attr('class').substr(5);
        if (!clicked.is(".filler")) {

            //handle menu select
            $(".menu").each(function (index, domEle) {
                // //Trace.log($(domEle).text() + "-----------" + (clicked.next()).text() + " - " + $(domEle).is(clicked.next()));
                if ($(this).is("." + selector)) {
                    $(this).prev().css("background", "rgba(50,58,69,1)");
                    $(this).css("background", "rgba(77,85,96,1)");
                    $(this).next().css("background", "rgba(50,58,69,1)");
                } else if (!$(domEle).is(clicked.next())) {
                    $(domEle).css("background", "rgba(50,58,69,1)");
                }
            });


            $(".menuHelp").css("background", "rgba(50,58,69,1)");
            $(".menuSearch").css("background", "rgba(50,58,69,1)");

            //handle flyers actions
            $("#container").css('display', 'block');
            $("#containerVertical").css('display', 'none');
            Config.filterFlyers = [];
            Config.arr = [0, 0, 0, 0, 0];
            clearInterval(Config.inactivitySnapTimer);
            Config.inactivitySnapTimer = setTimeout(resetView, Config.inactivity_time);
            selector = (selector != "searchAll") ? "" + selector : "*";
            var len = Config.flyers.length;
            for (var i = 0; i < len; i++) {
                var el = Config.flyers[i] //jquery object
                if (el) {
                    if (!el.hasClass(selector) && selector != "*") {
                        el.fadeOut();
                    } else {
                        ////Trace.log("filter this :" + el.css("opacity"));
                        Config.filterFlyers.push(el);
                        el.fadeIn();
                    }
                }
                //get verticalelementselector:
                var elVert=$('.selectorClassVert'+el.prop('itemID'))
                
                if (elVert) {
                    if (!elVert.hasClass(selector) && selector != "*") {
                        elVert.fadeOut();
                    } else {
                        ////Trace.log("filter this :" + el.css("opacity"));
                       // Config.filterFlyers.push(elVert);
                        elVert.fadeIn();
                    }
                }
            }
            filterToGrid(Config.filterFlyers)
        }
    })



    doMenuInitialDisplay();

    WinJS.Namespace.define("Menu.Action",
        {
            filterToGrid: filterToGrid,
            gotoView:resetView,
            resetALLFlyerView: resetALLFlyerView,
            layoutHorizontalGrig: layoutHorizontalGrig,
            getShortestCol: getShortestCol,
            doMenuInitialDisplay: doMenuInitialDisplay
        }
    );

})