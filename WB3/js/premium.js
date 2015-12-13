(function () {
    var adObjectLinear = {}
    var trackingMap = []
    var bindingDuration = WinJS.Binding.as(adObjectLinear);
    var companionY = 0;
    function getMediaType(ad, type) {
        var url
        ad.find('MediaFile').each(function () {
            var mediaType = $(this).attr('type')
            if (mediaType.indexOf(type) > -1) {

                url = ($(this).text());
                console.log("media url: "+url)
                return false
            }
        })
        return url
    }
    function renderLinearAd(xml) {
        var ad = $(xml);
        var mp4File = getMediaType(ad, 'mp4');

        adObjectLinear = {
            time: 0,
            duration: ad.find('Duration').text(),
            mediaFileMP4: mp4File
        }

        //populate tracking

        ad.find('TrackingEvents').children().each(function () {
            var event = $(this).attr('event');
            var url = $(this).text();
            trackingMap.push({ event: event, url: url, fired: false })
            //Trace.log("Found Tracking Event " + event + " -url: " + url);
            console.log("Found Tracking Event " + event + " -url: " + url);
        })

        //generate template 
        var templateElement = document.getElementById("templatePremiumLinear")
        var renderElement = document.getElementById("premium");
        var template = new WinJS.Binding.Template(templateElement)

        template.render(adObjectLinear, renderElement).done(function () {
            registerImpression()
            playVideoAd()
        })

        var persistentBinding = WinJS.Binding.as(adObjectLinear);

        //setInterval(function () {
        //    changeDuration(persistentBinding);
        //}, 1000);
    }
    function callToURL(url) {
        var loaderImage = $('<img src="' + url + '" width="0" height="0" style="display:none" />');
        $('body').append(loaderImage);
        $(loaderImage).one("load", function () {
            $(this).remove();
        }).error(function () {
            $(this).remove();
        }).each(function () {
            if (this.complete) {
                $(this).trigger("load");
            }
        });

    }
    function registerVideoEvent(ev) {
        for (var i in trackingMap) {
            if (trackingMap[i].event == ev && !trackingMap[i].fired) {
                //Trace.log("Register video event " + ev)
                trackingMap[i].fired = true;
                callToURL(trackingMap[i].url)
            }
        }
    }
    function registerImpression() {
        for (var i in VASTParser.VAST.Impression) {
            //Trace.log("Register impression " + i + " -- " + VASTParser.VAST.Impression[i])
            callToURL(VASTParser.VAST.Impression[i])
        }
    }
    function playVideoAd() {
        var player = $('#videoPlayerId');
        player[0].play();
    
     /*   player.bind('timeupdate durationchange ended', function (ev) {
            var timeLeft = Math.round(player[0].duration - player[0].currentTime)

            switch (ev.type) {
                case "durationchange":
                    break;
                case "timeupdate":
                    if (timeLeft <= player[0].duration * 75 / 100) {
                        registerVideoEvent('firstQuartile')
                    }
                    if (timeLeft <= player[0].duration * 50 / 100) {
                        registerVideoEvent('midpoint')
                    }
                    if (timeLeft <= player[0].duration * 25 / 100) {
                        registerVideoEvent('thirdQuartile')
                    }
                    break;
                case 'ended':
                    registerVideoEvent('complete')
                    //LOOP VIDEO
                    setTimeout(function () { player[0].play(); }, 2000);
                    break;
            }
        });
        */
    }
   
    //this is just for an example of converter conditional data binding
    function changeDuration(p) {
        p.time = p.time + 1;
        p.duration = p.duration + "1";
    };
    function renderCompanionAd(xml) {
        //Trace.log(" ---------------render companion");
        console.log("render companion");
 
        var companion = $(xml);
        var staticresource = $(companion.find('StaticResource'));
        var w = staticresource.attr("width");
        var h = staticresource.attr("height");
        var url = staticresource.text();
        console.log("/" + $.trim(url) + "/")
        var unTrustedData = '<div class="companion"> <img width="' + w + '" height="' + h + '" src="' + $.trim(url) + '"  /></div>';
        

        // Safe dynamic content can be added to the DOM without introducing errors
        var safeData = window.toStaticHTML(unTrustedData);
         $('.companionAds').append(safeData);
        ////Trace.log("            static resource=" + staticresource.text());
    }

    WinJS.Namespace.define("Premium",
        {
            renderLinearAd: renderLinearAd,
            renderCompanionAd:renderCompanionAd,
            adObjectLinear: adObjectLinear,
            //Converter function
            durationChangeColor: WinJS.Binding.converter(function (type) {
                return (type < 16) ? "#cfcfcf" : "Red";
            })

        }
    );
})()