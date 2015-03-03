/**
 * Created by chenliang on 15/2/20.
 */

var GameTileView = function () {
    return cc.Layer.extend({
        gameTile:null,
        position:null,
        sprite:null,
        ctor: function (gameTile, position, size) {
            this._super(size.width, size.height);
            this.gameTile = gameTile;
            this.position = position;
            this.setPosition(position);
            this.setContentSize(size);

            this.sprite = new cc.Sprite(this.gameTile.key);
            // this.sprite.setScale(0.75);
            this.addChild(this.sprite);
            this.sprite.setPosition(cc.p(this.getContentSize().width/2, this.getContentSize().height/2));

        }
    });
}();