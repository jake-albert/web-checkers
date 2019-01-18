// myTurn: switched after every turn is complete
var myTurn = {
	curColor : 'white',                             // current color to play
	enColor : 'black',                              // current enemy color
	allMoves : [],                                  // board positions a selected piece can move to
	allJumps : [],                                  // board positions a selected piece can jump to
	whitePieces : 12,                               // current number of white pieces
	blackPieces : 12 ,                              // current number of black pieces
};

$(document).ready(function() {
	setSide('keep');
});

// Update the score of the game after one enemy piece is removed, and notify if the game is over
function updateScoreAfterJump() {

	if (myTurn.curColor === 'white') {
		if (myTurn.blackPieces === 1) {
			$('.title').html('White wins. Refresh to play again.');
			myTurn.curColor = 'gameOver';
		} else {
			myTurn.blackPieces--;
		}
	} else {
		if (myTurn.whitePieces === 1) {
			$('.title').html('Black wins. Refresh to play again.');
			myTurn.curColor = 'gameOver';
		} else {
			myTurn.whitePieces--;
		}
	}
}

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

	if (myTurn.curColor === 'gameOver') {
		return;
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

	if (instruction !== 'jump') {                        // as long as we are not checking for multiple jumps,
		if (myTurn.curColor === 'white') {               // allow colors of current playing color to be clicked on
			$('.white.piece').addClass('turnPiece');       
			$('.black.piece').removeClass('turnPiece');	
		} else {
			$('.black.piece').addClass('turnPiece');
			$('.white.piece').removeClass('turnPiece');
		}
	}
}

// Click one piece to see potential moves
$(document).on('click', '.turnPiece', function() {
	$('.turnPiece').removeClass('turnPiece');           // other pieces cannot be clicked on
	$(this).addClass('pickPiece');                      // clicked piece stays highlighted
	var position = 1 + $(this.parentNode).index();      // tile position is 1-indexed, from top-left to bottom-right  
	if ($(this).hasClass(myTurn.curColor + '_king')) {  // find moves for piece, accounting for its kingness
		findMoves(position, true);         
	} else {
		findMoves(position, false);         
	}
	showMoves();
	jumps(position);
});

// Update allMoves to contain tile positions a piece would be able to move to, assuming all tiles are empty 
function findMoves(position, isItKing) {

	// white pieces and kings not in the top row may move up the board (to a lower position)
	if ((position > 8) && (myTurn.curColor === 'white' || isItKing)) { 
		if (position % 16 === 0) {                   // pieces on far right may move up by going to the left
			myTurn.allMoves.push(position - 9);
		} else {                                     // other pieces may move up to either of two spaces
			myTurn.allMoves.push(position - 9);
			myTurn.allMoves.push(position - 7);
		}
	} 

	// black pieces and kings not in the bottom row may move down the board (to a higher position)
	if ((position < 57) && (myTurn.curColor === 'black' || isItKing)) {                                       
		if (position % 16 === 1) {                   // pieces on far left may move down only by going to the right
			myTurn.allMoves.push(position + 9);
		} else {                                     // other pieces may move down to either of two spaces
			myTurn.allMoves.push(position + 9);
			myTurn.allMoves.push(position + 7);
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
		if ((myTurn.curColor === 'white' && $(posSelector).hasClass('black')) ||
			(myTurn.curColor === 'black' && $(posSelector).hasClass('white'))) {
			if (newPos % 16 === 0 || newPos % 16 === 1) {
				continue;
			} else if (newPos < 8 || newPos > 57) {
				continue;
			} else {
				if (position > newPos) {
					var newJump = (newPos - (position - newPos)); 
				} else {
					var newJump = ((2 * newPos) - position);
				}
				var jumpSelector = 'div.tile:nth-child(' + newJump + ') > :first-child';
				if ($(jumpSelector).hasClass('ghost')) {
					myTurn.allJumps.push([newJump, newPos]);
					$(jumpSelector).addClass('potentialJump');
				}
			}			
		}
	}
}

// Click an already clicked piece to deselect it
$(document).on('click', '.pickPiece', function() {
	if ($(this).hasClass('multiJump')) {                      // Switch to other side if not doing an additional jump
		$(this).removeClass('multiJump');
		$(this).removeClass('pickPiece');
		setSide('switch');
	} else {                                                  // Otherwise allow for more selections    
		$(this).removeClass('pickPiece');
		setSide('keep');
	}
});

// Click on a potential move to realize the move
$(document).on('click', '.potentialMove', function() {
	$(this).removeClass('ghost');                              // Convert potential position to real piece
	$(this).addClass(myTurn.curColor);
    var kingTest = 1 + $(this.parentNode).index();             // Turn new piece to king if in top or bottom row.
    if (kingTest < 8 || kingTest > 56) {
   		$(this).addClass(myTurn.curColor + '_king');
	} 
    if ($('.pickPiece').hasClass(myTurn.curColor + '_king')) { // Turn new piece to king if original piece was king.
    	$(this).addClass(myTurn.curColor + '_king');
    } 
	$('.pickPiece').removeClass(myTurn.curColor);              // Convert original piece to ghost piece
	$('.pickPiece').addClass('ghost');
    $('.pickPiece').removeClass(myTurn.curColor + '_king')
	$('.pickPiece').removeClass('pickPiece');
	setSide('switch');
});

// Click on a potential jump to realize the jump
$(document).on('click', '.potentialJump', function() {
	$(this).removeClass('ghost');                              // Convert potential position to real piece
	$(this).addClass(myTurn.curColor);
	var kingTest = 1 + $(this.parentNode).index();             // Turn new piece to king if in top or bottom row.
    var justKinged = false;
    if (kingTest < 8 || kingTest > 56) {
   		$(this).addClass(myTurn.curColor + '_king');
    	if (!($('.pickPiece').hasClass(myTurn.curColor + '_king'))) {
    		var justKinged = true;
    	}
	} 
	if ($('.pickPiece').hasClass(myTurn.curColor + '_king')) { // Turn new piece to king if original piece was king.
    	$(this).addClass(myTurn.curColor + '_king');
    } 
	$('.pickPiece').removeClass(myTurn.curColor);              // Convert original piece to ghost piece
	$('.pickPiece').addClass('ghost');
	$('.pickPiece').removeClass(myTurn.curColor + '_king');
	$('.pickPiece').removeClass('multiJump');
	$('.pickPiece').removeClass('pickPiece');
	var jumpPos = 1 + $(this.parentNode).index();              // Final position must match with a myTurn.allJumps pair
	for (var i = 0; i < myTurn.allJumps.length; i++) { 
		if (myTurn.allJumps[i][0] === jumpPos) {               // Find correct enemy piece that was jumped
			var deadPiece = myTurn.allJumps[i][1].toString();
			var deadSelector = 'div.tile:nth-child(' + deadPiece + ') > :first-child';
			$(deadSelector).removeClass(myTurn.enColor);       // Convert jumped piece to ghost piece
			$(deadSelector).removeClass(myTurn.enColor + '_king');
			$(deadSelector).addClass('ghost');
			updateScoreAfterJump();
		}
	}

	setSide('jump');

	if (myTurn.curColor !== 'gameOver') {
		if ($(this).hasClass(myTurn.curColor + '_king')) {  
			findMoves(jumpPos, true);         
		} else {
			findMoves(jumpPos, false);         
		}
		jumps(jumpPos);
		if (myTurn.allJumps.length === 0 || justKinged) {
			setSide('switch');
		} else {
			$(this).addClass('pickPiece');
			$(this).addClass('multiJump');
		}
	}

});