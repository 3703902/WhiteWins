var translation = {
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

function convertCoordinates (coord){
	return ['a','b','c','d','e','f','g','h'][parseInt(coord[0])]+(parseInt(coord[1]) +1)
};

var data = {
	'position': [],
	'allowed': {},
	'solutions': [],
	'suggestions': {},
	'author': '',
	'reference': '',
	'comment': ''
};

var diagrams = null;

$.Dom.addEvent(window, 'load', function(){
	if (/file:\/\/\//.test(location.href)) {
		$.Ajax.get('diagrams/diagrams.json', {}, {
			'onSuccess': function(t) {
				diagrams = $.Json.decode(t);
			}
		});
		alert('Warning: app running locally');
	}
	else {
		$.Ajax.get('../diagrams/diagrams.json', {}, {
			'onSuccess': function(t) {
				diagrams = $.Json.decode(t);
			}
		});
	}
	
	// Add next/previous events
	$.Each($.Dom.select('[data-goto]'), function(button){
		$.Dom.addEvent(button, 'click', function(event){
			// Get current section
			var current = $.Dom.select('.current')[0];
			// Get next section
			var next = $.Dom.id(event.target.getAttribute('data-goto'));
			
			$.Dom.removeClass(current, 'current');
			if (!$.Dom.hasClass(next, 'previous')) {
				$.Dom.addClass(current, 'previous');
			}
			$.Dom.addClass(next, 'current');
			$.Dom.removeClass(next, 'previous');
		});
	});
	
	$.Dom.addEvent(window, 'reload-output', function(){
		//
		var found = false;
		$.Each(diagrams, function(diagram){
			if (diagram.position.length == data.position.length) {
				found = true;
				$.Each(data.position, function(position){
					if (diagram.position.indexOf(position) == -1) {
						found = false;
					}
					return found;
				});
			}
			return !found;
		});
		if (found) {
			$.Dom.id('output').value = 'Same diagram';
		}
		else {
			$.Dom.id('output').value = $.Json.encode(data).replace(/\s\s+/, '')//.replace(/(\W)\s|\s(\W)/, '$1');
		}
	});
	
	document.body.setAttribute('data-ready', true);
});
