// myTurn: switched after every move is complete
var myTurn = {
	curColor : 'white',                             // current color to play
	enColor : 'black',                              // current enemy color
	allMoves : [],                                  // board positions a selected piece can move to
	allJumps : []                                   // board positions a selected piece can jump to
};

$(document).ready(function() {
	setSide('keep');
});

// Set the correct color to be active for gameplay, with instruction string 'switch' or 'keep'
function setSide(instruction) {
	for (var i = 0; i < myTurn.allMoves.length; i++) {     // remove dotted lines for potential moves
		var newPos = myTurn.allMoves[i].toString();
		var posSelector = 'div.tile:nth-child(' + newPos + ') > :first-child';
		$(posSelector).removeClass('potentialMove');
	}

	for (var i = 0; i < myTurn.allJumps.length; i++) {     // remove dotted lines for potential jumps
		var newJump = myTurn.allJumps[i][0].toString();
		var jumpSelector = 'div.tile:nth-child(' + newJump + ') > :first-child';
		$(jumpSelector).removeClass('potentialJump');
	}

	if (instruction === 'switch') {                 // switch current and enemy colors, and title text
		if (myTurn.curColor === 'white') {
			myTurn.curColor = 'black';
			myTurn.enColor = 'white';
			$('.title').html('Let\'s Play Checkers. Black to play.');
		} else {
			myTurn.curColor = 'white';
			myTurn.enColor = 'black';
			$('.title').html('Let\'s Play Checkers. White to play.');
		}
	}

	myTurn.allMoves = [];                            // always reset moves
	myTurn.allJumps = [];                            // and jumps

	if (myTurn.curColor === 'white') {               // allow colors of current playing color to be clicked on
		$('.white.piece').addClass('turnPiece');       
		$('.black.piece').removeClass('turnPiece');	
	} else {
		$('.black.piece').addClass('turnPiece');
		$('.white.piece').removeClass('turnPiece');
	}
}

// Click one piece to see potential moves
$(document).on('click', '.turnPiece', function() {
	$('.turnPiece').removeClass('turnPiece');        // other pieces cannot be clicked on
	$(this).addClass('pickPiece');                   // clicked piece stays highlighted
	var position = 1 + $(this.parentNode).index();   // tile position is 1-indexed, from top-left to bottom-right                 
	myTurn.allMoves = findMoves(position);         
	showMoves();
	jumps(position);
});

// Return an array of tile positions a piece may move to, assuming the tiles are empty 
function findMoves(position) {
	if (myTurn.curColor === 'white') {               // white pieces move up the board (to a lower position)
		if (position < 8) {                          // white pieces in top row cannot move up
			return [];
		} else if (position % 16 === 0) {            // white pieces on far right may move only up and to the left
			return [position - 9];
		} else {                                     // other white pieces may move to two spaces
			return [position - 9, position - 7];
		}
	} else {                                         // black pieces move down the board (to a higher position)
		if (position > 57) {                         // black pieces in bottom row cannot move down
			return [];
		} else if (position % 16 === 1) {            // black pieces on far left may move only up and to the right
			return [position + 9];
		} else {                                     // other black pieces may move to two spaces
			return [position + 9, position + 7];
		}
	}
}

// Show potential moves for all empty tiles in myTurn.allMoves 
function showMoves() {
	for (var i = 0; i < myTurn.allMoves.length; i++) {
		var newPos = myTurn.allMoves[i].toString();
		var posSelector = 'div.tile:nth-child(' + newPos + ') > :first-child';
		if ($(posSelector).hasClass('ghost')) {
			$(posSelector).addClass('potentialMove');
		}
	}
}

// Determine and show possible jumps a selected piece can perform 
function jumps(position) {
	for (var i = 0; i < myTurn.allMoves.length; i++) {
		var newPos = myTurn.allMoves[i].toString();
		var posSelector = 'div.tile:nth-child(' + newPos + ') > :first-child';
		if (myTurn.curColor === 'white') {
			if ($(posSelector).hasClass('black')) {
				if (newPos % 16 === 0 || newPos % 16 === 1) {
					continue;
				} else if (newPos < 8) {
					continue;
				} else {
					var newJump = (newPos - (position - newPos));
					myTurn.allJumps.push([newJump, newPos]);
					var jumpSelector = 'div.tile:nth-child(' + newJump + ') > :first-child';
					if ($(jumpSelector).hasClass('ghost')) {
						$(jumpSelector).addClass('potentialJump');
					}
				}			
			}
		} else {
			if ($(posSelector).hasClass('white')) {
				if (newPos % 16 === 0 || newPos % 16 === 1) {
					continue;
				} else if (newPos > 57) {
					continue;
				} else {
					var newJump = ((2 * newPos) - position);
					myTurn.allJumps.push([newJump, newPos]);
					var jumpSelector = 'div.tile:nth-child(' + newJump + ') > :first-child';
					if ($(jumpSelector).hasClass('ghost')) {
						$(jumpSelector).addClass('potentialJump');
					}
				}			
			}
		}
	}
}

// Click an already clicked piece to deselect it
$(document).on('click', '.pickPiece', function() {
	$(this).removeClass('pickPiece');
	setSide('keep');
});

// Click on a potential move to realize the move
$(document).on('click', '.potentialMove', function() {
	$(this).removeClass('ghost');                              // Convert potential position to real piece
	$(this).addClass(myTurn.curColor)                           
	$('.pickPiece').removeClass(myTurn.curColor);              // Convert original piece to ghost piece
	$('.pickPiece').addClass('ghost');
	$('.pickPiece').removeClass('pickPiece');
	setSide('switch');
});

// Click on a potential jump to realize the jump
$(document).on('click', '.potentialJump', function() {
	$(this).removeClass('ghost');                              // Convert potential position to real piece
	$(this).addClass(myTurn.curColor);
	$('.pickPiece').removeClass(myTurn.curColor);              // Convert original piece to ghost piece
	$('.pickPiece').addClass('ghost');
	$('.pickPiece').removeClass('pickPiece');
	var jumpPos = 1 + $(this.parentNode).index();              // Final position must match with a myTurn.allJumps pair
	for (var i = 0; i < myTurn.allJumps.length; i++) { 
		if (myTurn.allJumps[i][0] === jumpPos) {               // Find correct enemy piece that was jumped
			var deadPiece = myTurn.allJumps[i][1].toString();
			var deadSelector = 'div.tile:nth-child(' + deadPiece + ') > :first-child';
			$(deadSelector).removeClass(myTurn.enColor);       // Convert jumped piece to ghost piece
			$(deadSelector).addClass('ghost');
		}
	}
	setSide('switch');
});