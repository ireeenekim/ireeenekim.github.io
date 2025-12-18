let spacing = 25;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('canvas-container');
  noStroke();
}

function draw() {
  clear();

  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      
      let d = dist(mouseX, mouseY, x, y);
      let detectionRange = 150;

      // Only draw if within range of mouse
      if (d < detectionRange) {
        // Calculate opacity: closer = darker (but still subtle)
        // Map distance (0 to 150) to opacity (255 to 0)
        let alpha = map(d, 0, detectionRange, 100, 0);
        
        fill(0, alpha); // Black fill with variable transparency
        ellipse(x, y, 3, 3);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}