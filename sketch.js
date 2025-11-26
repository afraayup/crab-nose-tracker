// ==============================================
// FACEMESH - FACE TRACKING AS UI INTERACTION (PRELOAD VERSION)
// ==============================================

// ==============================================
// ADJUSTABLE PARAMETERS
// ==============================================
let SHOW_VIDEO = true;              
let SHOW_ALL_KEYPOINTS = true;      

let TRACKED_KEYPOINT_INDEX = 1;     // Nose tip
let CURSOR_SIZE = 60;               
let KEYPOINT_SIZE = 3;              

// ==============================================
// GLOBAL VARIABLES
// ==============================================
let cam;                            
let facemesh;                       
let faces = [];                     
let cursor;                         
let crab; // crab image

// ==============================================
// PRELOAD
// ==============================================
function preload() {
  crab = loadImage('crab.png'); // Make sure crab.png is in your sketch folder
}

// ==============================================
// SETUP
// ==============================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();  
  cam = createPhoneCamera('user', true, 'fitHeight');
  enableCameraTap();
  
  cam.onReady(() => {
    let options = {
      maxFaces: 1,           
      refineLandmarks: false,
      runtime: 'mediapipe',  
      flipHorizontal: false  
    };
    
    facemesh = ml5.faceMesh(options, () => {
      facemesh.detectStart(cam.videoElement, gotFaces);
    });
  });
}

// ==============================================
// GOT FACES
// ==============================================
function gotFaces(results) {
  faces = results;
}

// ==============================================
// DRAW LOOP
// ==============================================
function draw() {
  background(40);
  
  if (SHOW_VIDEO) {
    image(cam, 0, 0);
  }
  
  if (faces.length > 0) {
    drawFaceTracking();
  }
  
  drawUI();
}

// ==============================================
// DRAW FACE TRACKING
// ==============================================
function drawFaceTracking() {
  let face = faces[0];
  if (!face.keypoints || face.keypoints.length === 0) return;

  let trackedKeypoint = face.keypoints[TRACKED_KEYPOINT_INDEX];
  if (!trackedKeypoint) return;

  cursor = cam.mapKeypoint(trackedKeypoint);

  // -------------------------
  // Draw crab image at cursor
  // -------------------------
  push();
  imageMode(CENTER); 
  let crabSize = CURSOR_SIZE * 2; 
  image(crab, cursor.x, cursor.y, crabSize, crabSize);
  pop();

  // -------------------------
  // Optional: display coordinates
  // -------------------------
  push();
  fill(255);
  stroke(0);
  strokeWeight(3);
  textAlign(CENTER, TOP);
  textSize(14);
  text('x: ' + cursor.x.toFixed(0) + ', y: ' + cursor.y.toFixed(0), 
       cursor.x, cursor.y + crabSize/2 + 10);
  pop();

  // -------------------------
  // Optional: show all keypoints
  // -------------------------
  if (SHOW_ALL_KEYPOINTS) {
    let allPoints = cam.mapKeypoints(face.keypoints);
    push();
    fill(0, 255, 0, 100);
    noStroke();
    for (let point of allPoints) {
      ellipse(point.x, point.y, KEYPOINT_SIZE, KEYPOINT_SIZE);
    }
    pop();
  }
}

// ==============================================
// DRAW UI
// ==============================================
function drawUI() {
  push();
  fill(255);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(18);
  
  if (!cam.ready) {
    text('Starting camera...', width/2, 20);
  } else if (faces.length === 0) {
    text('Show your face to start tracking', width/2, 20);
  } else {
    let keypointNames = {
      1: 'Nose Tip',
      10: 'Top of Face',
      152: 'Chin',
      234: 'Left Eye',
      454: 'Right Eye',
      13: 'Lips'
    };
    let name = keypointNames[TRACKED_KEYPOINT_INDEX] || 'Keypoint ' + TRACKED_KEYPOINT_INDEX;
    text('Tracking: ' + name, width/2, 20);
  }

  textSize(14);
  fill(200);
  textAlign(CENTER, BOTTOM);
  text('Touch screen to toggle video', width/2, height - 20);
  
  textSize(12);
  fill(SHOW_VIDEO ? [0, 255, 0] : [150, 150, 150]);
  text('Video: ' + (SHOW_VIDEO ? 'ON' : 'OFF'), width/2, height - 40);
  
  fill(SHOW_ALL_KEYPOINTS ? [0, 255, 0] : [150, 150, 150]);
  text('All Keypoints: ' + (SHOW_ALL_KEYPOINTS ? 'ON' : 'OFF'), width/2, height - 55);
  
  fill(255);
  if (cam.ready) {
    text('Camera: ' + cam.active + ' (mirrored: ' + cam.mirror + ')', width/2, height - 70);
  }
  pop();
}

// ==============================================
// TOUCH / MOUSE EVENTS
// ==============================================
function touchStarted() {
  SHOW_VIDEO = !SHOW_VIDEO;
  return false;
}

function mousePressed() {
  SHOW_VIDEO = !SHOW_VIDEO;
  return false;
}
