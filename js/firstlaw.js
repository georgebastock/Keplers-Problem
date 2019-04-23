// -------------------------------------------------
// Description: This file contains all logic for the first law
// -------------------------------------------------

// Calculates the position of a orbiting planet
var physics = (function() {
  // Values that wont be changed relative to the earth and sun
  var constants = {
    // The gravitational constant [G], is a physical constant involved in the calculation of gravitational effects
    gravitationalConstant: (6.67408 * Math.pow(10, -11)),
    // The distance between the earth and sun
    earthSunDistanceMeters: (1.496 * Math.pow(10, 11)),
    // The rate of change in the angle of the earth
    earthAngularVelocityMetersPerSecond: (1.990986 *  Math.pow(10, -7)),
    // The mass of the sun
    massOfTheSunKg: (1.98855 * Math.pow(10, 30))
  };
  // The length of one AU (Earth-Sun distance) in pixels.
  var pixelsInOneEarthSunDistancePerPixel = 350;
  // A factor that scales the distance between the earth and sun
  var scaleFactor = (constants.earthSunDistanceMeters / pixelsInOneEarthSunDistancePerPixel);
  // The number of orbit calculations done per frame. Higher numbers give more precise calculations but slow the simulation.
  var numberOfCalculationsPerFrame = 1000;
  // The length of the time increment, in seconds.
  var deltaT = (3600 * 24 / numberOfCalculationsPerFrame);
  // Speed slider value element
  var speedValue = document.getElementById("sliderValue");
  // Page elements
  var earthElement = document.querySelector(".earth");
  var sunElement = document.querySelector(".sun");
  var sunSpinSpeed, earthSpinSpeed;
  var slide = document.getElementById("slideBarSpeedSetting");

  // Initial condition of the model
  var initialConditions = {
    distance: {
      value: constants.earthSunDistanceMeters,
      speed: 0.00
    },
    angle: {
      value: Math.PI / 6,
      speed: constants.earthAngularVelocityMetersPerSecond
    }
  };

  // Current state of the model (Constantly updates)
  var state = {
    distance: {
      value: 0,
      speed: 0
    },
    angle: {
      value: 0,
      speed: 0
    },
    massOfTheSunKg: constants.massOfTheSunKg,
    paused: false
  };

  // Function to calculates the acceleration of the distance given the current state
  // Equation: [acceleration of distance] = [distance][angular velocity]^2 - G * M / [distance]^2
  function calculateDistanceAcceleration(state) {
    return (state.distance.value * Math.pow(state.angle.speed, 2) -
      (constants.gravitationalConstant * state.massOfTheSunKg) / Math.pow(state.distance.value, 2));
  }

  // Function to calculates the acceleration of the angle given the current state
  // Equation: [acceleration of angle] = - 2[speed][angular velocity] / [distance]
  function calculateAngleAcceleration(state) {
    return (-2.0 * state.distance.speed * state.angle.speed / state.distance.value);
  }

  // Function to calculate the derivative value from Eulers method
  function newValue(currentValue, deltaT, derivative) {
    return (currentValue + deltaT * derivative);
  }

  // Function to reset all states to there initial values
  function resetStateToInitialConditions() {
    // Distance
    state.distance.value = initialConditions.distance.value;
    state.distance.speed = initialConditions.distance.speed;
    // Angle
    state.angle.value = initialConditions.angle.value;
    state.angle.speed = initialConditions.angle.speed;
  }

  // A function to calculate distance used on the canvas
  function scaledDistance() {
    return (state.distance.value / scaleFactor);
  }

  // Main function that calls on every animation frame. It calculates and updates the current positions of the bodies
  function updatePosition() {
    // Dont update if paused
    if (document.getElementById('pause').checked) {
      sunElement.style.animationPlayState = "paused";
      earthElement.style.animationPlayState = "paused";
      return;
    } else {
      if (sliderValue <= 50) {
        sunSpinSpeed = 20 * (50 / sliderValue);
        earthSpinSpeed = 1 * (50 / sliderValue);
      } else {
        sunSpinSpeed = 20 * (25 / sliderValue);
        earthSpinSpeed = 1 * (25 / sliderValue);
      }
      sunElement.style.animation = "sunSpin " + sunSpinSpeed + "s linear infinite";
      earthElement.style.animation = "earthSpin " + earthSpinSpeed + "s linear infinite";
    }

    document.getElementById("velocity").innerHTML = "Velocity: " + state.distance.speed;
    document.getElementById("mass").innerHTML = "Mass: " + state.massOfTheSunKg + " kg";

    // Calculates the position of each body so many times a frame
    for (var i = 0; i < numberOfCalculationsPerFrame; i++) {
      calculateNewPosition();
    }
  }

  // Calculates position of the Earth
  function calculateNewPosition() {
    // Calculates delta for the current speed setting
    if (sliderValue <= 50) {
      deltaT = (3600 * 24 / numberOfCalculationsPerFrame) * (sliderValue / 50);
    } else {
      deltaT = (3600 * 24 / numberOfCalculationsPerFrame) * (sliderValue / 25);
    }
    // Calculate new distance
    var distanceAcceleration = calculateDistanceAcceleration(state);
    state.distance.speed = newValue(state.distance.speed, deltaT, distanceAcceleration);
    state.distance.value = newValue(state.distance.value, deltaT, state.distance.speed);
    // Calculate new angle
    var angleAcceleration = calculateAngleAcceleration(state);
    state.angle.speed = newValue(state.angle.speed, deltaT, angleAcceleration);
    state.angle.value = newValue(state.angle.value, deltaT, state.angle.speed);
    // If the angle breaks the laws of angles (360+)
    if (state.angle.value > 2 * Math.PI) {
      state.angle.value = (state.angle.value % (2 * Math.PI));
    }
  }

  // Updates the mass of the Sun
  function updateFromUserInput(solarMassMultiplier) {
    state.massOfTheSunKg = constants.massOfTheSunKg * solarMassMultiplier;
  }

  return {
    scaledDistance: scaledDistance,
    resetStateToInitialConditions: resetStateToInitialConditions,
    updatePosition: updatePosition,
    initialConditions: initialConditions,
    updateFromUserInput: updateFromUserInput,
    state: state
  };
})();

// Draw the scene to the canvas
var graphics = (function() {
  // Canvas DOM element.
  var canvas = null
  // Canvas context for drawing.
  var context = null
  // Height of the canvas
  var canvasHeight = 937;
  // Size of orbiting planet
  var earthSize = 25;
  // Size of central body
  var sunsSize = 100;
  // Color for the orbital path
  var colors = { orbitalPath: "white"};
  // Last know position of the orbiting body
  var previousEarthPosition = null;
  // Orbit line checkbox element
  var checkBoxOrbitLine = document.getElementById("orbitLine");
  // Others
  var currentSunsSize = sunsSize;
  var middleX = 1;
  var middleY = 1;

  // Creates the orbiting body
  function drawTheEarth(earthPosition) {
    var left = (earthPosition.x - earthSize/2) + "px";
    var top = (earthPosition.y - earthSize/2) + "px";
    earthElement.style.left = left;
    earthElement.style.top = top;
  }

  // Works out where the body should be placed
  function calculateEarthPosition(distance, angle) {
    middleX = Math.floor(canvas.width / 2);
    middleY = Math.floor(canvas.height / 2);
    var centerX = (Math.cos(angle) * distance + middleX);
    var centerY = (Math.sin(-angle) * distance + middleY);

    return {
      x: centerX,
      y: centerY
    };
  }

  // Creates the orbit lining
  function drawOrbitalLine(newEarthPosition) {
    if (previousEarthPosition === null) {
      previousEarthPosition = newEarthPosition;
      return;
    }
    // Thin orbit
    context.beginPath();
    context.strokeStyle = colors.orbitalPath;
    context.moveTo(previousEarthPosition.x, previousEarthPosition.y);
    context.lineTo(newEarthPosition.x, newEarthPosition.y);
    context.stroke();
    previousEarthPosition = newEarthPosition;
  }

  // Updates the size of the Sun based on its mass. The sunMass argument is a fraction of the real Sun's mass.
  function updateSunSize(sunMass) {
    var sunsDefaultWidth = sunsSize;
    currentSunsSize = sunsDefaultWidth * Math.pow(sunMass, 1/2);
    sunElement.style.width = currentSunsSize + "px";
    sunElement.style.height = currentSunsSize + "px";
    sunElement.style.marginLeft = -(currentSunsSize / 2.0) + "px";
    sunElement.style.marginTop = -(currentSunsSize / 2.0) + "px";
  }

  // Draws the scene
  function drawScene(distance, angle) {
    var earthPosition = calculateEarthPosition(distance, angle);
    drawTheEarth(earthPosition);
    if (document.getElementById('hideOrbit').checked) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    } else if (document.getElementById('showOrbit').checked) {
      drawOrbitalLine(earthPosition);
    }
  }

  // Resize canvas to fit the container
  function fitToContainer(){
    canvas.style.width='100%';
    canvas.style.height= canvasHeight + 'px';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  // Create the main canvas for drawing
  function init(success) {
    // Find the canvas HTML element
    canvas = document.querySelector(".orbitSimulationCanvas");
    // Check if the browser supports canvas drawing
    if (!(window.requestAnimationFrame && canvas && canvas.getContext)) {
      return;
    }
    // Get canvas context for drawing
    context = canvas.getContext("2d");
    // Another check for browser support
    if (!context) {
      return;
    }
    // Update the size of the canvas
    fitToContainer();
    // Finds the bodies element
    earthElement = document.querySelector(".earth");
    sunElement = document.querySelector(".sun");
    // Execute success callback function
    success();
  }

  // Wipes the current canvas
  function clearScene() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    previousEarthPosition = null;
  }

  return {
    fitToContainer: fitToContainer,
    drawScene: drawScene,
    updateSunSize: updateSunSize,
    clearScene: clearScene,
    init: init
  };
})();

// Creates the simulation
var simulation = (function() {
  // The calls 60 times per second
  function animate() {
    physics.updatePosition();
    graphics.drawScene(physics.scaledDistance(), physics.state.angle.value);
    window.requestAnimationFrame(animate);
  }

  function start() {
    graphics.init(function() {
      // Use the initial conditions for the simulation
      physics.resetStateToInitialConditions();
      // Redraw the scene if page is resized
      window.addEventListener('resize', function(event){
        graphics.fitToContainer();
        graphics.clearScene();
        graphics.drawScene(physics.scaledDistance(), physics.state.angle.value);
      });
      // Makes the canvas a simulation
      animate();
    });
  }

  return {
    start: start
  };
})();

// Reacts to any user input
var userInput = (function(){
  var sunsMassElement = document.querySelector(".sunsMass");
  var massSlider;

  function updateSunsMass(sliderValue) {
    var sunsMassValue = sliderValue * 2;
    if (sunsMassValue > 1) {
      sunsMassValue = Math.pow(2, sunsMassValue - 1);
    }
    var formattedMass = parseFloat(Math.round(sunsMassValue * 100) / 100).toFixed(2);
    sunsMassElement.innerHTML = formattedMass;
    physics.updateFromUserInput(sunsMassValue);
    graphics.updateSunSize(sunsMassValue);
  }

  function init() {
    massSlider = Slider(".massSlideBar");
    massSlider.onSliderChange = updateSunsMass;
    massSlider.changePosition(0.5);
  }

  return {
    init: init
  };
})();
