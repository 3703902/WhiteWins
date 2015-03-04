$.Dom.addEvent(window, 'load', function(){
	$.Dom.addEvent('author', 'change', function(event){
		data.author = event.target.value;
		$.Dom.fireEvent(window, 'reload-info');
	});
	$.Dom.addEvent('reference', 'change', function(event){
		data.reference = event.target.value;
		$.Dom.fireEvent(window, 'reload-info');
	});
	$.Dom.addEvent('comment', 'change', function(event){
		data.comment = event.target.value;
		$.Dom.fireEvent(window, 'reload-info');
	});
	
	$.Dom.addEvent(window, 'reload-info', function(){
		$.Dom.fireEvent(window, 'reload-output');
	});
	
	$.Dom.id('author').focus();
	
	$.Dom.fireEvent('author', 'change');
	$.Dom.fireEvent('reference', 'change');
	$.Dom.fireEvent('comment', 'change');
});
