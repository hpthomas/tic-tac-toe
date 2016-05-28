"use strict";

var board = {
  start_game: function start_game(choice, players) {
    document.getElementById("prompt").className = "hidden";
    this.status = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    this.active = "X";
    this.player = choice;
    this.players = players;
    this.won = false; //remember if game is over to prevent extra clicks
    this.update_board();
    if (choice == 'O') {
      this.AI();
    }
  },
  prompt: function prompt(message) {
    //removes 'display:none' on prompt to show prompt & buttons
    document.getElementById("message").innerText = message ? message : "New Game!";
    document.getElementById("prompt").className = "";
  },
  play: function play(row, col, from_AI) {
    if (this.status[row][col] || this.won) {
      //exit if clicked on a taken square, or game is over
      return;
    }
    //reqire from_AI parameter if it's not player's turn in 1 player mode
    if (this.players == 1 && !from_AI && this.player != this.active) {
      return;
    }
    this.status[row][col] = this.active; //add play to the board
    this.active = this.active == "X" ? "O" : "X"; //toggle active player
    this.update_board();
    if (this.check()) {
      //check for a winner
      return; //avoid launching AI if game is over
    }
    if (this.players == 1 && this.player != this.active) {
      setTimeout(this.AI.bind(this), 500); //AI has to be bound to 'this' object to access board
    }
  },
  AI: function AI() {
    //winning_AI is an external function that recieves a board and player, returns move to play
    var optimal = winning_AI(this.status, this.active);
    this.play(optimal[0], optimal[1], true);
  },
  check: function check() {
    //calls external 'score' function
    var result = score(this.status);
    if (result.winner) {
      this.win(result.winner, result.winning_row);
      return true;
    } else if (this.status[0].indexOf(0) == -1 && this.status[1].indexOf(0) == -1 && this.status[2].indexOf(0) == -1) {
      //tie game
      this.prompt("Tie Game");
      return true;
    }
    return false;
  },
  win: function win(winner, coords) {
    var _this = this;

    this.won = true;
    var winning_elements = [];
    coords.map(function (pair) {
      var ele = document.getElementById("r" + pair[0] + "c" + pair[1]);
      ele.classList.add("win");
      winning_elements.push(ele);
    });
    //pause for 2 seconds, then remove red highlight and prompt again:
    setTimeout(function () {
      winning_elements.map(function (ele) {
        return ele.className = "square";
      });
      _this.prompt(winner + " Wins!");
    }, 2000);
  },
  init: function init() {
    var _this2 = this;

    var squares = document.getElementsByClassName("square");

    [].map.call(squares, function (square) {
      square.addEventListener("click", board.play.bind(board, square.id[1], square.id[3], false));
    });

    document.getElementById("play_x").addEventListener("click", function () {
      return _this2.start_game("X", 1);
    });
    document.getElementById("play_o").addEventListener("click", function () {
      return _this2.start_game("O", 1);
    });
    document.getElementById("play_two").addEventListener("click", function () {
      return _this2.start_game("X", 2);
    });
  },

  update_board: function update_board() {
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var value = this.status[i][j] ? this.status[i][j] : "";
        document.getElementById("r" + i + "c" + j).innerText = value;
      }
    }
  }
};
function score(board) {
  /*Scores the board in its current state
  If there's 2 in a row and an empty slot, it records the empty square
  in X_threats or O_threats -  need to remember 
  threats to later block opponent forks. */
  var ret = {
    winner: 0,
    winning_row: 0,
    X_threats: [],
    O_threats: []
  };
  var D1 = [board[0][0], board[1][1], board[2][2]]; //top-left to bottom-right diagonal
  var D2 = [board[2][0], board[1][1], board[0][2]]; //bottom-left to top right diagonal
  var D1_Xs = D1.filter(function (ele) {
    return ele == 'X';
  }).length; //count of Xs in D1
  var D1_Os = D1.filter(function (ele) {
    return ele == 'O';
  }).length; //Os in D1
  var D2_Xs = D2.filter(function (ele) {
    return ele == 'X';
  }).length; //Xs in D2
  var D2_Os = D2.filter(function (ele) {
    return ele == 'O';
  }).length; //Os in D2
  if (D1_Xs == 2 && !D1_Os) {
    //X has a threat (2-in-a-row)
    switch (D1.indexOf(0)) {
      case 0:
        ret.X_threats.push([0, 0]);break;
      case 1:
        ret.X_threats.push([1, 1]);break;
      case 2:
        ret.X_threats.push([2, 2]);break;
    }
  }
  if (D2_Xs == 2 && !D2_Os) {
    //X threat
    switch (D2.indexOf(0)) {
      case 0:
        ret.X_threats.push([2, 0]);break;
      case 1:
        ret.X_threats.push([1, 1]);break;
      case 2:
        ret.X_threats.push([0, 2]);break;
    }
  }
  if (D1_Os == 2 && !D1_Xs) {
    //O threat
    switch (D1.indexOf(0)) {
      case 0:
        ret.O_threats.push([0, 0]);break;
      case 1:
        ret.O_threats.push([1, 1]);break;
      case 2:
        ret.O_threats.push([2, 2]);break;
    }
  }
  if (D2_Os == 2 && !D2_Xs) {
    //O threat
    switch (D2.indexOf(0)) {
      case 0:
        ret.O_threats.push([2, 0]);break;
      case 1:
        ret.O_threats.push([1, 1]);break;
      case 2:
        ret.O_threats.push([0, 2]);break;
    }
  }
  if (D1_Xs == 3 || D1_Os == 3) {
    ret.winner = D1[0];
    ret.winning_row = [[0, 0], [1, 1], [2, 2]];
    return ret;
  } else if (D2_Xs == 3 || D2_Os == 3) {
    ret.winner = D2[0];
    ret.winning_row = [[2, 0], [1, 1], [0, 2]];
    return ret;
  }
  for (var i = 0; i < 3; i++) {
    var row = board[i];
    var col = [board[0][i], board[1][i], board[2][i]];
    var row_Xs = row.filter(function (ele) {
      return ele == 'X';
    }).length;
    var row_Os = row.filter(function (ele) {
      return ele == 'O';
    }).length;
    if (row_Xs == 2 && !row_Os) {
      ret.X_threats.push([i, row.indexOf(0)]);
    }
    if (row_Os == 2 && !row_Xs) {
      ret.O_threats.push([i, row.indexOf(0)]);
    }
    var col_Xs = col.filter(function (ele) {
      return ele == 'X';
    }).length;
    var col_Os = col.filter(function (ele) {
      return ele == 'O';
    }).length;
    if (col_Xs == 2 && !col_Os) {
      ret.X_threats.push([col.indexOf(0), i]);
    }
    if (col_Os == 2 && !col_Xs) {
      ret.O_threats.push([col.indexOf(0), i]);
    }
    if (row_Xs == 3 || row_Os == 3) {
      ret.winner = row[0];
      ret.winning_row = [[i, 0], [i, 1], [i, 2]];
      return ret;
    }
    if (col_Xs == 3 || col_Os == 3) {
      ret.winner = col[0];
      ret.winning_row = [[0, i], [1, i], [2, i]];
      return ret;
    }
  }
  return ret;
}
function winning_AI(board, player) {
  /* Play every open position as 'X' and as 'O'.
  Remember wins (to play), losses (to block), forks (to play if no wins/blocks), 
  opponent_forks(to block if we can't fork), and threats (to help block opponent forks).
  Every play mutates the board and calls check(), then returns it to how it was. */
  var opponent = player == 'X' ? 'O' : 'X';
  var wins = [],
      forks = [],
      blocks = [],
      threats = [],
      opponent_forks = [],
      result;
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      if (!board[i][j]) {
        board[i][j] = player; //play as player
        result = score(board); //get result
        if (result.winner == player) {
          //we have a win. could return here
          wins.push([i, j]);
        } else if (result[player + "_threats"].length > 1) {
          //if player_threats > 1, we have a fork
          forks.push([i, j]);
        } else if (result[player + "_threats"].length == 1) {
          //if there's only one threat, remember [i,j] as the move to play,
          //and remember the pair returned from score() as the 'target' -
          //where opponent must move if we play that threat. We need this to block a fork.
          threats.push({ move: [i, j], target: result[player + "_threats"][0] });
        }
        board[i][j] = opponent; //play as opponent
        result = score(board);
        if (result.winner == opponent) {
          //squares where opponent can win == squares where player can block
          blocks.push([i, j]);
        } else if (result[opponent + "_threats"].length > 1) {
          //remember squares where opponent can fork, so player can block them
          opponent_forks.push([i, j]);
        }
        board[i][j] = 0; //board[i][j] was originally 0, restore it
      }
    }
  }
  if (wins.length > 0) {
    //win if we found any
    console.log("winner: ", wins[0]);
    return wins[0];
  } else if (blocks.length > 0) {
    //block opponent wins
    console.log("block: ", blocks[0]);
    return blocks[0];
  } else if (forks.length > 0) {
    //fork if we found any
    console.log("Fork: ", forks[0]);
    return forks[0];
  }
  //block opponent fork:
  else if (opponent_forks.length == 1) {
      console.log("fork block:");
      return opponent_forks[0];
    } else if (opponent_forks.length > 1) {
      //for each object in threats:
      for (var i = 0; i < threats.length; i++) {
        //see if object.target is NOT one of opponent's fork plays:
        var ok = true;
        for (var j = 0; j < opponent_forks.length; j++) {
          if (threats[i].target.toString() == opponent_forks[j].toString()) {
            ok = false;
          }
        }
        //if it's not, threats[i] will force opponent to move somewhere that doesn't cause a fork
        if (ok) {
          console.log("fork block");
          return threats[i].move;
        }
      }
      //if we get here, fork can't be blocked. should be impossible.
      return threats[0];
    }
    //play the center
    else if (!board[1][1]) {
        return [1, 1];
      }
      //if there's an open corner across from opponent's square, play it:
      else if (!board[0][0] && board[2][2] == opponent) {
          return [0, 0];
        } else if (!board[2][2] && board[0][0] == opponent) {
          return [2, 2];
        } else if (!board[0][2] && board[2][0] == opponent) {
          return [0, 2];
        } else if (!board[2][0] && board[0][2] == opponent) {
          return [2, 0];
        }
  //then play any corner, then any edge:
  var prefs = [[0, 0], [0, 2], [2, 0], [2, 2], [0, 1], [1, 0], [1, 2], [2, 1]];
  return prefs.filter(function (pair) {
    return board[pair[0]][pair[1]] == '0';
  })[0];
}
window.onload = function () {
  board.init();
};