var whiteWins;

$.Dom.addEvent(window, 'load', function(){
	
	// Set browser language
	$.L10n.setLanguage($.L10n.sniff().substring(0, 2));
	
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
	$.Ajax.get('diagrams/diagrams.json', {}, {
		'onSuccess': function(t) {
			whiteWins = new WhiteWins($.Json.decode(t), $.Storage.get('solved') || []);
			whiteWins.clearBoard().load(whiteWins.getLastOrFirstUnsolved()).applyDiagram().applyAllowedRules();
			
			var info = whiteWins.getInfo();
			// Create diagrams list
			whiteWins.each(function(diagram, key){
				$.Dom.inject($.Dom.element('li', {
						'data-key': key,
						'class': 'pointer '+(info.solved[key] ? 'solved' : '')
					}, $.L10n.translate('diagram', '', 'Diagram')+' '+(parseInt(key)+1), {
					'click': function(event) {
						whiteWins.writeStatus('', '', ['status-ok', 'status-ko']).clearBoard().load(event.target.getAttribute('data-key')).applyDiagram().applyAllowedRules();
						location.href = '#';
					}
				}), 'index-sidebar-diagramslist');
			});
			
			var lis = $.Dom.select('#index-sidebar-diagramslist li');
			var last = null;
			$.Each(lis, function(li) {
				if (!$.Dom.hasClass(li, 'solved')) {
					last = li;
				}
			});
			if(last) {
				$.Dom.addClass(last, 'last');
			}
			
			$.Dom.id('index-sidebar-diagramsnumber').innerHTML = info.diagramsNumber;
		}
	});
	
	(function(){
		var start = null;
		$.Each($.Dom.select('#board .cell'), function(cell){
			$.Dom.addEvent(cell, 'click', function(event){
				if (!start) {
					whiteWins.removeHighlights().writeStatus('', '', ['status-ok', 'status-ko']);
					if (event.target.innerHTML == '') {
						return;
					}
					if (whiteWins._translation[event.target.innerHTML][0] == 'b') {
						return;
					}
					start = event.target;
					whiteWins.highlightCell(event.target, 'player start');
				}
				else {
					var startCoord = start.getAttribute('data-coord');
					var endCoord = event.target.getAttribute('data-coord');
					if (startCoord == endCoord) {
						start = null;
						whiteWins.removeHighlights();
						return;
					}
					if (event.target.innerHTML && whiteWins._translation[event.target.innerHTML][0] == 'w') {
						return;
					}
					if (whiteWins.valid(start.innerHTML, startCoord, endCoord)) {
						if (!event.detail.piece && start.innerHTML == '♙' && endCoord[1] == 7) {
							// ask piece promotion
							$.Dom.removeClass('index-piecepromotion', 'hidden');
							$.Dom.id('index-piecepromotion').setAttribute('data-cell', endCoord);
						}
						else {
							// GOTO: piece-promotion-selected
							whiteWins.highlightCell(event.target, 'player end');
							whiteWins.check(startCoord, endCoord, event.detail.piece);
							start = null;
						}
					}
				}
			});
		});
		$.Dom.addEvent(window, 'whitewins-load', function(event){
			start = null;
			whiteWins.removeHighlights().writeStatus('', '', ['status-ok', 'status-ko']);
		});
		$.Dom.addEvent('index', 'click', function(event){
			if (event.target.id == 'index') {
				start = null;
				whiteWins.removeHighlights().writeStatus('', '', ['status-ok', 'status-ko']);
			}
		});
	})();
	
	// GOTO: piece-promotion-selected
	$.Each($.Dom.select('#index-piecepromotion li'), function(li){
		$.Dom.addEvent(li, 'click', function(event) {
			$.Dom.addClass('index-piecepromotion', 'hidden');
			$.Dom.fireEvent($.Dom.select('.cell[data-coord="'+$.Dom.id('index-piecepromotion').getAttribute('data-cell')+'"]')[0], 'click', {
				'detail': {
					'piece': event.target.innerHTML
				}
			});
		});
	});
	
	$.Dom.addEvent('index-nextdiagram', 'click', function(){
		whiteWins.writeStatus('', '', ['status-ok', 'status-ko']);
		whiteWins.clearBoard().load(whiteWins.next()).applyDiagram().applyAllowedRules();
	});
	$.Dom.addEvent('status', 'click', function(event){
		if($.Dom.hasClass('status', 'status-ko')) {
			$.Dom.addClass('status', 'hidden');
			whiteWins.removeHighlights();
		}
	});
	
	// Hide/show solved diagrams names
	$.Dom.id('index-sidebar-showsolved').checked = $.Storage.get('show-solved');
	$.Dom.addEvent('index-sidebar-showsolved', 'change', function(event){
		$.Dom.id('index-sidebar-diagramslist').setAttribute('data-showsolved', event.target.checked);
		$.Storage.set('show-solved', event.target.checked);
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
		$.Dom.id('info-diagramnumber').innerHTML = info.diagramIndex;
	});
	
	$.Dom.addEvent('rules-resetalldata', 'click', function(){
		if (confirm($.L10n.translate('confirm-reset', '', 'Do you really want to reset all diagrams to unsolved?'))) {
			$.Storage.set('solved', {});
			$.Each($.Dom.select('#index-sidebar-diagramslist .solved'), function(li){
				$.Dom.removeClass(li, 'solved');
			});
			whiteWins._solved = {};
		}
	});
	
	$.Dom.addEvent(window, 'resize', function(){
		var fontSize = Math.max(1, (Math.min(window.innerHeight -50, window.innerWidth) /100 -0.5));
		$.Dom.style('board', 'font-size', fontSize +'rem');
		$.Dom.style('index-allowed-moves', 'font-size', fontSize +'rem');
	});
	$.Dom.fireEvent(window, 'resize');
});

// Set ready attribute
$.Dom.addEvent(window, 'whitewins-initialized', function(){
	document.body.setAttribute('data-ready', 'true');
});

$.Dom.addEvent(window, 'whitewins-load', function(event){
	$.Storage.set('last-opened', event.detail.index);
});

$.Dom.addEvent(window, 'whitewins-valid', function(event){});

$.Dom.addEvent(window, 'whitewins-setsolved', function(event){
	var info = whiteWins.getInfo();
	$.Storage.set('solved', info.solved);
	$.Dom.addClass($.Dom.select('#index-sidebar-diagramslist li[data-key="'+event.detail.index+'"]')[0], 'solved');
	
	var lis = $.Dom.select('#index-sidebar-diagramslist li');
	var last = null;
	$.Each(lis, function(li) {
		if (!$.Dom.hasClass(li, 'solved')) {
			last = li;
		}
	});
	if(last) {
		$.Dom.addClass(last, 'last');
	}
});

$.Dom.addEvent(window, 'whitewins-next', function(event){});

$.Dom.addEvent(window, 'whitewins-check', function(event){
	if (event.detail.correct) {
		whiteWins.setSolved(event.detail.index);
		whiteWins.writeStatus($.L10n.translate('correct-answer', '', 'Correct answer'), 'status-ok', 'status-ko');
	}
	else {
		whiteWins.writeStatus($.L10n.translate('wrong-answer', '', 'Wrong answer'), 'status-ko', 'status-ok');
		// Highlights
		var suggestion = whiteWins.getSuggestion(event.detail.start+event.detail.end+(event.detail.promotion?event.detail.promotion:''));
		if (suggestion) {
			whiteWins.highlightCell($.Dom.select('.cell[data-coord="'+suggestion.start+'"]')[0], 'opponent start');
			whiteWins.highlightCell($.Dom.select('.cell[data-coord="'+suggestion.end+'"]')[0], 'opponent end');
		}
	}
});

// WhiteWins extension
WhiteWins.prototype.writeStatus = function(message, add_class, remove_class) {
	var p = $.Dom.children('status', 'p')[0];
	if (message) {
		p.innerHTML = ''+message+'';
		$.Dom.removeClass('status', 'hidden');
	}
	else {
		$.Dom.addClass('status', 'hidden');
	}
	var self = this;
	
	setTimeout (function(){
	$.Each(add_class, function(a_class){
		$.Dom.addClass('status', a_class);
	});
	$.Each(remove_class, function(a_class){
		$.Dom.removeClass('status', a_class);
	});
	}, message?0:250);
	return this;
};

WhiteWins.prototype.applyDiagram = function () {
	var self = this;
	$.Each(this._diagram.position, function(position){
		var pos = position.substring(0, 2);
		var piece = position.substring(2, 4);
		var cell = $.Dom.select('#board .cell[data-coord="'+pos+'"]')[0];
		cell.innerHTML = self._translation[piece];
	});
	return this;
};

WhiteWins.prototype.clearBoard = function() {
	$.Each($.Dom.children($.Dom.id('board'), 'div', 'cell'), function(cell){
		cell.innerHTML = '';
		whiteWins.removeHighlight(cell);
	});
	return this;
};

WhiteWins.prototype.getLastOrFirstUnsolved = function() {
	var index = parseInt($.Storage.get('last-opened'));
	if (index || index === 0) {
		return index;
	}
	else {
		return this.next();
	}
};

WhiteWins.prototype.applyAllowedRules = function () {
	$.Dom.id('index-allowed-moves').innerHTML = '';
	if (this._diagram.allowed.wlc) {
		$.Dom.inject($.Dom.element('li', {}, '<span>'+$.L10n.translate('white', '', 'White')+' </span><code class="white">O-O-O</code>'), 'index-allowed-moves');
	}
	if (this._diagram.allowed.wsc) {
		$.Dom.inject($.Dom.element('li', {}, '<span>'+$.L10n.translate('white', '', 'White')+' </span><code class="white">O-O</code>'), 'index-allowed-moves');
	}
	if (this._diagram.allowed.blc) {
		$.Dom.inject($.Dom.element('li', {}, '<span>'+$.L10n.translate('black', '', 'Black')+' </span><code class="black">O-O-O</code>'), 'index-allowed-moves');
	}
	if (this._diagram.allowed.bsc) {
		$.Dom.inject($.Dom.element('li', {}, '<span>'+$.L10n.translate('black', '', 'Black')+' </span><code class="black">O-O</code>'), 'index-allowed-moves');
	}
	if (this._diagram.allowed.enp) {
		$.Dom.inject($.Dom.element('li', {}, '<span>'+$.L10n.translate('en-passant', '', 'En-passant')+' </span><code class="enpassant">'+this.convert(this._diagram.allowed.enp)+'</code>'), 'index-allowed-moves');
	}
	return this;
};

WhiteWins.prototype.highlightCell = function (cell, classes) {
	// Classes:
	// 	highlight, player, opponent, start, end
	$.Dom.addClass(cell, 'highlight');
	$.Dom.addClass(cell, classes);
	return this;
};

WhiteWins.prototype.removeHighlight = function (cell) {
	$.Dom.removeClass(cell, 'highlight');
	$.Dom.removeClass(cell, 'player');
	$.Dom.removeClass(cell, 'opponent');
	$.Dom.removeClass(cell, 'start');
	$.Dom.removeClass(cell, 'end');
	return this;
};
WhiteWins.prototype.removeHighlights = function(){
	var self = this;
	$.Each($.Dom.select('#board .highlight'), function(cell){
		self.removeHighlight(cell);
	});
	return this;
};