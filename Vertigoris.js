'use strict'

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
console.log("Init Objects...");
timer.start(0);

function merge(a, b) {for (var attrname in b) a[attrname] = b[attrname]}

//Polyfill
Number.isInteger = Number.isInteger || function(value) {
  return typeof value === "number" &&
    isFinite(value) &&
    Math.floor(value) === value;
}

function parseColor(color) {
  let r, g, b;
  if(color.match(/^#...$/)) {
    r = parseInt(color[1] + color[1], 16);
    g = parseInt(color[2] + color[2], 16);
    b = parseInt(color[3] + color[3], 16);
  }else if(color.match(/^#......$/)) {
    r = parseInt(color[1] + color[2], 16);
    g = parseInt(color[3] + color[4], 16);
    b = parseInt(color[5] + color[6], 16);
  }else  {
    throw new Error("[Error] Sketch.getMoreColor.color: unknown color("+color+")");
  }
  return [r, g, b];
}

function stringifyColor(r, g, b) {
  function fix(str) {
    if(str.length === 1) return "0" + str;
    return str;
  }

  return "#"+fix(r.toString(16))+fix(g.toString(16))+fix(b.toString(16));
}

function rgbToHsv(originR, originG, originB) {
  let r, g, b, h, s, v, dr, dg, db, cMin, cMax, dMax;
  r = originR / 255                     //RGB from 0 to 255
  g = originG / 255
  b = originB / 255

  cMin = Math.min(r, g, b)    //Min. value of RGB
  cMax = Math.max(r, g, b)    //Max. value of RGB
  dMax = cMax - cMin;             //Delta RGB value

  v = cMax;

  if(dMax === 0) {                     //This is a gray, no chroma...
    h = 0;                                //HSV results from 0 to 1
    s = 0;
  }else {                                  //Chromatic data...
    s = dMax / cMax;

    dr = (((cMax - r)/6) + (dMax/2)) / dMax;
    dg = (((cMax - g)/6) + (dMax/2)) / dMax;
    db = (((cMax - b)/6) + (dMax/2)) / dMax;

    if(r === cMax) h = db - dg;
    else if(g === cMax) h = (1/3) + dr - db;
    else if(b === cMax) h = (2/3) + dg - dr;

    if (h<0) h += 1
    if (h>1) h -= 1
  }
  return [h, s, v];
}

function hsvToRgb(h, s, v) {
  let ch, ci, c1, c2, c3, cr, cg, cb, r, g, b;
  if(s === 0) {                       //HSV from 0 to 1
    r = v*255;
    g = v*255;
    b = v*255;
  }else {
    ch = h*6;
    if (ch === 6) ch = 0;      //H must be < 1
    ci = parseInt(ch);            //Or ... var_i = floor( var_h )
    c1 = v * (1-s);
    c2 = v * (1-s * (ch-ci));
    c3 = v * (1-s * (1-(ch-ci)));

    if      (ci === 0) {cr = v ; cg = c3; cb = c1}
    else if (ci === 1) {cr = c2; cg = v ; cb = c1}
    else if (ci === 2) {cr = c1; cg = v ; cb = c3}
    else if (ci === 3) {cr = c1; cg = c2; cb = v }
    else if (ci === 4) {cr = c3; cg = c1; cb = v }
    else               {cr = v ; cg = c1; cb = c2}

    r = cr * 255                  //RGB results from 0 to 255
    g = cg * 255
    b = cb * 255
  }
  return [parseInt(Math.round(r)), parseInt(Math.round(g)), parseInt(Math.round(b))];
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
 * Visual Button
 * @constructor
 * @param {Object} ctx - any Object
 * @param {Vector2} vec1 - start point of button
 * @param {Vector2} vec2 - end point of button
 * @param {function(ctx)} clickAction
 * @param {function(ctx, CanvasButton, isClick)} drawAction
 * @param {boolean} repeatWhenHold - repeat clickAction when hold the button
 * @param {(int|function(ctx, CanvasButtonm isClick))} bgType - draw background using inner type or draw function
 * @param {String} bgColor - only work on inner type
 * @param {String} bgClickColor - only work on inner type
 */
function CanvasButton(ctx, vec1, vec2, clickAction, drawAction, repeatWhenHold, bgType, bgColor, bgClickColor) {
  if(!(vec1 instanceof Vector2)) throw new TypeError("CanvasButton.vec1 must instance of Vector2");
  if(!(vec2 instanceof Vector2)) throw new TypeError("CanvasButton.vec2 must instance of Vector2");
  if(typeof clickAction !== "function") throw new TypeError("CanvasButton.clickAction must instance of function");
  if(typeof drawAction !== "function") throw new TypeError("CanvasButton.drawAction must instance of function");
  this._ctx = ctx;
  this._v1 = vec1;
  this._v2 = vec2;
  this._click = clickAction;
  this._draw = drawAction;
  this._repeat = !!repeatWhenHold;
  this._bc = bgColor || "#444";
  this._bcc = bgClickColor || "#222";
  if(typeof bgType === "function") {
    this._bdf = bgType;
  }else if(typeof bgType === "number") {
    switch(bgType) {
      case 1:
        this._bdf = this._drawBgType1;
        break;
      default:
        throw new TypeError("Unknown background inner type: " + bgType);
    }
  }else {
    throw new TypeError("CanvasButton.bgType must instance of number or function");
  }

  this._clickStartMill = 0;
  this._clickLastRepeatMill = 0;
  this._onClick = false;

  this.width = this.getVectorEnd().getX() - this.getVectorStart().getX();
  this.height = this.getVectorEnd().getY() - this.getVectorStart().getY();
}

CanvasButton.prototype = {
  toString: function() {
    return "[CanvasButton("+this.v1.toString()+")]";
  },

  getVectorStart: function() {return this._v1},

  getVectorEnd: function() {return this._v2},

  inCollision: function(vec) {
    return (this._v1.getX() <= vec.getX() && this._v2.getX() >= vec.getX())
      && (this._v1.getY() <= vec.getY() && this._v2.getY() >= vec.getY());
  },

  isClicked: function() {return this._onClick},

  clickStart: function() {
    this._clickStartMill = Date.now();
    //this._clickLastRepeatMill = Date.now();
    this._onClick = true;
    this._click(this._ctx);
  },

  clickEnd: function() {
    this._onClick = false;
  },

  tick: function() {
    if(this._onClick && this._repeat && Date.now() - this._clickStartMill > 200/* && Date.now() - this._clickLastRepeatMill > 30*/) {
      this._click(this._ctx);
      //this._clickLastRepeatMill = Date.now(); Reason: Tick interval is already 30
    }

  },

  draw: function(ctx) {
    this._bdf(ctx, this, this._onClick, this._bc, this._bcc);
    this._draw(ctx, this, this._onClick);
  },

  _drawBgType1: function(ctx, cBtn, isClick, bgColor, bgClickColor) {
    //Background
    let radius = min(cBtn.width, cBtn.height)/5;

    ctx.beginPath();
    ctx.moveTo(this._v1.getX() + radius, this._v1.getY());
    ctx.lineTo(this._v2.getX() - radius, this._v1.getY());
    ctx.arcTo(this._v2.getX(), this._v1.getY(), this._v2.getX(), this._v1.getY() + radius, radius);
    ctx.lineTo(this._v2.getX(), this._v2.getY() - radius);
    ctx.arcTo(this._v2.getX(), this._v2.getY(), this._v2.getX() - radius, this._v2.getY(), radius);
    ctx.lineTo(this._v1.getX() + radius, this._v2.getY());
    ctx.arcTo(this._v1.getX(), this._v2.getY(), this._v1.getX(), this._v2.getY() - radius, radius);
    ctx.lineTo(this._v1.getX(), this._v1.getY() + radius);
    ctx.arcTo(this._v1.getX(), this._v1.getY(), this._v1.getX() + radius, this._v1.getY(), radius);
    ctx.closePath();

    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = radius/4;
    ctx.shadowOffsetY = radius/4;
    ctx.shadowColor = "Blank";
    ctx.fillStyle = isClick ? bgClickColor : bgColor;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = "#000000";
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
      console.log("[Warning] TetrisField.mergeBlock: Try override already exists location("
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
    range = range ? range : 1;
    if(axis) {
      for(let i = parseInt(index) + parseInt(range); i < this.getWidth(); i++) {
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
          this.blocks[i][o - range] = this.blocks[i][o];
          if(this.blocks[i][o - range] instanceof Block)
            this.blocks[i][o - range].moveLeft(range);
          this.blocks[i][o] = undefined;
        }
      }
    }
  }
});

console.log("Done("+timer.stop(0)+"ms)");
//Init defulat value ===========================================================
console.log("Init default value...");
timer.start(1);

let TetrisData = {
  mapWidth: 16, //Default is 10
  mapHeight: 20, //Not used
  pieces: [
    new PieceData("I piece", [new Vector2(0, 0), new Vector2(0, 1),
      new Vector2(0, 2), new Vector2(0, -1)], "#03A9F4"),
    new PieceData("O piece", [new Vector2(0, 0), new Vector2(0, 1),
      new Vector2(1, 1), new Vector2(1, 0)], "#FFEB3B"),
    new PieceData("S piece", [new Vector2(0, 0), new Vector2(-1, 0),
      new Vector2(-1, 1), new Vector2(0, -1)], "#8BC34A"),
    new PieceData("Z piece", [new Vector2(0, 0), new Vector2(1, 0),
      new Vector2(1, 1), new Vector2(0, -1)], "#F44336"),
    new PieceData("L piece", [new Vector2(0, 0), new Vector2(0, 1),
      new Vector2(0, -1), new Vector2(1, -1)], "#3F51B5"),
    new PieceData("J piece", [new Vector2(0, 0), new Vector2(0, 1),
      new Vector2(0, -1), new Vector2(-1, -1)], "#FF9800"),
    new PieceData("T piece", [new Vector2(0, 0), new Vector2(1, 0),
      new Vector2(-1, 0), new Vector2(0, -1)], "#9C27B0")
  ]
}

console.log("Done("+timer.stop(1)+"ms)");
//Init Tetris ==================================================================
console.log("Init Tetris...");
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
    this.pieceAppearAnimateTiming = [Date.now(), Date.now()];
    this.pieceAppearAnimateDelay = 1000;
    this.nextPieceQueue = [];
    this.nextPieceQueueMax = 1;
    this.actionDelay = 1000;

    this.ready = false;
    this._pause = false;
  },

  start: function() {
    this.lastWork = Date.now();
    this.ready = true;
  },

  stop: function() {
    this.ready = false;
  },

  isRun: function() {
    return this.ready;
  },

  pause: function() {
    this._pause = true;
    this.pauseTiming = Date.now();
  },

  restart: function() {
    this.lastWork += Date.now() - this.pauseTiming;
    this._pause = false;
  },

  isPause: function() {
    return this._pause
  },

  tick: function() {
    //0.05초마다 실행
    if(!this.ready || this._pause) return;
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
    if(!this.ready || this._pause) return;
    let direction = this.currentDirection ? "up" : "left";
    if(!this.field.checkPieceCollision(
      this.currentPiece.preCalculatePiece(direction), this.currentDirection)) {

      this.currentPiece.setLocation(direction);
      this.lastKeyEnter = Date.now();
    }
  },

  moveUp: function() {
    if(!this.ready || this._pause) return;
    let direction = this.currentDirection ? "right" : "up";
    if(!this.field.checkPieceCollision(
      this.currentPiece.preCalculatePiece(direction), this.currentDirection)) {

      this.currentPiece.setLocation(direction);
      this.lastKeyEnter = Date.now();
    }
  },

  moveRight: function() {
    if(!this.ready || this._pause) return;
    let direction = this.currentDirection ? "down" : "right";
    if(!this.field.checkPieceCollision(
      this.currentPiece.preCalculatePiece(direction), this.currentDirection)) {

      this.currentPiece.setLocation(direction);
      this.lastKeyEnter = Date.now();
    }
  },

  moveDown: function() {
    if(!this.ready || this._pause) return;
    let direction = this.currentDirection ? "left" : "down";
    if(!this.field.checkPieceCollision(
      this.currentPiece.preCalculatePiece(direction), this.currentDirection)) {

      this.currentPiece.setLocation(direction);
      this.lastKeyEnter = Date.now();
      this.lastWork = Date.now(); //Fixed timing
    }
  },

  rotateLeft: function() {
    if(!this.ready || this._pause) return;
    let rot = (this.currentPiece.getRotation()+1)%4;
    if(!this.field.checkPieceCollision(
      this.currentPiece.preCalculatePiece(null, rot), this.currentDirection)) {

      this.currentPiece.setRotation(rot);
      this.lastKeyEnter = Date.now();
    }else {
      //TODO: Implement T-Flip Flop and smooth rotate S, Z Piece
    }
  },

  rotateRight: function() {
    if(!this.ready || this._pause) return;
    let rot = (this.currentPiece.getRotation()+3)%4;
    if(!this.field.checkPieceCollision(
      this.currentPiece.preCalculatePiece(null, rot), this.currentDirection)) {

      this.currentPiece.setRotation(rot);
      this.lastKeyEnter = Date.now();
    }else {
      //TODO: Implement T-Flip Flop and smooth rotate S, Z Piece
    }
  },

  instantDrop: function() {
    if(!this.ready || this._pause) return;
    if(this.field.checkPieceCollision(this.currentPiece
      .preCalculatePiece(this.currentPiece.getLocation()
      .minus(new Vector2(this.currentDirection ? 1 : 0,
      this.currentDirection ? 0 : 1))), this.currentDirection)) {
        this.mergeCurrentPiece();
        this.shiftNextPieceFromQueue();
        this.swapDirection();
        this.addNewPieceInQueue();
    }else {
      for(let i = 2; i <= this.getField().getWidth(); i++) {
        if(this.getField().checkPieceCollision(this.currentPiece
          .preCalculatePiece(this.currentPiece.getLocation()
          .minus(new Vector2(this.currentDirection ? i : 0,
          this.currentDirection ? 0 : i))), this.currentDirection)) {

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
      console.log("[Warning] Tetris.currentPiece is already exists("
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

   checkFilledLines: function() { //TODO: Scoreing
     let lines = this.field.getFilledLine();
     if(lines[0].length > 0 || lines[1].length > 0) {
       for(let i in lines[0]) {
         this.field.deleteLines(0, lines[0][i], 1);
       }
       for(let i in lines[1]) {
         this.field.deleteLines(1, lines[1][i], 1);
       }
     }
   },

   getField: function() {
     return this.field;
   }
}

console.log("Done("+timer.stop(2)+"ms)");
//Init Sketch ==================================================================
console.log("Init Sketch...");
timer.start(3);

var ctx, tetrisInterval, ctxInterval;

function setupContext() {
  ctx = Sketch.create({container: document.getElementById("content")});

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

  ctx.getMoreColor = function(color) {
    let originRGB;
    try {
      originRGB = parseColor(color);
    }catch(err) {
      console.log("[Error]", err, err.message);
      return [color, color, color];
    }

    let hsv = rgbToHsv(originRGB[0], originRGB[1], originRGB[2]);
    let llv = hsv[2] + 0.15;
    let lv = hsv[2] + 0.05;
    let dv = hsv[2] - 0.05;
    let ddv = hsv[2] - 0.15;

    let llc = hsvToRgb(hsv[0], hsv[1], llv < 1 ? llv : 1);
    let lc = hsvToRgb(hsv[0], hsv[1], lv < 1 ? lv : 1);
    let dc = hsvToRgb(hsv[0], hsv[1], dv > 0 ? dv : 0);
    let ddc = hsvToRgb(hsv[0], hsv[1], ddv > 0 ? ddv : 0);
    return [stringifyColor(llc[0], llc[1], llc[2]), stringifyColor(lc[0], lc[1], lc[2]),
      color, stringifyColor(dc[0], dc[1], dc[2]), stringifyColor(ddc[0], ddc[1], ddc[2])];
  }

  ctx.drawBox = function(dx, dy, color, unit1, ax, ay) {
    if(!unit1) unit1 = this.unit.horizontalBox;
    if(!ax) ax = 0;
    if(!ay) ay = 0;
    let x = this.unit.hCenter + dx*unit1 - dy*unit1;
    let y = this.height - this.unit.vPadding - (dx+dy)*unit1;
    let cd = [[x+ax, y+ay], [x+unit1+ax, y-unit1+ay],
      [x+ax, y-2*unit1+ay], [x-unit1+ax, y-unit1+ay]];

    if(!this._moreColor[color]) { //부담이 큰 작업이므로 첫 로드때만 초기화
      this._moreColor[color] = this.getMoreColor(color);
    }
    color = this._moreColor[color];
    let blockHeight = unit1/5;

    //Main box
    //(draw index)
    //2↙↖1
    //3↘↗0
    this.fillStyle = color[2];
    this.beginPath();
    this.moveTo(cd[0][0], cd[0][1]);
    this.lineTo(cd[1][0], cd[1][1]);
    this.lineTo(cd[2][0], cd[2][1]);
    this.lineTo(cd[3][0], cd[3][1]);
    this.closePath();
    this.fill();

    //Sub box 0 (leftTop)
    this.fillStyle = color[0];
    this.beginPath();
    this.moveTo(cd[2][0], cd[2][1]);
    this.lineTo(cd[2][0], cd[2][1]+blockHeight);
    this.lineTo(cd[3][0]+blockHeight, cd[3][1]);
    this.lineTo(cd[3][0], cd[3][1]);
    this.closePath();
    this.fill();

    //Sub box 1 (rightTop)
    this.fillStyle = color[1];
    this.beginPath();
    this.moveTo(cd[2][0], cd[2][1]);
    this.lineTo(cd[2][0], cd[2][1]+blockHeight);
    this.lineTo(cd[1][0]-blockHeight, cd[1][1]);
    this.lineTo(cd[1][0], cd[1][1]);
    this.closePath();
    this.fill();

    //Sub box 2 (leftBottom)
    this.fillStyle = color[4];
    this.beginPath();
    this.moveTo(cd[0][0], cd[0][1]);
    this.lineTo(cd[0][0], cd[0][1]-blockHeight);
    this.lineTo(cd[3][0]+blockHeight, cd[3][1]);
    this.lineTo(cd[3][0], cd[3][1]);
    this.closePath();
    this.fill();

    //Sub box 3 (rightBottom)
    this.fillStyle = color[5];
    this.beginPath();
    this.moveTo(cd[0][0], cd[0][1]);
    this.lineTo(cd[0][0], cd[0][1]-blockHeight);
    this.lineTo(cd[1][0]-blockHeight, cd[1][1]);
    this.lineTo(cd[1][0], cd[1][1]);
    this.closePath();
    this.fill();
  }

  ctx.drawTitle = function(visible) {

  }

  /**
   * Draw pause screen
   * @param {boolean} visible
   * @return {boolean} success
   */
  ctx.drawPause = function(visible) {
    if(this._whilePauseAnimate) return;
    ctx._pauseAniTiming = Date.now();
    if(visible) { //Pause screen appear animation
      this.tetris.pause();
      this._whilePauseAnimate = true;
      this._pauseColor = stringifyColor.apply(this, hsvToRgb(random(0, 1), 1, 0.5));
      this.drawAfterRegister["pause_screen"] = function(ctx) {
        let t1 = 500;
        let time = Date.now() - ctx._pauseAniTiming;
        let rh;
        if(time < t1) {
          rh = -ctx.height + ctx.height*pow(time/t1, 3);
        }else {
          rh = 0;
          if(ctx._whilePauseAnimate) ctx._whilePauseAnimate = false;
        }
        //위쪽의 검은 덮개타일 그리기
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, ctx.height - ctx.unit.vPadding - ctx.unit.hCenter + rh);
        ctx.lineTo(ctx.unit.hCenter, ctx.height - ctx.unit.vPadding + rh);
        ctx.lineTo(ctx.width, ctx.height - ctx.unit.vPadding - ctx.unit.hCenter + rh);
        ctx.lineTo(ctx.width, 0);
        ctx.closePath();
        ctx.fill();

        //경계선 좌
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.moveTo(ctx.unit.hCenter, ctx.height - ctx.unit.vPadding + rh);
        ctx.lineTo(0, ctx.height - ctx.unit.vPadding - ctx.unit.hCenter + rh);
        ctx.closePath();
        ctx.stroke();

        //경계선 우
        ctx.beginPath();
        ctx.moveTo(ctx.unit.hCenter, ctx.height - ctx.unit.vPadding + rh);
        ctx.lineTo(ctx.width, ctx.height - ctx.unit.vPadding - ctx.unit.hCenter + rh);
        ctx.closePath();
        ctx.stroke();

        for(let i = 0; i < ctx._pauseBoxString.length; i++) {
          ctx.drawBox(ctx._pauseBoxString[i][0], ctx._pauseBoxString[i][1],
            ctx._pauseColor, ctx.unit.staticHorizontalBox(ctx, 25), 0, rh);
        }
      }
    }else { //Pause screen dismiss animation
      this._whilePauseAnimate = true;
      this.drawAfterRegister["pause_screen"] = function(ctx) {
        let t1 = 500;
        let time = Date.now() - ctx._pauseAniTiming;
        let rh;
        if(time < t1) {
          rh = -ctx.height*pow(time/t1, 3);
        }else {
          delete ctx.drawAfterRegister["pause_screen"];
          ctx._whilePauseAnimate = false;
          ctx.tetris.restart();
          return;
        }
        //위쪽의 검은 덮개타일 그리기
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, ctx.height - ctx.unit.vPadding - ctx.unit.hCenter + rh);
        ctx.lineTo(ctx.unit.hCenter, ctx.height - ctx.unit.vPadding + rh);
        ctx.lineTo(ctx.width, ctx.height - ctx.unit.vPadding - ctx.unit.hCenter + rh);
        ctx.lineTo(ctx.width, 0);
        ctx.closePath();
        ctx.fill();

        //경계선 좌
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.moveTo(ctx.unit.hCenter, ctx.height - ctx.unit.vPadding + rh);
        ctx.lineTo(0, ctx.height - ctx.unit.vPadding - ctx.unit.hCenter + rh);
        ctx.closePath();
        ctx.stroke();

        //경계선 우
        ctx.beginPath();
        ctx.moveTo(ctx.unit.hCenter, ctx.height - ctx.unit.vPadding + rh);
        ctx.lineTo(ctx.width, ctx.height - ctx.unit.vPadding - ctx.unit.hCenter + rh);
        ctx.closePath();
        ctx.stroke();

        for(let i = 0; i < ctx._pauseBoxString.length; i++) {
          ctx.drawBox(ctx._pauseBoxString[i][0], ctx._pauseBoxString[i][1],
            ctx._pauseColor, ctx.unit.staticHorizontalBox(ctx, 25), 0, rh);
        }
      }
    }
  }

  ctx.drawGameover = function(visible) {

  }

  ctx.drawTouchButton = function(ctx) {
    for(let i in ctx._touchButtons) {
      ctx._touchButtons[i].draw(ctx);
    }
  }

  ctx.confirmReset = function() {
    let time = Date.now() - ctx._confirmReset;
    /*
     * 0 ~ 250ms: Popup window
     * 250 ~ 3250ms: Waiting
     * 3250 ~ 3500ms: Colse window
     */
    if(time < 3400) {
      this._confirmReset = 0;
      //this.tetris.stop();
      this.tetris.reset();
      this.tetris.start();
      delete this.drawAfterRegister["confirm_reset"];
    }else {
      this._confirmReset = Date.now();
      this.drawAfterRegister["confirm_reset"] = function(ctx) {
        let time = Date.now() - ctx._confirmReset;
        let t1 = 150, t2 = 3000, t3 = 150;
        if(time > t1+t2+t3) {
          delete ctx.drawAfterRegister["confirm_reset"];
        }else {

          if(time < t1) {
            let h1 = ctx.height/10 + 80*pow((t1-time)/t1, 4);
            let h2 = 160 - 160*pow((t1-time)/t1, 4);
            //반투명 박스
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.fillRect(0, h1, ctx.width, h2);

            //상자 위쪽 경계선
            ctx.strokeStyle = "#f00";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, h1);
            ctx.lineTo(ctx.width, h1);
            ctx.stroke();

            //상자 아래쪽 경계선
            ctx.beginPath();
            ctx.moveTo(0, h1 + h2);
            ctx.lineTo(ctx.width, h1 + h2);
            ctx.stroke();
          }else if(time < t1+t2) {
            let cTime = time - t1;
            //반투명 박스
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.fillRect(0, ctx.height/10, ctx.width, 160);

            //카운트 다운 숫자 와 안내 메시지
            ctx.fillStyle = "#fff";
            ctx.globalAlpha = 1 - pow(cTime%1000/1000, 3);
            ctx.font = "50px Iceland";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(3 - floor(cTime/1000),
              ctx.width/2, ctx.height/10 + 80);
            ctx.globalAlpha = 1;
            ctx.font = "italic 30px Iceland";
            ctx.fillText("Press again RESET Button", ctx.width/2 - 5, ctx.height/10 + 25);
            ctx.fillText("to Start New Game", ctx.width/2 - 5, ctx.height/10 + 135)

            //원형 프로그래스 바
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 5;
            ctx.lineCap = "butt";
            ctx.beginPath();
            ctx.arc(ctx.width/2, ctx.height/10 + 80, 30, -PI/2, -PI/2
            + PI*2*cTime/t2, true);
            ctx.stroke();

            //상자 위쪽 경계선
            ctx.strokeStyle = "#f00";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, ctx.height/10);
            ctx.lineTo(ctx.width, ctx.height/10);
            ctx.stroke();

            //상자 아래쪽 경계선
            ctx.beginPath();
            ctx.moveTo(0, ctx.height/10 + 160);
            ctx.lineTo(ctx.width, ctx.height/10 + 160);
            ctx.stroke();
          }else {
            let cTime = time - (t1+t2);
            let h1 = ctx.height/10 + 80 - 80*pow((t3-cTime)/t3, 4);
            let h2 = 160*pow((t3-cTime)/t3, 4);
            //반투명 박스
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.fillRect(0, h1, ctx.width, h2);

            //상자 위쪽 경계선
            ctx.strokeStyle = "#f00";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, h1);
            ctx.lineTo(ctx.width, h1);
            ctx.stroke();

            //상자 아래쪽 경계선
            ctx.beginPath();
            ctx.moveTo(0, h1 + h2);
            ctx.lineTo(ctx.width, h1 + h2);
            ctx.stroke();
          }
        }
      }
    }
  }

  ctx.twinkle = function() {return round(abs((Date.now()%4000) - 2000) / 2000 * 80) + 100}

  ctx.getTouchMode = function() {return this.touchMode}

  ctx.setTouchMode = function(mode) {this.touchMode = !!mode}

  ctx.buttonMeasure = function() {
    let unit = ctx.width > ctx.height ? ctx.height/100 : ctx.width/100;
    this._touchButtons = [
      new CanvasButton(this, //Left
        new Vector2(ctx.width - unit*40, ctx.height - unit*20 - ctx.bottomPadding),
        new Vector2(ctx.width - unit*25, ctx.height - unit*5 - ctx.bottomPadding),
        function(ctx) {ctx.tetris.moveLeft()}, function(ctx, cBtn, isClick) {
          ctx.fillStyle = isClick ? "#111" : "#333";
          ctx.beginPath();
          ctx.moveTo(cBtn.getVectorStart().getX() + cBtn.width/4, cBtn.getVectorStart().getY() + cBtn.height/2);
          ctx.lineTo(cBtn.getVectorEnd().getX() - cBtn.width/4, cBtn.getVectorStart().getY() + cBtn.height/5);
          ctx.lineTo(cBtn.getVectorEnd().getX() - cBtn.width/4, cBtn.getVectorEnd().getY() - cBtn.height/5);
          ctx.closePath();
          ctx.fill();
        }, true, 1, null, null),
      new CanvasButton(this,  //Right
        new Vector2(ctx.width - unit*20, ctx.height - unit*20 - ctx.bottomPadding),
        new Vector2(ctx.width - unit*5, ctx.height - unit*5 - ctx.bottomPadding),
        function(ctx) {ctx.tetris.moveRight()}, function(ctx, cBtn, isClick) {
          ctx.fillStyle = isClick ? "#111" : "#333";
          ctx.beginPath();
          ctx.moveTo(cBtn.getVectorEnd().getX() - cBtn.width/4, cBtn.getVectorEnd().getY() - cBtn.height/2);
          ctx.lineTo(cBtn.getVectorStart().getX() + cBtn.width/4, cBtn.getVectorEnd().getY() - cBtn.height/5);
          ctx.lineTo(cBtn.getVectorStart().getX() + cBtn.width/4, cBtn.getVectorStart().getY() + cBtn.height/5);
          ctx.closePath();
          ctx.fill();
        }, true, 1, null, null),
      new CanvasButton(this, //Rotate Left
        new Vector2(unit*5, ctx.height - unit*20 - ctx.bottomPadding),
        new Vector2(unit*20, ctx.height - unit*5 - ctx.bottomPadding),
        function(ctx) {ctx.tetris.rotateLeft()}, function(ctx, cBtn, isClick) {
          ctx.fillStyle = isClick ? "#111" : "#333";
          ctx.fillRect(cBtn.getVectorStart().getX() + cBtn.width*3/10, cBtn.getVectorEnd().getY() - cBtn.height*3/10,
            cBtn.width*5/10, cBtn.height/10);
          ctx.fillRect(cBtn.getVectorEnd().getX() - cBtn.width*3/10, cBtn.getVectorStart().getY() + cBtn.height*3/10,
            cBtn.width/10, cBtn.height*5/10);
          ctx.fillRect(cBtn.getVectorStart().getX() + cBtn.width*3/10, cBtn.getVectorStart().getY() + cBtn.height*3/10,
            cBtn.width*5/10, cBtn.height/10);
          ctx.beginPath();
          ctx.moveTo(cBtn.getVectorStart().getX() + cBtn.width*4/10, cBtn.getVectorStart().getY() + cBtn.height*2/10);
          ctx.lineTo(cBtn.getVectorStart().getX() + cBtn.width*4/10, cBtn.getVectorStart().getY() + cBtn.height*5/10);
          ctx.lineTo(cBtn.getVectorStart().getX() + cBtn.width*2/10, cBtn.getVectorStart().getY() + cBtn.height*3.5/10);
          ctx.closePath();
          ctx.fill();
        }, true, 1, null, null),
      new CanvasButton(this, //Rotate Right
        new Vector2(unit*25, ctx.height - unit*20 - ctx.bottomPadding),
        new Vector2(unit*40, ctx.height - unit*5 - ctx.bottomPadding),
        function(ctx) {ctx.tetris.rotateRight()}, function(ctx, cBtn, isClick) {
          ctx.fillStyle = isClick ? "#111" : "#333";
          ctx.fillRect(cBtn.getVectorStart().getX() + cBtn.width*2/10, cBtn.getVectorEnd().getY() - cBtn.height*3/10,
            cBtn.width*5/10, cBtn.height/10);
          ctx.fillRect(cBtn.getVectorStart().getX() + cBtn.width*2/10, cBtn.getVectorStart().getY() + cBtn.height*3/10,
            cBtn.width/10, cBtn.height*5/10);
          ctx.fillRect(cBtn.getVectorStart().getX() + cBtn.width*2/10, cBtn.getVectorStart().getY() + cBtn.height*3/10,
            cBtn.width*5/10, cBtn.height/10);
          ctx.beginPath();
          ctx.moveTo(cBtn.getVectorEnd().getX() - cBtn.width*4/10, cBtn.getVectorStart().getY() + cBtn.height*2/10);
          ctx.lineTo(cBtn.getVectorEnd().getX() - cBtn.width*4/10, cBtn.getVectorStart().getY() + cBtn.height*5/10);
          ctx.lineTo(cBtn.getVectorEnd().getX() - cBtn.width*2/10, cBtn.getVectorStart().getY() + cBtn.height*3.5/10);
          ctx.closePath();
          ctx.fill();
        }, true, 1, null, null),
      new CanvasButton(this, //Drop
        new Vector2(ctx.width - unit*20, ctx.height - unit*40 - ctx.bottomPadding),
        new Vector2(ctx.width - unit*5, ctx.height - unit*25 - ctx.bottomPadding),
        function(ctx) {ctx.tetris.moveDown()}, function(ctx, cBtn, isClick) {
          ctx.fillStyle = isClick ? "#111" : "#333";
          ctx.beginPath();
          ctx.moveTo(cBtn.getVectorStart().getX() + cBtn.width/5, cBtn.getVectorStart().getY() + cBtn.height/4);
          ctx.lineTo(cBtn.getVectorEnd().getX() - cBtn.width/5, cBtn.getVectorStart().getY() + cBtn.height/4);
          ctx.lineTo(cBtn.getVectorStart().getX() + cBtn.width/2, cBtn.getVectorEnd().getY() - cBtn.height/4);
          ctx.closePath();
          ctx.fill();
        }, true, 1, null, null),
      new CanvasButton(this, //Instance drop
        new Vector2(unit*5, ctx.height - unit*40 - ctx.bottomPadding),
        new Vector2(unit*20, ctx.height - unit*25 - ctx.bottomPadding),
        function(ctx) {ctx.tetris.instantDrop()}, function(ctx, cBtn, isClick) {
          ctx.fillStyle = isClick ? "#111" : "#333";
          ctx.beginPath();
          ctx.moveTo(cBtn.getVectorStart().getX() + cBtn.width/5, cBtn.getVectorStart().getY() + cBtn.height/5);
          ctx.lineTo(cBtn.getVectorEnd().getX() - cBtn.width/5, cBtn.getVectorStart().getY() + cBtn.height/5);
          ctx.lineTo(cBtn.getVectorStart().getX() + cBtn.width/2, cBtn.getVectorEnd().getY() - cBtn.height*2/5);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(cBtn.getVectorStart().getX() + cBtn.width/5, cBtn.getVectorStart().getY() + cBtn.height*2/5);
          ctx.lineTo(cBtn.getVectorEnd().getX() - cBtn.width/5, cBtn.getVectorStart().getY() + cBtn.height*2/5);
          ctx.lineTo(cBtn.getVectorStart().getX() + cBtn.width/2, cBtn.getVectorEnd().getY() - cBtn.height/5);
          ctx.closePath();
          ctx.fill();
        }, false, 1, null, null),
      new CanvasButton(this, //Pause
        new Vector2(unit*5, unit*5),
        new Vector2(unit*20, unit*20),
        function(ctx) {ctx.drawPause(!ctx.tetris.isPause())}, function(ctx, cBtn, isClick) {
          ctx.fillStyle = isClick ? "#111" : "#333";
          ctx.fillRect(cBtn.getVectorStart().getX() + cBtn.width*2/10, cBtn.getVectorStart().getY() + cBtn.height*2/10,
            cBtn.width*2/10, cBtn.height*6/10);
          ctx.fillRect(cBtn.getVectorStart().getX() + cBtn.width*6/10, cBtn.getVectorStart().getY() + cBtn.height*2/10,
            cBtn.width*2/10, cBtn.height*6/10);
        }, false, 1, null, null),
      new CanvasButton(this, //Reset
        new Vector2(unit*25, unit*5),
        new Vector2(unit*40, unit*20),
        function(ctx) {ctx.confirmReset()}, function(ctx, cBtn, isClick) {
          ctx.fillStyle = isClick ? "#111" : "#333";
          ctx.font = round(cBtn.width) + "px Iceland";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("R", cBtn.getVectorStart().getX() + cBtn.width/2, cBtn.getVectorStart().getY() + cBtn.height/2);
        }, false, 1, null, null)
    ];
  }

  ctx.varReset = function() {
    this.touchMode = false;
    this._whilePauseAnimate = false;
    this._pauseAniTiming = 0;
    this._pauseBoxString = [
      [3, 7], [4, 7], [5, 7], [3, 6], [5, 6], [3, 5], [4, 5], [5, 5], [3, 4], [3, 3], //P
      [7, 7], [8, 7], [9, 7], [7, 6], [9, 6], [7, 5], [8, 5], [9, 5], [7, 4], [9, 4], [7, 3], [9, 3], //A
      [11, 7], [13, 7], [11, 6], [13, 6], [11, 5], [13, 5], [11, 4], [13, 4], [11, 3], [12, 3], [13, 3], //U
      [15, 7], [16, 7], [17, 7], [15, 6], [15, 5], [16, 5], [17, 5], [17, 4], [15, 3], [16, 3], [17, 3], //S
      [19, 7], [20, 7], [21, 7], [19, 6], [19, 5], [20, 5], [21, 5], [19, 4], [19, 3], [20, 3], [21, 3]  //E
    ];
    this._pauseColor = "#ffffff";
    this._confirmReset = 0;
    this._moreColor = [];
    this._onCollisionButtonIndexes = [];
    this.bottomPadding = 20;
    this.drawBeforeRegister = [];
    this.drawAfterRegister = [];
    this.drawUiRegister = [];
  }

  ctx.tick = function() {
    if(this.touchMode) {
      let indexes = [];
      for(let i in this.touches) {
        for(let j in this._touchButtons) {
          if(this._touchButtons[j].inCollision(new Vector2(this.touches[i].x, this.touches[i].y)))
            indexes.push(j);
        }
      }

      for(let i in this._onCollisionButtonIndexes) {
        if(indexes.indexOf(this._onCollisionButtonIndexes[i]) === -1) {
          this._touchButtons[this._onCollisionButtonIndexes[i]].clickEnd();
          this._onCollisionButtonIndexes.splice(i, 1);
        }
      }

      for(let i in this._touchButtons) {
        this._touchButtons[i].tick();
      }
    }
  }

  //Event
  ctx.setup = function() { //Setup default values
    if(ctxInterval)
      clearInterval(ctxInterval);
    if(tetrisInterval)
      clearInterval(tetrisInterval);
    this.varReset();
    this.setTouchMode(document.getElementById("setting_touchMode").checked);
    this.tetris = new Tetris(); //Magic start here
    this.tetris.start(); //TODO: remove this
    setInterval(function() {ctx.tetris.tick()}, 100);
    this.drawBeforeRegister["tetris"] = function(ctx) {ctx.tetris.sketchBeforeDraw(ctx)};
    this.drawAfterRegister["tetris"] = function(ctx) {ctx.tetris.sketchAfterDraw(ctx)};
    if(this.getTouchMode()) {
      this.buttonMeasure();
      this.drawUiRegister["button"] = function(ctx) {ctx.drawTouchButton(ctx)}
    }else {
      delete this.drawUiRegister["button"];
    }
    setInterval(function() {ctx.tick()}, 30);
  }

  ctx.resize = function() { //화면사이즈 바뀔때마다 단위 갱신
    this.unit = {
      screenOrientation: this.width > this.height*9/10, //좌우로 길때 true
      //width:100%,height:90%의 절반의 길이의 정사각형의 대각선길이 맵길이 등분
      box: this.width > this.height*9/10
        ? this.height*9/10/2*sqrt(2)/this.tetris.getField().getWidth()
        : this.width/2*sqrt(2)/this.tetris.getField().getWidth(),
      //위의 기울어진 맵길이 등분된 상자내부의 대각선 길이의 절반
      horizontalBox: this.width > this.height*9/10
        ? this.height*9/10/2*pow(sqrt(2), 2)/this.tetris.getField().getWidth()/2
        : this.width/2*pow(sqrt(2), 2)/this.tetris.getField().getWidth()/2,
      //특수 목적용 박스사이즈
      staticBox: function(ctx, count) {return ctx.width > ctx.height*9/10
        ? ctx.height*9/10/2*sqrt(2)/count : ctx.width/2*sqrt(2)/count},
      staticHorizontalBox: function(ctx, count) {return ctx.width > ctx.height*9/10
        ? ctx.height*9/10/2*pow(sqrt(2), 2)/count/2
        : ctx.width/2*pow(sqrt(2), 2)/count/2},
      //화면 중앙
      hCenter: this.width/2,
      //상하 패딩
      vPadding: this.width > this.height*9/10 ? this.height/20
        : (this.height-this.width) / 2
    }
    this.buttonMeasure();
    console.log("Resized in " + new Date().toTimeString(), this.unit)
  }

  ctx.draw = function() {
    for(let i in this.drawBeforeRegister) {
      if(typeof this.drawBeforeRegister[i] === "function")
        this.drawBeforeRegister[i](this);
    }

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

    for(let i in this.drawAfterRegister) {
      if(typeof this.drawAfterRegister[i] === "function")
        this.drawAfterRegister[i](this);
    }

    for(let i in this.drawUiRegister) {
      if(typeof this.drawUiRegister[i] === "function")
        this.drawUiRegister[i](this);
    }
  }

  ctx.keydown = function() {
    switch(true) {
      case this.keys.LEFT:
        this.tetris.moveLeft();
        this.keys.LEFT = false;
        break;
      case this.keys.UP:
        this.tetris.rotateRight();
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
      case this.keys.Z:
        this.tetris.rotateLeft();
        this.keys.Z = false;
        break;
      case this.keys.X:
        this.tetris.attachWall();
        this.keys.X = false;
        break;
      case this.keys.C:
        this.tetris.holdPiece();
        this.keys.C = false;
        break;
      case this.keys.P:
        this.drawPause(!this.tetris.isPause());
        this.keys.P = false;
        break;
      case this.keys.R:
        this.confirmReset();
        this.keys.R = false;
        break;
    }
  }

  ctx.touchstart = function() {
    let indexes = [];
    for(let i in this.touches) {
      for(let j in this._touchButtons) {
        if(this._touchButtons[j].inCollision(new Vector2(this.touches[i].x, this.touches[i].y)))
          indexes.push(j);
      }
    }

    for(let i in indexes) {
      if(this._onCollisionButtonIndexes.indexOf(indexes[i]) === -1) {
        this._onCollisionButtonIndexes.push(indexes[i]);
        this._touchButtons[indexes[i]].clickStart();
      }
    }
  }

/* Reason: Move to ctx.tick()
  ctx.touchmove = function() {
    let indexes = [];
    for(let i in this.touches) {
      for(let j in this._touchButtons) {
        if(this._touchButtons[j].inCollision(new Vector2(this.touches[i].x, this.touches[i].y)))
          indexes.push(j);
      }
    }

    for(let i in this._onCollisionButtonIndexes) {
      if(indexes.indexOf(this._onCollisionButtonIndexes[i]) === -1) {
        this._touchButtons[this._onCollisionButtonIndexes[i]].clickEnd();
        this._onCollisionButtonIndexes.splice(i, 1);
      }
    }
  }
  */

  //Only Desktop Code (Mobile touchEnder is work on ctx.tick())
  ctx.touchend = function(ender) {
    for(let i in this._touchButtons) {
      if(this._touchButtons[i].inCollision(new Vector2(ender.x, ender.y))) {
        this._onCollisionButtonIndexes.splice(this._onCollisionButtonIndexes.indexOf(i), 1);
        this._touchButtons[i].clickEnd();
      }
    }
  }

}

console.log("Done("+timer.stop(3)+"ms)");

window.addEventListener("blur", function(event) {
  if(ctx && !ctx.tetris.isPause()) ctx.drawPause(true);
}, false);
