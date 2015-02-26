
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
	
	this._solved = $.Storage.get('solved') || [];
	
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
					self.writeStatus('', '', ['status-ok', 'status-ko']);
				}
				else if(self.checkValidMove(self._piece.substring(1,2), self._start, end)){
					$.Dom.addClass(cell, 'highlight');
					$.Dom.addClass(cell, 'player');
					$.Dom.addClass(cell, 'end');
					
					if (self.check(self._start, end)) {
						// Right answer
						self.writeStatus('Correct answer', 'status-ok', 'status-ko');
						self.setSolvedDiagram();
						$.Dom.fireEvent(window, 'solved-diagram', {'detail': {
							'key': self._diagramIndex
						}});
					}
					else {
						// Wrong answer
						self.writeStatus('Wrong answer', 'status-ko', 'status-ok');
						
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
				self.writeStatus('', '', ['status-ok', 'status-ko']);
				
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
	
	$.Dom.addEvent('index', 'click', function(event){
		if (event.target.id == 'index') {
			// Clear highlights
			$.Each($.Dom.select('.cell.highlight'), function(cell){
				$.Dom.removeClass(cell, 'highlight');
				$.Dom.removeClass(cell, 'player');
				$.Dom.removeClass(cell, 'opponent');
				$.Dom.removeClass(cell, 'start');
				$.Dom.removeClass(cell, 'end');
			});
			self.writeStatus('', '', ['status-ok', 'status-ko']);
		}
	});
};

WhiteWins.prototype.checkValidMove = function(piece, start, end) {
	var startX = parseInt(start.substring(0,1));
	var startY = parseInt(start.substring(1,2));
	var endX = parseInt(end.substring(0,1));
	var endY = parseInt(end.substring(1,2));
	
	// Empty board check
	var valid_end = false;
	switch (piece) {
		case 'k':
			valid_end = (Math.abs(startX - endX) <= 1 && Math.abs(startY - endY) <= 1) ||
				(startX == 4 && startY == 0 && ((endX == 2 && endY == 0) || (endX == 6 && endY == 0)));
			break;
		case 'q':
			valid_end = (startX == endX || startY == endY) || (endY - endX == startY - startX) || (endY + endX ==  + startY + startX);
			break;
		case 'b':
			valid_end = (endY - endX == startY - startX) || (endY + endX ==  + startY + startX);
			break;
		case 'h':
			valid_end = (Math.abs(startX - endX) == 1 && Math.abs(startY - endY) == 2) || (Math.abs(startX - endX) == 2 && Math.abs(startY - endY) == 1);
			break;
		case 'r':
			valid_end = startX == endX || startY == endY;
			break;
		case 'p':
			valid_end = (endY - startY == 1 && Math.abs(startX - endX) <= 1) || (startY == 1 && endY == 3 && startX == endX);
			break;
	}
	if (!valid_end) {
		return false;
	}
	
	// End on white check
	var valid_white_end = false;
	var endCell = $.Dom.select('.cell[data-coord="'+end+'"]')[0];
	if(this._translation[endCell.innerHTML] && this._translation[endCell.innerHTML][0] == 'w') {
		valid_white_end = false;
	}
	else {
		valid_white_end = true;
	}
	
	// Limited movements
	var valid_limited_movements = false;
	switch (piece) {
		case 'q':
			valid_limited_movements = true;
			if (startX == endX) {
				for (var i=Math.min(startY,endY)+1; i<Math.max(startY,endY); i++) {
					if ($.Dom.select('.cell[data-coord="'+startX+i+'"]')[0].innerHTML) {
						valid_limited_movements = false;
						break;
					}
				}
			}
			else if(startY == endY){
				for (var i=Math.min(startX,endX)+1; i<Math.max(startX,endX); i++) {
					if ($.Dom.select('.cell[data-coord="'+i+startY+'"]')[0].innerHTML) {
						valid_limited_movements = false;
						break;
					}
				}
			}
			else {
				for (var i=Math.min(startX,endX)+1,j=Math.min(startY,endY)+1; i<Math.max(startX,endX); i++,j++){
					if ($.Dom.select('.cell[data-coord="'+i+j+'"]')[0].innerHTML) {
						valid_limited_movements = false;
						break;
					}
				}
			}
			break;
		case 'b':
			valid_limited_movements = true;
			for (var i=Math.min(startX,endX)+1,j=Math.min(startY,endY)+1; i<Math.max(startX,endX); i++,j++){
				if ($.Dom.select('.cell[data-coord="'+i+j+'"]')[0].innerHTML) {
					valid_limited_movements = false;
					break;
				}
			}
			break;
		case 'r':
			valid_limited_movements = true;
			if (startX == endX) {
				for (var i=Math.min(startY,endY)+1; i<Math.max(startY,endY); i++) {
					if ($.Dom.select('.cell[data-coord="'+startX+i+'"]')[0].innerHTML) {
						valid_limited_movements = false;
						break;
					}
				}
			}
			else if(startY == endY){
				for (var i=Math.min(startX,endX)+1; i<Math.max(startX,endX); i++) {
					if ($.Dom.select('.cell[data-coord="'+startY+i+'"]')[0].innerHTML) {
						valid_limited_movements = false;
						break;
					}
				}
			}
			else {
				valid_limited_movements = false;
			}
			break;
		case 'p':
			if (startX == endX) {
				valid_limited_movements = $.Dom.select('.cell[data-coord="'+startX+(startY+1)+'"]')[0].innerHTML == '';
				if(endY == startY + 2) {
					valid_limited_movements = valid_limited_movements && $.Dom.select('.cell[data-coord="'+startX+(startY+2)+'"]')[0].innerHTML == '';
				}
			}
			else {
				var endCell = $.Dom.select('.cell[data-coord="'+end+'"]')[0];
				valid_limited_movements = (endCell.innerHTML == '' && startY == 4) || (endCell.innerHTML != '' && this._translation[endCell.innerHTML][0] == 'b');
			}
			break;
		case 'h':
		case 'k':
			valid_limited_movements = true;
			break;
	}
	if (!valid_limited_movements) {
		return false;
	}
	
	// Uncover white king
	// TODO: considerare la posizione finale del pezzo mosso. Ci possono essere tanti casi, il pezzo e' solo mosso, il pezzo mangia (magari en-passant), ...
	var valid_uncover_king = false;
	var whiteKingX;
	var whiteKingY;
	$.Each($.Dom.select('.cell'), function(cell){
		if (cell.innerHTML == '♔') {
			whiteKingX = cell.getAttribute('data-coord')[0];
			whiteKingY = cell.getAttribute('data-coord')[1];
			return false;
		}
		return true;
	});
	for (var i=parseInt(whiteKingX)+1; i<8; i++) {
		iCell = $.Dom.select('.cell[data-coord="'+i+whiteKingY+'"]')[0];
		if (iCell.innerHTML == '♛' || iCell.innerHTML == '♜') {
			if (endX == i && endY == j) {
				valid_uncover_king = true;
			}
			else {
				valid_uncover_king = false;
			}
			break;
		}
		else if (iCell.innerHTML == '') {}
		else if(i!=whiteKingX || j!=whiteKingY) {
			valid_uncover_king = true;
			break;
		}
	}
	if (valid_uncover_king) {
		for (var i=parseInt(whiteKingX)-1; i>=0; i--) {
			iCell = $.Dom.select('.cell[data-coord="'+i+whiteKingY+'"]')[0];
			if (iCell.innerHTML == '♛' || iCell.innerHTML == '♜') {
				if (endX == i && endY == j) {
					valid_uncover_king = true;
				}
				else {
					valid_uncover_king = false;
				}
				break;
			}
			else if (iCell.innerHTML == '') {}
			else if(i!=whiteKingX || j!=whiteKingY) {
				valid_uncover_king = true;
				break;
			}
		}
	}
	if (valid_uncover_king) {
		for (var j=parseInt(whiteKingY)+1; j<8; j++) {
			jCell = $.Dom.select('.cell[data-coord="'+whiteKingX+j+'"]')[0];
			if (jCell.innerHTML == '♛' || jCell.innerHTML == '♜') {
				if (endX == i && endY == j) {
					valid_uncover_king = true;
				}
				else {
					valid_uncover_king = false;
				}
				break;
			}
			else if (jCell.innerHTML == '') {}
			else if(i!=whiteKingX || j!=whiteKingY) {
				valid_uncover_king = true;
				break;
			}
		}
	}
	if (valid_uncover_king) {
		for (var j=parseInt(whiteKingY)-1; j>=0; j--) {
			jCell = $.Dom.select('.cell[data-coord="'+whiteKingX+j+'"]')[0];
			if (jCell.innerHTML == '♛' || jCell.innerHTML == '♜') {
				if (endX == i && endY == j) {
					valid_uncover_king = true;
				}
				else {
					valid_uncover_king = false;
				}
				break;
			}
			else if (jCell.innerHTML == '') {}
			else if(i!=whiteKingX || j!=whiteKingY) {
				valid_uncover_king = true;
				break;
			}
		}
	}
	if (valid_uncover_king) {
		for (var i=parseInt(whiteKingX)+1,j=parseInt(whiteKingY)+1; i<8&&j<8; i++,j++) {
			ijCell = $.Dom.select('.cell[data-coord="'+i+j+'"]')[0];
			if (ijCell.innerHTML == '♛' || ijCell.innerHTML == '♝') {
				if (endX == i && endY == j) {
					valid_uncover_king = true;
				}
				else {
					valid_uncover_king = false;
				}
				break;
			}
			else if (ijCell.innerHTML == '' || ((i==startX) && (j==startY))) {}
			else {
				valid_uncover_king = true;
				break;
			}
		}
	}
	if (valid_uncover_king) {
		for (var i=parseInt(whiteKingX)-1,j=parseInt(whiteKingY)+1; i>=0&&j<8; i--,j++) {
			ijCell = $.Dom.select('.cell[data-coord="'+i+j+'"]')[0];
			if (ijCell.innerHTML == '♛' || ijCell.innerHTML == '♝') {
				if (endX == i && endY == j) {
					valid_uncover_king = true;
				}
				else {
					valid_uncover_king = false;
				}
				break;
			}
			else if (ijCell.innerHTML == '') {}
			else if(i!=whiteKingX || j!=whiteKingY) {
				valid_uncover_king = true;
				break;
			}
		}
	}
	if (valid_uncover_king) {
		for (var i=parseInt(whiteKingX)+1,j=parseInt(whiteKingY)-1; i<8&&j>=0; i++,j--) {
			ijCell = $.Dom.select('.cell[data-coord="'+i+j+'"]')[0];
			if (ijCell.innerHTML == '♛' || ijCell.innerHTML == '♝') {
				if (endX == i && endY == j) {
					valid_uncover_king = true;
				}
				else {
					valid_uncover_king = false;
				}
				break;
			}
			else if (ijCell.innerHTML == '') {}
			else if(i!=whiteKingX || j!=whiteKingY) {
				valid_uncover_king = true;
				break;
			}
		}
	}
	if (valid_uncover_king) {
		for (var i=parseInt(whiteKingX)-1,j=parseInt(whiteKingY)-1; i>=0&&j>=0; i--,j--) {
			ijCell = $.Dom.select('.cell[data-coord="'+i+j+'"]')[0];
			if (ijCell.innerHTML == '♛' || ijCell.innerHTML == '♝') {
				if (endX == i && endY == j) {
					valid_uncover_king = true;
				}
				else {
					valid_uncover_king = false;
				}
				break;
			}
			else if (ijCell.innerHTML == '') {}
			else if(i!=whiteKingX || j!=whiteKingY) {
				valid_uncover_king = true;
				break;
			}
		}
	}
	if (!valid_uncover_king) {
		return false;
	}
	
	// Castling
	// TODO: check for validity (ie. king is not in check, middle houses are not controlled)
	var valid_castling = false;
	if (piece == 'k' && startY == 0 && endY == 0 && startX == 4 && (endX == 2 || endX == 6)) {
		valid_castling = ((endX == 2 && this._diagram.wsc) || (endX == 6 && this._diagram.wlc));
	}
	else {
		valid_castling = true;
	}
	if (!valid_castling) {
		return false;
	}
	
	// En-passant
	var valid_enpassant = true;
	if (piece == 'p' && startY == 4 && endX != startX) {
		var endCell = $.Dom.select('.cell[data-coord="'+end+'"]')[0];
		// white wants to eat a piece
		if (endCell.innerHTML == '') {
			valid_enpassant = this._diagram.allowed.enp == (parseInt(endY)-1) +''+ endX;
		}
	}
	if (!valid_enpassant) {
		return false;
	}
	
	// Finally!!!
	return true;
}

WhiteWins.prototype.writeStatus = function(message, add_class, remove_class) {
	var p = $.Dom.children(this._status, 'p')[0];
	if (message) {
		p.innerHTML = ''+message+'';
		$.Dom.removeClass(this._status, 'hidden');
	}
	else {
		$.Dom.addClass(this._status, 'hidden');
	}
	var self = this;
	$.Each(add_class, function(a_class){
		$.Dom.addClass(self._status, a_class);
	});
	$.Each(remove_class, function(a_class){
		$.Dom.removeClass(self._status, a_class);
	});
	return this;
};

WhiteWins.prototype.setSolvedDiagram = function() {
	this._solved[this._diagramIndex] = true;
	$.Storage.set('solved', this._solved);
}

WhiteWins.prototype.next = function() {
	var l = 0;
	var index = (this._diagramIndex || 0);
	
	// Search the first unsolved diagram
	while (l != 0 && l <= this._solved.length) {
		index = index +1;
		// Turnaround
		if (index >= this._diagrams.length) {
			index = 0;
		}
		if (!this._solved[index]) {
			// This is unsolved 
			return index;
		}
		
		l++;
	}
	
	// No unsolved diagram found
	if (!this._solved[0]) {
		// Diagram 0 is unsolved
		// This can happen the first time one open the app
		return 0;
	}
	
	// Return the following even if it's solved
	index = (this._diagramIndex || 0) +1;
	if (index >= this._diagrams.length) {
		index = 0;
	}
	return index;
};

WhiteWins.prototype.getLastOrFirstUnsolved = function() {
	var index = parseInt($.Storage.get('last-opened'));
	if (index || index === 0) {
		return index;
	}
	else {
		return this.next();
	}
};

WhiteWins.prototype.loadDiagram = function(index) {
	index = parseInt(index);
	this._diagramIndex = index;
	this._diagram = this._diagrams[index];
	$.Storage.set('last-opened', index);
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
	var correct = false;
	$.Each(this._diagram.solutions, function(solution){
		if (start == solution.start && end == solution.end) {
			correct = true;
		}
		return !correct;
	});
	return correct;
	// return start == this._diagram.solution.start && end == this._diagram.solution.end;
};

WhiteWins.prototype.each = function(callback) {
	$.Each(this._diagrams, callback);
};

WhiteWins.prototype.convert = function(coord){
	return ['a','b','c','d','e','f','g','h'][parseInt(coord[0])] + (parseInt(coord[1]) +1);
};

WhiteWins.prototype.applyAllowedMoves = function(){
	$.Dom.id('index-allowed-moves').innerHTML = '';
	if (this._diagram.allowed.wlc) {
		$.Dom.inject($.Dom.element('li', {}, '<span>White </span><code class="white">O-O-O</code>'), 'index-allowed-moves');
	}
	if (this._diagram.allowed.wsc) {
		$.Dom.inject($.Dom.element('li', {}, '<span>White </span><code class="white">O-O</code>'), 'index-allowed-moves');
	}
	if (this._diagram.allowed.blc) {
		$.Dom.inject($.Dom.element('li', {}, '<span>Black </span><code class="black">O-O-O</code>'), 'index-allowed-moves');
	}
	if (this._diagram.allowed.bsc) {
		$.Dom.inject($.Dom.element('li', {}, '<span>Black </span><code class="black">O-O</code>'), 'index-allowed-moves');
	}
	if (this._diagram.allowed.enp) {
		$.Dom.inject($.Dom.element('li', {}, '<span>En-passant </span><code class="enpassant">'+this.convert(this._diagram.allowed.enp)+'</code>'), 'index-allowed-moves');
	}
	return this;
};

WhiteWins.prototype.getInfo = function(){
	return {
		'author': this._diagram.author,
		'reference': this._diagram.reference,
		'comment': this._diagram.comment,
		'_diagramIndex': this._diagramIndex
	};
};
