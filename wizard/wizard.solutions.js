$.Dom.addEvent(window, 'load', function(){
	(function(){
		var start = '';
		var end = '';
		$.Each($.Dom.select('#set-solution .cell'), function(cell){
			$.Dom.addEvent(cell, 'click', function(event){
				if (!start) {
					start = event.target.getAttribute('data-coord');
					$.Dom.addClass(event.target, 'highlight');
					$.Dom.addClass(event.target, 'solution-start');
				}
				else if (!end) {
					end = event.target.getAttribute('data-coord');
					if (end == start) {
						return;
					}
					var startCell = $.Dom.select('#set-solution .cell[data-coord="'+start+'"]')[0];
					if (startCell.innerHTML == '♙' && end[1] == 7 && !event.detail.piece) {
						$.Dom.removeClass('index-piecepromotion', 'hidden');
						$.Dom.id('index-piecepromotion').setAttribute('data-cell', end);
						end = '';
					}
					else {
						$.Dom.addClass(event.target, 'highlight');
						$.Dom.addClass(event.target, 'solution-end');
	
						$.Dom.inject($.Dom.element('li', {
								'data-start': start,
								'data-end': end,
								'data-promotion': event.detail.piece ? event.detail.piece : ''
							}, convertCoordinates(start)+'->'+convertCoordinates(end)+(event.detail.piece?'='+event.detail.piece:''), {
							'dblclick': function(event){
								event.target.parentNode.removeChild(event.target);
								$.Dom.fireEvent(window, 'reload-solutions');
							}
						}), 'solutions', 'first');
						$.Dom.fireEvent(window, 'reload-solutions');
					}
				}
				else {
					start = event.target.getAttribute('data-coord');
					end = '';
					$.Each($.Dom.select('#set-solution .highlight'), function(cell){
						$.Dom.removeClass(cell, 'highlight');
						$.Dom.removeClass(cell, 'solution-start');
						$.Dom.removeClass(cell, 'solution-end');
					});
					$.Dom.addClass(event.target, 'highlight');
					$.Dom.addClass(event.target, 'solution-start');
				}
			});
		});
		$.Each($.Dom.select('#index-piecepromotion li'), function(li){
			$.Dom.addEvent(li, 'click', function(event){
				$.Dom.addClass('index-piecepromotion', 'hidden');
				$.Dom.fireEvent($.Dom.select('#set-solution .cell[data-coord="'+$.Dom.id('index-piecepromotion').getAttribute('data-cell')+'"]')[0], 'click', {
				'detail': {
					'piece': event.target.innerHTML
				}});
			});
		});
	})();
	
	$.Dom.addEvent(window, 'reload-solutions', function(){
		data.solutions = [];
		$.Each($.Dom.select('#solutions li'), function(li){
			data.solutions.push({
				'start': li.getAttribute('data-start'),
				'end': li.getAttribute('data-end'),
				'promotion': li.getAttribute('data-promotion')
			})
		});
		$.Dom.fireEvent(window, 'reload-output');
	});
});