(function () {
    //inititalization vars
    //turn _debugMode "on" to show an overlay div with live console.log
    var _debugMode = "off"
    var _dates = []
    var _selectedDate = null;
    var _curFlyers = [];
    //timelineTimeout  timer 
    var _timelineTimeout
    //location of vast, currently read from JSON
    var _vastUrl = "";
    //'http://localhost/grisha/VAST/vast.xml';
    //location of JSON for flyers
    var _feedUrl = 'http://localhost/feed.json';
    //var _feedUrl = 'http://ads.wildboard.net:8080/feed.json';

    //_pollFeelTime=a timeout for reloading JSON(in millis) . It also resets flyers to original position
     var _pollFeelTime = 300000;
    //_inactivity_time= a timeout for reseting flyers position if there is no user interaction
    var _inactivity_time = 300000;//after _inactivity_time, restore flyers to original grid view 

    var _inactivitySnapTimer;

    var _boardName = "WbDev";

    //css vars that go into Config Namespace:
    // height will be used to reset after gesture manipulation
     //height will be auto in general, only width will constrain flyer. Just use 400 FOR INITIAL VALUE.
    var _height = 250; //this will only be used for a slipt second, untill the flyer image loads.

    //change grid view flyer size. height is auto
    var _grid_width = 180;
    var _grid_maxwidth = 300;

    //change details view flyer size. height is auto. 
    //!!!!!DO NOT GO BELOW 500px.it willnot look so nice
    var _details_width = 500;
    var _details_maxwidth = 500;

    //change image size for details view (to fit nicely should be around details_Width-NOTE1 -NOTE2)
    //NOTE1=330px :to change the 330px value (space for detailstext and qr) see default.html line 51
    //NOTE2=60px :to change the 60px value (a lot of margin styles) see default.html line 51

    var _details_image_width = 110;
    

    // _arr lenght defines on how many columnsthe flyers are displayed
    var _arr = [0, 0, 0, 0, 0];
    var _size = Math.min(_grid_width, _height) * 0.5;
    _pieces=document.getElementsByClassName("flyer") || [];
    var _angleDelta = 2.0 * Math.PI / _pieces.length;
   

    function updateFlyerObjectProp(id, prop, val) {
        for (var i in Config.curFlyers) {
            if (Config.curFlyers[i].id == id) {
                Config.curFlyers[i][prop]=val
            }
        }
    }
    //get flyer with JSON id
    function getFlyerForItemID(id) {
        for (var i in Config.curFlyers) {
            if (Config.curFlyers[i].id == id) {
                return Config.curFlyers[i]
            }
        }
        return
    }
    WinJS.Namespace.define("Config",
            {
                getFlyerForItemID: getFlyerForItemID,
            updateFlyerObjectProp: updateFlyerObjectProp,
            flyersIdToJson: {},
                flyersIdToKeywords: [],
                //"curFlyers" is used to store the Object {} from which we populate the template
                curFlyers:_curFlyers,
                feedUrl:_feedUrl,
                inactivitySnapTimer: _inactivitySnapTimer,
                inactivity_time: _inactivity_time,
                //change FLYERS sizes below (also need to change .flyers class inside .css file)
                //when in DETAILS view, flyer's max width is details_maxwidth:
                details_width:_details_width,
                details_maxwidth: _details_maxwidth,
                //when in DETAILS view, flyer's max height is details_maxheight:
                details_maxheight: 450,
                //when in GRID view, flyer's max width is:
                grid_maxWidth: _grid_maxwidth,
                width: _grid_width,
                height: _height,
                details_image_width:_details_image_width,
                _currentView: "grid",
                size: _size,
                radius: _size / Math.SQRT2 + 1.0,
                angleDelta: _angleDelta,
                angleStart: _angleDelta / 2.0,
                //arr.lenght = numer of cols,
                //example : arr[0]=100; means that 100pixels of colums 1 are occupied
                arr: _arr,

                //all flyers from feed
                flyers: [],

                //visible flyers after user filters
                filterFlyers: [],
                timelineTimeout: _timelineTimeout,
                pollFeelTime: _pollFeelTime,
                dates: _dates,
                selectedDate: _selectedDate,
                vastUrl: _vastUrl,
                displayPremium:true,
                debugMode: _debugMode,
                socket:null,
                boardName: _boardName,
                nodeActiveColors:[],
		MULTICOLOR:0
            }
    );
})()
