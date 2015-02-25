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
        onGameTileViewSelected: function (newSelected) {
            if(selectedGameTileView){
                if(selectedGameTileView === newSelected) {

                } else {
                    if(selectedGameTileView.gameTile.key == newSelected.gameTile.key) {
                        if(this.game.canConnect(selectedGameTileView.gameTile.position, newSelected.gameTile.position)) {
                            //mega coin splash
                            this.game.connect(selectedGameTileView.gameTile.position, newSelected.gameTile.position);

                            selectedGameTileView.removeFromParent();
                            newSelected.removeFromParent();

                            selectedGameTileView = null;
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
        init: function () {
            this._super();

            var size = this.getContentSize();
            this.horizontalInterval = (size.width - this.leftMargin - this.rightMargin - blockSize*this.game.columnCount) / (this.game.columnCount+1);
            this.verticalInterval = (size.height - this.topMargin - this.bottomMargin - blockSize*this.game.rowCount) / (this.game.rowCount+1);

            this.tileLayer = new cc.LayerColor(cc.color(0xff, 0xff,0xff,0xff));
            this.addChild(this.tileLayer);


            this.game.gameTiles.forEach(function (gameTile) {
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
            }, this);
            //var gameTile = this.game.gameTiles[0];
            //var position = this.getPositionInGame(gameTile.position);
            //position.x = 0;
            //position.y = 0;
            //var gameTileView = new GameTileView(gameTile, position, cc.size(blockSize, blockSize));
            //gameTileView.setColor(cc.color((Math.random()*256).toFixed(),(Math.random()*256).toFixed(),(Math.random()*256).toFixed(),255));

            //this.tileLayer.addChild(gameTileView);


            //var p = new cc.Sprite("#mahjong-28.png");
            //p.setPosition(cc.p(100, 100));
            //this.tileLayer.addChild(p);
        },
        getPositionInGame: function (position) {
            //var yOffset = this.bottomMargin;
            //for(var row=0; row < this.game.rowCount;row ++) {
            //    yOffset += this.verticalInterval;
            //
            //    var xOffset = this.leftMargin;
            //    for(var column=0; column < this.game.columnCount; column++) {
            //        xOffset += this.horizontalInterval;
            //
            //        var tileView = new cc.Sprite("#browsers-0.png");
            //        tileView.setScale(0.7);
            //        tileView.setPositionX(xOffset+blockSizeHalf);
            //        tileView.setPositionY(yOffset+blockSizeHalf);
            //
            //        this.tileLayer.addChild(tileView);
            //
            //        var touchListener = function (tileView) {
            //            return cc.EventListener.create({
            //                event:cc.EventListener.TOUCH_ONE_BY_ONE,
            //                swallowTouches:true,
            //                onTouchBegan: function (touch, event) {
            //                    var position = touch.getLocation();
            //                    var boundingBox = tileView.getBoundingBox();
            //                    if(cc.rectContainsPoint(boundingBox,position)) {
            //                        tileView.runAction(cc.sequence(new cc.ScaleTo(0.6, 0.2, 0.2), new cc.ScaleTo(0.6, 1, 1)));
            //                        return true;
            //                    }
            //                    return false;
            //                }
            //            });
            //        }(tileView);
            //
            //        cc.eventManager.addListener(touchListener, tileView);
            //
            //        xOffset += blockSize;
            //    }
            //    yOffset += blockSize;
            //}

            return cc.p(this.leftMargin + position.x*(this.horizontalInterval+blockSize) + this.horizontalInterval, this.bottomMargin + position.y*(this.verticalInterval+blockSize) + this.verticalInterval);
        },
        ctor:function (game) {
            this._super();
            this.game = game;

            return true;
        },
        createGameTileViews: function () {
            this.tileLayer.removeAllChildren();

        }
    });
}();

var GameScene = function () {
    return cc.Scene.extend({
        onEnter:function () {
            this._super();
            var game = new Game();
            var layer = new GameSceneLayer(game);
            layer.init();
            layer.setColor(new cc.Color(0xff,0xff,0xff,0xff));

            this.addChild(layer);
        }
    });
}();
