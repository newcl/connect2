/**
 * Created by chenliang on 15/2/20.
 */

var GameTile = cc.Class.extend({
    key:null,
    position: cc.p(0, 0),
    ctor : function(x,y,key){
        this._super();
        this.setKey(key);
        this.setX(x);
        this.setY(y);
    },
    setKey : function(key){
        this.key = key;
    },
    setX:function (x){
        this.position.x = x;
    },
    setY:function (y){
        this.position.y = y;
    }
});

