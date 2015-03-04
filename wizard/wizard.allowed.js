$.Dom.addEvent(window, 'load', function(){
	
	$.Dom.addEvent('allowed-wsc', 'change', function(){
		$.Dom.fireEvent(window, 'reload-allowed');
	});
	$.Dom.addEvent('allowed-wlc', 'change', function(){
		$.Dom.fireEvent(window, 'reload-allowed');
	});
	$.Dom.addEvent('allowed-bsc', 'change', function(){
		$.Dom.fireEvent(window, 'reload-allowed');
	});
	$.Dom.addEvent('allowed-blc', 'change', function(){
		$.Dom.fireEvent(window, 'reload-allowed');
	});
	
	var enp = false;
	$.Dom.addEvent('allowed-enp', 'focus', function(){
		enp = true;
	});
	$.Each($.Dom.select('#set-pieces .cell'), function(cell){
		$.Dom.addEvent(cell, 'click', function(event){
			if (!enp || !event.target.innerHTML || translation[event.target.innerHTML] != 'bp' || event.target.getAttribute('data-coord')[1] != 4) {
				return;
			}
			$.Dom.id('allowed-enp').value = convertCoordinates(event.target.getAttribute('data-coord'));
			$.Dom.id('allowed-enp').setAttribute('data-value', event.target.getAttribute('data-coord'));
			enp = false;
			$.Dom.fireEvent(window, 'reload-allowed');
		});
	});
	
	$.Dom.addEvent(window, 'reload-allowed', function(){
		data.allowed.wsc = $.Dom.id('allowed-wsc').checked;
		data.allowed.wlc = $.Dom.id('allowed-wlc').checked;
		data.allowed.bsc = $.Dom.id('allowed-bsc').checked;
		data.allowed.blc = $.Dom.id('allowed-blc').checked;
		data.allowed.enp = $.Dom.id('allowed-enp').getAttribute('data-value');
		$.Dom.fireEvent(window, 'reload-output');
	});
});
