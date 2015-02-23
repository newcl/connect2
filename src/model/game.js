/**
 * Created by chenliang on 15/2/20.
 */

var Game = cc.Class.extend({
    gameTiles: [],
    hintCount: 3,
    shuffleCount: 3,
    positionMap: {},
    iconNames:[],
    rowCount:8,
    columnCount:5,
    ctor:function() {
        this.init();
    },
    init: function () {
        var iconConfig = cc.loader.getRes("res/icons/icons.plist");
        for(var key in iconConfig) {
            this.iconNames.push(key);
            console.log(key + "=" + iconConfig[key]);
        }

    },
    isXLinked: function (x1, x2, y) {
        return true;
    },
    isYLinked: function (y1, y2, x) {
        return true;
    },
    isXLinked2: function (x, y, xTo) {

    },
    isYLinked2: function (x, y, yTo) {

    },
    calculateGenerateCount: function () {

    },
    addGameTilePairForKey: function (key) {

    },
    addGameTile: function (key) {

    },
    getConnectedGameTilePairCount: function () {

    },
    isPositionAvailable: function (x, y) {

    },
    positionToKey: function (x, y) {

    },
    getRandomPosition: function () {

    },
    takePosition: function (x, y, gameTile) {

    },
    updateAllPathFor: function (x1, y1, x2, y2) {

    },
    updateAllPath: function () {

    },
    generateRandomKey: function () {

    },

    //public begin
    getRowCount: function () {

    },
    getColumnCount: function () {

    },
    canConnect: function (x1, y1, x2, y2) {

    },
    connect: function (x1, y1, x2, y2) {

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