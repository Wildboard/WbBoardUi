// execute on documentready
$(function () {


    var ns = "NODE JS";
 
    // Keeping in rainbow order for convenience...
    var colorsAvailable = ['red', 'green', 'blue', 'orange', 'purple'];

    var activeColors = [];

    var socket = null;

    // For testing -- comment out. 
   // headsUp({ data: 'red' });

    // What's the point of this function?
    function startSocketConnection() {
        Trace.log("startSocketConnection");
    }

    connectToOrchestrator();

    function disconnect() {
        // Step 5.
        connectToOrchestrator();
    }

    //
    function headsUp(data) {
        // Step 21.
        Trace.log("Board HeadsUp color: " + data.color);
        Config.nodeActiveColors.push(data.color);
	var elt = null;
	if (Config.MULTICOLOR) {
	  elt = $("." + data.color);
	} else {
	  elt = $('#downArrowIcon');
	}
	elt.show();
    
	elt.effect('bounce', {
	    distance: 80,
	    times: 40
	},
    180);
	console.log("Multicolor: " + Config.MULTICOLOR + "; showing " + elt.html());	
        //see flyers.js line 222
        //expects data = { color: chosenColor }
        //TODO generate colored arrow call in flyers.js class
    }

    // Step 26.
    function removeColor(data) {
        console.log("Board remove active color: " + data.color);
        var colorIndex = Config.nodeActiveColors.indexOf(data.color)

        Config.nodeActiveColors.splice(colorIndex, 1);
        var elt;
        if (Config.MULTICOLOR) {
            elt = $("." + data.color);
        } else {
            elt = $('#downArrowIcon');
        }

        elt.hide();
    }

    function connectToOrchestrator() {
        // Step 1.
        try {
            socket = io.connect('http://ads.wildboard.net:8888', 
            { 'force new connection': true });
        } catch (ex) {
            // Step 2.
            setTimeout(function (x) {
                connectToOrchestrator();
            }, 30000);      
        }
    }
        socket.on('connect', function () {
            Trace.log("Board Connected");
            Config.socket = socket;
            sessionId = socket.socket.sessionid;
            console.log('Board Connected ' + sessionId);
            myBoardName = Config.boardName;
    
            // Step 3.
            socket.emit('boardHi', { boardName: myBoardName })

            //WB to Server calls -incoming
        
            socket.on('toBoardHeadsUp', headsUp);
            socket.on('toBoardRemoveArrow', removeColor);
            socket.on('disconnect', disconnect);

            
        });
        //});// end of Config.require

    
        startSocketConnection();
        WinJS.Namespace.define("Node.Action",
            {
                startSocketConnection: startSocketConnection
            }
			       );

    
  });
