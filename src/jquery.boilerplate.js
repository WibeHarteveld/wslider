;(function ( $, window, document, undefined ) {

		// private variables
		var totalSlides = 0,
				currentSlide = {},
				nextSlide = {},
				prevSlide = {};

		// wSlider defaults
		var pluginName = "wSlider",
				defaults = {
					slideInterval: 5000
				};

		var _privateMethod = function () {
			console.log("Private method");
		},

		_getTotalSlides = function () {
			console.log(this);
		},

		_getCurrentSlide = function () {
				// some logic
		},

		_getNextSlide = function () {
				// some logic
		},

		_getPrevSlide = function () {
				// some logic
		},

		_getSliderOffset = function () {
				// some logic
		},

		_setSliderOffset = function () {
				// some logic
		};

		// plugin constructor
		function Plugin ( element, options ) {
				this.element = element;
				this.settings = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;
				this.init();
		}

		Plugin.prototype = {

				init: function () {
						// Place initialization logic here
						// You already have access to the DOM element and
						// the options via the instance, e.g. this.element
						// and this.settings
						// you can add more functions like the one below and
						// call them like so: this.yourOtherFunction(this.element, this.settings).
						console.log("xD");

						// creating new DOM elements, registering listeners, etc
				},

				destroy: function () {
					// unset Plugin data instance
					this.element.data( dataPlugin, null );

					// responsible to free any resource used by the plugin: extra elements, unregister listeners, etc.
				},

				// public get method
				href: function () {
					return this.element.attr( "href" );
				},

				// public chaining method
				changeBG: function ( color ) {
					color = color || this.options.color;
					return this.element.each(function () {
						// .css() doesn't need .each(), here just for example
            $(this).css( "background", color );
					});
				},

				// private method
				publicMethod: function () {
					console.log("public method");
				}
		};

		/*
     * Plugin wrapper, preventing against multiple instantiations and
     * allowing any public function to be called via the jQuery plugin,
     * e.g. $(element).pluginName('functionName', arg1, arg2, ...)
     */
		$.fn[ pluginName ] = function ( arg ) {

			var args, instance;

			// only allow the plugin to be instantiated once
			if ( !( this.data( dataPlugin ) instanceof Plugin ) ) {

				// if no instance, create one
				this.data( dataPlugin, new Plugin( this ) );
			}

			instance = this.data( dataPlugin );

			instance.element = this;

			// Is the first parameter an object (arg), or was omitted,
      // call Plugin.init( arg )
			if ( typeof arg === "undefined" || typeof arg === "object" ) {

				if ( typeof instance.init === "function" ) {
					instance.init( arg );
				}

			// checks that the requested public method exists
			} else if ( typeof arg === "string" && typeof instance[arg] === "function" ) {

				// copy arguments & remove function name
				args =Array.prototype.slice.call( arguments, 1 );

				// Call the method
				return instance[arg].apply( instance, args );

			} else {

				$.error( "Method " + arg + " does not exist on jQuery." + pluginName );

			}
		};

})( jQuery, window, document );
