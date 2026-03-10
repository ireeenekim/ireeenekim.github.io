let spacing = 25;
let needsRedraw = true;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('canvas-container');
  noStroke();
  noLoop(); // render only when needed (mouse move / resize)
}

function draw() {
  clear();

  if (!needsRedraw) return;
  needsRedraw = false;

  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      let d = dist(mouseX, mouseY, x, y);
      let detectionRange = 150;
      if (d < detectionRange) {
        let alpha = map(d, 0, detectionRange, 100, 0);
        fill(0, alpha);
        ellipse(x, y, 3, 3);
      }
    }
  }
}

function mouseMoved() {
  needsRedraw = true;
  redraw();
  return false;
}

function touchMoved() {
  needsRedraw = true;
  redraw();
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  needsRedraw = true;
  redraw();
}