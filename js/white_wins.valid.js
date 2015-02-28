
WhiteWins.prototype._walk = function (start, end, callback, options, digital) {
	digital = digital || this._digital;
	var delta = {
		x: start.x > end.x ? -1 : (start.x < end.x ? 1 : 0),
		y: start.y > end.y ? -1 : (start.y < end.y ? 1 : 0)
	};
	var condition = {
		x: start.x > end.x ? function(a,b){return a>b} : (start.x < end.x ? function(a,b){return a<b} : function(a,b){return true}),
		y: start.y > end.y ? function(a,b){return a>b} : (start.y < end.y ? function(a,b){return a<b} : function(a,b){return true})
	};
	for (var i=start.x+delta.x, j=start.y+delta.y; condition.x(i,end.x) && condition.y(j,end.y); i+=delta.x, j+=delta.y) {
		if (callback(digital[i+''+j], options) === false) {
			break;
		}
	}
	return this;
};

WhiteWins.prototype.valid = function (piece, start, end) {
	var pieceType = this._translation[piece][1];
	var pieceColor = this._translation[piece][0];
	var startX = parseInt(start[0]);
	var startY = parseInt(start[1]);
	var endX = parseInt(end[0]);
	var endY = parseInt(end[1]);
	
	var valid = true;
	
	// Empty board validation
	switch (pieceType) {
		case 'k':
			valid = (Math.abs(startX - endX) <= 1 && Math.abs(startY - endY) <= 1) ||
				(startX == 4 && startY == 0 && ((endX == 2 && endY == 0) || (endX == 6 && endY == 0)));
			break;
		case 'q':
			valid = (startX == endX || startY == endY) || (endY - endX == startY - startX) || (endY + endX ==  + startY + startX);
			break;
		case 'b':
			valid = (endY - endX == startY - startX) || (endY + endX ==  + startY + startX);
			break;
		case 'h':
			valid = (Math.abs(startX - endX) == 1 && Math.abs(startY - endY) == 2) || (Math.abs(startX - endX) == 2 && Math.abs(startY - endY) == 1);
			break;
		case 'r':
			valid = startX == endX || startY == endY;
			break;
		case 'p':
			valid = (endY - startY == 1) && (
						(Math.abs(startX - endX) == 1 && (
							 this._digital[end] && this._digital[end].color == 'b' ||
							 this._diagram.allowed.enp == endX+''+endY-1)
						) ||
						(startX == endX && !this._digital[end])
					) ||
					(startY == 1 && endY == 3 && startX == endX && !this._digital[end]);
			break;
		default:
			valid = false;
			break;
	}
	if (!valid) {
		this._fireEvent('valid', {
			'valid': valid,
			'index': this._diagramIndex
		});
		return valid;
	}
	
	// Hidden cells validation
	switch (pieceType) {
		case 'q':
		case 'r':
		case 'b':
		case 'p':
			this._walk({
				x: startX,
				y: startY
			}, {
				x: endX,
				y: endY
			}, function(cell) {
				if (cell) {
					valid = false;
					return false;
				}
				return true;
			});
			
			break;
		default:
			valid = true;
	}
	if (!valid) {
		this._fireEvent('valid', {
			'valid': valid,
			'index': this._diagramIndex
		});
		return valid;
	}
	
	// White King in check after the move?
	var new_position = {};
	var king = {};
	$.Each(this._digital, function(cell, key){
		if (key == start) {
			new_position[end] = cell;
		}
		else if (key != end) {
			new_position[key] = cell;
		}
		// Also find king's position
		if (cell.piece == 'k' && cell.color == 'w') {
			king = {
				x: parseInt(key[0]),
				y: parseInt(key[1])
			};
		}
	});
	// Check pawns
	if (this._digital[(king.x+1)+''+(king.y+1)] == 'bp' || this._digital[(king.x-1)+''+(king.y+1)] == 'bp') {
		this._fireEvent('valid', {
			'valid': false,
			'index': this._diagramIndex
		});
		return false;
	}
	// Check horses
	if (this._digital[(king.x+1)+''+(king.y+2)] == 'bh' ||
		this._digital[(king.x+1)+''+(king.y-2)] == 'bh' ||
		this._digital[(king.x-1)+''+(king.y+2)] == 'bh' ||
		this._digital[(king.x-1)+''+(king.y-2)] == 'bh' ||
		this._digital[(king.x+2)+''+(king.y+1)] == 'bh' ||
		this._digital[(king.x+2)+''+(king.y-1)] == 'bh' ||
		this._digital[(king.x-2)+''+(king.y+1)] == 'bh' ||
		this._digital[(king.x-2)+''+(king.y-1)] == 'bh') {
		this._fireEvent('valid', {
			'valid': false,
			'index': this._diagramIndex
		});
		return false;
	}
	// Check bishops, rooks and queens
	var check_callback = function(cell, options){
		if (!cell) {
			return true;
		}
		if (cell.color == 'w') {
			valid = true;
			return false;
		}
		if (cell.piece == 'p' || cell.piece == 'h' || cell.piece == 'k') {
			valid = true;
			return false;
		}
		switch (options) {
			case 'rook':
				if (cell.piece == 'q' || cell.piece == 'r') {
					valid = false;
					return false;
				}
				break;
			case 'bishop':
				if (cell.piece == 'q' || cell.piece == 'b') {
					valid = false;
					return false;
				}
				break;
		}
		return true;
	};
	this._walk(king, {
		x: king.x,
		y: 8
	}, check_callback, 'rook', new_position);
	if (!valid) {
		this._fireEvent('valid', {
			'valid': valid,
			'index': this._diagramIndex
		});
		return valid;
	}
	this._walk(king, {
		x: king.x,
		y: -1
	}, check_callback, 'rook', new_position);
	if (!valid) {
		this._fireEvent('valid', {
			'valid': valid,
			'index': this._diagramIndex
		});
		return valid;
	}
	this._walk(king, {
		x: 8,
		y: king.y
	}, check_callback, 'rook', new_position);
	if (!valid) {
		this._fireEvent('valid', {
			'valid': valid,
			'index': this._diagramIndex
		});
		return valid;
	}
	this._walk(king, {
		x: -1,
		y: king.y
	}, check_callback, 'rook', new_position);
	if (!valid) {
		this._fireEvent('valid', {
			'valid': valid,
			'index': this._diagramIndex
		});
		return valid;
	}
	this._walk(king, {
		x: 8,
		y: 8
	}, check_callback, 'bishop', new_position);
	if (!valid) {
		this._fireEvent('valid', {
			'valid': valid,
			'index': this._diagramIndex
		});
		return valid;
	}
	this._walk(king, {
		x: -1,
		y: -1
	}, check_callback, 'bishop', new_position);
	if (!valid) {
		this._fireEvent('valid', {
			'valid': valid,
			'index': this._diagramIndex
		});
		return valid;
	}
	this._walk(king, {
		x: -1,
		y: 8
	}, check_callback, 'bishop', new_position);
	if (!valid) {
		this._fireEvent('valid', {
			'valid': valid,
			'index': this._diagramIndex
		});
		return valid;
	}
	this._walk(king, {
		x: 8,
		y: -1
	}, check_callback, 'bishop', new_position);
	if (!valid) {
		this._fireEvent('valid', {
			'valid': valid,
			'index': this._diagramIndex
		});
		return valid;
	}
	
	this._fireEvent('valid', {
		'valid': valid,
		'index': this._diagramIndex
	});
	return valid;
};
