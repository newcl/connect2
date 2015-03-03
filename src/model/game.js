/**
 * Created by chenliang on 15/2/20.
 */

var rowCount = 7;
var columnCount = 5;

function positionToKey (x, y) {
    return x + "-" + y;
}

var IconConfig = function () {
    var config;
    var iconNames;
    return cc.Class.extend({
        init: function () {
            config = JSON.parse(cc.loader.getRes("res/all_icons.json"));
            iconNames = Object.keys(config);
        },
        getConfig: function () {
            return config;
        },
        getIconNames: function () {
            return iconNames;
        }

    });
}();

var Path = function () {
    
    return cc.Class.extend({
        join: function (p) {
            this.elements.push(p);
            return this;
        },
        cost:0,
        elements:null,
        ctor:function  () {
            this.elements = [];
        },
        finish: function  () {
            var elements = this.elements;
            assert(elements.length > 0, "probably logic error");
            for (var i = 0; i < elements.length -1; i++) {
                var x1 = elements[i].x;
                var y1 = elements[i].y;

                var x2 = elements[i+1].x;
                var y2 = elements[i+1].y;


                var deltaX = x2-x1;
                var deltaY = y2-y1;
                this.cost += deltaX*deltaX+deltaY*deltaY;

                return this;
            };
        },
        reverse:function () {
            var path = new Path();
            path.elements = this.elements.reverse();
            path.finish();
            return path;
        },
        head:function () {
            return this.elements[0];
        },
        tail:function () {
            return this.elements[this.elements.length-1];
        }

    });
}();

var PathCache = function () {
    function positionToKey(p1, p2) {
        return p1.x+"-"+p1.y+"-"+p2.x+"-"+p2.y;

    }

    function comparePathCost(p1, p2){
        var length1 = p1.elements.length;
        var length2 = p2.elements.length;
        if (length1 < length2) {
            return -1;
        } else if(length1 > length2) {
            return 1;
        }

        return p1.cost - p2.cost;
    }
    var pathMap = {};
    var pathKeys = {};
    return cc.Class.extend({
        addPath: function (p1, p2, path) {
            //A->B
            var key1 = positionToKey(p1,p2);
            if(!(key1 in pathMap)) {
                pathMap[key1] = [];
            }
            pathMap[key1].push(path);
            pathMap[key1].sort(comparePathCost);

            //B->A
            var key2 = positionToKey(p2, p1);
            if(!(key2 in pathMap)) {
                pathMap[key2] = [];
            }
            pathMap[key2].push(path);
            pathMap[key2].sort(comparePathCost);

            //register keys
            if(!(key1 in pathKeys)) {
                pathKeys[key1] = 1;
            }
            if(!(key2 in pathKeys)) {
                pathKeys[key2] = 1;
            }

            assert(Object.keys(pathKeys).length%2==0, "");
        },
        getPath: function (p1, p2) {
            var key = positionToKey(p1,p2);
            if(key in pathMap) {
                return pathMap[key][0];
            } else {
                return null;
            }
        }
    });
}();

var Game = function () {
    var iconConfig;

    return cc.Class.extend({
        gameTiles: [],
        hintCount: 3,
        shuffleCount: 3,
        positionMap: {},
        iconNames:[],
        gameTileGroup:{},
        pathCache:null,
        score:0,
        ctor:function() {
            this.initGame();
        },
        initGame: function () {
            iconConfig = new IconConfig();
            iconConfig.init();
            this.pathCache = new PathCache();
            this.reset();
        },
        isXLinked: function (x1, x2, y) {
            var minX = Math.min(x1, x2);
            var maxX = Math.max(x1, x2);

            for (var i=minX + 1; i < maxX; i++) {
                if (!this.isPositionAvailable(i, y)) {
                    return false;
                }
            }

            return true;
        },
        isYLinked: function (y1, y2, x) {
            var minY = Math.min(y1, y2);
            var maxY = Math.max(y1, y2);

            for (var i=minY + 1; i < maxY; i++) {
                if (!this.isPositionAvailable(x, i)) {
                    return false;
                }
            }

            return true;
        },
        isXLinked2: function (x, y, xTo) {
            if (x > xTo) {
                return this.isXLinked(xTo-1, x, y);
            } else if(x < xTo) {
                return this.isXLinked(xTo+1, x, y);
            } else {
                return true;
            }
        },
        isYLinked2: function (x, y, yTo) {
            if (y > yTo) {
                return this.isYLinked(yTo-1, y, x);
            } else if(y < yTo){
                return this.isYLinked(yTo+1, y, x);
            } else {
                return true;
            }
        },
        calculateGenerateCount: function () {

        },
        addGameTilePairForKey: function (key) {

        },
        addGameTile: function (key) {
            var position = this.getRandomPosition();
            var gameTile = new GameTile(position, key);
            this.positionMap[positionToKey(position.x, position.y)] = gameTile;
            this.gameTiles.push(gameTile);
            if(!(key in this.gameTileGroup)) {
                this.gameTileGroup[key] = [];
            }
            var gameTileGroup = this.gameTileGroup[key];
            gameTileGroup.push(gameTile);

            return gameTile;
        },
        getConnectedGameTilePairCount: function () {

        },
        isPositionAvailable: function (x, y) {
            return !this.positionMap.hasOwnProperty(positionToKey(x,y));
        },
        getRandomPosition: function () {
            while (true) {
                var row = (Math.random()*rowCount) << 0;
                var col = (Math.random()*columnCount) << 0;

                if(this.isPositionAvailable(col, row)) {
                    return cc.p(col, row);
                }
            }

            throw new Error("no valid position available");
        },
        updateAllPathFor: function (p1, p2) {
            var x1 = p1.x;
            var y1 = p1.y;

            var x2 = p2.x;
            var y2 = p2.y;

            //one line link
            if (x1 == x2) {
                if (this.isYLinked(y1, y2, x1)) {
                    var path = new Path().join(p1).join(p2).finish();
                    this.pathCache.addPath(p1, p2, path);
                    return;
                }
            }

            if (y1 == y2) {
                if (this.isXLinked(x1, x2, y1)) {
                    var path = new Path().join(p1).join(p2).finish();
                    this.pathCache.addPath(p1, p2, path);
                    return;
                }
            }

            //2 line link
            if (this.isXLinked2(x1, y1, x2) && this.isYLinked2(x2, y2, y1)) {
                var path = new Path().join(p1).join(cc.p(x2, y1)).join(p2).finish();
                this.pathCache.addPath(p1, p2, path);
                return;
            }

            if (this.isYLinked2(x1, y1, y2) && this.isXLinked2(x2, y2, x1)) {
                var path = new Path().join(p1).join(cc.p(x1, y2)).join(p2).finish();
                this.pathCache.addPath(p1, p2, path);
                return;
            }

            var minX = Math.min(x1, x2);
            var maxX = Math.max(x1, x2);
            var minY = Math.min(y1, y2);
            var maxY = Math.max(y1, y2);

            for (var x=-1; x <= columnCount; x++) {
                if (x == x1 || x == x2) {
                    continue;
                }

                if (this.isXLinked2(x1, y1, x) && this.isYLinked(minY-1, maxY+1, x) && this.isXLinked2(x2, y2, x)) {
                    var path = new Path().join(p1).join(cc.p(x, y1)).join(cc.p(x, y2)).join(p2).finish();
                    this.pathCache.addPath(p1, p2, path);
                }
            }


            for (var y=-1; y <= rowCount; y++) {
                if (y == y1 || y == y2) {
                    continue;
                }

                if (this.isYLinked2(x1, y1, y) && this.isXLinked(minX-1, maxX+1, y) && this.isYLinked2(x2, y2, y)) {
                    var path = new Path().join(p1).join(cc.p(x1, y)).join(cc.p(x2, y)).join(p2).finish();
                    this.pathCache.addPath(p1, p2, path);
                }
            }
        },
        updateAllPath: function () {
            for(var key in this.gameTileGroup) {
                var gameTilesForKey = this.gameTileGroup[key];
                for(var i=0; i < gameTilesForKey.length-1;i ++) {
                    var gameTileI = gameTilesForKey[i];
                    for(var j=i+1; j < gameTilesForKey.length;j++) {
                        var gameTileJ = gameTilesForKey[j];
                        this.updateAllPathFor(gameTileI.position, gameTileJ.position);
                    }
                }
            }


        },

        //public begin
        isEmpty: function () {
            return this.gameTiles.length <= 0;
        },
        canConnect: function (p1, p2) {
            return this.getPath(p1,p2) != null;
        },
        connect: function (p1, p2) {
            var key1 = positionToKey(p1.x, p1.y);
            var key2 = positionToKey(p2.x, p2.y);

            var gameTile1 = this.positionMap[key1];
            var gameTile2 = this.positionMap[key2];

            assert(gameTile1.key === gameTile2.key, "WTF");


            var gameTileGroup = this.gameTileGroup[gameTile1.key];
            var oldGroupCount = gameTileGroup.length;
            gameTileGroup.splice(gameTileGroup.indexOf(gameTile1), 1);
            gameTileGroup.splice(gameTileGroup.indexOf(gameTile2), 1);
            assert(oldGroupCount-2===gameTileGroup.length, "WTF");
            

            var gameTiles = this.gameTiles;
            var oldGameTileCount = gameTiles.length;
            gameTiles.splice(gameTiles.indexOf(gameTile1), 1);
            gameTiles.splice(gameTiles.indexOf(gameTile2), 1);
            assert(oldGameTileCount-2 === gameTiles.length, "WTF");


            var oldPositionCount = Object.keys(this.positionMap).length;
            delete this.positionMap[key1];
            delete this.positionMap[key2];
            assert(oldPositionCount-2 === Object.keys(this.positionMap).length, "WTF");

            var path = this.pathCache.getPath(p1, p2);

            this.updateAllPath();

            return path;
        },
        getPath: function (p1, p2) {
            return this.pathCache.getPath(p1,p2);
        },
        getRandomPath: function () {

        },
        getHintPath: function () {

        },
        reset: function () {
            var iconNames = iconConfig.getIconNames();
            var iconName = iconNames[(iconNames.length*Math.random())<<0];

            var pair = 6;
            // var typeCount = Math.min(5, iconConfig.getConfig()[iconName]);
            var count = iconConfig.getConfig()[iconName];
            for(var i=0; i < pair;i++) {
                //"%s-%d.png"
                // var iconNameOffset = (Math.random()*typeCount) << 0;
                // var spriteFrameName = iconName + "-"+iconNameOffset+".png";

                // var key = all_icons[(Math.random()*all_icons.length) << 0];
                var index = (Math.random()*count) << 0;

                var key = "res/icons/"+iconName+"/"+iconName+"-"+index+".png";
                this.addGameTileForKey(key);
            }

            this.updateAllPath();
        },
        addGameTileForKey: function (key) {
            this.addGameTile(key);
            this.addGameTile(key);

            assert(this.gameTileGroup[key].length % 2 == 0, "addGameTileForKey fail for " + key);

        },
        canShuffle: function () {

        },
        shuffle: function () {

        },
        canHint: function () {

        },
        hintProvided: function () {

        },
        getGameTile: function (x, y) {

        },
        hasLinkedGameTiles: function () {

        },
        lock: function (x1, y1, x2, y2) {

        }
    });
}();