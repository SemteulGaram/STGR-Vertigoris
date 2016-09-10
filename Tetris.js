'use strict'

let log = console.log;
let timer = {
  timers: {},
  pauses: {},
  start: function(name) {
    if(this.pauses[name]) {
      this.timers[name] += Date.now() - this.pauses[name];
      this.pauses[name] = undefined;
    }else {
      this.timers[name] = Date.now();
    }
  },

  stop: function(name) {
    let result = this.timers[name] ? Date.now()-this.timers[name] : -1;
    this.timers[name] = undefined;
    if(this.pauses[name]) this.pauses[name] = undefined;
    return result;
  },

  pause: function(name) {
    this.pauses[name] = Date.now();
  },

  lap: function(name) {
    return Date.now() - this.timer[name];
  }
}

//Init Objects =================================================================
log("Init Objects...");
timer.start(0);

function merge(a, b) {for (var attrname in b) a[attrname] = b[attrname]}

//Polyfill
Number.isInteger = Number.isInteger || function(value) {
  return typeof value === "number" &&
    isFinite(value) &&
    Math.floor(value) === value;
}

/**
 * Vector2
 * @constructor
 * @param {int} x
 * @param {int} y
 */
function Vector2(x, y) {
  if(typeof x !== "number" || typeof y !== "number")
    throw new Error("Vector2.x, Vector2.y must instance of number (x:"+x+", y:"+y+")");
  this.x = x;
  this.y = y;
}
Vector2.prototype = {
  toString: function() {
    return "[Vector2 object("+this.x+", "+this.y+")]";
  },

  getX: function() {return this.x},
  setX: function(x) {this.x = x},

  getY: function() {return this.y},
  setY: function(y) {this.y = y},

  isEqual: function(vector2) {
    if(!(vector2 instanceof Vector2))
      throw new TypeError("Vector2.isEqual.vector2 must instanceof Vector2");
    return this.x === vector2.x && this.y === vector2.y;
  },

  add: function(vector2) {
    if(!(vector2 instanceof Vector2))
      throw new TypeError("Vector2.add.vector2 must instanceof Vector2");
    return new Vector2(this.x + vector2.x, this.y + vector2.y);
  },

  minus: function(vector2) {
    if(!(vector2 instanceof Vector2))
      throw new TypeError("Vector2.minus.vector2 must instanceof Vector2");
    return new Vector2(this.x - vector2.x, this.y - vector2.y);
  },

  multiplex: function(vector2) {
    if(!(vector2 instanceof Vector2))
      throw new TypeError("Vector2.multiple.vector2 must instanceof Vector2");
    return new Vector2(this.x * vector2.x, this.y * vector2.y);

  },

  divide: function(vector2) {
    if(!(vector2 instanceof Vector2))
      throw new TypeError("Vector2.divide.vector2 must instanceof Vector2");
    return new Vector2(this.x / vector2.x, this.y / vector2.y);
  }
}

/**
 * It is 1x1 block
 * @constructor
 * @extend Vector2
 * @param {int} x
 * @param {int} y
 * @param {string} color - ex) "#xxxxxx" or "#xxx"
 */
function Block(x, y, color) {
  if(typeof x !== "number" || typeof y !== "number")
    throw new Error("Vector2.x, Vector2.y must instance of number");
  this.x = x;
  this.y = y;
  this.color = color;
}
merge(Block.prototype, Vector2.prototype); //Extend Vector2
Block.prototype.constructor = Block;
merge(Block.prototype, {
  //@Override
  toString: function() {
    return "[Block object(x:"+this.x+", y:"+this.y+", color:"+this.color+")]";
  },

  getColor: function() {return this.color},
  setColor: function(color) {this.color = color},

  moveLeft: function(length) {this.x-=(Number.isInteger(length) ? length : 1)},
  moveUp: function(length) {this.y+=(Number.isInteger(length) ? length : 1)},
  moveRight: function(length) {this.x+=(Number.isInteger(length) ? length : 1)},
  moveDown: function(length) {this.y-=(Number.isInteger(length) ? length : 1)}
});

/**
 * Tetris piece data
 * @constructor
 * @param {string} name
 * @param {Vector2[]} positions
 * @param {string} defaultColor
 */
function PieceData(name, positions, defaultColor) {
  this.name = name;
  this.positions = positions;
  this.defaultColor = defaultColor;
}

/**
 * a Tetris piece
 * @constructor
 * @param {(int|null)} type - int(1~5) or null is random
 * @param {Vector2} location
 * @param {(string|null)} color - null is default piece color
 */
function Piece(type, location, color) {
  this.type = Number.isInteger(type) ? type : floor(random(0, TetrisData.pieces.length) + 1);
  if(!(location instanceof Vector2))
    throw new TypeError("Piece.location must instanceof Vector2");
  this.vec = location
  this.color = color;
  this.blocks = []; //index 0 is center
  this.pieceData = {};
  this.rotation = 0; //0, 1, 2, 3

  this._init();
}
Piece.prototype = {
  toString: function() {
    return "["+(this.pieceData.name ? this.pieceData.name : "Not defined Piece")
    +" object(type:"+this.type+", loc:"+this.vec.toString()+", color:"
    +this.color+")]";
  },

  _init: function() {
    if(!TetrisData || !TetrisData.pieces)
      throw new Error("TetrisData.pieces not defined");
    if(typeof this.type !== "number" || this.type < 1
      || this.type > TetrisData.pieces.length)
      throw new Error("Piece.type must instanceof number(1~"
        +TetrisData.pieces.length+")");

    this.pieceData = TetrisData.pieces[this.type-1];

    if(!(this.pieceData instanceof PieceData))
      throw new Error("TetrisData.pieces index "+(this.type-1)
        +"is not instanceof PieceData (value: "+this.pieceData+")");

    if(!this.color) this.color = this.pieceData.defaultColor;
    this._resetCollision();
  },

  _rotateVector2: function(x, y, rot) {
    return [round(x*cos(rot/2*PI) - y*sin(rot/2*PI)),
      round(x*sin(rot/2*PI) + y*cos(rot/2*PI))];
  },

  _resetCollision: function() {
    for(let i = 0; i < this.pieceData.positions.length; i++) {
      let rotated = this._rotateVector2(this.pieceData.positions[i].getX(),
        this.pieceData.positions[i].getY(), this.rotation);

      this.blocks[i] = new Block(this.vec.getX() + rotated[0],
        this.vec.getY() + rotated[1], this.color);
    }
  },

  //no setter on typen and blocks
  //please make a new one
  getType: function() {return this.type},

  getBlocks: function() {return this.blocks},
  getCollisions: function() {return this.getBlocks()}, //alise getBlocks

  getLocation: function() {return this.vec},
  setLocation: function(location, noReCalculate) {
    if(["left", "up", "right", "down"].indexOf(location) !== -1) {
      noReCalculate = true;
      switch(location) {
        case "left":
          this.vec = this.getLocation().add(new Vector2(-1, 0));
          for(let i in this.blocks) {
            this.blocks[i].moveLeft();
          }
          break;
        case "up":
          this.vec = this.getLocation().add(new Vector2(0, 1));
          for(let i in this.blocks) {
            this.blocks[i].moveUp();
          }
          break;
        case "right":
          this.vec = this.getLocation().add(new Vector2(1, 0));
          for(let i in this.blocks) {
            this.blocks[i].moveRight();
          }
          break;
        case "down":
          this.vec = this.getLocation().add(new Vector2(0, -1));
          for(let i in this.blocks) {
            this.blocks[i].moveDown();
          }
          break;
      }
    }else {
      if(!(location instanceof Vector2))
        throw new TypeError("Piece.setLocation.location must instanceof Vector2");
      this.vec = location;
      if(!noReCalculate) {
        this._resetCollision();
      }
    }
  },

  getRotation: function() {return this.rotation},
  setRotation: function(rot, noReCalculate) {
    if(!Number.isInteger(rot) || rot < 0 || rot > 3)
      throw new TypeError("Piece.setRotation.rot must instanceof Integer(0~3)");
    this.rotation = rot;
    if(!noReCalculate) {
      this._resetCollision();
    }
  },

  preCalculatePiece: function(location, rot) {
    if(["left", "up", "right", "down"].indexOf(location) !== -1) {
      switch(location) {
        case "left":
          location = this.getLocation().add(new Vector2(-1, 0));
          break;
        case "up":
          location = this.getLocation().add(new Vector2(0, 1));
          break;
        case "right":
          location = this.getLocation().add(new Vector2(1, 0));
          break;
        case "down":
          location = this.getLocation().add(new Vector2(0, -1));
          break;
      }
    }
    if(location === null || location === undefined) location = this.vec;
    if(rot === null || rot === undefined) rot = this.rotation;
    if(!(location instanceof Vector2))
      throw new TypeError("Piece.preCalculatePiece.location must instanceof Vector2");
    if(!Number.isInteger(rot) || rot < 0 || rot > 3)
      throw new TypeError("Piece.preCalculatePiece.rot must instanceof Integer(0~3)");

    location = new Block(location.getX(), location.getY(), this.color);
    let collisions = [];

    for(let i = 0; i < this.pieceData.positions.length; i++) {
      let rotated = this._rotateVector2(this.pieceData.positions[i].getX(),
        this.pieceData.positions[i].getY(), rot);

      collisions[i] = new Block(location.getX() + rotated[0],
        location.getY() + rotated[1], this.color);
    }

    let calculatePiece = new Piece(this.type, this.vec);
    calculatePiece.vec = location;
    calculatePiece.rotation = rot;
    calculatePiece.blocks = collisions;

    return calculatePiece;
  }
}

/**
 * Tetris default field
 * @constructor
 * @notImplemented
 * @param {int} width
 * @param {int} height
 */
function TetrisField(width, height) {
  //Not implemented
}
TetrisField.prototype = {
  toString: function() {
    return "[TetrisField object]";
  },

  checkCollision: function(block) {
    if(!(block instanceof Block))
      throw new TypeError("TetrisField.checkCollision.block must instance of Block");
    return block.getY() >= this.getHeight() ? false : this.checkBlockCollision(block)
      || block.getX() < 0 || block.getX() >= this.getWidth()
      || block.getY() < 0;
  },

  checkBlockCollision: function(block) {
    if(!(block instanceof Block))
      throw new TypeError("TetrisField.checkBlockCollision.block must instance of Block");
    return !!this.blocks[block.getY()][block.getX()];
  },

  checkPieceCollision: function(piece) {
    if(!(piece instanceof Piece))
      throw new TypeError("TetrisField.checkPieceCollision.piece must instance of Piece");
    for(let i in piece.blocks) {
      if(this.checkCollision(piece.blocks[i])) return true;
    }
    return false;
  },

  getWidth: function() {return this.width},

  getHeight: function() {return this.height},

  getBlocks: function() {return this.blocks},

  mergeBlock: function(block) {
    if(!(block instanceof Block))
      throw new TypeError("TetrisField.mergeBlock.block must instance of Block");
    let tmp = this.blocks[block.getY()][block.getX()];
    if(tmp)
      log("[Warning] TetrisField.mergeBlock: Try override already exists location("
        +block.toString()+")");
    this.blocks[block.getY()][block.getX()] = block;
  },

  mergePiece: function(piece) {
    if(!(piece instanceof Piece))
      throw new TypeError("TetrisField.mergePiece.piece must instance of Piece");
    for(let i in piece.blocks) this.mergeBlock(piece.blocks[i]);
  },

  getFilledLine: function() {
    let lines = [], hasBlank;

    for(let i = 0; i < this.blocks.length; i++) {
      hasBlank = false;
      for(let o = 0; o < this.blocks[i].length; o++) {
        if(!this.blocks[i][o]) {
          hasBlank = true;
          break;
        }
      }
      if(!hasBlank) {
        lines.push(i);
      }
    }

    return lines;
  },

  deleteLines: function(index, range) {
    this.blocks.splice(index, range ? range : 1);
    for(let i = index + range; i < this.getWidth(); i++) {
      this.blocks[i - range] = this.blocks[i];
      this.blocks[i] = undefined;
    }
  }
}

/**
 * Tetris secondery type field
 * @constructor
 * @extend TetrisField
 * @param {int} size
 */
function TetrisSeconderyField(size) {
  if(!Number.isInteger(size) || size < 1)
    throw new TypeError("TetrisSeconderyField.size must instance of Integer(1~)");
  this.width = size;
  this.blocks = new Array(size);
  for(let i = 0; i < size; i++) {
    this.blocks[i] = new Array(size);
  }
}
merge(TetrisSeconderyField.prototype, TetrisField.prototype); //Extend TestrisField
TetrisSeconderyField.prototype.constructor = TetrisSeconderyField;
merge(TetrisSeconderyField.prototype, {
  //@Override
  toString: function() {
    return "[TetrisSeconderyField object]";
  },

  //@Override
  getHeight: function() {return this.width},

  //@Override
  checkCollision: function(block, direction) {
    if(!(block instanceof Block))
      throw new TypeError("TetrisSeconderyField.checkCollision.block must instance of Block");
    return block.getX() < 0 || (direction ? false : (block.getX() >= this.getWidth()))
      || block.getY() < 0 || (direction ? (block.getY() >= this.getWidth()) : false)
      || (direction ? ((block.getX() >= this.getWidth()) ? false
        : this.checkBlockCollision(block)) : ((block.getY() >= this.getWidth())
        ? false : this.checkBlockCollision(block)));
  },

  //@Override
  checkPieceCollision: function(piece, direction) {
    if(!(piece instanceof Piece))
      throw new TypeError("TetrisField.checkPieceCollision.piece must instance of Piece");
    for(let i in piece.blocks) {
      if(this.checkCollision(piece.blocks[i], direction)) return true;
    }
    return false;
  },

  //@Override
  getFilledLine: function() {
    let lines = [[], []], hasBlank;

    for(let i = 0; i < this.blocks.length; i++) {
      hasBlank = false;
      for(let o = 0; o < this.blocks[0].length; o++) {
        if(!this.blocks[o][i]) {
          hasBlank = true;
          break;
        }
      }
      if(!hasBlank) {
        lines[0].push(i);
      }
    }

    for(let i = 0; i < this.blocks.length; i++) {
      hasBlank = false;
      for(let o = 0; o < this.blocks[0].length; o++) {
        if(!this.blocks[i][o]) {
          hasBlank = true;
          break;
        }
      }
      if(!hasBlank) {
        lines[1].push(i);
      }
    }

    return lines;
  },

  //Override
  deleteLines: function(axis, index, range) {
    log("deleteline", axis, index, range)
     range = range ? range : 1;
    if(axis) {
      for(let i = parseInt(index) + parseInt(range); i < this.getWidth(); i++) {
        log("linemove", i, this.blocks[i], "->", i - range, this.blocks[i - range]);
        this.blocks[i - range] = this.blocks[i];
        for(let o in this.blocks[i - range]) {
          if(this.blocks[i - range][o] instanceof Block)
            this.blocks[i - range][o].moveDown(range);
        }
        this.blocks[i] = new Array(this.getWidth());
      }
    }else {
      for(let i = 0; i < this.blocks.length; i++) {
        for(let o = parseInt(index) + parseInt(range); o < this.getWidth(); o++) {
          log("linemove", o, this.blocks[i][o], "->", o - range, this.blocks[i][o - range]);
          this.blocks[i][o - range] = this.blocks[i][o];
          if(this.blocks[i][o - range] instanceof Block)
            this.blocks[i][o - range].moveLeft(range);
          this.blocks[i][o] = undefined;
        }
      }
    }
  }
});

log("Done("+timer.stop(0)+"ms)");
//Init defulat value ===========================================================
log("Init default value...");
timer.start(1);

let TetrisData = {
  mapWidth: 16, //Default is 10
  mapHeight: 20, //Not used
  pieces: [
    new PieceData("I piece", [new Vector2(0, 0), new Vector2(0, 1),
      new Vector2(0, -1), new Vector2(0, -2)], "#03A9F4"),
    new PieceData("O piece", [new Vector2(0, 0), new Vector2(0, -1),
      new Vector2(-1, -1), new Vector2(-1, 0)], "#FFEB3B"),
    new PieceData("S piece", [new Vector2(0, 0), new Vector2(0, 1),
      new Vector2(1, 0), new Vector2(1, -1)], "#8BC34A"),
    new PieceData("Z piece", [new Vector2(0, 0), new Vector2(0, 1),
      new Vector2(-1, 0), new Vector2(-1, -1)], "#F44336"),
    new PieceData("L piece", [new Vector2(0, 0), new Vector2(0, 1),
      new Vector2(0, -1), new Vector2(1, -1)], "#3F51B5"),
    new PieceData("J piece", [new Vector2(0, 0), new Vector2(0, 1),
      new Vector2(0, -1), new Vector2(-1, -1)], "#FF9800"),
    new PieceData("T piece", [new Vector2(0, 0), new Vector2(1, 0),
      new Vector2(-1, 0), new Vector2(0, -1)], "#9C27B0")
  ]
}

log("Done("+timer.stop(1)+"ms)");
//Init Tetris ==================================================================
log("Init Tetris...");
timer.start(2);

/***
 * Y-axis    X-axis
 *    \       /
 *      \   /
 *        V
 */
function Tetris() {
  this.reset();
}
Tetris.prototype = {
  toString: function() {
    return "[Tetris object]";
  },

  reset: function() {
    this.field = new TetrisSeconderyField(TetrisData.mapWidth);
    this.score = 0;
    this.lastWork = 0;
    this.pauseTiming = 0;
    this.lastKeyEnter = 0;
    this.currentDirection = 0; //reverse
    this.currentPiece = this.createPiece(this.currentDirection);
    this.nextPieceQueue = [];
    this.nextPieceQueueMax = 1;
    this.actionDelay = 1000;

    this.ready = false;
  },

  start: function() {
    this.lastWork = Date.now();
    this.ready = true;
  },

  stop: function() {
    this.ready = false;
    this.pauseTiming = Date.now();
  },

  restart: function() {
    this.lastWork += Date.now() - this.pauseTiming;
    this.ready = true;
  },

  tick: function() {
    //0.05초마다 실행
    if(!this.ready) return;
    if(Date.now() - this.lastWork > this.actionDelay) {
      while(this.nextPieceQueue.length < this.nextPieceQueueMax)
        this.addNewPieceInQueue();

      if(this.currentDirection) { //Gravity on Left-Bottom
        if(this.field.checkPieceCollision(
          this.currentPiece.preCalculatePiece("left"), this.currentDirection)) {
          if(Date.now() - this.lastKeyEnter > this.actionDelay) { //Infinity rule
            this.mergeCurrentPiece();
          }
        }else {
          this.currentPiece.setLocation("left");
        }
      }else { //Gravity on Right-Bottom
        if(this.field.checkPieceCollision(
          this.currentPiece.preCalculatePiece("down"), this.currentDirection)) {
          if(Date.now() - this.lastKeyEnter > this.actionDelay) { //Infinity rule
            this.mergeCurrentPiece();
          }
        }else {
          this.currentPiece.setLocation("down");
        }
      }

      this.checkFilledLines();

      if(!this.currentPiece) {
        if(this.nextPieceQueue.length === 0) {
          this.swapDirection();
          this.currentPiece = this.createPiece();
        }else {
          this.shiftNextPieceFromQueue();
          this.swapDirection();
          this.addNewPieceInQueue();
        }
      }

      this.lastWork = Date.now();
    }
  },

  sketchBeforeDraw: function(ctx) {
    // 화면 드로잉과 같이 움직이는 함수
    // 그래픽 작업을 제외한 동기가 필요없고 오래걸리는 작업은 tick으로 이동

    function fillWithBlank(xIndex, blocks) {
      for(let i in blocks) {
        if(!blocks[i]) continue;
        ctx.drawBox(blocks[i].getX(), blocks[i].getY(), blocks[i].getColor());
      }
    }

    function fill(blocks) {
      for(let i = 0; i < blocks.length; i++) {
        ctx.drawBox(blocks[i].getX(), blocks[i].getY(), blocks[i].getColor());
      }
    }

    let fieldBlocks = this.getField().getBlocks();

    for(let o = 0; o < fieldBlocks.length; o++) {
      fillWithBlank(o, fieldBlocks[o]);
    }

    fill(this.currentPiece.getBlocks());
  },

  sketchAfterDraw: function(ctx) {
    // 화면 드로잉과 같이 움직이는 함수
    // 그래픽 작업을 제외한 동기가 필요없고 오래걸리는 작업은 tick으로 이동
  },

  moveLeft: function() {
    let direction = this.currentDirection ? "up" : "left";
    if(!this.field.checkPieceCollision(
      this.currentPiece.preCalculatePiece(direction), this.currentDirection)) {

      this.currentPiece.setLocation(direction);
    }
    this.lastKeyEnter = Date.now();
  },

  moveUp: function() {
    let direction = this.currentDirection ? "right" : "up";
    if(!this.field.checkPieceCollision(
      this.currentPiece.preCalculatePiece(direction), this.currentDirection)) {

      this.currentPiece.setLocation(direction);
    }
    this.lastKeyEnter = Date.now();
  },

  moveRight: function() {
    let direction = this.currentDirection ? "down" : "right";
    if(!this.field.checkPieceCollision(
      this.currentPiece.preCalculatePiece(direction), this.currentDirection)) {

      this.currentPiece.setLocation(direction);
    }
    this.lastKeyEnter = Date.now();
  },

  moveDown: function() {
    let direction = this.currentDirection ? "left" : "down";
    if(!this.field.checkPieceCollision(
      this.currentPiece.preCalculatePiece(direction), this.currentDirection)) {

      this.currentPiece.setLocation(direction);
    }
    this.lastKeyEnter = Date.now();
  },

  rotateLeft: function() {
    let rot = (this.currentPiece.getRotation()+3)%4;
    if(!this.field.checkPieceCollision(
      this.currentPiece.preCalculatePiece(null, rot), this.currentDirection)) {

      this.currentPiece.setRotation(rot);
    }else {
      //TODO: Implement T-Flip Flop and smooth rotate S, Z Piece
    }
    this.lastKeyEnter = Date.now();
  },

  rotateRight: function() {
    let rot = (this.currentPiece.getRotation()+1)%4;
    if(!this.field.checkPieceCollision(
      this.currentPiece.preCalculatePiece(null, rot), this.currentDirection)) {

      this.currentPiece.setRotation(rot);
    }else {
      //TODO: Implement T-Flip Flop and smooth rotate S, Z Piece
    }
    this.lastKeyEnter = Date.now();
  },

  instantDrop: function() {
    if(this.field.checkPieceCollision(this.currentPiece
      .preCalculatePiece(this.currentPiece.getLocation()
      .minus(new Vector2(this.currentDirection ? 0 : 1,
      this.currentDirection ? 1 : 0))), this.currentDirection)) {
        this.mergeCurrentPiece();
        this.shiftNextPieceFromQueue();
        this.swapDirection();
        this.addNewPieceInQueue();
    }else {
      for(let i = 2; i <= this.getField().getWidth(); i++) {
        if(this.getField().checkPieceCollision(this.currentPiece
          .preCalculatePiece(this.currentPiece.getLocation()
          .minus(new Vector2(this.currentDirection ? i : 0,
          this.currentDirection ? 0 : i))), (this.currentDirection+1)%2)) {

          this.currentPiece.setLocation(this.currentPiece.getLocation()
            .minus(new Vector2(this.currentDirection ? i-1 : 0,
            this.currentDirection ? 0 : i-1)));

          this.mergeCurrentPiece();
          this.shiftNextPieceFromQueue();
          this.swapDirection();
          this.addNewPieceInQueue();
          break;
        }
      }
    }

    this.checkFilledLines();
  },

  swapDirection: function() {
    if(this.currentDirection) this.currentDirection = 0;
    else this.currentDirection = 1;
  },

  /**
   * Create Piece
   */
  createPiece: function(position) {
    return new Piece(null, new Vector2(position ? this.getField().getWidth() + 1
      : floor(this.getField().getWidth() / 2),
      position ? floor(this.getField().getWidth() / 2)
      : this.getField().getWidth() + 1), null);
  },

  addNewPieceInQueue: function() {
    this.nextPieceQueue.push(this.createPiece((this.currentDirection
      + this.nextPieceQueue.length + 1) % 2));
  },

  shiftNextPieceFromQueue: function() {
    if(this.currentPiece)
      log("[Warning] Tetris.currentPiece is already exists("
        +this.currentPiece.toString()+"). Try override...");
    this.currentPiece = this.nextPieceQueue.shift();
  },

  /**
   * Merge piece to field
   * @param {Piece} piece
   */
   mergeCurrentPiece: function() {
     this.field.mergePiece(this.currentPiece);
     this.currentPiece = null;
   },

   checkFilledLines: function() {
     let lines = this.field.getFilledLine();
     if(lines[0].length > 0 || lines[1].length > 0) {
       for(let i in lines[0]) {
         this.field.deleteLines(0, i, 1);
       }
       for(let i in lines[1]) {
         this.field.deleteLines(1, i, 1);
       }
     }
   },

   getField: function() {
     return this.field;
   }
}

log("Done("+timer.stop(2)+"ms)");
//Init Sketch ==================================================================
log("Init Sketch...");
timer.start(3);

let ctx = Sketch.create();
ctx.container = document.getElementById("content");

//대각선 그리기
ctx.diagonal = function(x, y, size, direction) {
  let hSize = size/sqrt(2);
  switch(direction) {
    case "ul": //왼쪽 위로
      ctx.moveTo(x, y);
      ctx.lineTo(x-hSize, y-hSize);
      break;
    case "ur": //오른쪽 위로
      ctx.moveTo(x, y);
      ctx.lineTo(x+hSize, y-hSize);
      break;
    case "dl": //왼쪽 아래로
      ctx.moveTo(x, y);
      ctx.lineTo(x-hSize, y+hSize);
      break;
    case "dr": //오른쪽 아래로
      ctx.moveTo(x, y);
      ctx.lineTo(x+hSize, y+hSize);
      break;
    default:
      throw new Error("Unknown direction: (" + direction + ") dicrection must be 'ul','ur','dl','dr'");
  }
}

ctx.drawBox = function(dx, dy, color) {
  let x = this.unit.hCenter + dx*this.unit.horizontalBox - dy*this.unit.horizontalBox;
  let y = this.height - this.unit.vPadding - (dx+dy)*this.unit.horizontalBox;

  this.fillStyle = color;
  this.beginPath();
  this.moveTo(x, y);
  this.lineTo(x+this.unit.horizontalBox, y-this.unit.horizontalBox);
  this.lineTo(x, y-2*this.unit.horizontalBox);
  this.lineTo(x-this.unit.horizontalBox, y-this.unit.horizontalBox);
  this.closePath();
  this.fill();
}

//Event
ctx.setup = function() {
  this.twinkle = function() {return round(abs((Date.now()%4000) - 2000) / 2000 * 80) + 100}
  this.tetris = new Tetris();
  this.tetris.start();
  setInterval(function() {ctx.tetris.tick()}, 100);
}

ctx.resize = function() { //화면사이즈 바뀔때마다 단위 갱신
  this.unit = {
    //width:100%,height:90%의 절반의 길이의 정사각형의 대각선길이 맵길이 등분
    box: this.width > this.height*9/10
      ? this.height*9/10/2*sqrt(2)/this.tetris.getField().getWidth()
      : this.width/2*sqrt(2)/this.tetris.getField().getWidth(),
    //위의 기울어진 맵길이 등분된 상자내부의 대각선 길이의 절반
    horizontalBox: this.width > this.height*9/10
      ? this.height*9/10/2*pow(sqrt(2), 2)/this.tetris.getField().getWidth()/2
      : this.width/2*pow(sqrt(2), 2)/this.tetris.getField().getWidth()/2,
    //화면 중앙
    hCenter: this.width/2,
    //상하 패딩
    vPadding: this.height/20
  }
  log("Resized in " + new Date().toTimeString())
}


ctx.draw = function() {
  this.tetris.sketchBeforeDraw(this);

  //블럭 경계선
  this.strokeStyle = "#222";
  this.lineWidth = 2;
  for(let i = 1; i < this.tetris.getField().getWidth(); i++) {
    this.beginPath();
    this.diagonal(this.unit.hCenter - this.unit.horizontalBox*i, this.height
      - this.unit.vPadding - this.unit.horizontalBox*i,
      this.unit.box*this.tetris.getField().getWidth(), 'ur');
    this.closePath();
    this.stroke();
  }
  for(let i = 1; i < this.tetris.getField().getWidth(); i++) {
    this.beginPath();
    this.diagonal(this.unit.hCenter + this.unit.horizontalBox*i, this.height
      - this.unit.vPadding - this.unit.horizontalBox*i,
      this.unit.box*this.tetris.getField().getWidth(), 'ul');
    this.closePath();
    this.stroke();
  }


  //위쪽 최대한의 블럭이 쌓이는 높이에 빨간 경계선 그리기
  this.strokeStyle = "#"+this.twinkle().toString(16)+"0000";
  this.lineWidth = 3;
  this.beginPath();
  this.diagonal(this.unit.hCenter - this.unit.horizontalBox*this.tetris.getField().getWidth(),
    this.height - this.unit.vPadding - this.unit.horizontalBox*this.tetris.getField().getWidth(),
    this.unit.box*this.tetris.getField().getWidth(), 'ur');
  this.closePath();
  this.stroke();
  this.beginPath();
  this.diagonal(this.unit.hCenter + this.unit.horizontalBox*this.tetris.getField().getWidth(),
    this.height - this.unit.vPadding - this.unit.horizontalBox*this.tetris.getField().getWidth(),
    this.unit.box*this.tetris.getField().getWidth(), 'ul');
  this.closePath();
  this.stroke();

  //아래쪽의 검은 바닥타일 그리기
  this.fillStyle = "#222";
  this.beginPath();
  this.moveTo(0, this.height);
  this.lineTo(0, this.height - this.unit.vPadding - this.unit.hCenter);
  this.lineTo(this.unit.hCenter, this.height - this.unit.vPadding);
  this.lineTo(this.width, this.height - this.unit.vPadding - this.unit.hCenter);
  this.lineTo(this.width, this.height);
  this.closePath();
  this.fill();

  //경계선 좌
  this.strokeStyle = "#000";
  this.beginPath();
  this.moveTo(this.unit.hCenter, this.height - this.unit.vPadding);
  this.lineTo(0, this.height - this.unit.vPadding - this.unit.hCenter);
  this.closePath();
  this.stroke();

  //경계선 우
  this.beginPath();
  this.moveTo(this.unit.hCenter, this.height - this.unit.vPadding);
  this.lineTo(this.width, this.height - this.unit.vPadding - this.unit.hCenter);
  this.closePath();
  this.stroke();

  this.tetris.sketchAfterDraw(this);
}

ctx.keydown = function() {
  switch(true) {
    case this.keys.LEFT:
      this.tetris.moveLeft();
      this.keys.LEFT = false;
      break;
    case this.keys.UP:
      this.tetris.rotateLeft();
      this.keys.UP = false;
      break;
    case this.keys.RIGHT:
      this.tetris.moveRight();
      this.keys.RIGHT = false;
      break;
    case this.keys.DOWN:
      this.tetris.moveDown();
      this.keys.DOWN = false;
      break;
    case this.keys.SPACE:
      this.tetris.instantDrop();
      this.keys.SPACE = false;
      break;
  }
}

log("Done("+timer.stop(3)+"ms)");
