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

Object.prototype.merge = function(object) {for (var attrname in object)
  this[attrname] = object[attrname]}

//Polyfill
Number.isInteger = Number.isInteger || function(value) {
  return typeof value === "number" &&
    isFinite(value) &&
    Math.floor(value) === value;
}

/**
 * Vector2
 * @constructor
 * @param {int} x - Nullable number
 * @param {int} y - Nullable number
 */
class Vector2 {
  constructor(x, y) {
    if(typeof x !== "number" || typeof y !== "number")
      throw new Error("Vector2.x, Vector2.y must instance of number");
    this.x = x;
    this.y = y;
  }

  toString() {
    return "[Vector2 object("+this.x+", "+this.y+")]";
  }

  get x() {return this.x}
  set x(num) {
    if(num !== undefined && num !== null && typeof num !== "number")
      throw new TypeError("Vector2.x must instanceof number");
  }
}
/*
Vector2.prototype = {
  toSring: function() {
    return "[Vector2 object("+this.x+", "+this.y+")]";
  },

  getX: function() {return this.x},
  setX: function(x) {this.x = x},

  getY: function() {return this.y},
  setY: function() {this.y = y},

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
    return new Vector2(this.x /= vector2.x, this.y /= vector2.y);
  }
}
*/
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
Block.prototype = Vector2.prototype; //Extend Vector2
Block.prototype.constructor = Block;
Block.prototype.merge({
  //@Override
  toString: function() {
    return "[Block object(x:"+this.x+", color:"+this.color+")]";
  },

  getColor: function() {return this.color},
  setColor: function(color) {this.color = color},

  //not used :/
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
  this.type = Number.isInteger(type) ? type : random(1, TetrisData.pieces.length);
  if(!(location instanceof Vector2))
    throw new TypeError("Piece.location must instanceof Vector2");
  this.vec = location
  this.color = color;
  this.blocks = []; //index 0 is center
  this.pieceData = {};
  this.rotation = 0; //0, 1, 2, 3

  this.init();
}
Piece.prototype = {
  toString: function() {
    return "["+(this.pieceData.name ? this.pieceData.name : "Not defined Piece")
    +" object(type:"+this.type+", x:"+this.cx+", y:"+this.cy+", color:"
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

    if(!(pieceData instanceof PieceData))
      throw new Error("TetrisData.pieces index "+(this.type-1)
        +"is not instanceof PieceData (value: "+pieceData+")");

    if(!this.color) this.color = this.pieceData.defaultColor;
    this._resetCollision(true);
  },

  _resetCollision: function(resetAll) {
    let makeNew = resetAll || this.blocks.length === 0;
    let swap = this.type === 1 && this.type === 3;
    let signX = this.type === 3 ? -1 : 1;
    let signY = this.type === 2 ? -1 : 1;
    //TODO: is valid?

    for(let i = 0; i < this.pieceData.positions.length; i++) {
      if(swap) {
        if(makeNew || !this.blocks[i])
          this.blocks[i] = new Block(this.vec.add(
            new Vector2(this.pieceData.positions[i].getY()*signY,
            this.pieceData.positions[i].getX()*signX)), this.color);
        else
          this.blocks[i].setLocation(this.vec.add(
            new Vector2(this.pieceData.positions[i].getY()*signY,
            this.pieceData.positions[i].getX()*signX)));
      }else {
        if(makeNew || !this.blocks[i])
          this.blocks[i] = new Block(this.vec.add(
            new Vector2(this.pieceData.positions[i].getX()*signX,
            this.pieceData.positions[i].getY()*signY)), this.color);
        else
        this.blocks[i].setLocation(this.vec.add(
          new Vector2(this.pieceData.positions[i].getX()*signX,
          this.pieceData.positions[i].getY()*signY)));
      }
    }
  },

  //no setter on typen and blocks
  //please make a new one
  getType: function() {return this.type},

  getBlocks: function() {return this.blocks},
  getCollisions: function() {
    let collisions = [];
    for(let i = 0; i < this.blocks.length; i++)
      collisions[i] = this.blocks[i].getLocation();
    return collisions;
  },

  getLocation: function() {return this.vec},
  setLocation: function(location, noReCalculate) {
    if(!(location instanceof Vector2))
      throw new TypeError("Piece.setLocation.location must instanceof Vector2");
    this.vec = location;
    if(!noRecalculate) {
      this._resetCollision();
    }
  },

  getRotation: function() {return this.rotation},
  setRotation: function(rot, noReCalculate) {
    if(!Number.isInteger(rot) || rot < 0 || rot > 3)
      throw new TypeError("Piece.setRotation.rot must instanceof Integer(0~3)");
    this.rotation = num;
    if(!noRecalculate) {
      this._resetCollision();
    }
  },

  preCalculateCollision: function(location, rot) {
    if(location === null || location === undefined) location = this.vec;
    if(rot === null || rot === undefined) rot = this.rotation;
    if(!(location instanceof Vector2))
      throw new TypeError("Piece.preCalculateCollision.location must instanceof Vector2");
    if(!Number.isInteger(rot) || rot < 0 || rot > 3)
      throw new TypeError("Piece.preCalculateCollision.rot must instanceof Integer(0~3)");

    let collisions = [];
    let swap = this.type === 1 && this.type === 3;
    let signX = this.type === 3 ? -1 : 1;
    let signY = this.type === 2 ? -1 : 1;

    for(let i = 0; i < this.pieceData.positions.length; i++) {
      if(swap) {
        collisions[i] = this.vec.add(
          new Vector2(this.pieceData.positions[i].getY()*signY,
          this.pieceData.positions[i].getX()*signX));
      }else {
        collision[i] = this.vec.add(
          new Vector2(this.pieceData.positions[i].getX()*signX,
          this.pieceData.positions[i].getY()*signY));
      }
    }

    return collisions;
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

  checkCollision: function(vector2) {
    if(!(vector2 instanceof Vector2))
      throw new TypeError("TetrisField.checkCollision.vector2 must instance of Vector2");
    return !!this.blocks[vector2.getX()][vector2.getY()];
  },

  checkPieceCollision: function(piece) {
    if(!(piece instanceof Piece))
      throw new TypeError("TetrisField.checkPieceCollision.piece must instance of Piece");

  }

  getWidth: function() {return this.width},

  getHeight: function() {return this.height},

  getBlocks: function() {return this.blocks},

  mergeBlock: function(block) {
    if(!(block instanceof Block))
      throw new TypeError("TetrisField.mergeBlock.block must instance of Block");
    let tmp = this.blocks[block.getLocation().getX()][block.getLocation().getY()];
    if(!tmp)
      log("[Warning] TetrisField.mergeBlock: Try override already exists location("
        +block.getLocation().toString()+")");
    this.blocks[block.getLocation().getX()][block.getLocation().getY()] = block;
  },

  mergePiece: function(piece) {
    if(!(piece instanceof Piece))
      throw new TypeError("TetrisField.mergePiece.piece must instance of Piece");
    for(let i in piece.blocks) this.mergeBlock(piece.blocks[i]);
  },


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
    this.blocks[i] = new Array (size);
  }
}
TetrisSeconderyField.prototype = TetrisField.prototype; //Extend TestrisField
TetrisSeconderyField.prototype.constructor = TetrisSeconderyField;
TetrisSeconderyField.prototype.merge({
  //@Override
  toString: function() {
    return "[TetrisSeconderyField object]";
  },

  //@Override
  getHeight: function() {return this.width}
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
      new Vector2(0, -1), new Vector2(-1, -1)], "#8BC34A"),
    new PieceData("Z piece", [new Vector2(0, 0), new Vector2(0, 1),
      new Vector2(0, 1), new Vector2(1, 1)], "#F44336"),
    new PieceData("T piece", [new Vector2(0, 0), new Vector2(1, 0),
      new Vector2(-1, 0), new Vector2(0, -1)], "#9C27B0")
  ]
}

log("Done("+timer.stop(1)+"ms)");
//Init Tetris ==================================================================
log("Init Tetris...");
timer.start(2);

function Tetris() {
  this.reset();
}
Tetris.prototype = {
  toString: function() {
    return "[Tetris object]";
  },

  reset: function() {
    this.score = 0;
    this.currentDirection = 0; //reverse
    this.lastWork = 0;
    this.ready = true;
  },

  tick: function() {
    //0.05초마다 실행
    if(!this.ready) return;


  },

  sketchDraw: function() {
    //화면 드로잉과 같이 움직이는 함수
    //오래걸리는 작업은 tick으로 이동
    if(!this.ready) return;
  },

  swapDirection: function() {
    if(this.currentDirection) this.currentDirection = 0;
    else this.currentDirection = 1;
  },

  /**
   * Create Piece
   * @param {int} type
   */
  createPiece: function(type) {

  },

  /**
   * Merge piece to field
   * @param {Piece} piece
   */
   mergePiece: function(piece) {

   }
}

log("Done("+timer.stop(2)+"ms)");
//Init Sketch ==================================================================
log("Init Sketch...");
timer.start(3);

let ctx = Sketch.create();
ctx.container = document.getElementById("content");

//화면사이즈 바뀔때마다 단위 갱신
ctx.resize = function() {
  this.unit = {
    //width:100%,height:90%의 절반의 길이의 정사각형의 대각선길이 맵길이 등분
    box: this.width > this.height*9/10
      ? this.height*9/10/2*sqrt(2)/TetrisData.mapWidth
      : this.width/2*sqrt(2)/TetrisData.mapWidth,
    //위의 기울어진 맵길이 등분된 상자내부의 대각선 길이의 절반
    horizontalBox: this.width > this.height*9/10
      ? this.height*9/10/2*pow(sqrt(2), 2)/TetrisData.mapWidth/2
      : this.width/2*pow(sqrt(2), 2)/TetrisData.mapWidth/2,
    //화면 중앙
    hCenter: this.width/2,
    //상하 패딩
    vPadding: this.height/20,
    //TODO: implement this
    coordinate: []
  }
  let date = new Date();
  log("resized in " + date.toTimeString() + " ." + date.getMilliseconds())
}

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

//Event
ctx.setup = function() {
  this.twinkle = function() {return round(abs((Date.now()%4000) - 2000) / 2000 * 80) + 100}
  this.tetris = new Tetris();
  setInterval(function() {ctx.tetris.tick()}, 100);
}

ctx.draw = function() {
  this.tetris.sketchDraw();
  //블럭 경계선
  this.strokeStyle = "#222";
  this.lineWidth = 2;
  for(let i = 1; i < TetrisData.mapWidth; i++) {
    this.beginPath();
    this.diagonal(this.unit.hCenter - this.unit.horizontalBox*i, this.height
      - this.unit.vPadding - this.unit.horizontalBox*i,
      this.unit.box*TetrisData.mapWidth, 'ur');
    this.closePath();
    this.stroke();
  }
  for(let i = 1; i < TetrisData.mapWidth; i++) {
    this.beginPath();
    this.diagonal(this.unit.hCenter + this.unit.horizontalBox*i, this.height
      - this.unit.vPadding - this.unit.horizontalBox*i,
      this.unit.box*TetrisData.mapWidth, 'ul');
    this.closePath();
    this.stroke();
  }


  //위쪽 최대한의 블럭이 쌓이는 높이에 빨간 경계선 그리기
  this.strokeStyle = "#"+this.twinkle().toString(16)+"0000";
  this.lineWidth = 3;
  this.beginPath();
  this.diagonal(this.unit.hCenter - this.unit.horizontalBox*TetrisData.mapWidth,
    this.height - this.unit.vPadding - this.unit.horizontalBox*TetrisData.mapWidth,
    this.unit.box*TetrisData.mapWidth, 'ur');
  this.closePath();
  this.stroke();
  this.beginPath();
  this.diagonal(this.unit.hCenter + this.unit.horizontalBox*TetrisData.mapWidth,
    this.height - this.unit.vPadding - this.unit.horizontalBox*TetrisData.mapWidth,
    this.unit.box*TetrisData.mapWidth, 'ul');
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
}

ctx.keydown = function() {
  switch(true) {
    case ctx.keys.LEFT:
      ctx.keys.LEFT = false;
      break;
    case ctx.keys.UP:
      ctx.keys.UP = false;
      break;
    case ctx.keys.RIGHT:
      ctx.keys.RIGHT = false;
      break;
    case ctx.keys.DOWN:
      ctx.keys.DOWN = false;
      break;
    case ctx.keys.SPACE:
      ctx.keys.SPACE = false;
      break;

  }
}

log("Done("+timer.stop(3)+"ms)");
