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

$.Dom.addEvent(window, 'load', function(){
	$.Each($.Dom.select('#pieces li'), function(piece){
		// Add dragstart events for pieces
		$.Dom.addEvent(piece, 'dragstart', function(event){
			event.dataTransfer.effectAllowed = 'copy';
			event.dataTransfer.dropEffect = 'copy';
			event.dataTransfer.setData('text/plain', event.target.innerHTML);
		});
		// Add drag end event
		$.Dom.addEvent(piece, 'dragend', function(event){
			$.Each($.Dom.select('.droppable'), function(cell){
				$.Dom.removeClass(cell, 'droppable');
			});
		});
	});
	
	$.Each($.Dom.select('.cell'), function(cell){
		// Prevent default dragover
		$.Dom.addEvent(cell, 'dragover', function(event){
			event.preventDefault();
		});
		// Drop piece onto a cell
		$.Dom.addEvent(cell, 'drop', function(event){
			event.preventDefault();
			event.target.innerHTML = event.dataTransfer.getData('text/plain');
			$.Dom.fireEvent(window, 'reload-output');
		});
		// Drag enter highlight cell
		$.Dom.addEvent(cell, 'dragenter', function(event){
			$.Dom.addClass(event.target, 'droppable');
		});
		// Drag leave removes highlight
		$.Dom.addEvent(cell, 'dragleave', function(event){
			$.Dom.removeClass(event.target, 'droppable');
		});
		// Click on a cell...
		$.Dom.addEvent(cell, 'click', function(event){
			if ($.Dom.hasClass('solution', 'selected')) {
				// ...to define solution
				if ($.Dom.id('solution-start').getAttribute('data-defined') == 'false') {
					$.Dom.id('solution-start').value = event.target.getAttribute('data-coord');
					$.Dom.id('solution-start').setAttribute('data-defined', 'true');
					$.Each($.Dom.select('#board .solution'), function(cell){
						$.Dom.removeClass(cell, 'solution');
					});
					$.Dom.addClass(event.target, 'solution');
				}
				else {
					$.Dom.id('solution-end').value = event.target.getAttribute('data-coord');
					$.Dom.id('solution-start').setAttribute('data-defined', 'false');
					$.Dom.removeClass('solution', 'selected');
					$.Dom.addClass(event.target, 'solution');
				}
			}
			else {
				// ...to remove that piece !!
				event.target.innerHTML = '';
			}
			$.Dom.fireEvent(window, 'reload-output');
		});
		// Move over cells to see coordinates
		$.Dom.addEvent(cell, 'mousemove', function(event){
			var coords = $.Dom.id('coords');
			coords.innerHTML = event.target.getAttribute('data-coord');
			$.Dom.style(coords, {
				'left': event.clientX + 20 + 'px',
				'top': event.clientY + 20 + 'px'
			});
		});
	});
	
	//
	$.Dom.addEvent('solution', 'click', function(event){
		if ($.Dom.hasClass('solution', 'selected')) {
			$.Dom.removeClass('solution', 'selected');
		}
		else {
			$.Dom.addClass('solution', 'selected');
			$.Dom.id('solution-start').setAttribute('data-defined', 'false');
		}
	});
	
	// Hide coords on mouseout the board
	$.Dom.addEvent('board', 'mouseout', function(){
		$.Dom.id('coords').innerHTML = '';
	});
	
	// Reload output textarea
	$.Dom.addEvent(window, 'reload-output', function(){
		var output = $.Dom.id('output');
		
		output.innerHTML = '{';
		
		var positions = [];
		$.Each($.Dom.select('.cell'), function(cell){
			if (cell.innerHTML) {
				positions.push('"'+(cell.getAttribute('data-coord'))+(translation[cell.innerHTML])+'"');
			}
		});
		output.innerHTML += '"position": [' +positions.join(',')+ '],';
		
		output.innerHTML += '"solution": {"start": "'+$.Dom.id('solution-start').value+'", "end": "'+$.Dom.id('solution-end').value+'"},';
		output.innerHTML += '"suggestions": {}';
		
		output.innerHTML += '}';
	});
	
	// Enable/disable suggestions
	$.Dom.addEvent('options-suggestions', 'change', function(event){
		document.body.setAttribute('data-suggestions', event.target.checked);
	});
	document.body.setAttribute('data-suggestions', $.Dom.id('options-suggestions').checked);
	
	// Load first time output
	$.Dom.fireEvent(window, 'reload-output');
});