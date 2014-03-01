;(function ( $, window, document, undefined ) {
"use strict";

/* global variables */
var pluginName = "wSlider",
dataPlugin = "plugin_" + pluginName,

/* default options */
defaults = {
	cssPrefixes: [ "webkit", "moz", "MS", "o", "" ],
	domPrefixes: [ "webkit", "moz", "MS", "o", "" ],
	mouseSlidePercentage: 35,
	elasticPullResistance: 0.6,
	startAtSlide: 1,
	scrollbar: false,
	scrollbarLocation: "top",
	scrollbarContainer: "",
	desktopClickDrag: false,
	keyboardControls: false,
	tabToAdvance: false,
	responsiveSlideContainer: true,
	responsiveSlides: true,
	goToSlideSelector: "",
	slideRightSelector: "",
	slideleftSelector: "",
	autoSlide: false,
	autoSlideTimer: 8000,
	autoSlideTransTimer: 750,
	autoSlideToggleSelector: "",
	autoSlideHoverPause: true,
	infiniteSlider: false,

	/* Callback functions */
	onSliderLoaded: function() {},
	onSliderUpdate: function() {},
	onSliderResize: function() {},
	onSlideStart: function() {},
	onSlideChange: function() {},
	onSlideComplete: function() {}
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

		this.slidesContainer        = this.element.find("div.slides");
		this.allSlides              = this.element.find("div.slide");
		this.numAllSlides           = this.allSlides.length;
		this.sliderWidth            = this.element.width();
		this.slidesContainerWidth   = this.numAllSlides * this.sliderWidth;
		this.slideOffset            = this.sliderWidth;
		this.hasCSSAnimation        = Modernizr.cssanimations;
		this.anchorEvents           = this.element.find("a");
		this.curSlidePos            = this.settings.startAtSlide;
		this.curSlide               = $(this.allSlides[this.curSlidePos-1]);
		this.curSlideOffset         = this._getSlideOffset( this.settings.startAtSlide );
		this.nextSlidePos           = 0;
		this.nextSlideOffset        = 0;
		this.prevSlidePos           = 0;
		this.prevSlideOffset        = 0;
		this.slidesContainerOffset  = -( this._getSlideOffset( this.settings.startAtSlide ) );

		this.beforeFirstSlideOffset = this._getSlideOffset( "first", -1 );
		this.afterLastSlideOffset   = this._getSlideOffset( "last", 1 );
		this.slideOffsetLast        = this._getSlideOffset("last");

		/* Global variables */
		var $document = $(document),
		that          = this;

		this.slidesContainer[0].style.width = this.slidesContainerWidth;

		this._initAllSlidesOffset();

		this._initSlideOffset( this.curSlidePos );

		// curSlidePos, prevSlidePos, allSlides, slidesContainer,
		// 	numAllSlides, slideOffset, beforeFirstSlideOffset,
		// 	afterLastSlideOffset, slideOffsetLast

		// Sets transition status to idle because no transition occurse when
		// initiating the first slide.
		this.slidesContainer.data("transitionStatus", "idle");

		// Add mouse handlers for horizontal scrolling through slides
		// function mouseDownEventHandler( event ) {

		// }
		this.slidesContainer[0].addEventListener( "mousedown", function (event) {

			var mousePositionStartX    = event.clientX,
			mouseDistanceX             = 0,
			mouseDistancePerc          = 0,
			curCssCompStyles           = window.getComputedStyle(that.slidesContainer[0], null),
			curCssTransformMatrix      = "",
			curCssTransformMatrixArray = [],
			curCssTransformMatrixTx    = 0,
			slidesContainerOffset      = 0,
			offsetBase                 = 0;

			// Get the computed CSS3 transform matrix value
			curCssTransformMatrix   = curCssCompStyles.getPropertyValue("-webkit-transform") ||
				curCssCompStyles.getPropertyValue("-moz-transform") ||
				curCssCompStyles.getPropertyValue("-MS-transform") ||
				curCssCompStyles.getPropertyValue("-o-transform") ||
				curCssCompStyles.getPropertyValue("transform");

			// Get the current transform matrix tx position
			curCssTransformMatrixArray = curCssTransformMatrix.split("(")[1];
			curCssTransformMatrixArray = curCssTransformMatrixArray.split(")")[0];
			curCssTransformMatrixArray = curCssTransformMatrixArray.split(",");
			curCssTransformMatrixTx = parseInt(curCssTransformMatrixArray[4]);

			// If matrix offset on mousedown differs from curContainerOffset,
			// set containerOffset based on computed matrix offset.
			if ( curCssTransformMatrixTx !== -(that.curSlideOffset) ) {
				offsetBase = curCssTransformMatrixTx;
			} else {
				// else set containerOffset based on the negative curSlideOffset
				offsetBase = -(that.curSlideOffset);
			}

			// Remove CSS3 transition
			that._setPrefixedCss( that.slidesContainer[0], "Transition", "");

			// If mouseup event occures before CSS3 transition ends (e.g. fast scrolling) when
			// looping delay has been set, set delayed transform offsets immediately.
			if ( that.slidesContainer.data("delayForTransitionLastToFirst") === true ) {
				console.log("Mouse used in transition, last to first");
				that._setTransformOffsetLastToFirst();

				// New offset based on the difference between transform matrix tx when mousedown
				// occurred, and afterLastSlideOffset. This difference has been accounted for
				// in the new slidesContainerOffset which has a firstPos offset base.
				offsetBase = offsetBase + (that.prevSlideOffset + that.slideOffset);

				// Reset delayForTransitionLastToFirst to false
				that.slidesContainer.data( "delayForTransitionLastToFirst", false);

			//
			} else if ( that.slidesContainer.data("delayForTransitionFirstToLast") === true ) {
				console.log("Mouse used in transition, first to last");
				that._setTransformOffsetFirstToLast();

				// New offset based on the difference between transform matrix tx when mousedown
				// occurred, and beforeFirstSlideOffset. This difference has been accounted for
				// in the new slidesContainerOffset which has a lastPos offset base.
				offsetBase = -(that.curSlideOffset) + (offsetBase + that.beforeFirstSlideOffset);

				// Reset delayForTransitionFirstToLast to false
				that.slidesContainer.data( "delayForTransitionFirstToLast", false);
			}

			// Take current slide offset as base for mouse movement
			slidesContainerOffset = offsetBase;

			// Set sliderOffset of slidescontainer to dragged distance
			that._setTransformOffset( slidesContainerOffset, that.slidesContainer );

			$document.on( "mousemove.namespace1", function( evMouseMove ) {

				// Scroll slides
				mouseDistanceX = evMouseMove.pageX - mousePositionStartX;

				// Take current slide offset as base for mouse movement
				slidesContainerOffset = offsetBase + mouseDistanceX;

				// Set sliderOffset of slidescontainer to dragged distance
				that._setTransformOffset( slidesContainerOffset, that.slidesContainer );

			});
			$document.on( "mouseup.namespace1", function () {
				// Add CSS transition
				that._setPrefixedCss( that.slidesContainer[0], "Transition", "all 1s");

				// Scroll to next, previous or current slide.
				// If scroll is the same or more than given mouseSlidePercentage go to next slide or
				// previous slide
				mouseDistancePerc = Math.abs(mouseDistanceX) / (that.sliderWidth / 100);

				if ( mouseDistancePerc >= that.settings.mouseSlidePercentage ) {

					// If mouseDistanceX is negative, go to right slide
					if ( mouseDistanceX < 0 ) {
						that.slideRight();

					// If mouseDistanceX is positive go to left slide
					} else {
						that.slideLeft();
					}
					that.slidesContainer.data("transitionStatus", "active");

				// Go back to current slide
				} else {
					that._setTransformOffset( that.slidesContainerOffset, that.slidesContainer );

					// transitionStatus needs to be idle to circumvent fast scrolling triggering
					that.slidesContainer.data("transitionStatus", "idle");
				}

				// Unbind mouse handlers
				$document.off( ".namespace1" );
			});
		}, false );

		// Check if Slides container CSS3 transition has ended
		this._addPrefixedEvent( this.slidesContainer[0], "TransitionEnd", this.settings.cssPrefixes,
			function() {

				// If the current slide is the first slide and the previous slide was the last slide,
				// slider loops back to the beginning of the slides.
				// This only occurs when sliding to the right.
				if ( that.slidesContainer.data( "delayForTransitionLastToFirst" ) === true ) {
					that._setTransformOffsetLastToFirst( that.slidesContainer.data("curSlidesContainerOffset") );

				// If the current slide is the last slide and the previous slide was the first slide,
				// slider loops forth to the back of the slides.
				// This only occurse when sliding to the left.
				} else if ( that.slidesContainer.data( "delayForTransitionFirstToLast" ) === true ) {
					that._setTransformOffsetFirstToLast( that.slidesContainer.data("curSlidesContainerOffset") );
				}

				// transition ends, reset slideTransition to idle
				that.slidesContainer.data("transitionStatus", "idle");

				console.log( that.slidesContainer.data("transitionStatus") );
				// Unbind CSS3 transition check handler
				// that.slidesContainer.off();
			}
		);
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
		if ( this._getSlidePos(this.curSlidePos) === "last" ) {
			this.nextSlidePos = 1;

		} else {
			// Increase the next slide by 1
			this.nextSlidePos = this.curSlidePos + 1;
		}

		// Update previous slide position
		this.prevSlidePos = this.curSlidePos;

		// Set slideOffset based on next slide number
		this._initSlideOffset( this.nextSlidePos );

		// Update cur slide position
		this.curSlidePos = this.nextSlidePos;
		this.curSlide = $( this.allSlides[this.nextSlidePos-1] );

		// Update current, prev slide and slides container offset
		this.prevSlideOffset = this._getSlideOffset( this.prevSlidePos );
		this.curSlideOffset = this._getSlideOffset( this.curSlidePos );
		this.slidesContainerOffset = -( this._getSlideOffset( this.curSlidePos ) );

		// Reset next slide position
		this.nextSlidePos = 0;
	},

	// Slides to the left slide
	slideLeft: function () {
		// If current slide is the first slide, next slide is the last slide
		if ( this._getSlidePos(this.curSlidePos) === "first" ) {
			this.nextSlidePos = this._getSlidePos("last");
			console.log(this.nextSlidePos);

		} else {
			// Decrease the next slide by 1
			this.nextSlidePos = this.curSlidePos - 1;
		}

		// Update previous slide position
		this.prevSlidePos = this.curSlidePos;

		// Set slideOffset based on next slide number
		this._initSlideOffset( this.nextSlidePos );

		// Update cur slide position
		this.curSlidePos = this.nextSlidePos;
		this.curSlide = $( this.allSlides[ this.nextSlidePos - 1 ] );

		// Update current slide and slides container offset
		this.curSlideOffset = this._getSlideOffset(this.curSlidePos);
		this.slidesContainerOffset = -(this.curSlideOffset);

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

	// Locks the slider. Temporarily disabling touch/drag events within the slider
	// without unbinding them.
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

	// Add prefixed eventListners for the element
	_addPrefixedEvent:  function ( element, type, pfx, callback ) {
		var i, len;

		for ( i = 0, len = pfx.length; i < len; i++ ) {
			// If prefix is empty lowercase type
			if ( !pfx[i] ) {
				type = type.toLowerCase();
			}
			// Add for each prefixed type an eventListener
			element.addEventListener( pfx[i] + type, callback, false );
		}
	},

	_setPrefixedCss: function ( elem, cssProperty, cssValue ) {
		var i, len,
		pfx = [ "webkit", "moz", "MS", "o", "" ];

		for ( i = 0, len = pfx.length; i < len; i++ ) {
			// If prefix is empty lowercase type
			if ( !pfx[i] ) {
				cssProperty = cssProperty.toLowerCase();
			}
			// Add for each prefixed type an eventListener
			elem.style[ pfx[i] + cssProperty ] = cssValue;
			// elem.style[ pfx[i] + cssProperty ] = cssValue;
		}
	},

	// _setCssTransformMatrixTx
	_setTransformOffset: function ( offset, element ) {
		var i, len,
		pfx = [ "webkit", "moz", "MS", "o", "" ],
		cssValue = "Transform";

		// Iterate over each css prefix
		for ( i = 0, len = pfx.length; i < len; i++ ) {

			// If prefix is empty lowercase type
			if ( !pfx[i] ) {
				cssValue = cssValue.toLowerCase();
			}

			// Add for each prefix an css rule
			element[0].style[ pfx[i] + cssValue] = "matrix(1,0,0,1," + offset + ",0)";
		}
	},

	_initAllSlidesOffset: function () {
		var offset = 0,
		that = this;

		// Iterate over each slide and use a different offset for last slide.
		this.allSlides.each( function () {
			var $this = $(this);

			that._setTransformOffset( offset, $this );

			// Set inline css styles
			this.style.position = "absolute";
			this.style.cursor = "-webkit-grab";

			offset += that.slideOffset;
		});
	},

	_getSlidePos: function ( slidePos ) {
		// If slideNum is a number get position in string format
		if ( typeof(slidePos) === "number" ) {
			if ( slidePos === 1 ) {
				return "first";
			}
			if ( slidePos === 2 ) {
				return "second";
			}
			if ( slidePos === this.numAllSlides ) {
				return "last";
			}
			if ( slidePos === this.numAllSlides - 1 ) {
				return "secondlast";
			}
		// If slideNum is a string get nummeric position
		} else {
			// Get first slide number
			if ( slidePos === "first" ) {
				return 1;
			}
			// Get last slide number
			if ( slidePos === "last" ) {
				return this.numAllSlides;
			}
		}
	},

	_getSlide: function ( slidePos ) {
		// Get first slide
		if ( slidePos === "first" ) {
			return this.allSlides[0];
		}
		// Get last slide
		if ( slidePos === "last" ) {
			return this.allSlides[this.numAllSlides - 1];
		}
		// Get slide based on slidePos number
		if ( typeof(slidePos) === "number" ) {
			return this.allSlides[slideNum + 1];
		}
	},

	_getSlideOffset: function ( slidePos, optNum ) {
		var countNum = 0;

		// If optional opNum is set, set countNum
		if ( typeof(optNum) === "number") {
			countNum = optNum;
		}

		// Get slide offset based on slidePos number
		if ( typeof(slidePos) === "number" ) {
			slidePos = (slidePos + countNum) - 1;
		} else {
			// Get first slide offset or if optNum is given, get slide based on first slide
			if ( slidePos === "first" ) {
				slidePos = countNum;
			}
			// Get last slide offset or if optNum is given, get slide based on last slide
			else if ( slidePos === "last" ) {
				slidePos = (this.numAllSlides - 1) + countNum;
			}
		}

		// Return offset number
		return slidePos * this.slideOffset;
	},

	_setTransformOffsetLastToFirst: function ( slidesContainerOffset ) {
		var firstSlide         = this._getSlide("first"),
		firstSlideOffset       = this._getSlideOffset("first"),
		lastSlide              = this._getSlide("last"),
		beforeFirstSlideOffset = this._getSlideOffset("first", -1);

		// If optional slidesContainerOffset is not set, set default as value
		if ( typeof slidesContainerOffset === "undefined" ) {
			slidesContainerOffset = this.slidesContainerOffset;
		}

		console.log("To the beginning");
		// Remove slides container CSS3 Transition
		this._setPrefixedCss( this.slidesContainer[0], "Transition", "");

		// rearrange first slide from the back to the beginning of the slides.
		this._setTransformOffset( firstSlideOffset, $( firstSlide ) );

		// rearrange last slide before first slide (beforeFirstSlide position).
		this._setTransformOffset( beforeFirstSlideOffset, $( lastSlide ) );

		// Set slides container offset to first slide
		this._setTransformOffset( slidesContainerOffset, this.slidesContainer );

		// Reset DelayForTransition
		this.slidesContainer.data( "delayForTransitionLastToFirst", "" );
	},

	_setTransformOffsetFirstToLast: function ( slidesContainerOffset ) {
		var firstSlide = this._getSlide("first"),
		lastSlide      = this._getSlide("last"),
		lastSlideOffset = this._getSlideOffset("last"),
		afterLastSlideOffset = this._getSlideOffset("last", 1);
		console.log(lastSlideOffset);


		// If optional slidesContainerOffset is not set, set default as value
		if ( typeof slidesContainerOffset === "undefined" ) {
			slidesContainerOffset = this.slidesContainerOffset;
		}

		console.log("To the end");
		// Remove slides container CSS3 Transition
		this._setPrefixedCss( this.slidesContainer[0], "Transition", "");

		// Rearange last slide back to last position in slides
		this._setTransformOffset( lastSlideOffset, $( lastSlide ) );

		// Rearange first slide after the last slide (afterLastSlide position)
		this._setTransformOffset( afterLastSlideOffset, $( firstSlide ) );

		// Set slides container offset to last slide
		this._setTransformOffset( slidesContainerOffset, this.slidesContainer );

		// Reset DelayForTransition
		this.slidesContainer.data( "delayForTransitionFirstToLast", "" );
	},

	// slidePos, prevSlidePos, allSlides, slidesContainer, numAllSlides,
	// slideOffset, beforeFirstSlideOffset, afterLastSlideOffset, slideOffsetLast

	_initSlideOffset: function ( slidePos ) {
		var prevSlidePos         = this.prevSlidePos,
		slidesContainer          = this.slidesContainer,
		slidesContainerOffset    = -( this._getSlideOffset(slidePos) ),
		firstSlide               = this._getSlide("first"),
		firstSlideOffset         = this._getSlideOffset("first"),
		lastSlide                = this._getSlide("last"),
		beforeFirstSlideOffset   = this._getSlideOffset( "first", -1 ),
		afterLastSlideOffset     = this._getSlideOffset( "last", 1 ),
		slideOffsetLast          = this.slideOffsetLast,
		curSlidesContainerOffset = -( this._getSlideOffset(slidePos) );

		// Set SlidesContainerOffset in data for use with event function: when transition ends
		slidesContainer.data( "curSlidesContainerOffset", curSlidesContainerOffset );

		// Check if the slide is the first of slides
		if ( this._getSlidePos(slidePos) === "first" ) {
			console.log("slide 1");

			// If previous slide was the last slide, slider loops back to the beginning of the
			// slides. This occurs only when sliding to the right.
			if ( this._getSlidePos(prevSlidePos) === "last" ) {
				console.log("slider loops back to the beginning of the slides");

				// Set slides container offset to afterLastSlide position (slide 1)
				this._setTransformOffset( -(afterLastSlideOffset), slidesContainer );

				// Set delayForTransition to execute when transition is ended
				slidesContainer.data( "delayForTransitionLastToFirst", true);

			// If no looping occurse
			} else {
				// rearrange last slide before first slide (beforeFirstSlide position).
				this._setTransformOffset( beforeFirstSlideOffset, $( lastSlide ) );

				// Set slides container offset to first slide
				this._setTransformOffset( firstSlideOffset, slidesContainer );
				slidesContainer.data("transitionStatus", "active");
			}

		// If slide is the second slide and first slide is positioned last, position first slide
		// back to his initial position.
		} else if ( this._getSlidePos(slidePos) === "second" ) {
			console.log("Slide2");
			this._setTransformOffset( firstSlideOffset, $( firstSlide ) );

			// Set slides container offset
			this._setTransformOffset( slidesContainerOffset, slidesContainer );
			slidesContainer.data("transitionStatus", "active");

		// If slide is the second last slide, rearrange last slide to end, if
		// last slide is still before the first slide.
		} else if ( this._getSlidePos(slidePos) === "secondlast" ) {
			console.log("Slide3");
			// Rearange last slide back to last position in slides
			this._setTransformOffset( slideOffsetLast, $( lastSlide ) );

			// Set slides container offset
			this._setTransformOffset( slidesContainerOffset, slidesContainer );
			slidesContainer.data("transitionStatus", "active");

		// If slide is last slide, rearrange first slide to the end
		} else if ( this._getSlidePos(slidePos) === "last" ) {
			console.log("Slide4");

			// If the current slide is the last slide and the previous slide was the first slide,
			// slider loops forth to the back of the slides. This only occurse when sliding to the left.
			if ( this._getSlidePos(prevSlidePos) === "first" ) {
				console.log("slider loops forth to the back of the slides");

				// Set slides container offset to beforeFirstSlide position (slide 4)
				this._setTransformOffset( -(beforeFirstSlideOffset), slidesContainer );
				// Set delayForTransition to execute when transition is ended
				slidesContainer.data( "delayForTransitionFirstToLast", true);

			// If no looping occurse
			} else {
				// Rearange first slide after the last slide (afterLastSlide position)
				this._setTransformOffset( afterLastSlideOffset, $( firstSlide ) );

				// Set slides container offset to last slide
				this._setTransformOffset( slidesContainerOffset, slidesContainer );
				slidesContainer.data( "transitionStatus", "active" );
			}

		// If slide is between the specified slide positions of above,
		// change offset of slide container. No rearranging
		// of slide positions occur.
		} else {
			console.log("Between");

			this._setTransformOffset( slidesContainerOffset, slidesContainer );
			this.slidesContainer.data( "transitionStatus", "active" );
		}
	},
};

/*
 * Plugin wrapper, preventing against multiple instantiations and
 * allowing any public function to be called via the jQuery plugin,
 * e.g. $(element).pluginName("functionName", arg1, arg2, ...)
 */
$.fn[ pluginName ] = function ( arg ) {

	var args, instance;

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
