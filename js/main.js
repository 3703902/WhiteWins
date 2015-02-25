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
		whiteWins.clearBoard().loadDiagram(whiteWins.getLastOrFirstUnsolved()).applyDiagram().applyAllowedMoves();
		
		// Create diagrams list
		whiteWins.each(function(diagram, key){
			$.Dom.inject($.Dom.element('li', {
					'data-key': key,
					'class': 'pointer '+(whiteWins._solved[key]?'solved':'')
				}, 'diagram '+key, {
				'click': function(event) {
					whiteWins.writeStatus('', '', ['status-ok', 'status-ko']).clearBoard().loadDiagram(event.target.getAttribute('data-key')).applyDiagram().applyAllowedMoves();
					location.href = '#';
				}
			}), 'index-sidebar-diagramslist');
		});
		
		$.Dom.fireEvent(window, 'game-loaded');
	});
	
	$.Dom.addEvent(window, 'solved-diagram', function(event){
		$.Dom.addClass($.Dom.select('section[data-type="sidebar"] > nav > ul > li[data-key="'+event.detail.key+'"]')[0], 'solved');
	});
	
	$.Dom.addEvent('index-nextdiagram', 'click', function(){
		// TODO: search the next unsolved diagram
		whiteWins.writeStatus('', '', ['status-ok', 'status-ko']);
		whiteWins.clearBoard().loadDiagram(whiteWins.next()).applyDiagram().applyAllowedMoves();
	});
	
	// Set diagrams number
	$.Dom.addEvent(window, 'diagrams-loaded', function(){
		$.Dom.id('rules-diagramsnumber').innerHTML = whiteWins._diagrams.length;
		$.Dom.id('index-sidebar-diagramsnumber').innerHTML = whiteWins._diagrams.length;
	});
	
	// Hide/show solved diagrams names
	$.Dom.addEvent('index-sidebar-showsolved', 'change', function(event){
		$.Dom.id('index-sidebar-diagramslist').setAttribute('data-showsolved', event.target.checked);
	});
	$.Dom.fireEvent('index-sidebar-showsolved', 'change'); // On page load :D
	
	$.Dom.addEvent('index-goto-info', 'click', function(){
		var info = whiteWins.getInfo();
		if (/http[s]?:\/\//.test(info.reference)) {
			info.reference = '<a href="'+info.reference+'" title="Reference link" class="pointer">' + info.reference + '</a>';
		}
		
		$.Dom.id('info-author').innerHTML = info.author;
		$.Dom.id('info-reference').innerHTML = info.reference;
		$.Dom.id('info-comment').innerHTML = info.comment;
	});
	
	// Set ready attribute
	$.Dom.addEvent(window, 'game-loaded', function(){
		document.body.setAttribute('data-ready', 'true');
	});
});
