// -------------------------------------------------
// Description: This file contains all javascript
// -------------------------------------------------

// Scripts

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

// Initialise speed slider
slideBar('slideBarSpeedSetting', function(value) {
    document.getElementById('sliderValue').innerHTML = value + '%';
    sliderValue = value;
});
