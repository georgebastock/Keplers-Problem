// -------------------------------------------------
// Description: This file contains all javascript
// -------------------------------------------------

// Checks checkbox buttons
var earthCheckbox = document.getElementById("earthData");
var sunCheckbox = document.getElementById("sunData");
var earthDataBox = document.getElementById("earth").querySelector('.planetData');
var sunDataBox = document.getElementById("sun").querySelector('.planetData');
var earth = document.getElementById("earth")
var sun = document.getElementById("sun")

earthCheckbox.addEventListener( 'change', function() {
  if(this.checked) {
    earthDataBox.style.display = "block";
    earth.style.border = "1px solid white"
  } else {
    earthDataBox.style.display = "none";
    earth.style.border = "none"
  }
});

sunCheckbox.addEventListener( 'change', function() {
  if(this.checked) {
    sunDataBox.style.display = "block";
    sun.style.border = "1px solid white"
  } else {
    sunDataBox.style.display = "none";
    sun.style.border = "none"
  }
});

// Initialise speed slider
slideBar('slideBarSpeedSetting', function(value) {
    document.getElementById('sliderValueSimSpeed').innerHTML = value + '%';
    sliderValue = value;
});

userInput.init();

// Starts simulation
simulation.start();
