
var WhiteWins = function(board, diagrams, status) {
	this._translation = {
		'wk': '&#9812;',	// White king
		'wq': '&#9813;',	// White queen
		'wb': '&#9815;',	// White bishop
		'wh': '&#9816;',	// White horse
		'wr': '&#9814;',	// White rook
		'wp': '&#9817;',	// White pawn
		'bk': '&#9818;',	// Black king
		'bq': '&#9819;',	// Black queen
		'bb': '&#9821;',	// Black bishop
		'bh': '&#9822;',	// Black horse
		'br': '&#9820;',	// Black rook
		'bp': '&#9823;',	// Black pawn
		
		// Inverted
		'♔':'wk',		// White king
		'♕':'wq',		// White queen
		'♗':'wb',		// White bishop
		'♘':'wh',		// White horse
		'♖':'wr',		// White rook
		'♙':'wp',		// White pawn
		'♚':'bk',		// Black king
		'♛':'bq',		// Black queen
		'♝':'bb',		// Black bishop
		'♞':'bh',		// Black horse
		'♜':'br',		// Black rook
		'♟':'bp'		// Black pawn
	};
	
	this._board = board;
	this._diagrams = diagrams;
	this._status = status;
	
	this._start = null;
	this._piece = '';
	
	var self = this;
	
	$.Each($.Dom.children(this._board, 'div', 'cell'), function(cell){
		$.Dom.addEvent(cell, 'click', function(){
			if (self._start) {
				var end = cell.getAttribute('data-coord');
				
				if (self._start == end) {
					// I'm in the same cell as start
					// Clear all
					self._start = null;
					self._piece = '';
					
					// Clear highlights
					$.Each($.Dom.select('.cell.highlight'), function(cell){
						$.Dom.removeClass(cell, 'highlight');
						$.Dom.removeClass(cell, 'player');
						$.Dom.removeClass(cell, 'opponent');
						$.Dom.removeClass(cell, 'start');
						$.Dom.removeClass(cell, 'end');
					});
					// Clear status bar
					self.writeStatus('', false);
				}
				else if(self.checkValidMove(self._piece.substring(1,2), self._start, end)){
					$.Dom.addClass(cell, 'highlight');
					$.Dom.addClass(cell, 'player');
					$.Dom.addClass(cell, 'end');
					
					if (self.check(self._start, end)) {
						// Right answer
						self.writeStatus('Correct answer', true);
					}
					else {
						// Wrong answer
						self.writeStatus('Wrong answer', false);
						
						// If possible suggest a move for the black
						$.Each(self._diagram.suggestions, function(byMove, move){
							if (move == self._start + end) {
								// Choose a random solution
								var solution = byMove[Math.floor(Math.random() * byMove.length)];
								
								// Highlight solution
								var opponentStartCell = $.Dom.select('.cell[data-coord="'+solution.start+'"]')[0];
								$.Dom.addClass(opponentStartCell, 'highlight');
								$.Dom.addClass(opponentStartCell, 'opponent');
								$.Dom.addClass(opponentStartCell, 'start');
								var opponentEndCell = $.Dom.select('.cell[data-coord="'+solution.end+'"]')[0];
								$.Dom.addClass(opponentEndCell, 'highlight');
								$.Dom.addClass(opponentEndCell, 'opponent');
								$.Dom.addClass(opponentEndCell, 'end');
								
								// Stop searching
								return false;
							}
							// Keep searching
							return true;
						});
					}
					self._start = null;
					self._piece = '';
				}
			}
			else {
				// Clear highlights
				$.Each($.Dom.select('.cell.highlight'), function(cell){
					$.Dom.removeClass(cell, 'highlight');
					$.Dom.removeClass(cell, 'player');
					$.Dom.removeClass(cell, 'opponent');
					$.Dom.removeClass(cell, 'start');
					$.Dom.removeClass(cell, 'end');
				});
				// Clear status bar
				self.writeStatus('', false);
				
				if(cell.innerHTML && !$.Dom.hasClass(cell, 'black')) {
					self._start = cell.getAttribute('data-coord');
					self._piece = self._translation[cell.innerHTML];
					// Add highlights
					$.Dom.addClass(cell, 'highlight');
					$.Dom.addClass(cell, 'player');
					$.Dom.addClass(cell, 'start');
				}
			}
		});
	});
};

WhiteWins.prototype.checkValidMove = function(piece, start, end) {
	var startX = parseInt(start.substring(0,1));
	var startY = parseInt(start.substring(1,2));
	var endX = parseInt(end.substring(0,1));
	var endY = parseInt(end.substring(1,2));
	
	// if end cell has white piece => not a valid move
	var endCell = $.Dom.select('.cell[data-coord="'+end+'"]')[0];
	if(this._translation[endCell.innerHTML] && this._translation[endCell.innerHTML][0] == 'w') {
		return false;
	}
	
	// TODO: if a piece is in the middle => not a valid move
	
	switch (piece) {
		case 'k':
			return Math.abs(startX - endX) <= 1 && Math.abs(startY - endY) <= 1
		case 'q':
			return (startX == endX || startY == endY) || (endY - endX == startY - startX) || (endY + endX ==  + startY + startX);
		case 'b':
			return (endY - endX == startY - startX) || (endY + endX ==  + startY + startX);
		case 'h':
			return (Math.abs(startX - endX) == 1 && Math.abs(startY - endY) == 2) || (Math.abs(startX - endX) == 2 && Math.abs(startY - endY) == 1);
		case 'r':
			return startX == endX || startY == endY;
		case 'p':
			return (endY - startY == 1 && Math.abs(startX - endX) <= 1) || (startY == 1 && endY == 3 && startX == endX);
		default:
			return false;
	}
}

WhiteWins.prototype.writeStatus = function(message, next) {
	var p = $.Dom.children(this._status, 'p')[0]
	if (message) {
		p.innerHTML = ''+message+'';
		if (next) {
			$.Dom.removeClass('index-nextdiagram', 'hidden');
		}
		else {
			$.Dom.addClass('index-nextdiagram', 'hidden');
		}
		$.Dom.removeClass(this._status, 'hidden');
	}
	else {
		$.Dom.addClass(this._status, 'hidden');
	}
};

WhiteWins.prototype.next = function() {
	var index = this._diagramIndex +1;
	if (index >= this._diagrams.length) {
		index = 0;
	}
	return index;
};

WhiteWins.prototype.loadDiagram = function(index) {
	index = parseInt(index);
	this._diagramIndex = index;
	this._diagram = this._diagrams[index];
	return this;
};

WhiteWins.prototype.clearBoard = function() {
	$.Each($.Dom.children(this._board, 'div', 'cell'), function(cell){
		cell.innerHTML = '';
		$.Dom.removeClass(cell, 'highlight');
		$.Dom.removeClass(cell, 'player');
		$.Dom.removeClass(cell, 'opponent');
		$.Dom.removeClass(cell, 'start');
		$.Dom.removeClass(cell, 'end');
	});
	return this;
};

WhiteWins.prototype.applyDiagram = function () {
	var self = this;
	$.Each(this._diagram.position, function(position){
		var pos = position.substring(0, 2);
		var piece = position.substring(2, 4);
		var cell = $.Dom.select('#board .cell[data-coord="'+pos+'"]')[0]; // TODO: use this._board
		cell.innerHTML = self._translation[piece];
		if (piece[0] == 'b') {
			// Is a black piece
			$.Dom.addClass(cell, 'black');
		}
	});
	return this;
};

WhiteWins.prototype.check = function(start, end) {
	return start == this._diagram.solution.start && end == this._diagram.solution.end;
};

WhiteWins.prototype.each = function(callback) {
	$.Each(this._diagrams, callback);
};
