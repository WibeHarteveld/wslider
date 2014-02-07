;(function ( $, window, document, undefined ) {

/* global variables */
var pluginName = "wSlider",
dataPlugin = "plugin_" + pluginName,

/* default options */
defaults = {
	cssPrefixes: [ "webkit", "moz", "MS", "o", "" ],
	domPrefixes: [ "webkit", "moz", "MS", "o", "" ],
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

// Add prefixed eventListners for the element
_prefixedEvent = function ( element, type, pfx, callback ) {
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

_setPrefixedCss = function ( element, type, pfx, callback ) {
	var i, len;

	for ( i = 0, len = pfx.length; i < len; i++ ) {
		// If prefix is empty lowercase type
		if ( !pfx[i] ) {
			type = type.toLowerCase();
		}
		// Add for each prefixed type an eventListener
		element.style.setProperty( pfx[i] + type, callback, false );
	}
},

// _setCssTransformMatrixTx
_setTransformOffset = function ( offset, element ) {
	var i, len,
	pfx = [ "-webkit-", "-moz-", "-MS-", "-o-", "" ],
	cssRule = "Transform";
	// node.css({
	// 	"webkitTransform": "matrix(1,0,0,1," + offset + ",0)",
	// 	"MozTransform": "matrix(1,0,0,1," + offset + ",0)",
	// 	"transform": "matrix(1,0,0,1," + offset + ",0)",
	// });
	for ( i = 0, len = pfx.length; i < len; i++ ) {
		// If prefix is empty lowercase type
		if ( !pfx[i] ) {
			cssRule = cssRule.toLowerCase();
		}
		// Add for each prefix an css rule
		element[0].style.setProperty( pfx[i] + cssRule, "matrix(1,0,0,1," + offset + ",0" );
	}
},

_setTransformOffsetLastToFirst = function ( allSlides, numAllSlides, beforeFirstSlideOffset,
		slidesContainerOffset, slidesContainer ) {
	console.log("To the beginning");
	// Remove slides container CSS3 Transition
	slidesContainer[0].style.removeProperty( "-webkit-transition" );

	// rearrange first slide from the back to the beginning of the slides.
	_setTransformOffset( 0, $(allSlides[0]) );

	// rearrange last slide before first slide (beforeFirstSlide position).
	_setTransformOffset( beforeFirstSlideOffset, $(allSlides[ numAllSlides - 1 ]) );

	// Set slides container offset to first slide
	_setTransformOffset( slidesContainerOffset, slidesContainer );

	// Reset DelayForTransition
	slidesContainer.data( "delayForTransitionLastToFirst", "" );

},

_setTransformOffsetFirstToLast = function ( allSlides, numAllSlides, afterLastSlideOffset,
		slidesContainerOffset, slidesContainer, slideOffsetLast ) {
	console.log("To the end");
	// Remove slides container CSS3 Transition
	// slidesContainer.css( "transition", "" );
	slidesContainer[0].style.removeProperty( "-webkit-transition" );

	// Rearange last slide back to last position in slides
	_setTransformOffset( slideOffsetLast, $(allSlides[ numAllSlides - 1 ]) );

	// Rearange first slide after the last slide (afterLastSlide position)
	_setTransformOffset( afterLastSlideOffset, $(allSlides[0]) );

	// Set slides container offset to last slide
	_setTransformOffset( slidesContainerOffset, slidesContainer );

	// Reset DelayForTransition
	slidesContainer.data( "delayForTransitionFirstToLast", "" );
},

_initAllSlidesOffset = function ( allSlides, numAllSlides, slideOffset ) {
	var offset = 0;

	// Iterate over each slide and use a different offset for last slide.
	allSlides.each( function () {
		var $this = $(this);

		_setTransformOffset( offset, $this );

		$this.css({
			"position": "absolute",
			"cursor": "-webkit-grab"
		});

		offset += slideOffset;
	});
},

_initSlideOffset = function ( slidePos, prevSlidePos, allSlides, slidesContainer, numAllSlides,
		slideOffset, beforeFirstSlideOffset, afterLastSlideOffset, slideOffsetLast ) {
	var slidesContainerOffset = -(_getSlideOffset( slidePos, slideOffset ));

	// Set SlidesContainerOffset in data for use event function (when transition ends)
	slidesContainer.data( "slidesContainerOffset", slidesContainerOffset );

	// var beforeFirstSlideOffset = _getSlideOffset( 0, slideOffset ),
	// afterLastSlideOffset       = _getSlideOffset( (numAllSlides + 1), slideOffset ),
	// slideOffsetLast            = _getSlideOffset( numAllSlides, slideOffset ),
	// slidesContainerOffset      = -(_getSlideOffset( slidePos, slideOffset ));

	// If MouseUp event occures before CSS3 transition end (e.g. fast scrolling),
	// set transform offsets immediately. If MouseUp event occures before CSS3 transition end
	// (e.g. fast scrolling)
	if ( slidesContainer.data("transitionStatus") === "active" ) {
		// Set data to slideDirect
		slidesContainer.data( "slideDirect", true);
	} else {
		slidesContainer.data( "slideDirect", false);
	}

	// Check if the slide is the first of slides
	if ( _isFirstSlide( slidePos ) ) {
		console.log("slide 1");

		// If previous slide was the last slide, slider loops back to the beginning of the
		// slides. This occurs only when sliding to the right.
		if ( prevSlidePos === numAllSlides ) {
			console.log("slider loops back to the beginning of the slides");

			// Set slides container offset to afterLastSlide position (slide 1)
			_setTransformOffset( -afterLastSlideOffset, slidesContainer );

			// Set delayForTransition to execute when transition is ended
			slidesContainer.data( "delayForTransitionLastToFirst", true);









		// If no looping occurse
		} else {
			// rearrange last slide before first slide (beforeFirstSlide position).
			_setTransformOffset( beforeFirstSlideOffset, $(allSlides[ numAllSlides - 1 ]) );

			// Set slides container offset to first slide
			_setTransformOffset( slidesContainerOffset, slidesContainer );
			slidesContainer.data("transitionStatus", "active");
		}


	// If slide is the second slide and first slide is positioned last, position first slide back
	} else if ( slidePos === 2 ) {
		console.log("Slide2");
		_setTransformOffset( 0, $(allSlides[0]) );

		// Set slides container offset
		_setTransformOffset( slidesContainerOffset, slidesContainer );
		slidesContainer.data("transitionStatus", "active");

	// If slide is the second last slide, rearrange last slide to end if
	// last slide is still before the first slide.
	// TODO check eff
	} else if ( slidePos === (numAllSlides - 1) ) {
		console.log("Slide3");
		// Rearange last slide back to last position in slides
		_setTransformOffset( slideOffsetLast, $(allSlides[ numAllSlides - 1 ]) );

		// Set slides container offset
		_setTransformOffset( slidesContainerOffset, slidesContainer );
		slidesContainer.data("transitionStatus", "active");

	// If slide is last slide, rearrange first slide to the end.
	} else if ( _isLastSlide( slidePos, numAllSlides ) ) {
		console.log("Slide4");

		// If the current slide is the last slide and the previous slide was the first slide,
		// slider loops forth to the back of the slides. This only occurse when sliding to the left.
		if ( prevSlidePos === 1 ) {
			console.log("slider loops forth to the back of the slides");

			// Set slides container offset to beforeFirstSlide position (slide 4)
			_setTransformOffset( -beforeFirstSlideOffset, slidesContainer );
			// Set delayForTransition to execute when transition is ended
			slidesContainer.data( "delayForTransitionFirstToLast", true);






		// If no looping occurse
		} else {
			// Rearange first slide after the last slide (afterLastSlide position)
			_setTransformOffset( afterLastSlideOffset, $(allSlides[0]) );

			// Set slides container offset to last slide
			_setTransformOffset( slidesContainerOffset, slidesContainer );
			slidesContainer.data( "transitionStatus", "active" );
		}

	} else {
		console.log("Between");
		// Else only change offset of slide container, no rearranging
		// of slide positions occur.
		_setTransformOffset( slidesContainerOffset, slidesContainer );
		slidesContainer.data( "transitionStatus", "active" );

	}
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
		this.curSlideOffset         = _getSlideOffset( this.settings.startAtSlide, this.slideOffset );
		this.nextSlidePos           = 0;
		this.nextSlideOffset        = 0;
		this.prevSlidePos           = 0;
		this.prevSlideOffset        = 0;
		this.slideContainerOffset   = -(_getSlideOffset( this.settings.startAtSlide, this.slideOffset ));

		this.beforeFirstSlideOffset = _getSlideOffset( 0, this.slideOffset );
		this.afterLastSlideOffset   = _getSlideOffset( (this.numAllSlides + 1), this.slideOffset );
		this.slideOffsetLast        = _getSlideOffset( this.numAllSlides, this.slideOffset );

		this.slidesContainer.data("transitionStatus", "idle");
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
		this.slidesContainer[0].style.setProperty( "width", this.slidesContainerWidth );

		_initAllSlidesOffset( this.allSlides, this.numAllSlides, this.slideOffset );

		_initSlideOffset( this.curSlidePos, this.prevSlidePos, this.allSlides, this.slidesContainer,
			this.numAllSlides, this.slideOffset, this.beforeFirstSlideOffset,
			this.afterLastSlideOffset, this.slideOffsetLast );

		// Sets transition status to idle because no transition occurse when
		// initiating the first slide.
		this.slidesContainer.data("transitionStatus", "idle");

		// // Set initial slides container offset
		// _setSliderOffset( slidesContainer, 0 );

		// // set each initial slide offset and css
		// allSlides.each( function( index, node ) {

		// 	_setSliderOffset( node, slideOffset);

		// Add mouse handlers for horizontal scrolling through slides
		this.slidesContainer[0].addEventListener( "mousedown", function () {
			var mousePositionStartX = window.event.clientX,
			mouseDistanceX          = 0,
			mouseDistancePerc       = 0,
			curCssTransformMatrix   = window.getComputedStyle(that.slidesContainer[0]).getPropertyValue("-webkit-transform"),
			curCssTransformMatrixArray = [],
			curCssTransformMatrixTx = 0,
			slidesContainerOffset   = 0,
			offsetBase              = 0;

			// Get tx position of the current transform matrix pos
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

			// If mousedown event occures before CSS3 transition end (e.g. fast scrolling)
			// if ( that.slidesContainer.data("transitionStatus") === "active" ) {
			// 	console.log(that.curSlide);
			// 	console.log(curSlideMouseOffset.left);
			// }

			// Remove CSS3 transition
			that.slidesContainer[0].style.removeProperty( "-webkit-transition" );

			// If mouseup event occures before CSS3 transition end (e.g. fast scrolling) when
			// looping delay has been set, set delayed transform offsets immediately.
			if ( that.slidesContainer.data("delayForTransitionLastToFirst") === true ) {
				console.log("Mouse used in transition, last to first");
				_setTransformOffsetLastToFirst( that.allSlides, that.numAllSlides,
					that.beforeFirstSlideOffset, that.slidesContainerOffset, that.slidesContainer );

				// New offset based on the difference between transform matrix tx when mousedown
				// occurred, and afterLastSlideOffset. This difference has been accounted for
				// in the new slideContainerOffset which has a firstPos offset base.
				offsetBase = offsetBase + (that.prevSlideOffset + that.slideOffset);

				// Reset delayForTransitionLastToFirst to false
				that.slidesContainer.data( "delayForTransitionLastToFirst", false);

			//
			} else if ( that.slidesContainer.data("delayForTransitionFirstToLast") === true ) {
				console.log("Mouse used in transition, first to last");
				_setTransformOffsetFirstToLast( that.allSlides, that.numAllSlides, that.afterLastSlideOffset,
					that.slidesContainerOffset, that.slidesContainer, that.slideOffsetLast );

				// New offset based on the difference between transform matrix tx when mousedown
				// occurred, and beforeFirstSlideOffset. This difference has been accounted for
				// in the new slideContainerOffset which has a lastPos offset base.
				offsetBase = -(that.curSlideOffset) + (offsetBase + that.beforeFirstSlideOffset);

				// Reset delayForTransitionFirstToLast to false
				that.slidesContainer.data( "delayForTransitionFirstToLast", false);

			}

			// Take current slide offset as base for mouse movement
			slidesContainerOffset = offsetBase;

			// Set sliderOffset of slidescontainer to dragged distance
			_setTransformOffset( slidesContainerOffset, that.slidesContainer );


			$document.on( "mousemove.namespace1", function( evMouseMove ) {

				// Scroll slides
				mouseDistanceX = evMouseMove.pageX - mousePositionStartX;

				// Take current slide offset as base for mouse movement
				slidesContainerOffset = offsetBase + mouseDistanceX;

				// Set sliderOffset of slidescontainer to dragged distance
				_setTransformOffset( slidesContainerOffset, that.slidesContainer );

			});
			$document.on( "mouseup.namespace1", function () {

				// // Check if Slides container CSS3 transition has ended
				// that.slidesContainer.on("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
				// 	function() {
				// 		// // Remove slides container CSS3 Transition
				// 		// slidesContainer.css( "transition", "" );x

				// 		// // rearrange first slide from the back to the beginning of the slides.
				// 		// _setTransformOffset( 0, allSlides[0] );

				// 		// // rearrange last slide before first slide (beforeFirstSlide position).
				// 		// _setTransformOffset( beforeFirstSlideOffset, allSlides[ numAllSlides - 1 ] );

				// 		// // Set slides container offset to first slide
				// 		// _setTransformOffset( slidesContainerOffset, slidesContainer );

				// 		that.slidesContainer.data("transitionStatus", "idle");
				// 		console.log( that.slidesContainer.data("transitionStatus") );
				// 		// Unbind CSS3 transition check handler
				// 		that.slidesContainer.off();
				// 	}
				// );

				// Add CSS transition
				// that.slidesContainer.css( "webkitTransition", "all 1s" );
				that.slidesContainer[0].style.setProperty( "-webkit-transition", "all 1s" );

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
					_setTransformOffset( that.slideContainerOffset, that.slidesContainer );

					// transitionStatus needs to be idle to circumvent fast scrolling triggering
					that.slidesContainer.data("transitionStatus", "idle");
				}

				// console.log("==========================");
				// console.log("Current slide pos: " + that.curSlidePos);
				// console.log("Current slide Offset: " + that.curSlideOffset);
				// console.log("Next slide pos: " + that.nextSlidePos);
				// console.log("Previous slide pos: " + that.prevSlidePos);
				// console.log("Current Container Offset: " + that.slideContainerOffset);

				// that.slidesContainer.data("transitionStatus", "active");

				// Unbind mouse handlers
				$document.off( ".namespace1" );
			});
		}, false );

		// Check if Slides container CSS3 transition has ended
		// function ( element, type, callback )
		_prefixedEvent( this.slidesContainer[0], "TransitionEnd", this.settings.cssPrefixes,
			function() {
				// // Remove slides container CSS3 Transition
				// slidesContainer.css( "transition", "" );

				// // rearrange first slide from the back to the beginning of the slides.
				// _setTransformOffset( 0, allSlides[0] );

				// // rearrange last slide before first slide (beforeFirstSlide position).
				// _setTransformOffset( beforeFirstSlideOffset, allSlides[ numAllSlides - 1 ] );

				// // Set slides container offset to first slide
				// _setTransformOffset( slidesContainerOffset, slidesContainer );

				// If the current slide is the first slide and the previous slide was the last slide,
				// slider loops back to the beginning of the slides.
				// This only occurs when sliding to the right.
				if ( that.slidesContainer.data( "delayForTransitionLastToFirst" ) === true ) {
					_setTransformOffsetLastToFirst( that.allSlides, that.numAllSlides,
						that.beforeFirstSlideOffset, that.slidesContainer.data("slidesContainerOffset"),
						that.slidesContainer );

				// If the current slide is the last slide and the previous slide was the first slide,
				// slider loops forth to the back of the slides.
				// This only occurse when sliding to the left.
				} else if ( that.slidesContainer.data( "delayForTransitionFirstToLast" ) === true ) {
					_setTransformOffsetFirstToLast( that.allSlides, that.numAllSlides,
						that.afterLastSlideOffset, that.slidesContainer.data("slidesContainerOffset"),
						that.slidesContainer, that.slideOffsetLast );
				}

				// transition ends, reset slideTransition to idle
				that.slidesContainer.data("transitionStatus", "idle");

				console.log( that.slidesContainer.data("transitionStatus") );
				// Unbind CSS3 transition check handler
				// that.slidesContainer.off();
			}
		);

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

		// Update previous slide position
		this.prevSlidePos = this.curSlidePos;

		// Set slideOffset based on next slide number
		_initSlideOffset( this.nextSlidePos, this.prevSlidePos, this.allSlides, this.slidesContainer,
			this.numAllSlides, this.slideOffset, this.beforeFirstSlideOffset,
			this.afterLastSlideOffset, this.slideOffsetLast );

		// Update cur slide position
		this.curSlidePos = this.nextSlidePos;
		this.curSlide = $(this.allSlides[this.nextSlidePos-1]);

		// Update current, prev slide and slides container offset
		this.prevSlideOffset = _getSlideOffset( this.prevSlidePos, this.slideOffset );
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

		// Update previous slide position
		this.prevSlidePos = this.curSlidePos;

		// Set slideOffset based on next slide number
		_initSlideOffset( this.nextSlidePos, this.prevSlidePos, this.allSlides,
			this.slidesContainer, this.numAllSlides, this.slideOffset, this.beforeFirstSlideOffset,
			this.afterLastSlideOffset, this.slideOffsetLast);

		// Update cur slide position
		this.curSlidePos = this.nextSlidePos;
		this.curSlide = $(this.allSlides[this.nextSlidePos-1]);

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
