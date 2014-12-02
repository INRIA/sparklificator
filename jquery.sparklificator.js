/**
* Sparklificator jQuery plugin version v1.0.0
*
* (c) 2014 Pascal Goffin, Wesley Willett, Jean-Daniel Fekete, and Petra Isenberg
*
* http://inria.github.io/sparklificator
*
* Released under MIT license.
**/


(function ( $ ) {

	$.widget( 'aviz.sparklificator', {

		/**
		* Default options
		* @param {string} position - 3 available named choices: 'top', 'right', and 'baseline' OR just {top: int, left: int}
		* @param {int} width - the width of the word-scale visusalization
		* @param {int} height - the height of the word-scale visusalization
		* @param {array | function} data - the data to be visualized by the word-scale visusalization
		* @param {boolean} paddingWidth - adds padding (horizontal) or allows overlap between word-scale visusalization and word-scale visusalization, and word-scale visusalization and text
		* @param {boolean} paddingHeight - adds padding (vertical) or allows overlap between word-scale visusalization and word-scale visusalization, and word-scale visusalization and text
		* @param {string} stackingOrder - 2 available named choices: 'front' and 'back', adds the possibility ('back') to render the word-scale visualization behind the entity (parts covered by entity) or in front ('front')
		* @param {boolean} hoverInteraction - adds hover interaction to the entity
		* @param {string | function} renderer - visualizes the given data for an element
		**/
		options: {
			position: 'top',
			width: 100,
			height: 50,
			data: [],
			paddingWidth: true,
			paddingHeight: false,
			stackingOrder: 'front',
			hoverInteraction: false,
			renderer: function(){},
		},


		/**
		* Function that gets called when the plugin is called the first time, initialization of the plugin
		**/
	    _create: function() {

	    	var o = this.options;

	    	// element is the text element (entity) associated with the words-scale visualization
	    	var element = this.element;
	    	element.css('position', 'relative');
	    	element.addClass('entity');

	    	element.wrap("<span class='sparklificated'></span>");

	    	// sparklificatedSPAN is the span which contains the word-scale visualization span and the entity span
	    	var sparklificatedSPAN = element.parent();
	    	sparklificatedSPAN.css('position', 'relative');
	    	sparklificatedSPAN.css('white-space', 'nowrap');
			sparklificatedSPAN.css('display', 'inline-block');

	    	// sparklineSPAN is the the span around the word-scale visualization
	    	var sparklineSPAN = $('<span class="sparkline"></span>');
			sparklificatedSPAN.append(sparklineSPAN);

	    	//set the other basic properties of the container and sparkline
	    	sparklineSPAN.css('position', 'absolute');

			return this;
		},


		/**
		* To change one default option
		* Example of how this function can be called: $('.name').sparklificator('option', 'renderer', 'classicSparkline')
		* @param {string} option - the option name (position, width, height, data, paddingWidth, paddingHeight, renderer)
		* @param {string | function} value - the value for the option
		**/
		_setOption: function(option, value) {
			this._super(option, value);
        	this.refresh(option);
		},


		/**
		* To change multiples default options
		* Example of how this function can be called: $('.name').sparklificator('option', {renderer: 'classicSparkline', position: 'right'})
		* @param {object} options - contains multiple options to be changed at once
		**/
		_setOptions: function(options) {
			this._super(options);
		},


		/**
		* Called when a default option is changed
		* @param {string} option - the option name
		**/
		refresh: function(option) {
			var o = this.options;
			var element = this.element;

			// sparklificatedSPAN is the span which contains the word-scale visualization span and the entity span
			var sparklificatedSPAN = element.parent();

			// sparklineSPAN is the the span around the word-scale visualization
			var sparklineSPAN = element.next();

			var newWidth = $.isFunction(o.width) ? o.width.call(this) : o.width;
			var newHeight = $.isFunction(o.height) ? o.height.call(this) : o.height;

			switch(option) {
				case 'position':
				case 'paddingWidth':
				case 'paddingHeight':

					this._setNewPosition(sparklineSPAN, sparklificatedSPAN, newWidth, newHeight);
					break;

				case 'data':
				case 'renderer':
				case 'hoverInteraction':
				case 'height':
				case 'width':

					sparklineSPAN.empty();

					var data = $.isFunction(o.data) ? o.data.call(this, element[0]) : o.data;

					var hoverInteraction = $.isFunction(o.hoverInteraction) ? o.hoverInteraction.call(this, element[0]) : o.hoverInteraction;

					o.renderer.call(this, sparklineSPAN, newWidth, newHeight, hoverInteraction, data);
					
					this._setNewPosition(sparklineSPAN, sparklificatedSPAN, newWidth, newHeight);
					break;
			}
		},


		/**
		* Recomputes and sets the position of the word-scale visualization using the current settings.
		* IMPORTANT: divs/spans that are sparklificated need to be visible (NOT display: none), as some of the calculations are based on the divs being connected in the DOM.
		* @param {object} sparklineSPAN - the container in which the word-scale visualization is drawn.
		* @param {object} sparklificatedSPAN - the outside span holding both the word-scale visualization and entity spans.
		* @param {int} width - the width of the word-scale visualization from the current setting
		* @param {int} height - the height of the word-scale visualization from the current setting
		**/
		_setNewPosition: function(sparklineSPAN, sparklificatedSPAN, width, height) {

			var o = this.options;
			var elementSPAN = this.element;

			// set the top position of the sparklineSPAN to 0, to guarantee a consistent calculation of the difference between sparklineSPAN and elementSPAN position
			sparklineSPAN.css('top', 0 + 'px');

			// height of the text element bounding box
			var fontSize = elementSPAN[0].offsetHeight;

			// width of the text element bounding box
			var lengthOfEntity = elementSPAN[0].offsetWidth;
			
			// line-height of the text element
			var currentLineHeight = parseFloat($(elementSPAN[0]).css('line-height'));

			// because the postion can be a function
			var newPosition = $.isFunction(o.position) ? o.position.call(this, elementSPAN[0]) : o.position;

			// set the width and height of the sparklineSPAN to guarantee consistent widht and height
			sparklineSPAN.width(width);
			sparklineSPAN.height(height);

			var xOffset = 0;
			var yOffset = 0;	// the y position of the top edge
			var marginTop = 0;
			var marginRight = 0;
			var marginLeft = 0;
			var marginBottom = 0;


			// yOffset for top position of the elementSPAN and the sparklineSPAN
			var topPosSpanToSpark = elementSPAN[0].getBoundingClientRect().top;
			var topPosSpark = sparklineSPAN[0].getBoundingClientRect().top;

			// difference between top positions of the 2 containers
			var diffTopPos = topPosSpanToSpark - topPosSpark;

			// difference between right positions of the 2 containers
			var diffTopPosRight = (topPosSpanToSpark + fontSize) - (topPosSpark + height);


			// calculate length of nbsp (space between entity and sparkline)
			var tmpNBSPNode = $('<span display=none></span>').append('&nbsp;');
			sparklificatedSPAN.append(tmpNBSPNode);
			var lengthOfNBSP = tmpNBSPNode[0].offsetWidth;
			tmpNBSPNode.remove();


			if (newPosition === 'top'){
				yOffset = diffTopPos - height;
			} else if (newPosition === 'right') {
				xOffset = +lengthOfEntity + lengthOfNBSP;
				yOffset = diffTopPosRight;
			} else if (newPosition === 'baseline'){
				yOffset = diffTopPosRight;
			} else if (newPosition === 'left'){
				xOffset = -width - +lengthOfNBSP;
				yOffset = diffTopPosRight;
			} else if (newPosition === 'below'){
				yOffset = diffTopPos + fontSize;
			} else if ($.isPlainObject(o.position) || $.isFunction(o.position)) {
				xOffset = newPosition.left;
				yOffset = newPosition.top;
			} else {
				console.log('PROBLEM: your option for POSITION (' + newPosition +') is not a function or a valid default option');
			}


			marginTop = o.paddingHeight ? Math.max(-(yOffset-diffTopPos) - (currentLineHeight - fontSize), 0) :0
			marginRight = o.paddingWidth ? Math.max(xOffset + width - lengthOfEntity, 0) : 0;
			marginLeft = o.paddingWidth ? Math.max(-xOffset, 0) : 0;
			marginBottom = o.paddingHeight ? Math.max(yOffset - (currentLineHeight - fontSize), 0) : 0;

			sparklineSPAN.css('top', yOffset + 'px');
			sparklineSPAN.css('left', xOffset + 'px');
			sparklificatedSPAN.css('margin-top', marginTop);
			sparklificatedSPAN.css('margin-right', marginRight);
			sparklificatedSPAN.css('margin-left', marginLeft);
			sparklificatedSPAN.css('margin-bottom', marginBottom);


			var currentIndex = 2;
			this.element.css('z-index', currentIndex);
			if (o.stackingOrder === 'front') {
				var upOne = currentIndex + 1;
			 	sparklineSPAN.css('z-index', upOne);
			} else if (o.stackingOrder === 'back') {
				var downOne = currentIndex - 1;
			 	sparklineSPAN.css('z-index', downOne);
			}
		},


		/**
		* Relayouts the word-scale visualizations
		**/
		// relayout: function() {
		// 	// what is needed for the relayouting
		// }


		/**
		* Removes all the DOM objects added by the sparklificator
		**/
		destroy: function() {
			var element = this.element;

			element.next().next().remove();
			element.next().remove()
			element.unwrap();

			this._destroy();
		},

	});

}( jQuery ));
