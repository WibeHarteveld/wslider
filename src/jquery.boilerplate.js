;(function ( $, window, document, undefined ) {

	/* global variables */
	var pluginName = "wSlider",
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
	_getSliderOffset = function ( hasCSSAnimation ) {

	},

	_nextSlide = function () {
		objSlider.callback.curSlide += 1;
		_setSlideOffset();
		// _setSlideOffset(curSlide)
	},

	// Slides to next slide
	_setSlideOffset = function ( slidePos ) {
		var offset = 0;

		// If no slidePos is passed through function, use curSlide value instead.
		slidePos = (typeof slidePos === "undefined") ? objSlider.callback.curSlide : slidePos;
		console.log(objSlider.callback.curSlide);

		// If the current slide is the first one, rearrange last slide before first slide.
		if ( slidePos <= 1 ) {

			// Iterate over each slide and use a different offset
			// for last slide
			objAllSlides.each( function ( index ) {
				// set offset of last slide before first slide
				if ( index === numAllSlides-1 ) {
					offset = -slideOffset;
				}
				_setTransformOffset( offset, this );

				$(this).css({
					"position": "absolute",
					"cursor": "-webkit-grab"
				});

				offset += sliderWidth;
			});

			// set slides container offset
			_setTransformOffset( 0, slidesContainer );

		// If current slide is the last slide, rearrange first slide to the end.
		} else if ( slidePos === numAllSlides ) {
			_setTransformOffset( slideOffsetLast, objAllSlides[0] );

		// Else do normal
		} else {

			nextSlideOffset = ( -( objSlider.callback.curSlide -1 ) * slideOffset );
			_setTransformOffset( nextSlideOffset, slidesContainer );

		}

	},

	_setTransformOffset = function ( offset, node ) {
		$(node).css({
			"webkitTransform": "matrix(1,0,0,1," + offset + ",0)",
			"MozTransform": "matrix(1,0,0,1," + offset + ",0)",
			"transform": "matrix(1,0,0,1," + offset + ",0)",
		});
	},

	// Slides to the next slide.

	// Slides to the previous slide.
	prevSlide = function () {
		// ...
	},

	// Moves to the selected slide.
	goToSlide = function ( slideNum ) {
		// ...
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
			var $document        = $(document);
			objSlider            = this,
			slider               = this.element,
			slidesContainer      = slider.find("div.slides");
			objAllSlides         = slider.find("div.slide"),
			numAllSlides         = objAllSlides.length,
			sliderWidth          = slider.width();
			slidesContainerWidth = numAllSlides * sliderWidth,
			slideOffset          = sliderWidth,
			slideOffsetLast      = slideOffset * numAllSlides,
			hasCSSAnimation      = Modernizr.cssanimations,
			anchorEvents         = slider.find("a");

			this.callback = {
				"curSlide": this.settings.startAtSlide
			};


			console.log($(slider).data());

			// // If current slide is at the beginning of slides, rearrange 4th slide
			// // to the beginning.
			// if ( curSlide <== 1 ) {
			// 	_setSliderOffset( objAllSlides[ numAllSlides-1 ], 0 );

			// // If current slide is at the end of slides, rearrange 1st slide
			// // to the end.
			// } else if ( curSlide === numAllSlides ) {
			// 	_setSliderOffset( objAllSlides[0], slideOffsetLast );
			// }

			// Set initial slides container css
			slidesContainer.css({
				"width": slidesContainerWidth,
				"webkitTransition": "all 1s"
			});

			_setSlideOffset();

			// // Set initial slides container offset
			// _setSliderOffset( slidesContainer, 0 );

			// // set each initial slide offset and css
			// objAllSlides.each( function( index, node ) {

			// 	_setSliderOffset( node, slideOffset);

			// Add mouse handlers for horizontal scrolling through slides
			objAllSlides.on( "mousedown", function ( evMouseDown ) {
				var mousePositionStartX = evMouseDown.pageX,
				mouseDistanceX    = 0,
				mousePositionCurX = 0;

				// Remove css transition
				slidesContainer.css( "transition", "" );

				$document.on( "mousemove.namespace1", function( evMouseMove ) {
					// Scroll slides
					mouseDistanceX = evMouseMove.pageX - mousePositionStartX;

					// Set sliderOffset of slidescontainer to dragged distance
					_setTransformOffset( mouseDistanceX, slidesContainer );

				});
				$document.on( "mouseup.namespace1", function () {

					// Add CSS transition
					slidesContainer.css( "webkitTransition", "all 1s" );
					console.log(mouseDistanceX);
					// Scroll to next, previous or current slide
					// if scroll is over half of current slide go to next slide or
					// previous slide
					if ( Math.abs(mouseDistanceX) > (sliderWidth / 2) ) {

						// If mouseDistanceX is negative, goto next slide
						if ( mouseDistanceX < 0 ) {
							console.log("_nextSlide()");
							_nextSlide();

						// If positive go to prev slide
						} else {
							console.log("_goPrevSlide()");

						}

					// Go back to current slide
					} else {
						console.log("nop, not more than half");
						_setTransformOffset( 0, slidesContainer );
					}

					// Unbind mouse handlers
					$(this).unbind( ".namespace1" );
				});
			});

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
