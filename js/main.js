var development = false;

$.Dom.addEvent(window, 'load', function(){
	
	// Set browser language
	$.L10n.setLanguage($.L10n.sniff().substring(0, 2));
	// $.L10n.setLanguage('es');
	
	// Translate all
	$.L10n.translateAll();
	
	// Add 'goto' events
	$.Each(document.body.querySelectorAll('[data-goto]'), function(item){
		$.Dom.addClass(item, 'pointer');
		$.Dom.addEvent(item, 'click', function(event){
			Page.open(event.target.getAttribute('data-goto'));
		});
	});
	
	// Add 'goback' events
	$.Each(document.body.querySelectorAll('[data-goback]'), function(item){
		$.Dom.addClass(item, 'pointer');
		$.Dom.addEvent(item, 'click', function(event){
			Page.back();
		});
	});
	
	// Load the diagrams
	var diagrams = null;
	$.Ajax.get('diagrams/diagrams.json', {}, {
		'onSuccess': function(t) {
			diagrams = $.Json.decode(t);
			$.Dom.fireEvent(window, 'diagrams-loaded');
		}
	});
	
	var whiteWins;
	// Load the game
	$.Dom.addEvent(window, 'diagrams-loaded', function(){
		whiteWins = new WhiteWins($.Dom.id('board'), diagrams, $.Dom.id('status'));
		whiteWins.clearBoard().loadDiagram(diagrams.length -1).applyDiagram();
		$.Dom.fireEvent(window, 'game-loaded');
	});
	
	// Set diagrams number
	$.Dom.addEvent(window, 'diagrams-loaded', function(){
		$.Dom.id('rules-diagramsnumber').innerHTML = whiteWins._diagrams.length;
	});
	
	// Set ready attribute
	$.Dom.addEvent(window, 'game-loaded', function(){
		document.body.setAttribute('data-ready', 'true');
	});
	
	// Add some development useful features
	if (development) {
		var coords = $.Dom.element('div', {}, '', {});
		$.Dom.style(coords, {
			'position': 'absolute',
			'background-color': 'silver',
			'border': '0.1em solid black',
			'padding': '0.2em 0.5em',
			'text-align': 'center'
		});
		$.Dom.inject(coords, document.body);
		$.Each($.Dom.select('.cell'), function(cell){
			$.Dom.addEvent(cell, 'mouseover', function(event){
				coords.innerHTML = event.target.getAttribute('data-coord');
				$.Dom.style(coords, {
					'top': (event.clientY +10) +'px',
					'left': (event.clientX +10) +'px'
				});
			});
		});
	}
});
