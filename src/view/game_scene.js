/**
 * Created by chenliang on 15/2/19.
 */

var GameSceneLayer = function () {
    var blockSize = 80;
    var blockSizeHalf = blockSize/2;
    var selectedGameTileView = null;

    var TAG_TINT_FOR_SELECTION = "__tint_for_selection";
    var TAG_SHAKE = "__shake";

    function randomAngle(base, offset) {
        return base + Math.random()*offset;
    }

    function generateRotateAction(time, angle, offset) {
        var rotateAngle = randomAngle(Math.abs(angle), offset);
        rotateAngle *= angle / Math.abs(angle);
        return cc.rotateTo(time, rotateAngle, rotateAngle);
    }

    return cc.LayerColor.extend({
        sprite:null,
        game: null,
        tileLayer:null,
        uiLayer:null,
        backgroundLayer:null,
        leftMargin:60,
        rightMargin:60,
        topMargin:60,
        bottomMargin:60,
        horizontalInterval:undefined,
        verticalInterval:undefined,
        shake: function (gameTileView, time,angle, deltaAngle,count) {
            var time = time || 0.1;
            var angle = angle || 25;
            var deltaAngle = deltaAngle || 5;
            var count = count || 4;
            var shakeActions = [];
            for (var i=0; i < count; i++) {
                shakeActions.push(generateRotateAction(time, angle*(i%2==0 ? 1 : -1), deltaAngle));
            }
            shakeActions.push(cc.rotateTo(time, 0, 0));
            var sequence = cc.sequence(shakeActions);
            sequence.setTag(TAG_SHAKE);

            gameTileView.runAction(sequence);
        },
        tryTintSelectedGameTileView: function (gameTileView) {
            if(!gameTileView.getActionByTag(TAG_TINT_FOR_SELECTION)) {
                var action = cc.RepeatForever.create(cc.sequence(new cc.TintTo(0.4,50,50,50), new cc.TintTo(0.4, 170,170,170)));
                action.setTag(TAG_TINT_FOR_SELECTION);
                gameTileView.runAction(action);
            }
        },
        stopTintSelectedGameTileView: function (gameTileView) {
            gameTileView.stopActionByTag(TAG_TINT_FOR_SELECTION);
            gameTileView.setColor(cc.color(0xff,0xff,0xff,0xff));
        },
        reset: function () {
            this.game = new Game();
            this.createGameTileViews(this.game);
        },
        cleanupForGameTileView: function (gameTileView) {
            gameTileView.removeFromParent();
            cc.eventManager.removeListener(gameTileView);
        },
        onConnected: function (newSelected) {
            //mega coin splash
            this.game.connect(selectedGameTileView.gameTile.position, newSelected.gameTile.position);

            this.cleanupForGameTileView(selectedGameTileView);
            this.cleanupForGameTileView(newSelected);

            selectedGameTileView = null;

            if(this.game.isEmpty()) {
                this.reset();
            }
        },
        onGameTileViewSelected: function (newSelected) {
            if(selectedGameTileView){
                if(selectedGameTileView === newSelected) {

                } else {
                    if(selectedGameTileView.gameTile.key == newSelected.gameTile.key) {
                        if(this.game.canConnect(selectedGameTileView.gameTile.position, newSelected.gameTile.position)) {
                            this.onConnected(newSelected);
                        } else {
                            //nooooooooooooo
                            this.stopTintSelectedGameTileView(selectedGameTileView);

                            this.shake(selectedGameTileView);

                            selectedGameTileView = newSelected;
                            this.tryTintSelectedGameTileView(selectedGameTileView);
                        }
                    } else {
                        this.stopTintSelectedGameTileView(selectedGameTileView);

                        selectedGameTileView = newSelected;
                        this.tryTintSelectedGameTileView(selectedGameTileView);
                    }
                }
            } else {
                selectedGameTileView = newSelected;
                this.tryTintSelectedGameTileView(selectedGameTileView);
            }
        },
        createGameTileView: function (gameTile) {
            var position = this.getPositionInGame(gameTile.position);
            var gameTileView = new GameTileView(gameTile, position, cc.size(blockSize, blockSize));

            var touchListener = function (gameTileView, gameScene) {
                return cc.EventListener.create({
                    event: cc.EventListener.TOUCH_ONE_BY_ONE,
                    swallowTouches: true,
                    onTouchBegan: function (touch, event) {
                        var position = touch.getLocation();
                        var boundingBox = gameTileView.getBoundingBox();
                        if (cc.rectContainsPoint(boundingBox, position)) {
                            gameScene.onGameTileViewSelected(gameTileView);
                            return true;
                        }
                        return false;
                    }
                });
            }(gameTileView, this);

            cc.eventManager.addListener(touchListener, gameTileView);

            this.tileLayer.addChild(gameTileView);
        },
        createGameTileViews: function (game) {
            game.gameTiles.forEach(function (gameTile) {
                this.createGameTileView(gameTile);
            }, this);
        },
        init: function () {
            this._super();

            var size = this.getContentSize();
            this.horizontalInterval = (size.width - this.leftMargin - this.rightMargin - blockSize*columnCount) / (columnCount+1);
            this.verticalInterval = (size.height - this.topMargin - this.bottomMargin - blockSize*rowCount) / (rowCount+1);

            this.tileLayer = new cc.LayerColor(cc.color(0xff, 0xff,0xff,0xff));
            this.addChild(this.tileLayer);

            this.reset();
        },
        getPositionInGame: function (position) {
            return cc.p(this.leftMargin + position.x*(this.horizontalInterval+blockSize) + this.horizontalInterval, this.bottomMargin + position.y*(this.verticalInterval+blockSize) + this.verticalInterval);
        },
        ctor:function (game) {
            this._super();
            this.game = game;

            return true;
        }
    });
}();

var GameScene = function () {
    return cc.Scene.extend({
        onEnter:function () {
            this._super();
            var layer = new GameSceneLayer();
            layer.init();
            layer.setColor(new cc.Color(0xff,0xff,0xff,0xff));

            this.addChild(layer);
        }
    });
}();
