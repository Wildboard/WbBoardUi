//execute on document ready
$(function () {
    var len = 0;

    //generate template 
    var templateElement = document.getElementById("templateDiv");
    var renderElement = document.getElementById("container");
    var template = new WinJS.Binding.Template(templateElement);
    //generate verticaltemplate
    var templateElementVertical = document.getElementById("templateDivVertical")
    var renderElementVertical = document.getElementById("containerVertical");
    var templateVertical = new WinJS.Binding.Template(templateElementVertical)
    //generate template for timelineDates
    var templateElementTimeline = document.getElementById("templateDivTimelineDate")
    var renderElementTimeline = document.getElementById("timelineDates");
    var templateTimeline = new WinJS.Binding.Template(templateElementTimeline);


    function removeFlyerByID(flyerID) {
        for (var i = 0; i < Config.flyers.length; i++) {
            existing = Config.flyers[i].prop('itemID');
            if (existing == flyerID) {
                var sel = Config.flyers[i]
                $(sel).remove();
                Config.flyers.slice(i, 1);
                Config.curFlyers.slice(i, 1);
                break;
            }
        }
    }
    function isExistingFlyer(flyerID) {
        for (var i = 0; i < Config.flyers.length; i++) {
            existing = Config.flyers[i].prop('itemID');
            //console.log("is existing :"+existing)
            if (existing == flyerID) {
                return true;
            }

        }
        return false;
    }
    //FIRST LOAD
    $.ajax({
        url: Config.feedUrl,
        cache: false,
        dataType: 'json',
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("Error: " + textStatus + "; " + errorThrown);
            //Trace.log("error")
        },
        success: function (feed, textStatus, jqXHR) {
            //Trace.log("<br>[ajax success]");

            setTimeout(loadFeed, Config.pollFeelTime)
            len = feed.flyers.length;
            console.log("Fetched feed items: " + len);
            //Trace.log("Fetched feed items: " + len);
            if (!len) {
                console.log("Bad feed: " + feed);
                return;
            }
            $("#container").css('display', 'block');
            $("#containerVertical").css('display', 'none');
            //represents new items added after reload
            var newFlyers = {}
            //Trace.log("FEED premium= " + feed.premium[0].vastUrl)
            Config.vastUrl = feed.premium[0].vastUrl;
            VASTParser.loadVast(Config.vastUrl);
            Config.flyersIdToJson = {};
            for (var i = 0; i < len; i++) {
                var f = feed.flyers[i];
                Config.flyersIdToJson[f.id] = f;

                // Find words to search on
                var json = f;
                var keyStr =json.titleArea.title.toLowerCase();
                for (var stIdx in json.subtitle) {
                    keyStr += " " + json.subtitle[stIdx];
                }
                keyStr += " " + json.bodyArea.description;
                var keyStrOld = keyStr;
                keyStr = keyStr.toLowerCase();
                keyStr = keyStr.replace("\t", " ").replace(/[\.,-\/,#!$%\^\[\]{}=\*&`~()\-"'\?]/g, " ");
                keyStr = keyStr.replace(/\s{2,}/g, " ");
                
                var keyArr = keyStr.split(" ");
                keyArr.sort();
                // Mindlessly dedup
                var keyArr2 = [];
                var prev = "";
                for (var j = 0; j < keyArr.length; j++) {
                    var cur = keyArr[j];
                    if (prev == cur) {
                        continue;
                    }
                    keyArr2.push(cur);
                    prev = cur;
                }
                console.log("Replaced [" + keyStrOld + "] with [" + keyArr2.join(" ") + "]");
                Config.flyersIdToKeywords[f.id] = keyArr2;


                //using "itemID" attribute only to keep track of correct id during touch pointer events.s
                //calculate category class
                var category = f.category.join(" ");
                var subtitle = ""
                //Calculate how subtitle array is rendered
                for (var s = 0; s < f.titleArea.subtitle.length; s++) {
                    //check if is first entry ,then align left
                    if (!(s % 2)) {
                        subtitle += "<div style='float:left'>" + f.titleArea.subtitle[s] + "</div>"
                    } else {
                        //this is second entry , align rightand insert linebreak
                        subtitle += "<div style='float:right'>" + f.titleArea.subtitle[s] + "</div><br/>"

                    }
                }
                //divclass = class used in GRID view
                var divclass = 'flyer ' + category + " selectorClass" + f.id;
                //divclassVert = class used in Vertical view;
                var divclassVert = 'flyer ' + f.category + " selectorClassVert" + f.id;
                var curElt = '.selectorClass' + f.id;
                var curEltVert = '.selectorClassVert' + f.id;

                var fEmbed = null;
                var fGoogleMap = null;
                var displayGoogleMapStyle = 'none';
                var vCurTimeCursor = 0;
                var displayImgStyle = 'inline';
                var displayVidStyle = 'none';
                var missing = "http://s.opendsp.com/1x1.gif";
                var img = null;

                if (f.mediaArea.length > 0) {
                    var firstEl = f.mediaArea[0];
                    if (firstEl.hasOwnProperty("embed")) {
                        img = missing;
                        fEmbed = firstEl.embed;
                        displayImgStyle = 'none';
                        displayVidStyle = 'inline';
                        displayGoogleMapStyle = 'none';
                    } else if (firstEl.hasOwnProperty("googleMap")) {
                        img = missing;
                        fGoogleMap = firstEl.googleMap;
                        displayImgStyle = 'none';
                        displayVidStyle = 'none';
                        displayGoogleMapStyle = 'inline';
                    } else {
                        img = firstEl;
                    }
                } else {
                    img = missing;
                 }

                var imgContact = null;
                var txtContact = null;
                if (f.contactArea.length > 0 && f.contactArea[0].hasOwnProperty('img')) {
                    imgContact = f.contactArea[0].img;
                    txtContact = f.contactArea[0].text;
                }
               
                var Flyer = {
                    displayState:"grid",
                    outOfBounds:false,
                    id: f.id,
                    selectorClass: "sel" + f.id,
                    title: f.titleArea.title,
                    flyerClass: divclass,
                    flyerClassVert: divclassVert,
                    subtitle: subtitle,
                    posted: f.titleArea.posted,
                    sort_date: f.titleArea.sort_date,
                    description: f.bodyArea.description,
                    image: img,
                    embed: fEmbed,
                    googleMap : fGoogleMap,
                    curTimeCursor : vCurTimeCursor,
                    displayImgP: displayImgStyle,
                    displayVidP: displayVidStyle,
                    displayGoogleMapP : displayGoogleMapStyle,
                    imageContact: imgContact,
                    textContact: txtContact
                }
                template.render(Flyer, renderElement).done(function (element) {
                    //addgesture controlsfor this item
                    if (element.innerText.indexOf("Fall Lecture") > 0) {
                        var g = $(element).find('#googleMapFlyer0');
                        var mapDiv = g.find('#mapDiv');
                        if (mapDiv != null) {
                      //      g.append("<div id='mapDiv' style='width:160px;height:120px;'></div>");
                        }
                    }
                    var item = element
                    var angle = Config.angleStart + 1 * Config.angleDelta;

                    item.style.transform = (new MSCSSMatrix()).translate(-Config.size / 2.0, -Config.size / 2.0).translate(Config.width / 2.0 + Config.radius * Math.cos(Config.angle), Config.height / 2.0 + Config.radius * Math.sin(Config.angle));
                    item.startingTransform = item.style.transform;  // expando property for resetting

                    item.style.zIndex = 1 + i;
                    item.gestureObject = null;
                })
                //at this point div #continerVertical is hidden
                templateVertical.render(Flyer, renderElementVertical).done(function (element) {
                    //$(el).animate({ width: Config.details_maxwidth + 'px', opacity: 1 }, 680);
                    $(curEltVert).css('top', i * 200 + "px");
                    var item = element
                    var angle = Config.angleStart + 1 * Config.angleDelta;

                    item.style.transform = (new MSCSSMatrix()).translate(-Config.size / 2.0, -Config.size / 2.0).translate(Config.width / 2.0 + Config.radius * Math.cos(Config.angle), Config.height / 2.0 + Config.radius * Math.sin(Config.angle));
                    item.startingTransform = item.style.transform;  // expando property for resetting

                    item.style.zIndex = 1 + i;
                    item.gestureObject = null;
                })

                newFlyers['flyer' + f.id] = $(curElt);
                Config.curFlyers.push(Flyer);
                Config.flyers.push($(curElt));
                Config.filterFlyers.push($(curElt));

                
                //start addind dates to timelinediv
                /*
                if (!Timeline.isExistingDate(Flyer.sort_date)) {
                    Config.dates.push({ date: Flyer.sort_date, id: Flyer.id });
                    templateTimeline.render(Flyer, renderElementTimeline).done(function (element) {
                    })
                    if (Config.selectedDate == null) {
                        Config.selectedDate = Flyer.sort_date
                    }
                }
                */
                //END adding dates to #timelineView
            }
            //End of for
            // setTimeout(Menu.Action.filterToGrid, 1200);
            setTimeout(Menu.Action.gotoView, 1200);
            
        }

    });//end of ajax

    //function used on interval reload
    function loadFeed() {
        $('#searchInputId0').val("");
        Config.filterFlyers = Config.flyers;
        Menu.Action.filterToGrid(Config.flyers);
        //Trace.log("=====reloadng==");
        $.ajax({
            url: Config.feedUrl,
            cache: false,
            dataType: 'json',
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error: " + textStatus + "; " + errorThrown);
            },
            success: function (feed, textStatus, jqXHR) {
                setTimeout(loadFeed, Config.pollFeelTime);
                //Trace.log("<br>loaded ");
                try {
                    //represents new items added after reload
                    var newFlyers = {};
                    if (!feed) {
                        console.log("Bad feed: " + feed);
                        //Trace.log("Bad feed" + feed);
                        return;
                    }
                    len = feed.flyers.length;
                   
                    console.log("Fetched " + len);
                    for (var i = 0; i < len; i++) {
                        var f = feed.flyers[i];
                //using "itemID" attribute only to keep track of correct id during touch pointer events.s
                //calculate category class
                var category = f.category.join(" ");
                var subtitle = ""
                //Calculate how subtitle array is rendered
                for (var s = 0; s < f.titleArea.subtitle.length; s++) {
                    //check if is first entry ,then align left
                    if (!(s % 2)) {
                        subtitle += "<div style='float:left'>" + f.titleArea.subtitle[s] + "</div>"
                    } else {
                        //this is second entry , align rightand insert linebreak
                        subtitle += "<div style='float:right'>" + f.titleArea.subtitle[s] + "</div><br/>"

                    }
                }
                var existing;
                 var divclass = 'flyer ' + f.category + " selectorClass" + f.id;
                        var curElt = '.selectorClass' + f.id;
                        if (isExistingFlyer(f.id)) {
                            newFlyers['flyer' + f.id] = $(curElt);
                            //console.log('Already loaded ' + f.id);
                            continue;
                        }
                        //divclassVert = class used in Vertical view;
                    	var divclassVert = 'flyer ' + f.category + " selectorClassVert" + f.id;
                    	var curElt = '.selectorClass' + f.id;
                    	var curEltVert = '.selectorClassVert' + f.id;
                        
                    	var displayImgStyle = 'inline';
                    	var displayVidStyle = 'none';
                    	var fEmbed = null;
                    	var fGoogleMap = null;
                    	var displayGoogleMapStyle = 'none';
                    	var vCurTimeCursor = 0;
                    	var missing = "http://s.opendsp.com/1x1.gif";
                    	var img = null;

                    	if (f.mediaArea.length > 0) {
                    	    var firstEl = f.mediaArea[0];
                    	    if (firstEl.hasOwnProperty("embed")) {
                    	        img = missing;
                    	        displayImgStyle = 'none';
                    	        displayVidStyle = 'inline';
                    	        fEmbed = firstEl.embed;
                    	    } else if (firstEl.hasOwnProperty("googleMap")) {
                    	        img = missing;
                    	        fGoogleMap = firstEl.googleMap;
                    	        displayImgStyle = 'none';
                    	        displayVidStyle = 'none';
                    	        displayGoogleMapStyle = 'inline';
                    	      

                    	    } else {
                    	        img = firstEl;
                    	    }
                    	} else {
                    	    img = missing;
                    }

                    var imgContact = null;
                    var txtContact = null;
                    	
                    	if (f.contactArea.length > 0 && f.contactArea[0].hasOwnProperty('img')) {
                    	    imgContact = f.contactArea[0].img;
                    	    txtContact = f.contactArea[0].text;
                    	}
                        var Flyer = {
                            displayState: "grid",
                            outOfBounds: false,
                            id: f.id,
                            selectorClass: "sel" + f.id,
                            title: f.titleArea.title,
                            flyerClass: divclass,
                            flyerClassVert: divclassVert,
                            subtitle: subtitle,
                            posted: f.titleArea.posted,
                            sort_date: f.titleArea.sort_date,
                            description: f.bodyArea.description,
                            image: img,
                            displayImgP: displayImgStyle,
                            displayVidP: displayVidStyle,
                            displayGoogleMapP : displayGoogleMapStyle,
                            embed : fEmbed,
                            googleMap : fGoogleMap,
                            curTimeCursor: vCurTimeCursor,
                            imageContact: imgContact,
                            textContact: txtContact
                        }
                        //template.render(Flyer, renderElement).

                        newFlyers['flyer' + f.id] = $(curElt);
                        template.render(Flyer, renderElement).done(function (element) {
                            //addgesture controlsfor this item
                            var item = element
                            var angle = Config.angleStart + 1 * Config.angleDelta;
                            item.style.transform = (new MSCSSMatrix()).translate(-Config.size / 2.0, -Config.size / 2.0).translate(Config.width / 2.0 + Config.radius * Math.cos(Config.angle), Config.height / 2.0 + Config.radius * Math.sin(Config.angle));
                            item.startingTransform = item.style.transform;  // expando property for resetting

                            item.style.zIndex = 1 + i;
                            item.gestureObject = null;
                        })
                        templateVertical.render(Flyer, renderElementVertical).done(function (el) {
                            //$(el).animate({ width: Config.details_maxwidth + 'px', opacity: 1 }, 680);
                            var item = el
                            var angle = Config.angleStart + 1 * Config.angleDelta;
                            item.style.transform = (new MSCSSMatrix()).translate(-Config.size / 2.0, -Config.size / 2.0).translate(Config.width / 2.0 + Config.radius * Math.cos(Config.angle), Config.height / 2.0 + Config.radius * Math.sin(Config.angle));
                            item.startingTransform = item.style.transform;  // expando property for resetting

                            item.style.zIndex = 1 + i;
                            item.gestureObject = null;
                        })
                        Config.curFlyers.unshift(Flyer);
                        Config.flyers.unshift($(curElt));
                        Config.filterFlyers.unshift($(curElt));

                        //position flyers
                        var leftPos = Menu.Action.getShortestCol() * (300 ) + 50
                        $(curElt).css('left', leftPos + "px");
                        var topPos = Config.arr[Menu.Action.getShortestCol()]
                        $(curElt).css('top', topPos + "px")
                        Config.arr[Menu.Action.getShortestCol()] = Config.arr[Menu.Action.getShortestCol()] + $(curElt).height() + 20;


                    }

                    // Remove flyers that disappeared from the feed 
                    if (true) {
                        var toRemove = new Array();

                        for (var i = 0; i < Config.flyers.length; i++) {
                            var f = Config.flyers[i];
                            var existingId = "flyer" + f.prop("itemID");
                            //console.log(f + " existingId = " + existingId + ' isNew' + newFlyers[existingId]);
                            //for (var i in f) {
                            //        console.log (i)
                            //}
                            //newFlyers['flyer' + f.id]
                            if (newFlyers[existingId]) {
                            } else {
                                toRemove.push(i);
                            }
                        }
                        // console.log("toRemove = " + toRemove);
                        var removedAny = false;
                        while (toRemove.length > 0) {
                            var toRemoveIdx = toRemove[0];
                            var f = Config.flyers[toRemoveIdx];
                            //var sel = f
                            //console.log(JSON.stringify(Config.flyers));
                            //console.log(JSON.stringify(Config.filterFlyers));
                            removeFlyerByID(f.prop('itemID'));
                            //Config.flyers.splice(toRemoveIdx, 1);
                            //console.log(JSON.stringify(Config.flyers));
                            //Config.filterFlyers.splice(toRemoveIdx, 1);
                            toRemove.splice(0, 1);
                            // $(sel).remove();
                            removedAny = true;
                           
                        }

                        //if (removedAny) {

                        Menu.Action.doMenuInitialDisplay();
                        //resetALLFlyerView();
                        //_currentView = "grid";
                        Menu.Action.filterToGrid(Config.flyers);
                        //}
                    } // End of commenting out of flyer removals
                    //End of for
                } catch (e) {
                    console.log("Error  " + e);
                }
            }
        });
    }


})