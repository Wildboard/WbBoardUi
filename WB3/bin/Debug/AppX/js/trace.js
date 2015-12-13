(function () {

    var ns = "TRACE JS";
    console.log(ns);


    function createLogDIV() {
        //create div for traces
        if (Config.debugMode == "on") {
            var d = '<div id="trace"style="overflow:auto;top:60px;left:850px;width:400px;height:450px;background-color:#eedd66;position:absolute;float:left;z-index:9999999"></div>'
            $('body').append(d)
        }
    }
    function log(msg) {
        //trace new info
        if (Config.debugMode == "on") {
            $("#trace").prepend("<br>" + msg)
        }
    }
    WinJS.Namespace.define("Trace",
        {
            create: createLogDIV,
            log: log
        }
    );
})()