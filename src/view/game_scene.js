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
            if(!gameTileView.sprite.getActionByTag(TAG_TINT_FOR_SELECTION)) {
                var action = cc.RepeatForever.create(cc.sequence(new cc.TintTo(0.4,50,50,50), new cc.TintTo(0.4, 170,170,170)));
                action.setTag(TAG_TINT_FOR_SELECTION);
                gameTileView.sprite.runAction(action);
            }
        },
        stopTintSelectedGameTileView: function (gameTileView) {
            gameTileView.sprite.stopActionByTag(TAG_TINT_FOR_SELECTION);
            gameTileView.sprite.setColor(cc.color(0xff,0xff,0xff,0xff));
        },
        reset: function () {
            this.game = new Game();
            this.createGameTileViews(this.game);
        },
        cleanupForGameTileView: function (gameTileView) {
            //gameTileView.removeFromParent();
            cc.eventManager.removeListener(gameTileView.listener);
            delete gameTileView.listener;
        },
        moveGameTileViewAlongPath:function (gameTileView, path, target) {
            if (this.game.isEmpty()) {
                gameTileView.removeFromParent();
                target.removeFromParent();
            } else {
                var startPosition = gameTileView.gameTile.position;
                if (startPosition.x === path.head().x && startPosition.y === path.head().y) {

                } else {
                    path = path.reverse();
                    assert(startPosition.x === path.head().x && startPosition.y === path.head().y, "WTF");
                }

                var actions = [];

                for (var i = 1; i < path.elements.length; i++) {
                    // var positon = this.getPositionInGameForSprite(path.elements[i]);
                    // actions.push(cc.moveTo(0.2, positon));
                    var duration = 0.15;
                    var action = cc.spawn(cc.moveTo(duration, this.getPositionInGame(path.elements[i])),
                                          cc.fadeTo(duration, 0));
                    

                    actions.push(action);
                };

                var onFinish = cc.callFunc(function () {
                    gameTileView.removeFromParent();
                    target.removeFromParent();
                });
                actions.push(onFinish);
                var sequence = cc.sequence(actions);

                // gameTileView.setVisible(false);
                gameTileView.runAction(sequence);

                // var motionStreak = new cc.MotionStreak(0.3, 1.0, 50.0, cc.color(255, 255, 0,0), gameTileView.gameTile.key);
                // motionStreak.setPosition(this.getPositionInGameForSprite(gameTileView.gameTile.position));
                // this.tileLayer.addChild(motionStreak);
                // motionStreak.runAction(sequence);
            }
            
        },
        onConnected: function (newSelected) {
            //mega coin splash
            var path = this.game.connect(selectedGameTileView.gameTile.position, newSelected.gameTile.position);

            this.cleanupForGameTileView(selectedGameTileView);
            this.cleanupForGameTileView(newSelected);

            this.moveGameTileViewAlongPath(selectedGameTileView, path, newSelected);

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

            gameTileView.listener = cc.eventManager.addListener(touchListener, gameTileView);

            this.tileLayer.addChild(gameTileView);
        },
        createGameTileViews: function (game) {
            game.gameTiles.forEach(function (gameTile) {
                this.createGameTileView(gameTile);
            }, this);
        },
        initScene: function () {
            this._super();

            var size = this.getContentSize();
            //alert(size.width+"-"+size.height);
            this.horizontalInterval = (size.width - this.leftMargin - this.rightMargin - blockSize*columnCount) / (columnCount+1);
            this.verticalInterval = (size.height - this.topMargin - this.bottomMargin - blockSize*rowCount) / (rowCount+1);

            this.backgroundLayer = new cc.LayerColor();
            var particleBackground = new cc.ParticleSystem("res/effects/background.plist");
            this.backgroundLayer.addChild(particleBackground);
            this.addChild(this.backgroundLayer);

            this.tileLayer = new cc.Layer();
            this.addChild(this.tileLayer);

            this.reset();
        },
        getPositionInGame: function (position) {
            return cc.p(this.leftMargin + position.x*(this.horizontalInterval+blockSize) + this.horizontalInterval, this.bottomMargin + position.y*(this.verticalInterval+blockSize) + this.verticalInterval);
        },
        getPositionInGameForSprite:function (position) {
            var p = this.getPositionInGame(position);
            p.x += blockSizeHalf;
            p.y += blockSizeHalf;
            return p;
        },
        ctor:function (game) {
            this._super();
            this.game = game;
            this.initScene();
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
