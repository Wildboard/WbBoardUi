(function () {
    //How VAST object will look
    /*var VAST = {
        Impression: ["myImpresionURL.com","yourImpressionURL"],
        Creatives: [
                {
                    type: "Linear",
                    creative: (objectElement) of vast (liner,nonlinear,companion tags)
                },
                {
                    type:"Companion",
                    creative:...
                }
            ]
    */
    var VAST = {
        Impression: [],
        Creatives:[]
    }
    

    //only support VAST3.0 INLINE (not <wrapper>).
    function loadVast(vastURL) {
        if (!Config.displayPremium) {
            $("#videoPlayerId").remove();
            $("#premium").css("display", "none");
            return;
        }
        //Trace.log("Load Vast");
        $.ajax({
            type: "GET",
            url: vastURL,
            xhrFields: { withCredentials: false },
            cache: false,
            dataType: 'xml',
            error: function (jqXHR, textStatus, errorThrown) {
                //Trace.log("*VAST Error: " + textStatus + "; " + errorThrown);
            },
            success: function (xml) {
                //Trace.log("Success VAST ");
                VAST.Impression=[]
                //Look for possibly multiple <Impression> Tags 
                $(xml).find('Impression').each(function () {
                    //Trace.log("*Found Impression :: "+ $(this).text())
                    VAST.Impression.push($(this).text())
                })
                $(xml).find('Creative').each(function () {
                    //Trace.log("*Found Creative :: " + $(this).children()[0].nodeName)
                    var ad = $(this).children()[0]
                    var adType=$(this).children()[0].nodeName
                    VAST.Creatives.push({ type: adType, creative: ad})
                    switch (adType) {
                        case "Linear":
                            Premium.renderLinearAd(ad)

                            break;
                        case "CompanionAds":
                           // //Trace.log("                 children: " + $(ad).children().length);
                            $(ad).find('Companion').each(function () {
                                Premium.renderCompanionAd($(this))
                            })
                            break;
                    }
                })
                ////Trace.log($(VAST.Creatives[0].creative).find('Duration').text())
            }
        })
    }
       

    WinJS.Namespace.define("VASTParser",
        {
            loadVast:loadVast,
            VAST:VAST
        }
    );
})()