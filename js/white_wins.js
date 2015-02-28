
var WhiteWins = function(diagrams, solved) {
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
	
	this._fireEvent = function (name, data) {
		$.Dom.fireEvent(window, 'whitewins-'+name, {
			'detail': data
		});
	};
	
	this._diagrams = diagrams;
	this._solved = solved;
	
	this._fireEvent('initialized');
};

WhiteWins.prototype.next = function() {
	var l = 0;
	var index = (this._diagramIndex || 0);
	
	// Search the first unsolved diagram
	while (l < this._solved.length) {
		index = index +1;
		// Turnaround
		if (index >= this._diagrams.length) {
			index = 0;
		}
		if (!this._solved[index]) {
			// This is unsolved
			this._fireEvent('next', {
				'index': index
			});
			return index;
		}
		
		l++;
	}
	
	// No unsolved diagram found
	if (!this._solved[0]) {
		// Diagram 0 is unsolved
		// This can happen the first time one open the app
		this._fireEvent('next', {
			'index': 0
		});
		return 0;
	}
	
	// Return the following even if it's solved
	index = (this._diagramIndex || 0) +1;
	if (index >= this._diagrams.length) {
		index = 0;
	}
	
	this._fireEvent('next', {
		'index': index
	});
	return index;
};

WhiteWins.prototype.load = function(index){
	index = parseInt(index);
	if (index >= this._diagrams.length) {
		index = 0;
	}
	this._diagramIndex = index;
	this._diagram = this._diagrams[index];
	this._digital = {};
	var self = this;
	$.Each(this._diagram.position, function(cell){
		self._digital[cell[0]+cell[1]] = {
			'piece': cell[3],
			'color': cell[2]
		};
	});
	this._fireEvent('load', {
		'index': index,
		'diagram': this._diagram
	});
	return this;
};

WhiteWins.prototype.check = function(start, end, promotion) {
	var correct = false;
	$.Each(this._diagram.solutions, function(solution){
		if (start == solution.start && end == solution.end) {
			if (promotion) {
				if (promotion == solution.promotion) {
					correct = true;
				}
				else {
					correct = false;
				}
			}
			else {
				correct = true;
			}
		}
		return !correct;
	});
	this._fireEvent('check', {
		'correct': correct,
		'index': this._diagramIndex,
		'start': start,
		'end': end,
		'promotion': promotion
	});
	return correct;
};

WhiteWins.prototype.getSuggestion = function (key) {
	return this._diagram.suggestions[key]? this._diagram.suggestions[key][Math.floor(Math.random(this._diagram.suggestions[key].length))] : null;
}

WhiteWins.prototype.each = function(callback){
	for (var i in this._diagrams) {
		if (callback(this._diagrams[i], i) === false) {
			break;
		}
	}
};

WhiteWins.prototype.allowed = function (){
	return this._diagram.allowed;
};

WhiteWins.prototype.setSolved = function(index) {
	this._solved[index] = true;
	this._fireEvent('setsolved', {
		'index': index
	});
	return this;
};

WhiteWins.prototype.convert = function(coord){
	return ['a','b','c','d','e','f','g','h'][parseInt(coord[0])] + (parseInt(coord[1]) +1);
};

WhiteWins.prototype.getInfo = function(){
	return {
		'author': this._diagram.author,
		'reference': this._diagram.reference,
		'comment': this._diagram.comment,
		'diagramIndex': this._diagramIndex,
		'diagramsNumber': this._diagrams.length,
		'solved': this._solved
	};
};
