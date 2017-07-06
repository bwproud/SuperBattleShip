var Player = function(game, is_player_one) {
    if(is_player_one) {
		var key = game.registerPlayerOne();
	} else {
		var key = game.registerPlayerTwo();
	}
    var oppShips=new Array();
    var myShips=new Array();

    this.getKey = function(){
    	return key;
    }

    this.shootAt=function(x,y){
		game.shootAt(key, x, y);
	}

	this.moveForward = function(ship_name){
		var ship = game.getShipByName(key, ship_name);
		if (ship != null) {
		    game.moveShipForward(key, ship);
		}
	};

	this.moveBackward = function(ship_name){
		var ship = game.getShipByName(key, ship_name);
		if (ship != null) {
		    game.moveShipBackward(key, ship);
		}
	};

	this.rotateCW = function(ship_name){
		var ship = game.getShipByName(key, ship_name);
		if (ship != null) {
		    game.rotateShipCW(key, ship);
		}
	};

	this.rotateCCW = function(ship_name){
		var ship = game.getShipByName(key, ship_name);
		if (ship != null) {
		    game.rotateShipCCW(key, ship);
		}
	};

    var eventLogHandler = function(e) {	
		switch (e.event_type) {	
			case SBConstants.SHIP_SUNK_EVENT:
			    var ship = e.ship;
			    if (ship.isMine(key)) {
				    if($.inArray(ship.getName(), myShips)==-1){
				    	myShips.push(ship.getName());
				    }
				    var id="#"+ship.getName();
				    $(id).css( "background-color", "#b22c2c");
				    $(id).css( "color", "black");
					var pos = ship.getPosition(key);
				    if(myShips.length==5){
				    	$.prompt("You lost because you suck!");
				    }
			    } else {
				    if($.inArray(ship.getName(), oppShips)==-1){
				    	oppShips.push(ship.getName());
				    	$.prompt("You have destroyed opponent's "+ship.getName());
				    }
					var pos = ship.getPosition(null);
				    if(oppShips.length==5){
				    	$.prompt("Congratulations, you won!");
				    }
				}
				break;
		}
    };

    game.registerEventHandler(SBConstants.SHIP_SUNK_EVENT,
			      eventLogHandler);
};

