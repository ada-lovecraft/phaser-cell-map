'use strict';
var BSPMapLeaf = require('./BSPMapLeaf');
var BSPMapGenerator = function(size, maxFactor, minFactor) {
  this.size = size;
  this.maxLeafSize = size/maxFactor;
  this.minLeafSize = size/minFactor;
  console.log('minLeafSize:', this.minLeafSize);
  console.log('maxLeafSize:', this.maxLeafSize);
  this._leafs = [];
  this.l = null; // helper leaf
  this.leafCounter = 0;
  this.root = new BSPMapLeaf(0,0, this.size, this.size, this.minLeafSize);
  this._leafs.push(this.root);
  this.halls = [];


  var didSplit = true;
  while(didSplit) {
    didSplit = false;
    this._leafs.forEach(function(l) {
      if(!l.leftChild && !l.rightChild) {
        // if this leaf is too big 
        if(l.width > this.maxLeafSize || l.height > this.maxLeafSize) {
          if(l.split()) { // split the leaf
            // if we did split, push the child leafs to the array
            this._leafs.push(l.leftChild);
            this._leafs.push(l.rightChild);
            didSplit = true;
          }
        }
      }
    }, this);
  }
  this.root.createRooms();

  this.createDoors();
  console.log('done creating');
};

BSPMapGenerator.prototype.createTileMap = function() {
  console.log('making tile map');
  var map = [];
  var c = '.';
  var leaf;
  var rowCount;
  var room;
  for(var i = 0; i < this._leafs.length; i++ ) { 
    leaf = this._leafs[i];
    room = leaf.getRoom();
    rowCount = 0;
    for(var y = room.top; y < room.bottom; y++) {
      for(var x = room.left; x < room.right; x++) {
        if(y === room.top || y === room.bottom - 1 ||
           x === room.left || x === room.right - 1) {
          c = '#';
        } else {
          c = '.';
        }
        map[y * rowCount + x] = c;
      }
      rowCount++;
    }
  }
  /*
  for(var d = 0; d < leaf.doors.length; d++ ) {
    var door = leaf.doors[d];
    map[Math.floor(door.y / this.size) + door.x] = 'D';
  }
  */
 
  for (i = this.size; i < this.size * this.size; i += this.size) {
    console.log('splicing at:', i);
    map.splice(i, 0, '\n');
  }

  console.log('map:\n', map.join(''));
};

BSPMapGenerator.prototype.createDoors = function() {
  var doorCounter = 0;
  this._leafs.forEach(function(leaf) {
    if(leaf.room) {
      var room = leaf.room;
      if(room) {
        this._leafs.forEach(function(otherLeaf) {
          if(otherLeaf.room) {
            // check top
            if(leaf.connections.top.indexOf(otherLeaf) === -1 && otherLeaf.room.bottom === leaf.room.top) {
              leaf.connections.top.push(otherLeaf);
              otherLeaf.connections.bottom.push(leaf);
            }
            //check right
            else if(leaf.connections.right.indexOf(otherLeaf) === -1 && otherLeaf.room.left === leaf.room.right) {
              leaf.connections.right.push(otherLeaf);
              otherLeaf.connections.left.push(leaf);
            }
            // check bottom
            else if(leaf.connections.bottom.indexOf(otherLeaf) === -1 && otherLeaf.room.top === leaf.room.bottom) {
              leaf.connections.bottom.push(otherLeaf);
              otherLeaf.connections.top.push(leaf); 
            }
            // check left
            else if(leaf.connections.left.indexOf(otherLeaf) === -1 && otherLeaf.room.right === leaf.room.left) {
              leaf.connections.left.push(otherLeaf);
              otherLeaf.connections.right.push(leaf); 
            }
          }
        }, this);
      }
    }
  }, this);
  
  this._leafs.forEach(function(leaf) {
    var x, y,myDoor ={}, otherDoor={};
    var topLeaves = leaf.connections.top, 
        bottomLeaves = leaf.connections.bottom, 
        rightLeaves = leaf.connections.right;
    
    topLeaves.forEach(function(t) {
      x = null;
      if(leaf.centerX === t.centerX) {
        x = leaf.centerX;
      } 
      else if(leaf.left > t.left && leaf.right < t.right) {
        x = leaf.centerX;
      }
      else if (leaf.right === t.right) {
        if(leaf.left < t.left) {
          x = t.centerX;
        } if(leaf.left > t.left) {
          x = leaf.centerX;
        }
      } else if(leaf.left === t.left) {
        if(leaf.right < t.right) {
          x = leaf.centerX;
        } else  {
          x = t.centerX;
        }
      } else if(leaf.left > t.left && leaf.right > t.right) {
        x = leaf.left + (t.right - leaf.left) /2;
      }
      
       if(x) {
        myDoor = { name: t.name, x: x, y: leaf.top };
        otherDoor = { name: leaf.name, x: x, y: t.bottom };
        if(leaf.doors.indexOf(myDoor) === -1) {
          leaf.doors.push(myDoor);
          doorCounter++;
        } 
        if(t.doors.indexOf(otherDoor) === -1) {
          t.doors.push(otherDoor);  
          doorCounter++;
        }
      }
    }, this);

    rightLeaves.forEach(function(r) {
      y = null;
      if(leaf.centerY === r.centerY) {
        y = leaf.centerY;
      } 
      else if(leaf.top < r.top && leaf.bottom > r.bottom) {
        y = leaf.centerY;
      }
      else if (leaf.top === r.top) {
        if(leaf.bottom > r.bottom) {
          y = r.centerY;
        } if(leaf.bottom < r.bottom) {
          y = leaf.centerY;
        }
      } else if(leaf.bottom === r.bottom) {
        if(leaf.top > r.top) {
          y = leaf.centerY;
        } else  {
          y = r.centerY;
        }
      } else if(leaf.bottom < r.bottom && leaf.top < r.top) {
        y = leaf.bottom + (r.top - leaf.bottom) /2;
      }
      
       if(y) {
        myDoor = { name: r.name, x: leaf.right, y: y };
        otherDoor = { name: leaf.name, x: r.left, y: y };
        if(leaf.doors.indexOf(myDoor) === -1) {
          leaf.doors.push(myDoor);
          doorCounter++;
        } 
        if(r.doors.indexOf(otherDoor) === -1) {
          r.doors.push(otherDoor);  
          doorCounter++;
        }
      }
    }, this);
  }, this);
  console.log('doors:', doorCounter);
};

module.exports = BSPMapGenerator;