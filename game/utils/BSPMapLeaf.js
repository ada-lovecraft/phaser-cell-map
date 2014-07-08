'use strict';
var BSPMapLeaf = function(x, y, width, height, minSize) {
  this.minLeafSize = minSize || 150;
  Phaser.Rectangle.call(this, x, y, width, height);
  
  this.leftChild = null; // Leaf
  this.rightChild = null; // Leaf
  this.room = null;
  this.doors = [];
  this.name = BSPMapLeaf.CurrentLeaf++;
  this.rnd = new Phaser.RandomDataGenerator([(Date.now() * Math.random()).toString()]); 
  this.connections = {
    top: [],
    right: [],
    bottom: [],
    left: []
  };
};

BSPMapLeaf.prototype = Object.create(Phaser.Rectangle.prototype);
BSPMapLeaf.prototype.constructor = BSPMapLeaf;

BSPMapLeaf.prototype.split = function() {

  // begin splitting the leaf into two children
  if(!!this.leftChild || !!this.rightChild) {
    return false; // we've already split. abort.
  }

  // determine direction of split
  // if the width is >25% larger than the height we split vertically
  // if the height is >25% larger than the width, we split horizontally
  // otherwise, split randomly
  var splitH = Phaser.Math.chanceRoll(50);
  if( this.width > this.height && this.height / this.width >= 0.5) {
    splitH = false;
  } else if(this.height > this.width && this.width / this.height >= 0.5) {
    splitH = true;
  }

  var max = (splitH ? this.height : this.width) - this.minLeafSize;

  if(max <= this.minLeafSize) {
    return false; // the area is too small to split any more
  }

  var split = this.rnd.integerInRange(this.minLeafSize, max);

  // create our left and right children based on direction
  if(splitH) {
    this.leftChild = new BSPMapLeaf(this.x, this.y, this.width, split, this.minLeafSize);
    this.rightChild = new BSPMapLeaf(this.x, this.y + split, this.width, this.height - split, this.minLeafSize);
  } else {
    this.leftChild = new BSPMapLeaf(this.x, this.y, split, this.height, this.minLeafSize);
    this.rightChild = new BSPMapLeaf(this.x + split, this.y, this.width - split, this.height, this.minLeafSize);
  }
  return true;
};


BSPMapLeaf.prototype.createRooms = function() {
  if(!!this.leftChild || !!this.rightChild) {
    // this leaf has been split, so go into the children leafs
    if(!!this.leftChild) {
      this.leftChild.createRooms();
    }
    if(!!this.rightChild) {
      this.rightChild.createRooms();
    } 

  } else {
    // this leaf is read to make a room
    var roomSize = new Phaser.Point();
    roomSize.setTo(this.width, this.height);
    // place the room within the leaf, but don't put it right against the side of the leaf
    // as that would merge rooms together
    this.room = new Phaser.Rectangle(this.x, this.y, roomSize.x, roomSize.y);
  }
};


BSPMapLeaf.prototype.getRoom = function() {
  if(!!this.room) {
    return this.room;
  } else {
    var lRoom, rRoom;
    if(!!this.leftChild) {
      lRoom = this.leftChild.getRoom();
    }
    if(!!this.rightChild) {
      rRoom = this.rightChild.getRoom();
    }
    if(!lRoom && !rRoom) {
      return null;
    } else if(!rRoom) {
      return lRoom;
    } else if(!lRoom) {
      return rRoom;
    } else if(Phaser.Math.chanceRoll(50)) {
      return lRoom;
    } else {
      return rRoom;
    }
  }
};


BSPMapLeaf.prototype.connectsTo = function(leafName) {
  return this._connections.indexOf(leafName) > -1;
};

BSPMapLeaf.prototype.addConnection = function(leafName) {
  this._connections.push(leafName);
};

/*
BSPMapLeaf.prototype.createHall = function(left, right) {
  this.halls = [];

  var l = left.getRoom();
  var r = right.getRoom();
  var lx, rx, ly, ry;
  if(left.centerX < right.centerX) {
    lx = l.right;
    rx = r.left;
  } else if (left.centerX > right.centerX){
    lx = l.left;
    rx = r.right;
  } else {
    lx = l.centerX;
    rx = r.centerX;
  }

  if(left.centerY < right.centerY) {
    ly = l.bottom;
    ry = r.top;
  } else if(left.centerY > right.centerY) {
    ly = l.top;
    ry = r.bottom;
  } else {
    ly = l.centerY;
    ry = r.centerY;
  }
  var point1 = new Phaser.Point(lx, ly);
  var point2 = new Phaser.Point(rx, ry);
                                

  left.doors.push(point1);
  right.doors.push(point2);
  this.point1 = point1;
  this.point2 = point2;
  var w = point2.x - point1.x;
  var h = point2.y - point1.y;

  if(ly === l.centerY) {
    console.log('there')
    // start out by moving horizontally
    //  --
    //    |
    //    --
    
    if (h < 0) {
      
        this.halls.push(new Phaser.Rectangle(point1.x, point1.y, Math.abs(w/2), 1));
        this.halls.push(new Phaser.Rectangle(point1.x + Math.abs(w/2), point2.y, 1, Math.abs(h)));
        this.halls.push(new Phaser.Rectangle(point1.x + Math.abs(w/2), point2.y, Math.abs(w/2),1));
    } 
    else if (h > 0) {
      
        this.halls.push(new Phaser.Rectangle(point1.x, point1.y, Math.abs(w/2), 1));
        this.halls.push(new Phaser.Rectangle(point1.x + Math.abs(w/2), point1.y, 1, Math.abs(h)));
        this.halls.push(new Phaser.Rectangle(point1.x + Math.abs(w/2), point2.y, Math.abs(w/2),1));
      
    } else {
        this.halls.push(new Phaser.Rectangle(point1.x, point2.y, Math.abs(w), 1));
    }
  } else {
     // start out by moving vertically
    //  |
    //   --
    //     |
    if (h < 0) {
        this.halls.push(new Phaser.Rectangle(point1.x, point1.y, w/2, 1));
        this.halls.push(new Phaser.Rectangle(point1.x + w/2, point1.y, 1, h));
        this.halls.push(new Phaser.Rectangle(point1.x + w/2, point1.y + h, w/2,1));
    } 
    else if (h > 0) {
        this.halls.push(new Phaser.Rectangle(point1.x, point1.y, 1, h/2));
        this.halls.push(new Phaser.Rectangle(point1.x, point1.y + h/2, w, 1));
        this.halls.push(new Phaser.Rectangle(point1.x + w, point1.y + h/2, 1, h/2));      
    } else {
      
      this.halls.push(new Phaser.Rectangle(point1.x, point2.y, Math.abs(w), 1));
        
    }
  }
};
*/


BSPMapLeaf.prototype.createDoors = function() {
};
BSPMapLeaf.CurrentLeaf = 0;
module.exports = BSPMapLeaf;