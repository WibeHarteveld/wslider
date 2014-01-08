;(function ( $, window, document, undefined ) {

	/* global variables */
	var totalSlides = 0,
	    currentSlide = {},
	    nextSlide = {},
	    prevSlide = {},
	    pluginName = "wSlider",
	    // the name of using in .data()
	    dataPlugin = "plugin_" + pluginName,

	/* default options */
	defaults = {
		elasticPullResistance: 0.6,
		frictionCoefficient: 0.92,
		elasticFrictionCoefficient: 0.6,
		snapFrictionCoefficient: 0.92,
		snapToChildren: false,
		snapSlideCenter: false,
		startAtSlide: 1,
		scrollbar: false,
		scrollbarDrag: false,
		scrollbarHide: true,
		scrollbarLocation: "top",
		scrollbarContainer: "",
		scrollbarOpacity: 0.4,
		scrollbarHeight: "4px",
		scrollbarBorder: "0",
		scrollbarMargin: "5px",
		scrollbarBackground: "#000",
		scrollbarBorderRadius: "100px",
		scrollbarShadow: "0 0 0 #000",
		scrollbarElasticPullResistance: 0.9,
		desktopClickDrag: false,
		keyboardControls: false,
		tabToAdvance: false,
		responsiveSlideContainer: true,
		responsiveSlides: true,
		navSlideSelector: "",
		navPrevSelector: "",
		navNextSelector: "",
		autoSlide: false,
		autoSlideTimer: 5000,
		autoSlideTransTimer: 750,
		autoSlideToggleSelector: "",
		autoSlideHoverPause: true,
		infiniteSlider: false,
		snapVelocityThreshold: 5,
		slideStartVelocityThreshold: 0,
		horizontalSlideLockThreshold: 5,
		verticalSlideLockThreshold: 3,
		stageCSS: {
			position: "relative",
			top: "0",
			left: "0",
			overflow: "hidden",
			zIndex: 1
		},
		unselectableSelector: "",

		/* Callback functions */
		onSliderLoaded: function() {},
		onSliderUpdate: function() {},
		onSliderResize: function() {},
		onSlideStart: function() {},
		onSlideChange: function() {},
		onSlideComplete: function() {}
	},

	/* Private methods */
	_getSliderOffset = function (hasCSSAnimation) {

	},

	_setSliderOffset = function (slidesGroup, slidesOffset) {
		console.log("hallo");

		slidesGroup.css({
			"width": slidesOffset,
			"webkitTransform": "matrix(1,0,0,1," + slidesOffset + ",0)",
			"MozTransform": "matrix(1,0,0,1," + slidesOffset + ",0)",
			"transform": "matrix(1,0,0,1," + slidesOffset + ",0)",
		});
		// width: 3600px; -webkit-transform: matrix(1, 0, 0, 1, -4500, 0);
	},

	_getTotalSlides = function () {
		console.log("Total slides");
	},

	_getCurSlide = function () {
		// some logic
	},

	_getNextSlide = function () {
		// some logic
	},

	_getPrevSlide = function () {
		// some logic
	},

	// plugin constructor
	Plugin = function ( element ) {
		/*
		 * plugin instantiation
		 */
		this.element = element;
		this._defaults = defaults;
		this._name = pluginName;
	};

	Plugin.prototype = {

		init: function ( options ) {
			// Merge passes options with defaults obj
			this.settings = $.extend( this._defaults, options );

			/* Global variables */
			var hasCSSAnimation = Modernizr.cssanimations,
			slider = this.element,
			slidesGroup = slider.find("div.slides");
			slides = slider.find("div.slide"),
			slidesOffset = slides.length * slider.width(),

			anchorEvents = slider.find("a");

			console.log(hasCSSAnimation);

			// Use css3 animation if browser supports it
			if (hasAnimation) {

				// arrange slides behind each other by using CSS3 animation
				_setSliderOffset(slidesGroup, slidesOffset);
			} else {
				// jquery animation fallback will be used instead
			}


			// Place initialization logic here
			// You already have access to the DOM element and
			// the options via the instance, e.g. this.element
			// and this.settings
			// you can add more functions like the one below and
			// call them like so: this.yourOtherFunction(this.element, this.settings).

			// creating new DOM elements, registering listeners, etc


		},

		// Updates/reinitializes internal variables/CSS attributes based
		// on changes to the HTML/CSS/JS structure of the slider.
		update: function () {
			console.log("update method!");
		},

		destroy: function () {
			// unset Plugin data instance
			this.element.data( dataPlugin, null );

			// responsible to free any resource used by the plugin: extra elements, unregister listeners, etc.
		},

		// Slides to the next slide.
		nextSlide: function () {
			// ...
		},

		// Slides to the previous slide.
		prevSlide: function () {
			// ...
		},

		// Moves to the selected slide.
		goToSlide: function ( slideNum ) {
			// ...
		},

		// Adds a slide defined by "slideHTML" and placed at position "slidePosition".
		addSlide: function ( slideHTML, slidePosition ) {
			// ...
		},

		// Removes a slide from the slider
		removeSlide: function ( slideNum ) {
			// ...
		},

		// Locks the slider. Temporarily disabling touch/drag events within the slider without unbinding them.
		lockSlide: function () {
			// ...
		},

		// Unlocks the slider. Enables touch/drag events previously disabled by the lock method.
		unlockSlide: function () {
			// ...
		},

		// Starts and enables auto-sliding on the slider.
		autoSlidePlay: function () {
			// ...
		},

		// Stops the slider from auto-sliding.
		autoSlidePause: function () {
			// ...
		},

		// public get method
		href: function () {
			return this.element.attr( "href" );
		},

		// public chaining method
		changeBG: function ( color ) {
			color = color || this.options.color;
			return this.element.each(function () {
				// .css() doesn"t need .each(), here just for example
				$(this).css( "background", color );
			});
		}
	};

	/*
	 * Plugin wrapper, preventing against multiple instantiations and
	 * allowing any public function to be called via the jQuery plugin,
	 * e.g. $(element).pluginName("functionName", arg1, arg2, ...)
	 */
	$.fn[ pluginName ] = function ( arg ) {

		var args,
		    instance;

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
			args = Array.prototype.slice.call( arguments, 1 );

			// Call the method
			return instance[arg].apply( instance, args );

		} else {

			$.error( "Method " + arg + " does not exist on jQuery." + pluginName );

		}
	};

})( jQuery, window, document );
