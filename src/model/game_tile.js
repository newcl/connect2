/**
 * Created by chenliang on 15/2/20.
 */

var GameTile = cc.Class.extend({
    key:null,
    position: null,
    ctor : function(position, key){
        this.key = key;
        this.position = position;
    },
    setPosition: function (position) {
        this.position = position;
    }
});

