;(function ( $, window, document, undefined ) {

	/* global variables */
	var pluginName = "wSlider",
	dataPlugin = "plugin_" + pluginName,

	/* default options */
	defaults = {
		mouseSlidePercentage: 35,

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
	getCurSlidePos = function () {

	},

	_getSlideOffset = function ( slidePos, slideOffset ) {
		return ( slidePos - 1 ) * slideOffset;
	},

	_isFirstSlide = function ( slide ) {
		if ( slide === 1 ) {
			return true;
		}
	},

	_isLastSlide = function ( slide, numAllSlides ) {
		if ( slide === numAllSlides ) {
			return true;
		}
	},

	// _updateCurSlidePos = function ( option, obj ) {
	// 	obj.CurSlidePos = option;
	// },

	// _updateNextSlidePos = function ( option, obj ) {

	// 	// Increment nextSlide number if +
	// 	if ( option === "+") {
	// 		obj.nextSlidePos = obj.curSlidePos + 1;

	// 	// Decrement nextSlide number if -
	// 	} else if ( option === "-") {
	// 		obj.nextSlidePos = obj.curSlidePos - 1;

	// 	// Next slide number becomes passed through argument, if nextSlidePos is a number
	// 	// and below or same as last slide number.
	// 	} else if ( IsNumeric( option ) && option <= obj.numAllSlides ) {
	// 		obj.nextSlidePos = option;

	// 	} else {
	// 		exit;
	// 	}
	// },

	_initAllSlidesOffset = function ( allSlides, numAllSlides, slideOffset ) {
		var offset = 0;

		// Iterate over each slide and use a different offset for last slide.
		allSlides.each( function () {

			_setTransformOffset( offset, this );

			$(this).css({
				"position": "absolute",
				"cursor": "-webkit-grab"
			});

			offset += slideOffset;
		});
	},

	_initSlideOffset = function ( slidePos, allSlides, slidesContainer, numAllSlides, slideOffset ) {
		var beforeFirstSlideOffset = 0,
		afterLastSlideOffset       = _getSlideOffset( (numAllSlides + 1), slideOffset ),
		slideOffsetLast            = _getSlideOffset( numAllSlides, slideOffset ),
		slidesContainerOffset      = -(_getSlideOffset( slidePos, slideOffset ));


		// if ( slidePos === 0 ) {
		// 	// Position the last slide (who is positioned before first) back to the end of the slides
		// 	_setTransformOffset( slideOffsetLast, allSlides[ numAllSlides - 1 ] );

		// 	// Rearrange the first slide after the last slide.
		// 	afterLastSlideOffset = _getSlideOffset( (numAllSlides + 1), slideOffset ),
		// 	console.log(allSlides[0]);
		// 	_setTransformOffset( afterLastSlideOffset, allSlides[0] );

		// 	// Set slides container offset to last slide
		// 	slidesContainerOffset = -(_getSlideOffset( numAllSlides, slideOffset ));
		// 	_setTransformOffset( slidesContainerOffset, slidesContainer );

		// If the current slidePos is the first slide, rearrange last slide before first slide.
		// Rearrange first slide if it is positioned at the end of the slides.
		if ( _isFirstSlide( slidePos ) ) {
			_setTransformOffset( 0, allSlides[0] );

			beforeFirstSlideOffset = _getSlideOffset( (slidePos - 1), slideOffset ),
			_setTransformOffset( beforeFirstSlideOffset, allSlides[ numAllSlides - 1 ] );

			// Set slides container offset to first slide
			_setTransformOffset( slidesContainerOffset, slidesContainer );

		// If slide is the second slide and first slide is positioned last, position first slide back
		} else if ( slidePos === 2 ) {
			_setTransformOffset( 0, allSlides[0] );

			// Set slides container offset
			_setTransformOffset( slidesContainerOffset, slidesContainer );

		// If slide is the second last slide, rearrange last slide to end if
		// last slide is still before the first slide.
		// TODO check eff
		} else if ( slidePos === numAllSlides - 1 ) {
			// Rearange last slide
			_setTransformOffset( slideOffsetLast, allSlides[ numAllSlides - 1 ] );

			// Set slides container offset
			_setTransformOffset( slidesContainerOffset, slidesContainer );

		// If slide is the last slide, rearrange first slide to the end.
		} else if ( _isLastSlide( slidePos, numAllSlides ) ) {
			console.log("Last slide");
			_setTransformOffset( slideOffsetLast, allSlides[ numAllSlides - 1 ] );
			_setTransformOffset( afterLastSlideOffset, allSlides[0] );
			// Set slides container offset to last slide
			_setTransformOffset( slidesContainerOffset, slidesContainer );

		} else {
			// Else only change offset of slide container, no rearranging
			// of slide positions occur.
			_setTransformOffset( slidesContainerOffset, slidesContainer );

		}
	},

	_setTransformOffset = function ( offset, node ) {
		$(node).css({
			"webkitTransform": "matrix(1,0,0,1," + offset + ",0)",
			"MozTransform": "matrix(1,0,0,1," + offset + ",0)",
			"transform": "matrix(1,0,0,1," + offset + ",0)",
		});
	};

	// plugin constructor
	function Plugin( element ) {
		this.element   = element;

		this._defaults = defaults;
		this._name     = pluginName;
 	}

	Plugin.prototype = {

		init: function ( options ) {
			// Merge passes options with defaults obj
			this.settings = $.extend( this._defaults, options );

			// Check for correct startAtSlide value. If not correct, set to default value.
			// 0 is not allowed for startSlide
			if ( this.settings.startAtSlide === 0 ) {
				this.settings.startAtSlide = this.defaults.startAtSlide;

			// Higher value than last slide is not allowed
			} else if ( this.settings.startAtSlide > this.numAllSlides ) {
				this.settings.startAtSlide = this.defaults.startAtSlide;
			}

			/* Global variables */
			var $document = $(document),
			that          = this;
			// slider               = this.element,
			// slidesContainer      = slider.find("div.slides"),
			// objAllSlides         = slider.find("div.slide"),
			// numAllSlides         = objAllSlides.length,
			// sliderWidth          = slider.width(),
			// slidesContainerWidth = numAllSlides * sliderWidth,
			// slideOffset          = sliderWidth,
			// slideOffsetLast      = slideOffset * numAllSlides,
			// hasCSSAnimation      = Modernizr.cssanimations,
			// anchorEvents         = slider.find("a");

			this.slidesContainer      = this.element.find("div.slides");
			this.allSlides            = this.element.find("div.slide");
			this.numAllSlides         = this.allSlides.length;
			this.sliderWidth          = this.element.width();
			this.slidesContainerWidth = this.numAllSlides * this.sliderWidth;
			this.slideOffset          = this.sliderWidth;
			this.hasCSSAnimation      = Modernizr.cssanimations;
			this.anchorEvents         = this.element.find("a");
			this.curSlidePos          = this.settings.startAtSlide;
			this.nextSlidePos         = 0;
			this.prevSlidePos         = 0;
			this.curSlideOffset       = _getSlideOffset( this.settings.startAtSlide, this.slideOffset );
			this.slideContainerOffset = -(_getSlideOffset( this.settings.startAtSlide, this.slideOffset ));

			// // If current slide is at the beginning of slides, rearrange 4th slide
			// // to the beginning.
			// if ( curSlide <== 1 ) {
			// 	_setSliderOffset( objAllSlides[ numAllSlides-1 ], 0 );

			// // If current slide is at the end of slides, rearrange 1st slide
			// // to the end.
			// } else if ( curSlide === numAllSlides ) {
			// 	_setSliderOffset( objAllSlides[0], slideOffsetLast );
			// }

			// Set CSS3 transition on the slides container
			// this.slidesContainer.css({
			// 	"width": this.slidesContainerWidth,
			// 	"webkitTransition": "all 1s"
			// });

			_initAllSlidesOffset( this.allSlides, this.numAllSlides, this.slideOffset );

			_initSlideOffset( this.curSlidePos, this.allSlides, this.slidesContainer, this.numAllSlides, this.slideOffset );

			// // Set initial slides container offset
			// _setSliderOffset( slidesContainer, 0 );

			// // set each initial slide offset and css
			// allSlides.each( function( index, node ) {

			// 	_setSliderOffset( node, slideOffset);

			// Add mouse handlers for horizontal scrolling through slides
			this.allSlides.on( "mousedown", function ( evMouseDown ) {
				var mousePositionStartX = evMouseDown.pageX,
				mouseDistanceX          = 0,
				mousePositionCurX       = 0,
				mouseDistancePerc       = 0;

				// Remove css transition
				that.slidesContainer.css( "transition", "" );

				$document.on( "mousemove.namespace1", function( evMouseMove ) {
					// Scroll slides
					mouseDistanceX = evMouseMove.pageX - mousePositionStartX;

					// Take current slide offset as base of mouse movement
					mouseDistanceXCurSlide = -that.curSlideOffset + mouseDistanceX;

					// Set sliderOffset of slidescontainer to dragged distance
					_setTransformOffset( mouseDistanceXCurSlide, that.slidesContainer );

				});
				$document.on( "mouseup.namespace1", function () {

					// Add CSS transition
					// that.slidesContainer.css( "webkitTransition", "all 1s" );

					// Scroll to next, previous or current slide.
					// If scroll is the same or more that given mouseSlidePercentage go to next slide or
					// previous slide
					mouseDistancePerc = Math.abs(mouseDistanceX) / (that.sliderWidth / 100);
					if ( mouseDistancePerc >= that.settings.mouseSlidePercentage ) {

						// If mouseDistanceX is negative, goto next slide
						if ( mouseDistanceX < 0 ) {
							that.slideRight();

						// If mouseDistanceX is positive go to prev slide
						} else {
							that.slideLeft();
						}

					// Go back to current slide
					} else {
						console.log("nop, not more than half");
						_setTransformOffset( that.slideContainerOffset, that.slidesContainer );
					}

					console.log("Current slide pos: " + that.curSlidePos);
					console.log("Current slide Offset: " + that.curSlideOffset);
					console.log("Next slide pos: " + that.nextSlidePos);
					console.log("Previous slide pos: " + that.prevSlidePos);
					console.log("Current Container Offset: " + that.slideContainerOffset);

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

		// Slides to the right slide
		slideRight: function () {
			// If current slide is the last slide, next slide is the first slide
			if ( _isLastSlide( this.curSlidePos, this.numAllSlides ) ) {
				this.nextSlidePos = 1;

			} else {
				// Increase the next slide by 1
				this.nextSlidePos = this.curSlidePos + 1;
			}

			// Set slideOffset based on next slide number
			_initSlideOffset( this.nextSlidePos, this.allSlides, this.slidesContainer, this.numAllSlides, this.slideOffset );

			// Update previous slide position
			this.prevSlidePos = this.curSlidePos;

			// Update cur slide position
			this.curSlidePos = this.nextSlidePos;

			// Update current slide and slides container offset
			this.curSlideOffset = _getSlideOffset( this.curSlidePos, this.slideOffset );
			this.slideContainerOffset = -(_getSlideOffset( this.curSlidePos, this.slideOffset ));

			// Reset next slide position
			this.nextSlidePos = 0;
		},

		// Slides to the left slide
		slideLeft: function () {
			// If current slide is the first slide, next slide is the last slide
			if ( _isFirstSlide( this.curSlidePos, this.numAllSlides ) ) {
				this.nextSlidePos = this.numAllSlides;

			} else {
				// Decrease the next slide by 1
				this.nextSlidePos = this.curSlidePos - 1;
			}

			// Set slideOffset based on next slide number
			_initSlideOffset( this.nextSlidePos, this.allSlides, this.slidesContainer, this.numAllSlides, this.slideOffset );

			// Update previous slide position
			this.prevSlidePos = this.curSlidePos;

			// Update cur slide position
			this.curSlidePos = this.nextSlidePos;

			// Update current slide and slides container offset
			this.curSlideOffset = _getSlideOffset( this.curSlidePos, this.slideOffset );
			this.slideContainerOffset = -(_getSlideOffset( this.curSlidePos, this.slideOffset ));

			// Reset next slide position
			this.nextSlidePos = 0;
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
