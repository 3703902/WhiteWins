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
	(function(){
		var start_cell = null;
		$.Each($.Dom.select('#set-pieces .cell'), function(cell){
			// Add dragstart events for pieces
			$.Dom.addEvent(cell, 'dragstart', function(event){
				if (event.target.innerHTML == '') {
					return;
				}
				//event.dataTransfer.effectAllowed = 'move';
				//event.dataTransfer.dropEffect = 'move';
				event.dataTransfer.setData('text/plain', event.target.innerHTML);
				if(!event.ctrlKey) {
					start_cell = event.target;
				}
			});
			// Add drag end event
			$.Dom.addEvent(cell, 'dragend', function(event){
				$.Each($.Dom.select('.droppable'), function(cell){
					$.Dom.removeClass(cell, 'droppable');
				});
			});
			// Prevent default dragover
			$.Dom.addEvent(cell, 'dragover', function(event){
				event.preventDefault();
			});
			// Drop piece onto a cell
			$.Dom.addEvent(cell, 'drop', function(event){
				event.preventDefault();
				event.target.innerHTML = event.dataTransfer.getData('text/plain');
				if(start_cell && start_cell != event.target && !event.ctrlKey){
					start_cell.innerHTML = '';
				}
				start_cell = null;
				$.Dom.fireEvent(window, 'reload-diagram');
			});
			// Drag enter highlight cell
			$.Dom.addEvent(cell, 'dragenter', function(event){
				$.Dom.addClass(cell, 'droppable');
			});
			// Drag leave removes highlight
			$.Dom.addEvent(cell, 'dragleave', function(event){
				$.Dom.removeClass(cell, 'droppable');
			});
			$.Dom.addEvent(cell, 'dblclick', function(event){
				event.target.innerHTML = '';
				$.Dom.fireEvent(window, 'reload-diagram');
			});
		});
	})();
	
	$.Dom.addEvent(window, 'reload-diagram', function(){
		data.position = [];
		$.Each($.Dom.select('#set-pieces .cell'), function(cell){
			if (cell.innerHTML != '') {
				data.position.push(cell.getAttribute('data-coord')+translation[cell.innerHTML]);
			}
			$.Dom.select('#set-solution .cell[data-coord="'+cell.getAttribute('data-coord')+'"]')[0].innerHTML = cell.innerHTML;
			$.Dom.select('#set-suggestions .cell[data-coord="'+cell.getAttribute('data-coord')+'"]')[0].innerHTML = cell.innerHTML;
		});
		$.Dom.fireEvent(window, 'reload-output');
	});
});