/*
This AI traverses the gameboard by various amounts of x and y*(-1^a).
When it hits one of the opponent's pieces it uses the logic below to detect the 
direction to shoot next. Very effective at sinking ships when it manages to get the
initial hit. Can detect when ships get within distance of own ships
*/
var bwproudAI = function(game, is_player_one, delay) {
	if(is_player_one) {
		var key = game.registerPlayerOne();
		var enemy="p2";
		var displace=Math.floor(game.getBoardSize()/2);
	} else {
		var key = game.registerPlayerTwo();
		var enemy="p1";
		var displace=0;
	}
	var count=0;
	var x=0; var hitX=0;
    var y=0; var hitY=0;
    var dir=1;
   	var justHit=false;
   	var found=false;
   	var moves = new Array();
    var turnChangeHandler = function(e) {
    	count++;
        if (e.who == SBConstants.PLAYER_TWO) {
			for(var i = 0; i < game.getBoardSize(); i++) {
					for(var j = 0; j < game.getBoardSize(); j++) {
						var status = game.queryLocation(key, i, j);
						if(status.type == enemy && status.state != SBConstants.BURNT) {
						 	x=i; y=j;
						 	found=true;
						 	break;
						}
					}
			}
			if(!justHit||found){
				found=false;
				game.shootAt(key, x, y);
				if(!justHit){
					chooseMove();
				}
			}else{
				switch(dir){
					case 1:
						y++;
						game.shootAt(key, x, y);
						break;
					case 2:
						y--;
						game.shootAt(key, x, y);
						break;
					case 3:
						x++;
						game.shootAt(key, x, y);
						break;
					case 4:
						x--;
						game.shootAt(key, x, y);
						break;
					default:
						dir=1;
						game.shootAt(key, x, y);
						justHit=false;	
				}
			}
		}
    };

    var shipHitHandler = function(e) {
    	if (!e.ship.isMine(key)) {
	   		switch(e.event_type){
				case SBConstants.HIT_EVENT:
					if(!justHit){
						hitX=e.x;
						hitY=e.y;
					}
					x=e.x
					y=e.y
				 	justHit=true;
				 	break;
				 case SBConstants.SHIP_SUNK_EVENT:
				 	justHit=false;
				 	dir=1;
				 	break;	
			 }
		}
	};	 	

	var chooseMove = function(e){
		while($.inArray(x+" "+y, moves)!=-1){	
			x+=Math.floor(Math.random() * 3);y+=Math.floor(Math.random() * 3)*Math.pow(-1,Math.floor(Math.random() * 2));
			x=x%Math.ceil(game.getBoardSize()/2)+displace;
		}
		moves.push(x+" "+y);	
	}

	var missHandler = function(e){
		if(count%2==0){
			if(justHit){
				x=hitX;
				y=hitY;
				dir++;
			}
	}
	}

    game.registerEventHandler(SBConstants.TURN_CHANGE_EVENT,
			      				turnChangeHandler);
    game.registerEventHandler(SBConstants.HIT_EVENT,
			      				shipHitHandler);
    game.registerEventHandler(SBConstants.SHIP_SUNK_EVENT,
			      				shipHitHandler);
    game.registerEventHandler(SBConstants.MISS_EVENT,
			      				missHandler);


    this.giveUpKey = function() {
	return key;
    }
	
}
