$(document).ready(function () {
    var boardSize=25; var turnLimit=350; var count=0;
    var array=newGame({"boardSize": boardSize, "turnLimit": turnLimit});
    var game=array[0]; var player=array[1]; var activeShip="";

    $("#grid").on('click',"td" , function(e) {
        var x = e.target.cellIndex;
        var y = e.target.parentNode.rowIndex;
        var cell = game.queryLocation(player.getKey(), x, y);
        var ship = cell.ship;
        if(ship!=null&&ship.isMine(player.getKey())){
            activeShip=ship.getName();
        }
        else{
            player.shootAt(x,y);
        }
    });

    $("html").on("keydown", function(e){
        if(activeShip!=""){
            if (e.keyCode == '38') {
                e.preventDefault();
                player.moveForward(activeShip);
            }
            else if (e.keyCode == '40') {
                e.preventDefault();
                player.moveBackward(activeShip);
            }
            else if (e.keyCode == '37') {
                e.preventDefault();
                player.rotateCW(activeShip);
            }
            else if (e.keyCode == '39') {
                e.preventDefault();
                player.rotateCCW(activeShip);
            }
        }    
    });

    $("button").click( function(e){
        var move = $(this).attr('id');
        if(move=="forward"){
            player.moveForward(activeShip);
        }else if(move=="backward"){
            player.moveBackward(activeShip);
        }else if(move=="CW"){
            player.rotateCW(activeShip);
        }else if(move=="CCW"){
            player.rotateCCW(activeShip);
        }else if(move=="reset"){
            var array=newGame({"boardSize": boardSize, "turnLimit": turnLimit});
            game =array[0]; player =array[1]; count=0;
            activeShip=""; redraw(game, mapDrawHandler);
        }else if(move=="settings"){
            var temp = {
                state0: {
                    html: 'Board Size: <input type="range" name="size" id="sinput" value='+boardSize+' min="16" max="75" oninput="soutput.value = sinput.value">'+
                    '<output name="display" id="soutput">'+boardSize+'</output><br>'+
                    'Turn Limit: <input type="range" name="turns" id="tinput" value="350" min="0" max="500" step="25" oninput="toutput.value = tinput.value">'+
                    '<output name="display" id="toutput">350</output><br>'+
                    'Miss Age: <input type="range" name="miss" id="minput" value="10" min="0" max="100" step="5" oninput="moutput.value = minput.value">'+
                    '<output name="display" id="moutput">10</output><br>'+
                    'Rear View Distance: <input type="range" name="viewDistance" id="vinput" value="2" min="0" max='+boardSize +' oninput="voutput.value = vinput.value">'+
                    '<output name="display" id="voutput">2</output><br>',
                    buttons: {Ok: 1 },
                    focus: 1,
                    submit:function(e,v,m,f){ }
                }
            }
            $.prompt(temp,{
                    close: function(e,v,m,f){
                        if(v !== undefined){
                            boardSize=parseInt(f["size"]);
                            var missAge=parseInt(f["miss"]);
                            turnLimit=parseInt(f["turns"]);
                            var rearViewDistance=parseInt(f["viewDistance"]);
                            var array=newGame({"boardSize": boardSize, "missAge": missAge,
                                                "turnLimit": turnLimit, "rearViewDistance": rearViewDistance});
                            game =array[0]; player=array[1]; count=0;
                            activeShip="";
                            redraw(game, mapDrawHandler);
                        }
                    }
                });
        }else if(move=="info"){
                $.prompt("Attack enemy ships by clicking on the board. Ship movement rests on the concept of an \"active ship\". When you click on one of your own ships or click one of the ship buttons,"+
                    "that becomes your \"active ship\", and then you can use the movement buttons which appear or the arrow keys to move your ship around the board."+
                    "When one of your ships is sunk, the color of the button turns red, meaning the blue ship buttons represent "+
                    "the ships you have left. The \"Reset\" button starts a new game and the \"Change Game Settings\" button allows you to adjust "+ 
                    "the board size, amount of turns, the amount of turns that misses stay on the board, and the distance that ships can see behind them.");
            }else{
            shipPress(move);
        }     
    });

    var shipPress = function(ship){
        $('#buttons').show();
        if(activeShip!=""){
            $('#'+activeShip).toggleClass("active");
        }
        activeShip=ship;
        $('#'+activeShip).toggleClass("active");
    }

    var mapDrawHandler = function() {  
        count++;
        if(count==turnLimit){
            $.prompt("Ran out of moves. Game is a tie.");
        }
        for (var y=0; y<game.getBoardSize(); y++) {
            for (var x=0; x<game.getBoardSize(); x++) {
                var sqr = game.queryLocation(player.getKey(), x, y);
                var block = $('#grid')[0].rows[y].cells[x];
                switch (sqr.type) {
                    case "miss":
                        $(block).attr('data_cell', "miss");
                        break;
                    case "p1":
                        if (sqr.state == SBConstants.OK) {
                            $(block).attr('data_cell', "p1OK");
                        } else {
                            $(block).attr('data_cell', "p1Hit");
                        }
                        break;
                    case "p2":
                        if (sqr.state == SBConstants.OK) {
                            $(block).attr('data_cell', "p2OK");
                        } else {
                            $(block).attr('data_cell', "p2Hit");
                        }
                        break;
                    case "empty":
                        $(block).attr('data_cell', "empty");
                        break;
                    case "invisible":
                        $(block).attr('data_cell', "invisible");
                        break;
                }
            }
        }
    };
    redraw(game, mapDrawHandler);
});

var redraw = function(game, method){
    game.registerEventHandler(SBConstants.TURN_CHANGE_EVENT,
                  method);
    method();
}

var newGame = function(custom_options){
    var game= new SuperBattleship(custom_options);
    var player_one = new Player(game, true);
    var ai_player_two = new bwproudAI(game, false);
    var height=width=custom_options['boardSize'];
    boardGen(width,height);
    game.startGame();
    return [game,player_one];
}


var boardGen = function(width, height){
    $("#grid").empty();
    $('#buttons').hide();
    resetShips();
    for(i=0; i<height; i++){
        var row=$("<tr></tr>")
        for(j=0;j<width;j++){
            var cell = $("<td></td>");
            row.append(cell);
        }
        $("#grid").append(row);
    }
}


var resetShips= function(){
    $("#Destroyer").css( "background-color", "");
    $("#Destroyer").css( "color", "");
    $("#Submarine").css( "background-color", "");
    $("#Submarine").css( "color", "");
    $("#Cruiser").css( "background-color", "");
    $("#Cruiser").css( "color", "");
    $("#Battleship").css( "background-color", "");
    $("#Battleship").css( "color", "");
    $("#Carrier").css( "background-color", "");
    $("#Carrier").css( "color", "");
};
