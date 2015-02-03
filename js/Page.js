
var Page = {
	history: [],
	open: function (id) {
		//duale
		var page = $.Dom.id(id);
		if (page) {
			var current = $.Dom.children(document.body, 'section', 'current')[0]
			if (current) {
				location.href = '#';
				$.Dom.removeClass(current, 'current');
				$.Dom.addClass(current, 'previous');
				$.Dom.addClass(page, 'current');
				this.history.push(current.id);
			}
		}
	},
	back: function() {
		//ricavo dal dom l'oggetto con l'id richiesto
		var page = $.Dom.id(this.history.pop());
		if (page) {
			//trovo nel dom la section con classe current
			var current = $.Dom.children(document.body, 'section', 'current')[0];
			if (current) {
				//tolgo la classe current alla section attualmente visualizzata (che sta per andarsene)
				//assegno la classe current alla section che sto per rendere visibile 
				$.Dom.removeClass(current, 'current');
				$.Dom.addClass(page, 'current');
				$.Dom.removeClass(page, 'previous');
			}
		}
	}
};
