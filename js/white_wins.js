
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
		'bp': '&#9823;'		// Black pawn
	};
	
	this._board = board;
	this._diagrams = diagrams;
	this._status = status;
	
	this._start = null;
	
	var self = this;
	
	$.Each($.Dom.children(this._board, 'div', 'cell'), function(cell){
		$.Dom.addEvent(cell, 'click', function(){
			if (self._start) {
				var end = cell.getAttribute('data-coord');
				
				if (self._start == end) {
					// I'm in the same cell as start
					// Clear all
					self._start = null;
					
					// Clear highlights
					$.Each($.Dom.select('.cell.highlight'), function(cell){
						$.Dom.removeClass(cell, 'highlight');
						$.Dom.removeClass(cell, 'player');
						$.Dom.removeClass(cell, 'opponent');
						$.Dom.removeClass(cell, 'start');
						$.Dom.removeClass(cell, 'end');
					});
					// Clear status bar
					self.writeStatus('');
				}
				else {
					// TODO: check if it's a right move
					
					$.Dom.addClass(cell, 'highlight');
					$.Dom.addClass(cell, 'player');
					$.Dom.addClass(cell, 'end');
					
					if (self.check(self._start, end)) {
						// Right answer
						self.writeStatus('Right answer');
					}
					else {
						// Wrong answer
						self.writeStatus('Wrong answer');
						
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
				self.writeStatus('');
				
				if(cell.innerHTML && !$.Dom.hasClass(cell, 'black')) {
					self._start = cell.getAttribute('data-coord');
					// Add highlights
					$.Dom.addClass(cell, 'highlight');
					$.Dom.addClass(cell, 'player');
					$.Dom.addClass(cell, 'start');
				}
			}
		});
	});
};

WhiteWins.prototype.writeStatus = function(message) {
	if (message) {
		this._status.innerHTML = '<p>'+message+'</p>';
		$.Dom.removeClass(this._status, 'hidden');
	}
	else {
		setTimeout(function(){
			this._status.innerHTML = '';
		}, 400);
		$.Dom.addClass(this._status, 'hidden');
	}
};

WhiteWins.prototype.loadDiagram = function(index) {
	this._diagramIndex = index;
	this._diagram = this._diagrams[index];
	return this;
};

WhiteWins.prototype.clearBoard = function() {
	$.Each($.Dom.children(this._board, 'div', 'cell'), function(cell){
		cell.innerHTML = '';
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
}
