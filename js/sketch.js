var canvas;
let flock;
var boidCounter = 1;

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background("#1e1e2e"); // Mocha base
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-1');
    background("#1e1e2e"); // Mocha base
    boidCounter = 1;
    
    flock = new Flock();
    // Add an initial set of boids into the system
    for (let i = 0; i < 70; i++) {
        let b = null;
        if (i < 35) {
            b = new Boid(width / 2, height / 2);
        } else {
            b = new Boid(random(width), random(height));
        }
        flock.addBoid(b);
    }
}

function draw() {
    background("#1e1e2e"); // Mocha base
    flock.run();
}

// Add a new boid into the System
function mouseDragged() {
    if (boidCounter <= 250) {
        flock.addBoid(new Boid(mouseX, mouseY));
    }
}

// Flock object
// Does very little, simply manages the array of all the boids
function Flock() {
    // An array for all the boids
    this.boids = []; // Initialize the array
}

Flock.prototype.run = function() {
    for (let i = 0; i < this.boids.length; i++) {
        this.boids[i].run(this.boids); // Passing the entire list of boids to each boid individually
    }
}

Flock.prototype.addBoid = function(b) {
    this.boids.push(b);
}

// Boid class
// Methods for Separation, Cohesion, Alignment added
function Boid(x, y) {
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.position = createVector(x, y);
    this.r = 3.0;
    this.maxspeed = 3; // Maximum speed
    this.maxforce = 0.05; // Maximum steering force
    this.boidCounter = boidCounter;
    boidCounter += 1;
    this.noiseOffsetX = random(1000); // Random starting point in noise space
    this.noiseOffsetY = random(1000);
    this.noiseIncrement = 0.002; // How fast we move through noise space
}

Boid.prototype.run = function(boids) {
    this.flock(boids);
    this.update();
    this.borders();
    this.render();
}

Boid.prototype.applyForce = function(force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
    // Sakana AI does it's own thing!!
    if (this.boidCounter == boidCounter-1 && boidCounter > 2) {
        let noiseX = noise(this.noiseOffsetX);
        let noiseY = noise(this.noiseOffsetY);
        // Convert noise (0-1) to forces (-1 to 1)
        let forceX = map(noiseX, 0, 1, -1, 1);
        let forceY = map(noiseY, 0, 1, -1, 1);
        // Create smooth random force
        let randomForce = createVector(forceX, forceY);
        randomForce.mult(5.5); // Adjust this to control how strong the random movement is
        
        // Apply forces
        this.applyForce(randomForce);
        
        // Increment noise offsets
        this.noiseOffsetX += this.noiseIncrement;
        this.noiseOffsetY += this.noiseIncrement + 0.001; // Slightly different increment for Y
    } else {
        let sep = this.separate(boids); // Separation
        let ali = this.align(boids); // Alignment
        let coh = this.cohesion(boids); // Cohesion
        
        // Arbitrarily weight these forces
        sep.mult(1.5);
        ali.mult(1.0);
        coh.mult(1.0);
        
        // Add the force vectors to acceleration
        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    }
}

// Method to update location
Boid.prototype.update = function() {
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset accelertion to 0 each cycle
    this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
    let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force
    return steer;
}

Boid.prototype.render = function() {
    // Draw a triangle rotated in the direction of velocity
    let theta = this.velocity.heading() + radians(90);
    if (this.boidCounter == boidCounter-1) {
        fill("#f5c2e7"); // Mocha pink - brighter color for the special fish
        stroke("#f5c2e7"); // Mocha pink
    } else {
        // Using RGB values with alpha as separate parameter
        fill(137, 180, 250, 230); // Mocha blue (89b4fa) with high opacity for better contrast
        stroke(137, 180, 250, 230); // Mocha blue
    }
    push();
    translate(this.position.x, this.position.y);
    rotate(theta - PI/2);
    scale(0.02);
    strokeWeight(0);
    
    // Logo Fish
    beginShape();
    vertex(0, 554.58227);
    bezierVertex(0, 539.57642, 12.277536, 527.29883, 27.283415, 527.29883);
    bezierVertex(137.78125, 527.29883, 237.36554, 570.95227, 311.03076, 641.89916);
    bezierVertex(350.5917, 588.69652, 376.51114, 524.71648, 381.9678, 453.77966);
    vertex(154.15112, 452.53317);
    bezierVertex(139.14525, 452.53317, 126.86771, 440.25564, 126.86771, 425.24979);
    bezierVertex(126.86771, 410.24393, 139.14525, 397.96639, 154.15112, 397.96639);
    vertex(410.61548, 397.96639);
    bezierVertex(582.50098, 397.96639, 744.83722, 464.8106, 866.24841, 586.22177);
    vertex(941.27783, 661.25118);
    bezierVertex(946.7345, 666.70785, 949.46289, 673.52902, 949.46289, 680.34982);
    bezierVertex(949.46289, 687.17062, 946.7345, 693.99142, 941.27783, 699.44808);
    vertex(866.24841, 774.47749);
    bezierVertex(744.83722, 896.88866, 582.50098, 963.7329, 410.61548, 963.7329);
    vertex(154.15112, 963.7329);
    bezierVertex(139.14525, 963.7329, 126.86771, 951.45536, 126.86771, 936.44951);
    bezierVertex(126.86771, 921.44365, 139.14525, 909.16611, 154.15112, 909.16611);
    vertex(381.9678, 909.16611);
    bezierVertex(376.51114, 839.69397, 350.5917, 774.21393, 311.03076, 721.01129);
    bezierVertex(237.36554, 791.94812, 137.78125, 835.60156, 27.283415, 835.60156);
    bezierVertex(12.277536, 835.60156, 0, 823.32398, 0, 808.31811);
    bezierVertex(0, 793.31226, 12.277536, 781.03467, 27.283415, 781.03467);
    bezierVertex(124.13953, 781.03467, 211.44664, 742.83795, 275.56265, 680.08612);
    bezierVertex(211.44664, 617.33429, 124.13953, 579.13757, 27.283415, 579.13757);
    bezierVertex(12.277536, 581.86597, 0, 569.58814, 0, 554.58227);
    vertex(883.98248, 682.81421);
    vertex(828.05182, 626.88355);
    bezierVertex(723.01068, 521.84241, 585.22925, 460.45465, 436.53464, 454.99799);
    bezierVertex(431.07794, 540.94074, 398.33786, 620.06238, 347.86352, 682.81421);
    bezierVertex(398.33786, 745.5661, 431.07794, 824.68817, 436.53464, 910.63092);
    bezierVertex(583.86505, 903.81006, 723.01068, 843.7865, 828.05182, 738.74476);
    vertex(883.98248, 682.81421);
    endShape();
    pop();
}

// Wraparound
Boid.prototype.borders = function() {
    if (this.position.x < -this.r) this.position.x = width + this.r;
    if (this.position.y < -this.r) this.position.y = height + this.r;
    if (this.position.x > width + this.r) this.position.x = -this.r;
    if (this.position.y > height + this.r) this.position.y = -this.r;
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
    let desiredseparation = 20.0;
    let steer = createVector(0, 0);
    let count = 0;
    // For every boid in the system, check if it's too close
    for (let i = 0; i < boids.length; i++) {
        let d = p5.Vector.dist(this.position, boids[i].position);
        // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
        if ((d > 0) && (d < desiredseparation)) {
            // Calculate vector pointing away from neighbor
            let diff = p5.Vector.sub(this.position, boids[i].position);
            diff.normalize();
            diff.div(d); // Weight by distance
            steer.add(diff);
            count++; // Keep track of how many
        }
    }
    // Average -- divide by how many
    if (count > 0) {
        steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
        // Implement Reynolds: Steering = Desired - Velocity
        steer.normalize();
        steer.mult(this.maxspeed);
        steer.sub(this.velocity);
        steer.limit(this.maxforce);
    }
    return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
    let neighbordist = 40;
    let sum = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
        let d = p5.Vector.dist(this.position, boids[i].position);
        if ((d > 0) && (d < neighbordist)) {
            sum.add(boids[i].velocity);
            count++;
        }
    }
    if (count > 0) {
        sum.div(count);
        sum.normalize();
        sum.mult(this.maxspeed);
        let steer = p5.Vector.sub(sum, this.velocity);
        steer.limit(this.maxforce);
        return steer;
    } else {
        return createVector(0, 0);
    }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
    let neighbordist = 40;
    let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
        let d = p5.Vector.dist(this.position, boids[i].position);
        if ((d > 0) && (d < neighbordist)) {
            sum.add(boids[i].position); // Add location
            count++;
        }
    }
    if (count > 0) {
        sum.div(count);
        return this.seek(sum); // Steer towards the location
    } else {
        return createVector(0, 0);
    }
}
