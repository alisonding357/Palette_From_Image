let img;
let img_large;
let deflt;
let centroids = [];
let centroidAssignment = [];
let k = 5;
let maxIters = 50;
let canvasHeight;
let canvasWidth;

function preload() {
  deflt = loadImage('assets/mount.png');
}

function setup() {
  canvasContainer = select('.canvas');
  canvasHeight = (select('.grid_item')).height - 150;
  let canv = createCanvas(canvasContainer.width - 75, canvasHeight);
  canv.parent(canvasContainer);
  background(255);
  image(deflt, 0,0);
  
  let input = createFileInput(handleImage);
  input.parent(canvasContainer);
}

function draw() {
  if(img){
    background(255);
    img.resize(300,300);
    if(img_large.width > img_large.height){
      img_large.resize(0,width);
    }
    else img_large.resize(width,0);

    img.loadPixels();
    console.log(img.pixels.length);

    initializeCentroids();
    kMeans();
  
    let xStart = Math.max(0, int((img_large.width - height)/2));
    let yStart = Math.max(0, int((img_large.height - height)/2));
    let img_new = img_large.get(xStart, yStart, height, height);
    image(img_new,0,0);

    drawSquares();
    noLoop();
  }
}

function kMeans(){
  let changing = true;
  let iters = 0;
  while(changing && iters < maxIters){
    updateCentroids();
    changing = assignToCentroid();
    iters++;
  }
  console.log("iterations: "+iters);
}

function initializeCentroids(){
  //initializing centroids 
  let spacing = int(img.width * img.height/7);
  for(let i = 1; i<= k; i++){
    let index = int(spacing*k);
    centroids.push(getPixel(index));
    console.log("Initialized " + centroids[i]);
  }

  //centroidAssignment[i] holds an int representing the index 1-k of the 
  //centroid that pixel is  assigned to 
  for (let i = 0; i < img.width * img.height; i++) {
    centroidAssignment.push(0);
  }
}

function assignToCentroid(){
  let changed = false;
  for (let i = 0; i < img.width * img.height; i++) {
    let pixelCol = getPixel(i);
    let curDist = distance(centroids[centroidAssignment[i]], pixelCol);
    let newAss = centroidAssignment[i];
      
    for(let j = 0; j<k; j++){
      let tempDist = distance(centroids[j], pixelCol);
      if(tempDist < curDist){
        changed = true;
        curDist = tempDist;
        newAss = j;
      }
    }
    centroidAssignment[i] = newAss;
  }
  return changed;
}

function updateCentroids(){
  let means = [];
  let sizes = [];
  for(let i = 0; i<k; i++){
    means.push(createVector(0, 0, 0));
    sizes.push(0);
  }
  
  for (let i = 0; i < img.width * img.height; i++) {
    let centroid = centroidAssignment[i];
    let color = getPixel(i);
    means[centroid].add(createVector(red(color), green(color), blue(color)));
    sizes[centroid] += 1;
  }
  
  for(let i = 0; i<k; i++){
    if(sizes[i] != 0){
      means[i].div(sizes[i]);
    }
    centroids[i] = color(means[i].x, means[i].y, means[i].z);
    console.log("new: " + centroids[i]);
  }
}

function distance(c1, c2){
  return sqrt(
    pow((red(c1) - red(c2)), 2) + 
    pow((blue(c1) - blue(c2)), 2) +
    pow((green(c1) - green(c2)), 2)
  );
}

function getPixel(index) {
  index *= 4;
  return color(img.pixels[index], img.pixels[index+1], img.pixels[index+2]);
}

function handleImage(file) {
  console.log("handleImage called");
  if (file.type === 'image') {
    loadImage(file.data, function(loadedImage) {
      img = loadedImage;
      img_large = createImage(loadedImage.width, loadedImage.height);
      img_large.copy(loadedImage, 0, 0, loadedImage.width, loadedImage.height, 0, 0, loadedImage.width, loadedImage.height);
      console.log("Image loaded and img_large set.");
    }, function(err) {
      console.log("Error loading image:", err);
      img = null;
      img_large = null;
    });
  } else {
    img = null;
    img_large = null;
  }
}

function drawSquares() {
  let squareHeight = int(height/6);
    let margin = (height - (5*squareHeight))/6;
    let curMarg = margin;
    for(let i = 0; i<k; i++){
      stroke(255);
      strokeWeight(5);
      fill(centroids[i]);
      square(height + (width - height - squareHeight)/2, curMarg + squareHeight*i, squareHeight);
      curMarg += margin;
    }
}