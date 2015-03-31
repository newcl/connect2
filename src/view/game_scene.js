/**
 * Created by chenliang on 15/2/19.
 */




var COMBO_INTERVAL = 3000;

function randomColor() {
    return cc.color(Math.random()*256 << 0, Math.random()*256 <<0, Math.random()*256 <<0, 255);
}
var GameSceneLayer = function () {
    // var blockSize = 80;
    var blockSizeHalf = blockSize/2;
    var selectedGameTileView = null;

    var TAG_TINT_FOR_SELECTION = 10001;
    var TAG_SHAKE = 10002;

    function randomAngle(base, offset) {
        return base + Math.random()*offset;
    }

    function generateRotateAction(time, angle, offset) {
        var rotateAngle = randomAngle(Math.abs(angle), offset);
        rotateAngle *= angle / Math.abs(angle);
        return cc.rotateTo(time, rotateAngle, rotateAngle);
    }

    return cc.Layer.extend({
        sprite:null,
        viewScore:0,
        game: null,
        tileLayer:null,
        uiLayer:null,
        scoreText:null,
        timeLeftText:null,
        comboText:null,
        backgroundLayer:null,
        hintLayer:null,
        leftMargin:60,
        rightMargin:60,
        topMargin:60,
        bottomMargin:60,
        horizontalInterval:undefined,
        verticalInterval:undefined,
        lastConnectTime:0,
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
                var action = cc.RepeatForever.create(cc.sequence(new cc.TintTo(0.2,100,100,100), new cc.TintTo(0.2, 200,200,200)));
                action.setTag(TAG_TINT_FOR_SELECTION);
                gameTileView.sprite.runAction(action);
            }

            this.hintLayer.removeAllChildren();

            var paths = this.game.getPathConnectedTo(gameTileView.gameTile.position);
            if(paths != null) {
                //var path = paths[0];
                //var colorForPath = randomColor();
                //path.elements.forEach(function (position) {
                //    var hintTile = new cc.LayerColor(colorForPath, blockSize, blockSize);
                //    hintTile.setAnchorPoint(cc.p(0.5,0.5));
                //    hintTile.setPosition(this.getPositionInGame(position));
                //    this.hintLayer.addChild(hintTile);
                //},this);
                //paths.forEach(function (path) {
                //    var colorForPath = randomColor();
                //    path.elements.forEach(function (position) {
                //        var hintTile = new cc.LayerColor(colorForPath, blockSize, blockSize);
                //        hintTile.setAnchorPoint(cc.p(0.5,0.5));
                //        hintTile.setPosition(this.getPositionInGame(position));
                //        this.hintLayer.addChild(hintTile);
                //    },this);
                //}, this);
            }

        },
        stopTintSelectedGameTileView: function (gameTileView) {
            gameTileView.sprite.stopActionByTag(TAG_TINT_FOR_SELECTION);
            gameTileView.sprite.setColor(cc.color(0xff,0xff,0xff,0xff));
        },
        bind:function(game){
            this.game = game;
            this.hintLayer.removeAllChildren();
            this.tileLayer.removeAllChildren();
            this.createGameTileViews(this.game);
        },
        reset: function () {
            var game = new Game();
            this.bind(game);
            this.viewScore = 0;
            this.scoreText.setString(this.viewScore+"");
            //this.backgroundLayer.removeAllChildren();

        },
        cleanupForGameTileView: function (gameTileView) {
            //gameTileView.removefromParent();
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
        onGameShuffled:function() {
            this.bind(this.game);
        },
        onConnected: function (newSelected) {
            //mega coin splash
            var path = this.game.connect(this.selectedGameTileView.gameTile.position, newSelected.gameTile.position);

            if (this.game.isEmpty()) {
                cc.audioEngine.playEffect("res/sound/clear.wav",false);
            } else {
                if (newSelected.gameTile.key.indexOf("cat") > -1) {
                    cc.audioEngine.playEffect("res/sound/cat"+((Math.random()*4)<<0)+".wav",false);
                } else {
                    cc.audioEngine.playEffect("res/sound/connect.wav", false);
                }

                
                this.game.score += 200;
            }

            var now = new Date().getTime();
            var interval = now - this.lastConnectTime;
            
            if (interval <= COMBO_INTERVAL) {
                if (this.game.combo == 0) {
                    this.comboText.setScale(1.0);
                    // this.comboText.setVisible(true); 
                    this.comboText.runAction(cc.show());
                }
                this.game.combo += 1;
                this.comboText.setString("x"+(this.game.combo <<0) + "");

                var sequence = cc.sequence(cc.scaleTo(0.1, 1.4), cc.scaleTo(0.1, 1.0));
                this.comboText.runAction(sequence);

                var comboEffectIndex = this.game.combo + 1;
                comboEffectIndex = Math.min(7, comboEffectIndex);
                cc.audioEngine.playEffect("res/sound/combo"+comboEffectIndex+".wav", false);
                //combo extra score
                var comboCount = this.game.combo;
                this.game.score += comboCount*comboCount*100;
            }
            this.lastConnectTime = now;

            this.cleanupForGameTileView(this.selectedGameTileView);
            this.cleanupForGameTileView(newSelected);

            this.moveGameTileViewAlongPath(this.selectedGameTileView, path, newSelected);

            this.selectedGameTileView = null;

            if(this.game.isEmpty()) {
                this.reset();
            } else {
                if (this.game.hasValidPath()) {

                } else {
                    this.doShuffle();
                }
            }
        },
        doShuffle:function(){
            do {
                this.game.shuffle();
            } while(!this.game.hasValidPath());

            this.onGameShuffled();
        },
        doHint:function () {
            var path = this.game.getHintPath();
            if (path != null) {
                var head = path.head();
                var tail = path.tail();

                var duration = 0.2;
                var sequence = cc.sequence(cc.scaleTo(duration, 1.3), cc.scaleTo(duration, 1.0));
                var sequence2 = cc.sequence(cc.scaleTo(duration, 1.3), cc.scaleTo(duration, 1.0));
                var headTileView = this.tileLayer.getChildByName(positionToKey(head.x, head.y));
                var tailTileView = this.tileLayer.getChildByName(positionToKey(tail.x, tail.y));
                headTileView.runAction(sequence);
                tailTileView.runAction(sequence2);
            }
        },
        onGameTileViewSelected: function (newSelected) {
            if(this.selectedGameTileView){
                if(this.selectedGameTileView === newSelected) {

                } else {
                    if(this.selectedGameTileView.gameTile.key == newSelected.gameTile.key) {
                        if(this.game.canConnect(this.selectedGameTileView.gameTile.position, newSelected.gameTile.position)) {
                            this.onConnected(newSelected);
                        } else {
                            cc.audioEngine.playEffect("res/sound/connect_fail.wav");

                            this.stopTintSelectedGameTileView(this.selectedGameTileView);

                            this.shake(newSelected);

                            this.selectedGameTileView = newSelected;
                            this.tryTintSelectedGameTileView(this.selectedGameTileView);
                        }
                    } else {
                        this.stopTintSelectedGameTileView(this.selectedGameTileView);

                        this.selectedGameTileView = newSelected;
                        this.tryTintSelectedGameTileView(this.selectedGameTileView);
                    }
                }
            } else {
                this.selectedGameTileView = newSelected;
                this.tryTintSelectedGameTileView(this.selectedGameTileView);
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
            gameTileView.setName(positionToKey(gameTile.position.x, gameTile.position.y));
            
        },
        createGameTileViews: function (game) {
            game.gameTiles.forEach(function (gameTile) {
                this.createGameTileView(gameTile);
            }, this);
        },
        initUi:function () {
            var ui = ccs.load("res/ui/main_ui.json");
            this.uiLayer = ui.node;
            this.addChild(this.uiLayer);

            var visibleSize = cc.director.getVisibleSize();

            var winSize = cc.director.getWinSize();
            var top = this.uiLayer.getChildByName("top");
            top.setPositionY(winSize.height);
            var scoreText = top.getChildByName("score");
            scoreText.setPositionX(visibleSize.width -10);
            this.scoreText = scoreText;

            this.timeLeftText = top.getChildByName("timeLeft");
            this.comboText = top.getChildByName("combo");


            var bottom = this.uiLayer.getChildByName("bottom");
            var shuffle = bottom.getChildByName("shuffle");
            shuffle.addTouchEventListener(function(sender, type){
                switch (type) {
                    case ccui.Widget.TOUCH_BEGAN:
                        this.doShuffle();
                        break;

                    case ccui.Widget.TOUCH_MOVED:
                        //this._topDisplayText.setString("Touch Move");
                        break;

                    case ccui.Widget.TOUCH_ENDED:
                        //this._topDisplayText.setString("Touch Up");
                        break;

                    case ccui.Widget.TOUCH_CANCELED:
                        //this._topDisplayText.setString("Touch Cancelled");
                        break;

                    default:
                        break;
                }
            },this);

            var hint = bottom.getChildByName("hint");
            hint.addTouchEventListener(function(sender, type){
                switch (type) {
                    case ccui.Widget.TOUCH_BEGAN:
                        this.doHint();
                        break;

                    case ccui.Widget.TOUCH_MOVED:
                        //this._topDisplayText.setString("Touch Move");
                        break;

                    case ccui.Widget.TOUCH_ENDED:
                        //this._topDisplayText.setString("Touch Up");
                        break;

                    case ccui.Widget.TOUCH_CANCELED:
                        //this._topDisplayText.setString("Touch Cancelled");
                        break;

                    default:
                        break;
                }
            },this);

            //cc.eventManager.addListener(shuffleTouchListener, shuffle);

            
            top.setContentSize(cc.size(visibleSize.width, uiTopHeight));
            bottom.setContentSize(cc.size(visibleSize.width, uiBottomHeight));
        },
        update:function (dt) {
            this._super(dt);
            if (this.viewScore != this.game.score) {
                var delta = this.game.score - this.viewScore;
                if (delta <= 2) {
                    this.viewScore = this.game.score;
                } else {
                    this.viewScore += delta/2;
                }

                this.scoreText.setString((this.viewScore<<0) + "");
            }

            this.game.time -= dt*1000;
            this.game.time = Math.max(this.game.time, 0) << 0;
            if (this.game.time <= 0) {

            }

            //combo
            var now = new Date().getTime();
            if (now - this.lastConnectTime <= COMBO_INTERVAL) {

            } else {
                this.game.combo = 0;
            }

            if (this.game.combo <= 0) {
                var sequence = cc.sequence(cc.scaleTo(0.1, 0.1), cc.hide());
                this.comboText.runAction(sequence);
                // console.log("hiding");
            } else {
                this.comboText.setVisible(true);    
            }

            // this.comboText.setVisible();

            this.timeLeftText.setString(((this.game.time/1000)<<0)+"");
            // alert(cc._renderType + "--->");
            //cc.log("shit running\n");
        },
        createBackgroudGrid: function () {
            var backgroundGrid = new cc.DrawNode();

            var size = cc.size(blockSize*columnCount, blockSize*rowCount);
            backgroundGrid.setContentSize(size);

            var lineWidth = .3;

            for(var row=0; row<=rowCount;row++) {
                var lineY = uiBottomHeight+bottomMargin+row*blockSize;
                backgroundGrid.drawSegment(cc.p(this.leftMargin, lineY), cc.p(this.leftMargin+blockSize*columnCount,lineY), lineWidth, cc.color(0,0,0,255));
            }

            for(var col=0; col<=columnCount;col++) {
                var lineX = this.leftMargin+col*blockSize;
                backgroundGrid.drawSegment(cc.p(lineX, uiBottomHeight+bottomMargin), cc.p(lineX,uiBottomHeight+bottomMargin+rowCount*blockSize), lineWidth, cc.color(0,0,0,255));
            }


            return backgroundGrid;
        },
        initScene: function () {
            var size = this.getContentSize();
            //alert(size.width+"-"+size.height);
            this.horizontalInterval = (size.width - this.leftMargin - this.rightMargin - blockSize*columnCount) / (columnCount+1);
            this.verticalInterval = (size.height - this.topMargin - this.bottomMargin - blockSize*rowCount) / (rowCount+1);

            // var designResolution = cc.view.getDesignResolutionSize();
            var visibleSize = cc.director.getVisibleSize();
            this.leftMargin = this.rightMargin = (visibleSize.width - blockSize*columnCount)/2;

            this.backgroundLayer = new cc.LayerColor();
            this.backgroundLayer.setColor(cc.color(255,255,255,255));

            var backgroundGrid = this.createBackgroudGrid();
            this.backgroundLayer.addChild(backgroundGrid);
            // var particleBackground = new cc.ParticleSystem("res/effects/background.plist");
            // this.backgroundLayer.addChild(particleBackground);
            this.addChild(this.backgroundLayer);

            this.hintLayer = new cc.LayerColor(cc.color(0, 0, 0, 0));
            this.addChild(this.hintLayer);

            this.tileLayer = new cc.Layer();
            //this.tileLayer.setColor(cc.color(255,255,255,255));
            this.addChild(this.tileLayer);

            this.initUi();

            this.scheduleUpdate();

            this.reset();
        },
        getPositionInGame: function (position) {
            return cc.p(this.leftMargin + position.x * blockSize, uiBottomHeight + bottomMargin + position.y*blockSize);
            // return cc.p(this.leftMargin + position.x*(this.horizontalInterval+blockSize) + this.horizontalInterval, this.bottomMargin + position.y*(this.verticalInterval+blockSize) + this.verticalInterval);
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
            // layer.init();
            //layer.setColor(new cc.Color(0xff,0,0,0xff));

            this.addChild(layer);
        }
    });
}();
