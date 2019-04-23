// -------------------------------------------------
// Description: This file contains all javascript slider functions
// -------------------------------------------------

// Function that will create a simple scaled slider
function Slider(sliderElementSelector) {
  var that = {
    onSliderChange: null,
    previousSliderValue: 0,
    didRequestUpdateOnNextFrame: false
  };

  // Initialise the slider element
  that.init = function(sliderElementSelector) {
    that.slider = document.querySelector(sliderElementSelector);
    that.sliderHead = that.slider.querySelector(".sliderHead");
    var sliding = false;

    // Detect use of slide bar
    that.slider.addEventListener("mousedown", function(e) {
      sliding = true;
      that.updateHeadPositionOnTouch(e);
    });

    that.slider.addEventListener("touchstart", function(e) {
      sliding = true;
      that.updateHeadPositionOnTouch(e);
    });

    that.slider.onselectstart = function () {
      return false;
    };

    // Detect the end of using the slide bar
    document.addEventListener("mouseup", function(){
      sliding = false;
    });

    document.addEventListener("dragend", function(){
      sliding = false;
    });

    document.addEventListener("touchend", function(e) {
      sliding = false;
    });

    // Detect any movement on slide bar
    document.addEventListener("mousemove", function(e) {
      if (!sliding) {
        return;
      }
      that.updateHeadPositionOnTouch(e);
    });

    document.addEventListener("touchmove", function(e) {
      if (!sliding) {
        return;
      }
      that.updateHeadPositionOnTouch(e);
    });

    that.slider.addEventListener("touchmove", function(e) {
      if (typeof e.preventDefault !== 'undefined' && e.preventDefault !== null) {
        e.preventDefault();
      }
    });
  };

  // Returns the slider value (a number form 0 to 1) from the cursor position
  that.sliderValueFromCursor = function(e) {
    // Declare local variables
    var pointerX = e.pageX;
    var headLeft;

    if (e.touches && e.touches.length > 0) {
      pointerX = e.touches[0].pageX;
    }

    pointerX = pointerX - that.slider.offsetLeft;
    headLeft = (pointerX - 16);

    if (headLeft < 0) {
      headLeft = 0;
    }

    if ((headLeft + that.sliderHead.offsetWidth) > that.slider.offsetWidth) {
      headLeft = that.slider.offsetWidth - that.sliderHead.offsetWidth;
    }
    // Calculate slider value from head position
    var sliderWidthWithoutHead = that.slider.offsetWidth - that.sliderHead.offsetWidth;
    var sliderValue = 1;

    if (sliderWidthWithoutHead !== 0) {
      sliderValue = headLeft / sliderWidthWithoutHead;
    }

    return sliderValue;
  };

  // Changes the position of the slider
  that.changePosition = function(sliderValue) {
    var headLeft = (that.slider.offsetWidth - that.sliderHead.offsetWidth) * sliderValue;
    that.sliderHead.style.left = headLeft + "px";
  };

  // Update the slider position and call the callback function
  that.updateHeadPositionOnTouch = function(e) {
    var sliderValue = that.sliderValueFromCursor(e);

    // Handle the head change only if it changed significantly (more than 0.1%)
    if (Math.round(that.previousSliderValue * 1000) === Math.round(sliderValue * 1000)) {
      return;
    }
    that.previousSliderValue = sliderValue;

    if (!that.didRequestUpdateOnNextFrame) {
      // Update the slider on next redraw, to improve performance
      that.didRequestUpdateOnNextFrame = true;
      window.requestAnimationFrame(that.updateOnFrame);
    }
  };

  that.updateOnFrame = function() {
    that.changePosition(that.previousSliderValue);

    if (that.onSliderChange) {
      that.onSliderChange(that.previousSliderValue);
    }

    that.didRequestUpdateOnNextFrame = false;
  };

  that.init(sliderElementSelector);

  return that;
}

// Function to create a simple percentage based slide bar
function slideBar(id, onDrag) {

  // Gets slider element
  var slide = document.getElementById(id);
  // Gets dragger element
  var dragger = slide.children[0];
  // width of dragger
  var draggerWidth = 10;
  // Misc
  var down = false;
  var rangeWidth;
  var rangeLeft;
  var sliderValue;

  // Styles initial dragger
  dragger.style.width = draggerWidth + 'px';
  dragger.style.left = "114" + 'px';
  dragger.style.marginLeft = "5" + 'px';
  onDrag(50);

  // Checks for user input on the slider
  slide.addEventListener("mousedown", function(e) {
    rangeWidth = this.offsetWidth;
    rangeLeft = this.offsetLeft;
    down = true;
    updateDragger(e);
    return false;
  });

  // Checks for user input on the dragger
  document.addEventListener("mousemove", function(e) {
    updateDragger(e);
  });
  document.addEventListener("mouseup", function() {
    down = false;
  });

  // Function to update where the dragger is on the slider
  function updateDragger(e) {
      if (down && e.pageX >= rangeLeft && e.pageX <= (rangeLeft + rangeWidth)) {
        dragger.style.left = e.pageX - rangeLeft - draggerWidth + 'px';
        if (typeof onDrag == "function") {
          onDrag(Math.round(((e.pageX - rangeLeft) / rangeWidth) * 100));
        }
      }
  }
}
