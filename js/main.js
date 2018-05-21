/*global tau*/
/*global widget*/
/*global $*/


var SCROLL_STEP = 50;       // distance of moving scroll for each rotary event


setup_button_line = function(liandbutton) {
    var button = $(liandbutton).find("span");
    tau.widget.Button(button);
    var event = button.attr("data-event");

    var endpoint = iftttUrl().replace(/\{event\}/g, event);


    button.click(function(e) {
        //button.prop("disabled",true);
        tau.changePage("pageProcessing");
	$.ajax({
	    url: endpoint,
	    async: false,
            dataType: 'jsonp'
	}).fail(function(e) {
            if(e.status === 200) {
                tau.changePage("main");
            } else {
                tau.changePage("options");
            }
        });

    });
    return liandbutton;
}

iftttUrl = function() {
    return 'https://maker.ifttt.com/trigger/{event}/with/key/' + getVal("ifttt_key");
}

eventList = function() {
    return getVal("events").split(",");
}

isSetup = function() {
    return (getVal("events") !== null && getVal("ifttt_key") !== null)
}

saveVal = function(key, data) {
    localStorage.setItem(key, data);
    console.log(localStorage, sessionStorage);
}

getVal = function(key) {
    return localStorage.getItem(key);
}

saveKey = function() {
    var key = document.getElementById('ifttt_key');
    setup_buttons();
    saveVal("ifttt_key", key.value);
}

saveEvents = function() {
    var events = document.getElementById('events');
    saveVal("events", events.value);
    setup_buttons();
}
setup_options_buttons = function() {
    $("#option_button").click(function() {
        tau.changePage("options");
    });

    if(getVal("ifttt_key") !== null)
        $("#ifttt_key").attr("value", getVal("ifttt_key"));
    if(getVal("events") !== null)
        $("#events").attr("value", getVal("events"));        
}


setup_buttons = function() {

    var target = $("body .ui-listview");
    target.empty();
    $.each(eventList(), function(i, val) {
	var entry = $("<li><span class='ui-li-text-main' data-event='"+ val + "'>" + val + "</span></li>");
        setup_button_line(entry).appendTo(target);
    });
    return true;
}


window.onload = function() {

    
    document.addEventListener("pagebeforeshow", function pageScrollHandler(e) {
        var page = e.target;
        elScroller = page.querySelector(".ui-scroller");

        // rotary event handler
        rotaryEventHandler = function(e) {
            if (elScroller) {
                if (e.detail.direction === "CW") { // Right direction
                    elScroller.scrollTop += SCROLL_STEP;
                } else if (e.detail.direction === "CCW") { // Left direction
                    elScroller.scrollTop -= SCROLL_STEP;
                }
            }
        };

        // register rotary event.
        document.addEventListener("rotarydetent", rotaryEventHandler, false);

        // unregister rotary event
        page.addEventListener("pagebeforehide", function pageHideHanlder() {
            page.removeEventListener("pagebeforehide", pageHideHanlder, false);
            document.removeEventListener("rotarydetent", rotaryEventHandler, false);
        }, false);
    }, false);


    setup_options_buttons();
    if (isSetup()) {
        setup_buttons();
        tau.changePage("main");
    } else {
        tau.changePage("options");
    }
    



    window.addEventListener( 'tizenhwkey', function( ev ) {
	if( ev.keyName === 'back' ) {
	    var page = document.getElementsByClassName( 'ui-page-active' )[0],
		pageid = page ? page.id : "";
	    if( pageid === 'main' ) {
		try {
		    tizen.application.getCurrentApplication().exit();
		} catch (ignore) {
		}
	    } else {
		tau.back();
	    }
	}
    } );
	

};
