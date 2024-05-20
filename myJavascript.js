let canvas, ctx, w, h; 
let mousePos;
let balls = []; 
let initialNumberOfBalls;
let globalSpeedMutiplier = 1;
let colorToEat = 'red';
let wrongBallsEaten = 0;
let goodBallsEaten = 0;
let numberOfGoodBalls;
let ballEatenSound;
//
// Player as a singleton/simple object
let player = {
  x:10,
  y:10,
  width:20,
  height:20,
  color:'red',
  
  move(x, y) {
    this.x = x;
    this.y = y;
  },
  //
  draw(ctx) {

    ctx.save();
    ctx.translate(this.x, this.y);
  
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();    
  }
};

// called when the window loads
window.onload = function init() {
    playBackgroundMusic(); 
    canvas = document.querySelector("#myCanvas");
    w = canvas.width; 
    h = canvas.height;  
    ctx = canvas.getContext('2d');  
    // start game with 10 balls, balls to eat = red balls
    startGame(10);
    // add a mousemove event listener to the canvas
    canvas.addEventListener('mousemove', mouseMoved);

    // sound that plays when you pop a ball
    ballEatenSound = new Howl({
      urls: ['https://mainline.i3s.unice.fr/mooc/SkywardBound/assets/sounds/plop.mp3'],
      onload: function () {          
          mainLoop();
        }
    });
  
};

function playBackgroundMusic() {
   let audioPlayer = document.querySelector("#audioPlayer");
   audioPlayer.play();
}

function pausebackgroundMusic() {
   let audioPlayer = document.querySelector("#audioPlayer");
   audioPlayer.pause();  
}

// nb = number of balls
// creates nb number of balls and sets initial count
// of balls to nb
function startGame(nb) {
  do {
    balls = createBalls(nb);
    initialNumberOfBalls = nb;
    numberOfGoodBalls = countNumberOfGoodBalls(balls, colorToEat);
  } while(numberOfGoodBalls === 0); 
  wrongBallsEaten = goodBallsEaten = 0;
}

// for each ball left, if its color equals the ball we need to eat
// increase nb by 1
function countNumberOfGoodBalls(balls, colorToEat) {
  let nb = 0;  
  balls.forEach(function(b) {
    if(b.color === colorToEat)
      nb++;
  });
  return nb;
}

// if number of balls is changed (input) it calls start game
function changeNbBalls(nb) {
  startGame(nb);
}

// grabs value of color ball to eat and changes it
function changeColorToEat(color) {
  colorToEat = color;
}

// if player color changes, calls this function
function changePlayerColor(color) {
  player.color = color;
}

// if speed multiplier changes, call this
function changeBallSpeed(coef) {
    globalSpeedMutiplier = coef;
}

// if the mouse moves, calls this
function mouseMoved(evt) {
    mousePos = getMousePos(canvas, evt);
}

// gets position of the mouse
function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function mainLoop() {
  // clear the game area
  ctx.clearRect(0, 0, w, h); 
  // draw the player
  player.draw(ctx);
  // draw all balls
  drawAllBalls(balls);
  moveAllBalls(balls);
  // moves our player to wherever our mouse is pointed
  if(mousePos !== undefined)
      player.move(mousePos.x, mousePos.y);
  // draw the game score
  drawScore(balls);
  // ask for a new animation frame
  requestAnimationFrame(mainLoop);
}

// function for testing if the player square is overlapping a ball
function circRectsOverlap(x0, y0, w0, h0, cx, cy, r) {
   let testX=cx;
   let testY=cy;
   if (testX < x0) testX=x0;
   if (testX > (x0+w0)) testX=(x0+w0);
   if (testY < y0) testY=y0;
   if (testY > (y0+h0)) testY=(y0+h0);
   return (((cx-testX)*(cx-testX)+(cy-testY)*(cy-testY))< r*r);
}

// the ball class
class Ball {
  constructor(x, y, radius, color, speedX, speedY) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.speedX = speedX;
    this.speedY = speedY;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();    
  }
  move() {
      this.x += this.speedX;
      this.y += this.speedY;    
  }
}

function createBalls(n) {
  let ballArray = [];
  for(let i=0; i < n; i++) {
    let x = w/2;
    let y = h/2;
    let radius =  5 + 30 * Math.random(); // between 5 and 35
    // implemented change ball speed
    let speedX =  globalSpeedMutiplier*(-3 + 10 * Math.random()); // between -5 and + 5
    let speedY =  globalSpeedMutiplier*(-3 + 10 * Math.random()); // between -5 and + 5
    let color = getARandomColor();
    // create ball with established parameters
    let b = new Ball(x, y, radius, color, speedX, speedY);
    // push to ball array
    ballArray.push(b);
  }
  return ballArray;
}

// picks a random colour from this array
function getARandomColor() {
  let colors = ['red', 'blue', 'cyan', 'purple', 'pink', 'green', 'yellow'];
  let colorIndex = Math.round((colors.length-1)*Math.random()); 
  let c = colors[colorIndex];
  return c;
}

// text that will be displayed in our canvas
function drawScore(balls) {
  ctx.save();
  ctx.font="20px Arial";
  if(balls.length === 0) {
    ctx.fillText("Game Over!", 20, 30);
  } else if(goodBallsEaten === numberOfGoodBalls) {
    ctx.fillText("You Win! Final score : " + (initialNumberOfBalls - wrongBallsEaten), 
                 20, 30);
  } else {
    ctx.fillText("Balls still alive: " + balls.length, 210, 30);
    ctx.fillText("Good Balls eaten: " + goodBallsEaten, 210, 50);
     ctx.fillText("Wrong Balls eaten: " + wrongBallsEaten, 210, 70);
  }
  ctx.restore();
}

// goes through each ball in our ball array and draws it
function drawAllBalls(ballArray) {
    ballArray.forEach(function(b) {
      b.draw(ctx);
    });
}

function moveAllBalls(ballArray) {
  // for every ball, move
  ballArray.forEach(function(b, index) {
      b.move();
      // test if the ball is up against a wall
      testCollisionBallWithWalls(b); 
      // test if the ball is colliding with the player
      testCollisionWithPlayer(b, index);
  });
}

function testCollisionWithPlayer(b, index) {
  if(circRectsOverlap(player.x, player.y,
                     player.width, player.height,
                     b.x, b.y, b.radius)) {
    // play sound if overlap
    ballEatenSound.play();
    // if the color of the ball we collided with, matches
    // the color we are meant to eat,
    // increase good balls by 1, else increase
    // wrong balls by 1                  
    if(b.color === colorToEat) {

      goodBallsEaten += 1;
    } else {
      wrongBallsEaten += 1;
    }
    // splice balls array from the position of the ball
    // we collided with, and remove 1 element (the ball we
    //  collided with) 
    balls.splice(index, 1);
  }
}

function testCollisionBallWithWalls(b) {
  // collision with vertical walls
    if((b.x + b.radius) > w) {
    b.speedX = -b.speedX;
    b.x = w - b.radius;
  } else if((b.x -b.radius) < 0) {
    b.speedX = -b.speedX;

    b.x = b.radius;
  }

  // collision with horizontal walls
  if((b.y + b.radius) > h) {
    b.speedY = -b.speedY;
    b.y = h - b.radius;
  } else if((b.y -b.radius) < 0) {
    b.speedY = -b.speedY;
    b.Y = b.radius;
  }  
}


