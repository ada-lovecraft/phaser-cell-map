'use strict';
var CellTypes = require('../utils/CellTypes');
var DungeonLevel = function(map, layer, tilesetName, heroes) {
  this.walkableIndex = 0;
  this._tilemap = map;
  this._layerIndex = layer.index;
  this._layer = layer;
  this._tilesetIndex = this._tilemap.getTilesetIndex(tilesetName);
  this._tiles = this.getAllTiles();
  this._open;
  this._closed;
  this._visited; 
  this._useDiagonal = false;
  this._findClosest = false;
  this._walkablePropName = 'walkable';
  this._distanceFunction = DungeonLevel.DISTANCE_EUCLIDIAN;
  this._lastPath = null;
  this._debug = true;
  this.heroes  = heroes;
  this.interesting = {
    entry: {
      tiles: this.findTilesByCellType(CellTypes.ENTRY),
      cellType: CellTypes.ENTRY
    },
    exit: {
      tiles: this.findTilesByCellType(CellTypes.EXIT),
      cellType: CellTypes.EXIT
    },
    treasure: {
      tiles: this.findTilesByCellType(CellTypes.TREASURE),
      cellType: CellTypes.TREASURE
    }
  };
  this.events = {
    onExit: new Phaser.Signal()
  };
  this.updateMap();
  console.log('interseting:', this.interesting);
  this.heroes.setAll('mapPosition', this.interesting.entry.tiles[0]);
  this.heroes.children.forEach(function(hero) {
    hero.events.onTreasure.add(this.clearTile, this);
    hero.events.onExit.add(this.exitLevel, this);
    hero.canAdvance = false;
  }, this);

  return this;
  
};

DungeonLevel.DISTANCE_MANHATTAN = 'distManhattan';
DungeonLevel.DISTANCE_EUCLIDIAN = 'distEuclidian';
DungeonLevel.COST_ORTHOGONAL = 1;
DungeonLevel.COST_DIAGONAL = DungeonLevel.COST_ORTHOGONAL*Math.sqrt(2);


module.exports = DungeonLevel;


DungeonLevel.prototype.tick = function() {
  var targetObj = {};
  var targetTypes;
  
  if(this.heroes) {
    this.heroes.forEach(function(hero) {
      var paths = [];
      targetTypes = hero.targetWeights;
      targetTypes.forEach(function(type) {
        var matches = _.filter(this.interesting, {cellType: type.cellType});
        matches.forEach(function(match) {
          match.tiles.forEach(function(tile) {
            var path = this.findPath(hero.mapPosition, {x: tile.x, y: tile.y});
            if(path.nodes.length) {
              var pathObj = {path: path, order: path.nodes.length / type.weight, node: path.nodes[path.nodes.length-1]  }
              paths.push(pathObj);
            }
          }, this);
        }, this);
      }, this);
      paths.sort(function(a, b) {
        return a.order - b.order;
      });
      if(paths.length) {
        hero.mapPosition = paths[0].node;
      }
    }, this);
  }
};


DungeonLevel.prototype.findTilesByCellType = function(type) {
  var matching = [];
  this._tiles.forEach(function(tile) {
    if(_.isEqual(tile.properties.cellType,type)) {
      matching.push(tile);
    }
  });
  return matching;
};

DungeonLevel.prototype.findInterestingTilesByCellType = function(cellType) {
  var matching = [];
  _.forOwn(this.interesting, function(item) {
    if(_.isEqual(item.cellType, cellType)) {
      matching = item.tiles;
    }
  });
  return matching;
};




DungeonLevel.prototype.getAllTiles = function() {
  var tiles = [];;
  for(var x = 0; x < this._tilemap.width; x++) {
    for(var y = 0; y < this._tilemap.height; y++) {
      tiles.push(this._tilemap.getTile(x,y, this._layerIndex));
    }
  }
  return tiles;
};

DungeonLevel.prototype.clearTile = function(tile) {
  this._tilemap.putTile(CellTypes.FLOOR.tileIndex, tile.x, tile.y, this._tilemap.currentLayer);
  var interesting = _.find(this.interesting, {cellType: tile.properties.cellType});
  _.remove(interesting.tiles, tile);
  if(this.interesting.treasure.tiles.length === 0) {
    this.heroes.setAll('canAdvance', true);
  }

};

DungeonLevel.prototype.exitLevel = function() {
  console.log('exiting level...');
  this.events.onExit.dispatch(this.heroes);
};



DungeonLevel.prototype.updateMap = function()
{
    var tile;
    var walkable;

    //for each tile, add a default AStarNode with x, y and walkable properties according to the tilemap/tileset datas
    for(var y=0; y < this._tilemap.height; y++)
    {
        for(var x=0; x < this._tilemap.width; x++)
        {
            tile = this._tilemap.layers[this._layerIndex].data[y][x];
            walkable = tile.properties.cellType.walkable;
            tile.properties.astarNode = new DungeonLevel.AStarNode(x, y, walkable);
        }
    }

};


/**
 * Find a path between to tiles coordinates
 * @method DungeonLevel#findPath
 * @public
 * @param {Phaser.Point} startPoint - The start point x, y in tiles coordinates to search a path.
 * @param {Phaser.Point} goalPoint - The goal point x, y in tiles coordinates that you trying to reach.
 * @return {DungeonLevel.AStarPath} The DungeonLevel.AStarPath that results
 */
DungeonLevel.prototype.findPath = function(startPoint, goalPoint)
{
    var path = new DungeonLevel.AStarPath();

    var start = this._tilemap.layers[this._layerIndex].data[startPoint.y][startPoint.x].properties.astarNode; //:AStarNode;
    var goal = this._tilemap.layers[this._layerIndex].data[goalPoint.y][goalPoint.x].properties.astarNode

    path.start = start;
    path.goal = goal;

    this._open = [];
    this._closed = [];
    this._visited = [];
   
    this._open.push(start);
    
    start.g = 0;
    start.h = this[this._distanceFunction](start, goal);
    start.f = start.h;
    start.parent = null;                    
   
    //Loop until there are no more nodes to search
    while(this._open.length > 0) 
    {
        //Find lowest f in this._open
        var f = Infinity;
        var x;
        for (var i=0; i<this._open.length; i++) 
        {
            if (this._open[i].f < f) 
            {
                x = this._open[i];
                f = x.f;
            }
        }
       
        //Solution found, return solution
        if (x == goal) 
        {
            path.nodes = this.reconstructPath(goal);
            this._lastPath = path;
            if(this._debug === true) path.visited = this._visited;
            return path;
        }    
       
        //Close current node
        this._open.splice(this._open.indexOf(x), 1);
        this._closed.push(x);
       
        //Then get its neighbors       
        var n = this.neighbors(x);

        for(var yIndex=0; yIndex < n.length; yIndex++) 
        {

            var y = n[yIndex];
               
            if (-1 != this._closed.indexOf(y))
                continue;
           
            var g = x.g + y.travelCost;
            var better = false;
           
            //Add the node for being considered next loop.
            if (-1 == this._open.indexOf(y)) 
            {
                    this._open.push(y);
                    better = true;
                    if(this._debug === true) this.visit(y);
            } 
            else if (g < y.g) 
            {
                    better = true;
            }

            if (better) {
                    y.parent = x;
                    y.g = g;
                    y.h = this[this._distanceFunction](y, goal);
                    y.f = y.g + y.h;
            }
               
        }
           
    }

    //If no solution found, does A* try to return the closest result?
    if(this._findClosest === true)
    {
        var min = Infinity;
        var closestGoal, node, dist;
        for(var i=0, ii=this._closed.length; i<ii; i++) 
        {
            node = this._closed[i];

            var dist = this[this._distanceFunction](goal, node);
            if (dist < min) 
            {
                min = dist;
                closestGoal = node;
            }
        }

        //Reconstruct a path a path from the closestGoal
        path.nodes = this.reconstructPath(closestGoal);
        if(this._debug === true) path.visited = this._visited;
    }

    this._lastPath = path;

    return path;                              
};


/**
 * Reconstruct the result path backwards from the goal point, crawling its parents. Internal method.
 * @method DungeonLevel-reconstructPath
 * @private
 * @param {DungeonLevel.AStarNode} n - The astar node from wich you want to rebuild the path.
 * @return {array} An array of DungeonLevel.AStarNode
 */ 
DungeonLevel.prototype.reconstructPath = function(n) 
{
    var solution = [];
    var nn = n;
    while(nn.parent) {
            solution.push({x: nn.x, y: nn.y});
            nn = nn.parent;
    }
    return solution;
};

 
/**
 * Add a node into visited if it is not already in. Debug only.
 * @method DungeonLevel-visit
 * @private
 * @param {DungeonLevel.AStarNode} node - The astar node you want to register as visited
 * @return {void}
 */ 
DungeonLevel.prototype.visit = function(node)
{
    for(var i in this._visited)
    {
        if (this._visited[i] == node) return;
    }

    this._visited.push(node);
};
   

/**
 * Add a node into visited if it is not already in. Debug only.
 * @method DungeonLevel-neighbors
 * @private
 * @param {DungeonLevel.AStarNode} n - The astar node you want to register as visited
 * @return {void}
 */
DungeonLevel.prototype.neighbors = function(node)
{
    var x = node.x;
    var y = node.y;
    var n = null;
    var neighbors = [];
   
    var map = this._tilemap.layers[this._layerIndex].data;

    //West
    if (x > 0) {
           
        n = map[y][x-1].properties.astarNode;
        if (n.walkable) {
            n.travelCost = DungeonLevel.COST_ORTHOGONAL;
            neighbors.push(n);
        }
    }
    //East
    if (x < this._tilemap.width-1) {
        n = map[y][x+1].properties.astarNode;
        if (n.walkable) {
            n.travelCost = DungeonLevel.COST_ORTHOGONAL;
            neighbors.push(n);
        }
    }
    //North
    if (y > 0) {
        n = map[y-1][x].properties.astarNode;
        if (n.walkable) {
            n.travelCost = DungeonLevel.COST_ORTHOGONAL;
            neighbors.push(n);
        }
    }
    //South
    if (y < this._tilemap.height-1) {
        n = map[y+1][x].properties.astarNode;
        if (n.walkable) {
            n.travelCost = DungeonLevel.COST_ORTHOGONAL;
            neighbors.push(n);
        }
    }
   
    //If diagonals aren't used do not search for other neighbors and return orthogonal search result
    if(this._useDiagonal === false)
        return neighbors;
   
    //NorthWest
    if (x > 0 && y > 0) {
        n = map[y-1][x-1].properties.astarNode;
        if (n.walkable
            && map[y][x-1].properties.astarNode.walkable
            && map[y-1][x].properties.astarNode.walkable
        ) {                                            
            n.travelCost = DungeonLevel.COST_DIAGONAL;
            neighbors.push(n);
        }
    }
    //NorthEast
    if (x < this._tilemap.width-1 && y > 0) {
        n = map[y-1][x+1].properties.astarNode;
        if (n.walkable
            && map[y][x+1].properties.astarNode.walkable
            && map[y-1][x].properties.astarNode.walkable
        ) {
            n.travelCost = DungeonLevel.COST_DIAGONAL;
            neighbors.push(n);
        }
    }
    //SouthWest
    if (x > 0 && y < this._tilemap.height-1) {
        n = map[y+1][x-1].properties.astarNode;
        if (n.walkable
            && map[y][x-1].properties.astarNode.walkable
            && map[y+1][x].properties.astarNode.walkable
        ) {
            n.travelCost = DungeonLevel.COST_DIAGONAL;
            neighbors.push(n);
        }
    }
    //SouthEast
    if (x < this._tilemap.width-1 && y < this._tilemap.height-1) {
        n = map[y+1][x+1].properties.astarNode;
        if (n.walkable
            && map[y][x+1].properties.astarNode.walkable
            && map[y+1][x].properties.astarNode.walkable
        ) {
            n.travelCost = DungeonLevel.COST_DIAGONAL;
            neighbors.push(n);
        }
    }
   
    return neighbors;
};


/**
 * Calculate a distance between tow astar nodes coordinates according to the Manhattan method
 * @method DungeonLevel-distManhattan
 * @private
 * @param {DungeonLevel.AStarNode} nodeA - The A node.
 * @param {DungeonLevel.AStarNode} nodeB - The B node.
 * @return {number} The distance between nodeA and nodeB
 */
DungeonLevel.prototype.distManhattan = function (nodeA, nodeB) 
{
    return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
};

/**
 * Calculate a distance between tow astar nodes coordinates according to the Euclidian method. More accurate
 * @method DungeonLevel-distEuclidian
 * @private
 * @param {DungeonLevel.AStarNode} nodeA - The A node.
 * @param {DungeonLevel.AStarNode} nodeB - The B node.
 * @return {number} The distance between nodeA and nodeB
 */
DungeonLevel.prototype.distEuclidian = function(nodeA, nodeB)
{
    return Math.sqrt(Math.pow((nodeA.x - nodeB.x), 2) + Math.pow((nodeA.y  -nodeB.y), 2));
};


/**
 * Tells if a tile is walkable from its tilemap coordinates
 * @method DungeonLevel-isWalkable
 * @public
 * @param {number} x - The x coordiante of the tile in tilemap's coordinate.
 * @param {number} y - The y coordinate of the tile in tilemap's coordinate.
 * @return {boolean} The distance between nodeA and nodeB
 */
DungeonLevel.prototype.isWalkable = function(x, y)
{  
    return this._tilemap.layers[this._layerIndex].data[y][x].properties.astarNode.walkable;
};


/**
 * @properties {string} version - The version number of DungeonLevel read only
 */
Object.defineProperty(DungeonLevel.prototype, "version", {
    
    get: function () {
        return DungeonLevel.VERSION;
    }

});

        
/**
* AStarNode is an object that stores AStar value. Each tile have an AStarNode in their properties
* @class DungeonLevel.AStarNode
* @constructor
* @param {number} x - The x coordinate of the tile.
* @param {number} y - The y coordinate of the tile.
* @param {boolean} isWalkable - Is this tile is walkable?
*/
DungeonLevel.AStarNode = function(x, y, isWalkable)
{

    /**
    * @property {number} x - The x coordinate of the tile.
    */
    this.x = x;
    
    /**
    * @property {number} y - The y coordinate of the tile.
    */
    this.y = y;

    /**
    * @property {number} g - The total travel cost from the start point. Sum of COST_ORTHOGONAL and COST_DIAGONAL
    */
    this.g = 0;

    /**
    * @property {number} h - The remaing distance as the crow flies between this node and the goal.
    */
    this.h = 0;

    /**
    * @property {number} f - The weight. Sum of g + h.
    */
    this.f = 0;

    /**
     * @property {DungeonLevel.AStarNode} parent - Where do we come from? It's an AStarNode reference needed to reconstruct a path backwards (from goal to start point)
     */
    this.parent; 

    /**
     * @property {boolean} walkable - Is this node is walkable?
     */
    this.walkable = isWalkable;

    /**
     * @property {number} travelCost - The cost to travel to this node, COST_ORTHOGONAL or COST_DIAGONAL 
     */
    this.travelCost;
};


/**
* AStarPath is an object that stores a searchPath result.
* @class DungeonLevel.AStarPath
* @constructor
* @param {array} nodes - An array of nodes coordinates sorted backward from goal to start point.
* @param {DungeonLevelNode} start - The start AStarNode used for the searchPath.
* @param {DungeonLevelNode} goal - The goal AStarNode used for the searchPath.
*/
DungeonLevel.AStarPath = function(nodes, start, goal)
{
    /**
     * @property {array} nodes - Array of AstarNodes x, y coordiantes that are the path solution from goal to start point. 
     */
    this.nodes = nodes || [];

    /**
     * @property {DungeonLevel.AStarNode} start - Reference to the start point used by findPath. 
     */
    this.start = start || null;

    /**
     * @property {DungeonLevel.AStarNode} goal - Reference to the goal point used by findPath. 
     */
    this.goal = goal || null;

    /**
     * @property {array} visited - Array of AStarNodes that the findPath algorythm has visited. Used for debug only.
     */
    this.visited = [];
};


/**
* Debug method to draw the last calculated path by AStar
* @method Phaser.Utils.Debug.AStar
* @param {DungeonLevel} astar- The AStar plugin that you want to debug.
* @param {number} x - X position on camera for debug display.
* @param {number} y - Y position on camera for debug display.
* @param {string} color - Color to stroke the path line.
* @return {void}
*/
Phaser.Utils.Debug.prototype.AStar = function(astar, x, y, color, showVisited)
{
    if (this.context == null)
    {
        return;
    }
    
    var pathLength = 0;
    if(astar._lastPath !== null)
    {
        pathLength = astar._lastPath.nodes.length;
    }

    color = color || 'rgb(255,255,255)';

    game.debug.start(x, y, color);


    if(pathLength > 0)
    {
        var node = astar._lastPath.nodes[0];
        this.context.strokeStyle = color;
        this.context.beginPath();
        this.context.moveTo((node.x * astar._tilemap.tileWidth) + (astar._tilemap.tileWidth/2) - game.camera.view.x, (node.y * astar._tilemap.tileHeight) + (astar._tilemap.tileHeight/2) - game.camera.view.y);

        for(var i=0; i<pathLength; i++)
        {
            node = astar._lastPath.nodes[i];
            this.context.lineTo((node.x * astar._tilemap.tileWidth) + (astar._tilemap.tileWidth/2) - game.camera.view.x, (node.y * astar._tilemap.tileHeight) + (astar._tilemap.tileHeight/2) - game.camera.view.y);
        }

        this.context.lineTo((astar._lastPath.start.x * astar._tilemap.tileWidth) + (astar._tilemap.tileWidth/2) - game.camera.view.x, (astar._lastPath.start.y * astar._tilemap.tileHeight) + (astar._tilemap.tileHeight/2) - game.camera.view.y);

        this.context.stroke(); 

        //Draw circles on visited nodes
        if(showVisited !== false)
        {
            var visitedNode;
            for(var j=0; j < astar._lastPath.visited.length; j++)
            {
                visitedNode = astar._lastPath.visited[j];
                this.context.beginPath();
                this.context.arc((visitedNode.x * astar._tilemap.tileWidth) + (astar._tilemap.tileWidth/2) - game.camera.view.x, (visitedNode.y * astar._tilemap.tileHeight) + (astar._tilemap.tileHeight/2) - game.camera.view.y, 2, 0, Math.PI*2, true);
                this.context.stroke(); 
            }
        }
    }

    this.line('Path length: ' + pathLength);
    this.line('Distance func: ' + astar._distanceFunction);
    this.line('Use diagonal: ' + astar._useDiagonal);
    this.line('Find Closest: ' + astar._findClosest);

    game.debug.stop();
};



