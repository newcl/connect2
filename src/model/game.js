/**
 * Created by chenliang on 15/2/20.
 */


function positionToKey (x, y) {
    return x + "-" + y;
}

var IconConfig = function () {
    var config;
    var iconNames;
    return cc.Class.extend({
        init: function () {
            config = cc.loader.getRes("res/icons/icons.plist");
            iconNames = Object.keys(config);
        },
        getIconTypeCount: function () {
            return iconNames.length;
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
    var elements = [];
    return cc.Class.extend({
        join: function (p) {
            elements.push(p);
            return this;
        },
        cost:0

    });
}();

var PathCache = function () {
    function positionToKey(p1, p2) {
        return p1.x+"-"+p1.y+"-"+p2.x+"-"+p2.y;

    }

    function comparePathCost(p1, p2){
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

            assert(pathKeys.length%2==0, "");
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
        rowCount:8,
        columnCount:5,
        gameTileGroup:{},
        pathCache:null,
        ctor:function() {
            this.init();
        },
        init: function () {
            iconConfig = new IconConfig();
            iconConfig.init();
            this.pathCache = new PathCache();
            this.reset();
        },
        isXLinked: function (x1, x2, y) {
            var minX = min(x1, x2);
            var maxX = max(x1, x2);

            for (var i=minX + 1; i < maxX; i++) {
                if (!this.isPositionAvailable(i, y)) {
                    return false;
                }
            }

            return true;
        },
        isYLinked: function (y1, y2, x) {
            var minY = min(y1, y2);
            var maxY = max(y1, y2);

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
                var row = (Math.random()*this.rowCount) << 0;
                var col = (Math.random()*this.columnCount) << 0;

                if(this.isPositionAvailable(col, row)) {
                    console.log(col + "-" + row + "->" + "("+this.rowCount+",)"+this.columnCount);
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
                    var path = new Path().join(p1).join(p2);
                    this.pathCache.addPath(p1, p2, path);
                    return;
                }
            }

            if (y1 == y2) {
                if (this.isXLinked(x1, x2, y1)) {
                    var path = new Path().join(p1).join(p2);
                    this.pathCache.addPath(p1, p2, path);
                    return;
                }
            }

            //2 line link
            if (this.isXLinked2(x1, y1, x2) && this.isYLinked2(x2, y2, y1)) {
                var path = new Path().join(p1).join(cc.p(x2, y1)).join(p2);
                this.pathCache.addPath(p1, p2, path);
                return;
            }

            if (this.isYLinked2(x1, y1, y2) && this.isXLinked2(x2, y2, x1)) {
                var path = new Path().join(p1).join(cc.p(x1, y2)).join(p2);
                this.pathCache.addPath(p1, p2, path);
                return;
            }

            var minX = Math.min(x1, x2);
            var maxX = Math.max(x1, x2);
            var minY = Math.min(y1, y2);
            var maxY = Math.max(y1, y2);

            for (var x=-1; x <= this.columnCount; x++) {
                if (x == x1 || x == x2) {
                    continue;
                }

                if (this.isXLinked2(x1, y1, x) && this.isYLinked(minY-1, maxY+1, x) && this.isXLinked2(x2, y2, x)) {
                    var path = new Path().join(p1).join(cc.p(x, y1)).join(cc.p(x, y2)).join(p2);
                    this.pathCache.addPath(p1, p2, path);
                }
            }


            for (var y=-1; y <= this.rowCount; y++) {
                if (y == y1 || y == y2) {
                    continue;
                }

                if (this.isYLinked2(x1, y1, y) && this.isXLinked(minX-1, maxX+1, y) && this.isYLinked2(x2, y2, y)) {
                    var path = new Path().join(p1).join(cc.p(x1, y)).join(cc.p(x2, y)).join(p2);
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
        getRowCount: function () {

        },
        getColumnCount: function () {

        },
        canConnect: function (p1, p2) {

            return false;
        },
        connect: function (p1, p2) {

        },
        getPath: function (x1, y1, x2, y2) {

        },
        getRandomPath: function () {

        },
        getHintPath: function () {

        },
        isEmpty:function(){

        },
        reset: function () {
            this.positionMap = {};
            var iconName = iconConfig.getIconNames()[ (iconConfig.getIconTypeCount()*Math.random)<<0];

            var pair = 5;
            var typeCount = Math.min(5, iconConfig.getConfig()[iconName]);

            for(var i=0; i < pair;i++) {
                //"%s-%d.png"
                var iconNameOffset = (Math.random()*typeCount) << 0;
                var spriteFrameName = iconName + "-"+iconNameOffset+".png";
                this.addGameTileForKey(spriteFrameName);
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