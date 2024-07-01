let img;
let img_large;
let centroids = [];
let centroidAssignment = [];
let k = 5;
let maxIters = 80;

function preload(){
  //img = loadImage('assets/lotus.jpg');
  //img_large = loadImage('assets/lotus.jpg');
}

function setup() {
  let canvasContainer = select('.canvas');
  let canv = createCanvas(canvasContainer.width - 50, 800);
  canv.parent(canvasContainer);
  background(255);
  
  let input = createFileInput(handleImage);
  input.parent(canvasContainer);
}

function draw() {
  if(img){
    console.log("in conditional");
    
    img.resize(300,300);
    if(img_large.width > img_large.height){
      img_large.resize(0,800);
    }
    else img_large.resize(800,0);

    //image(img,0,0,600,800,0,0,img.width, img.height, COVER);
    img.loadPixels();
    console.log(img.pixels.length);
    console.log(img.width);

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

    kMeans();
  
    img_large = img_large.get(0,0,800,800);
    image(img_large,0,0);

    for(let i = 0; i<k; i++){
      stroke(255);
      strokeWeight(5);
      fill(centroids[i]);
      square(850, 35 + 150*i, 130);
    }
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

// function handleImage(file) {
//   console.log("calling function");
//   if (file.type === 'image') {
//     img = loadImage(file.data, function(loadedImage) {
//       img = loadedImage;
//       img_large = loadedImage.get(); // Clone the image for img_large
//     });
//   } else {
//     img = null;
//   }
//   console.log(img === null);
// }

function handleImage(file) {
  console.log("calling function");
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
  console.log(img === null);
}
