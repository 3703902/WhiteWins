$.Dom.addEvent(window, 'load', function(){
	(function(){
		var phase = 'set-move-start';
		var key = '';
		var suggestions = [];
		var start = '';
		var end = '';
		var ul = null;
		var li = null;
		
		$.Dom.addEvent('done-suggestion', 'click', function(){
			phase = 'set-move-start';
			start = end = '';
			ul = li = null;
			$.Dom.fireEvent(window, 'reload-suggestions');
		});
		
		$.Each($.Dom.select('#set-suggestions .cell'), function(cell){
			$.Dom.addEvent(cell, 'click', function(event){
				switch (phase) {
					case 'none':
					default:
						phase = 'set-move-start'
						break;
					case 'set-move-start':
						start = event.target.getAttribute('data-coord');
						li = $.Dom.element('li', {}, convertCoordinates(start)+'->', {
							'dblclick': function(event){
								if (event.currentTarget != event.target) {
									return;
								}
								event.currentTarget.parentNode.removeChild(event.currentTarget);
								phase = 'set-move-start';
								$.Dom.fireEvent(window, 'reload-suggestions');
							}
						});
						$.Dom.inject(li, 'suggestions', 'first');
						phase = 'set-move-end';
						break;
					case 'set-move-end':
						
						end = event.target.getAttribute('data-coord');
						key = start+end;
						
						if (start == end) {
							return;
						}
						
						li.innerHTML = convertCoordinates(start)+'->'+convertCoordinates(end)+':';
						li.setAttribute('data-id', start+end);
						ul = $.Dom.element('ul');
						$.Dom.inject(ul, li);
						
						start = end = '';
						phase = 'set-answers';
						$.Dom.fireEvent(window, 'reload-suggestions');
						break;
					case 'set-answers':
						if (!start) {
							start = event.target.getAttribute('data-coord');
						}
						else {
							end = event.target.getAttribute('data-coord');
							if (start == end) {
								return;
							}
							suggestions.push({
								'start': start,
								'end': end
							})
							$.Dom.inject($.Dom.element('li', {
								'data-start': start,
								'data-end': end
							}, convertCoordinates(start)+'->'+convertCoordinates(end), {
								'dblclick': function(event){
									event.target.parentNode.removeChild(event.target);
									$.Dom.fireEvent(window, 'reload-suggestions');
								}
							}), ul);
							start = end = '';
							$.Dom.fireEvent(window, 'reload-suggestions');
						}
						break;
				}
			});
		});
		
		$.Dom.addEvent(window, 'reload-suggestions', function(){
			data.suggestions = {};
			$.Each($.Dom.select('#suggestions > li'), function(li){
				data.suggestions[li.getAttribute('data-id')] = [];
				$.Each($.Dom.select('#suggestions > li[data-id="'+li.getAttribute('data-id')+'"] li'), function(subli){
					data.suggestions[li.getAttribute('data-id')].push({
						'start': subli.getAttribute('data-start'),
						'end': subli.getAttribute('data-end')
					});
				});
			});
			$.Dom.fireEvent(window, 'reload-output');
			/*$.Dom.id('suggestions').innerHTML = '';
			$.Each(data.suggestions, function(suggest, key){
				var li = $.Dom.element('li', {
					'data-id': key
				}, convertCoordinates(key.substring(0,2))+'->'+convertCoordinates(key.substring(1,3))+':', {
					'dblclick': function(event){
						event.target.parentNode.removeChild(event.target);
					}
				});
				$.Dom.inject(li, 'suggestions');
				var ul = $.Dom.element('ul');
				$.Dom.inject(ul, li);
				$.Each(suggest, function(item){
					$.Dom.inject($.Dom.element('li', {
						'data-start': item.start,
						'data-end': item.end
					}, convertCoordinates(item.start) +'->'+ convertCoordinates(item.end), {
						'dblclick': function(event){
							event.target.parentNode.removeChild(event.target);
						}
					}), ul);
				});
			});*/
		});
	})();
});