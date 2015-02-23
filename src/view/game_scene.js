/**
 * Created by chenliang on 15/2/19.
 */

var GameSceneLayer = function () {
    var blockSize = 80;
    var blockSizeHalf = blockSize/2;

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

        init: function () {
            this._super();

            var size = this.getContentSize();
            this.horizontalInterval = (size.width - this.leftMargin - this.rightMargin - blockSize*this.game.columnCount) / (this.game.columnCount+1);
            this.verticalInterval = (size.height - this.topMargin - this.bottomMargin - blockSize*this.game.rowCount) / (this.game.rowCount+1);

            this.tileLayer = new cc.LayerColor(cc.color(0xff, 0xff,0xff,0xff));
            this.addChild(this.tileLayer);

            var yOffset = this.bottomMargin;
            for(var row=0; row < this.game.rowCount;row ++) {
                yOffset += this.verticalInterval;

                var xOffset = this.leftMargin;
                for(var column=0; column < this.game.columnCount; column++) {
                    xOffset += this.horizontalInterval;

                    var tileView = new cc.Sprite("#browsers-0.png");
                    tileView.setScale(0.7);
                    tileView.setPositionX(xOffset+blockSizeHalf);
                    tileView.setPositionY(yOffset+blockSizeHalf);
                    //tileView.setPositionX(100);
                    //tileView.setPositionY(100);
                    this.tileLayer.addChild(tileView);

                    xOffset += blockSize;
                }
                yOffset += blockSize;
            }
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
