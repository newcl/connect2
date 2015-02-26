/**
 * Created by chenliang on 15/2/20.
 */

var GameTileView = function () {
    return cc.LayerColor.extend({
        gameTile:null,
        position:null,
        sprite:null,
        ctor: function (gameTile, position, size) {
            this._super(new cc.Color(0xff, 0xff,0xff,0), size.width, size.height);
            this.gameTile = gameTile;
            this.position = position;
            this.setPosition(position);
            this.setContentSize(size);

            this.sprite = new cc.Sprite("#" + this.gameTile.key);
            this.sprite.setScale(0.6);
            this.addChild(this.sprite);
            this.sprite.setPosition(cc.p(this.getContentSize().width/2, this.getContentSize().height/2));

        }
    });
}();