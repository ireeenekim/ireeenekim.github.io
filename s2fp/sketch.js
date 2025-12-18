let baseY, maxH;
const wH = 150, wM = 100, wS = 50;
let cH, cM, cS;

function setup() {
  createCanvas(820, 480);
  noStroke();
  baseY = height * 0.82;
  maxH  = height * 0.62;
  cH = width * 0.20;
  cM = width * 0.50;
  cS = width * 0.80;
}

function draw() {
  background(92, 69, 57);
  
  // smooth real-time values, fractional seconds/minutes/hours
  const now = new Date();
  const sExact = now.getSeconds() + now.getMilliseconds() / 1000;
  const mExact = now.getMinutes() + sExact / 60;
  const hExact = (now.getHours() + mExact / 60) % 12;

  // candle height
  const fH = constrain((12 - hExact) / 12, 0, 1);
  const fM = constrain((60 - mExact) / 60, 0, 1);
  const fS = constrain((60 - sExact) / 60, 0, 1);

  // candle colors
  const colH = color(236, 200, 175);
  const colM = color(231, 173, 153);
  const colS = color(206, 121, 107);

  // time-driven height
  drawCandle(cH - wH/2, baseY, wH, maxH * fH, colH);
  drawCandle(cM - wM/2, baseY, wM, maxH * fM, colM);
  drawCandle(cS - wS/2, baseY, wS, maxH * fS, colS);

  drawTimeUnderCandles(cH, cM, cS);
}

function drawCandle(x, yBase, w, h, waxCol) {
  const topY = yBase - h;
  const topCol = lerpColor(waxCol, color(255), 0.35); // lighter surface

  // candle shape
  fill(waxCol); ellipse(x + w/2, yBase, w, w * 0.30);
  fill(waxCol); rect(x, topY, w, h);
  fill(topCol); ellipse(x + w/2, topY, w, w * 0.30);

  // shrink flame in bottom 10%
  const shrink = constrain(h / (maxH * 0.1), 0, 1);
  if (shrink > 0) drawFlame(x + w/2, topY - 18, w, shrink);
}

function drawFlame(cx, cy, candleW, k = 1) {
  // noise-based flicker motion (L to R, vertical stretch)
  const t = millis() * 0.002;
  const sway   = map(noise(t * 1.2), 0, 1, -6, 6);
  const scaleY = map(noise(t * 2.0 + 43), 0, 1, 0.9, 1.12);

  const base = map(candleW, 64, 150, 16, 24);
  const size = base * k;

  // ellipses behind flame
  for (let r = 90 * k; r > 8 * k; r -= 12) {
    fill(255, 200, 90, map(r, 8, 90, 120, 0));
    ellipse(cx + sway * 0.35, cy, r, r * 0.7);
  }

  // flame
  push();
  translate(cx + sway, cy);
  noStroke();
  fill(255, 230, 160); ellipse(0, 0, size * 0.9, size * 2.1 * scaleY);
  fill(255, 150, 50);  ellipse(0, 3, size * 0.55, size * 1.4 * scaleY);
  pop();

  stroke(35);
  strokeWeight(2 * k);
  line(cx, cy + 10 * k, cx, cy + 22 * k);
  noStroke();
}

function drawTimeUnderCandles(cH, cM, cS) {
  let h = hour(), m = minute(), s = second();
  let h12 = h % 12; if (h12 === 0) h12 = 12;
  const mm = nf(m, 2), ss = nf(s, 2);

  const y = baseY + 36;
  fill(240); textAlign(CENTER, TOP);
  textFont('monospace'); textSize(24);

  text(h12, cH, y);
  text(mm,  cM, y);
  text(ss,  cS, y);

  // : placement
  const midHM = (cH + cM) / 2;
  const midMS = (cM + cS) / 2;
  text(":", midHM, y);
  text(":", midMS, y);
}
