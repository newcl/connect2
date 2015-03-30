/**
 * A brief explanation for "project.json":
 * Here is the content of project.json file, this is the global configuration for your game, you can modify it to customize some behavior.
 * The detail of each field is under it.
 {
    "project_type": "javascript",
    // "project_type" indicate the program language of your project, you can ignore this field

    "debugMode"     : 1,
    // "debugMode" possible values :
    //      0 - No message will be printed.
    //      1 - cc.error, cc.assert, cc.warn, cc.log will print in console.
    //      2 - cc.error, cc.assert, cc.warn will print in console.
    //      3 - cc.error, cc.assert will print in console.
    //      4 - cc.error, cc.assert, cc.warn, cc.log will print on canvas, available only on web.
    //      5 - cc.error, cc.assert, cc.warn will print on canvas, available only on web.
    //      6 - cc.error, cc.assert will print on canvas, available only on web.

    "showFPS"       : true,
    // Left bottom corner fps information will show when "showFPS" equals true, otherwise it will be hide.

    "frameRate"     : 60,
    // "frameRate" set the wanted frame rate for your game, but the real fps depends on your game implementation and the running environment.

    "id"            : "gameCanvas",
    // "gameCanvas" sets the id of your canvas element on the web page, it's useful only on web.

    "renderMode"    : 0,
    // "renderMode" sets the renderer type, only useful on web :
    //      0 - Automatically chosen by engine
    //      1 - Forced to use canvas renderer
    //      2 - Forced to use WebGL renderer, but this will be ignored on mobile browsers

    "engineDir"     : "frameworks/cocos2d-html5/",
    // In debug mode, if you use the whole engine to develop your game, you should specify its relative path with "engineDir",
    // but if you are using a single engine file, you can ignore it.

    "modules"       : ["cocos2d"],
    // "modules" defines which modules you will need in your game, it's useful only on web,
    // using this can greatly reduce your game's resource size, and the cocos console tool can package your game with only the modules you set.
    // For details about modules definitions, you can refer to "../../frameworks/cocos2d-html5/modulesConfig.json".

    "jsList"        : [
    ]
    // "jsList" sets the list of js files in your game.
 }
 *
 */

var blockSize = 64;
var topMargin = 20;
var bottomMargin = 20;
var uiTopHeight = 50;
var uiBottomHeight = 60;

var rowCount = 7;
var columnCount = 5;
var designHeight = uiTopHeight + topMargin + blockSize * rowCount + bottomMargin + uiBottomHeight;

cc.game.onStart = function(){
    var gameScene = null;

    cc.view.adjustViewPort(true);

    //design width & height
    // height = top(80) + bottom(80) + block(128)*7 + topMargin(20) + bottomMargin(20)
    // leftMargin = rightMargin = (newDesignHeight - block(128)*5)/2
    // width = block(128)*5 + leftMargin(?) + rightMargin(?)

//    var policy = new cc.ResolutionPolicy(cc.ContainerStrategy.ORIGINAL_CONTAINER, cc.ContentStrategy.FIXED_HEIGHT);
    // cc.view.setDesignResolutionSize(1000, designHeight, policy);

    cc.view.enableAutoFullScreen(false);
    cc.view.resizeWithBrowserSize(false);
    cc.view.setDesignResolutionSize(1000, designHeight, cc.ResolutionPolicy.FIXED_HEIGHT);
    
    cc.view.setResizeCallback(function() {
        if (gameScene) {
            // gameScene.onSizeChanged();
            // cc.director.runScene(new GameScene());    
        }
    });
    // cc.director.setContentScaleFactor(2);
    //load resources
    cc.LoaderScene.preload(allResource, function () {
        gameScene = new GameScene();
        cc.director.runScene(gameScene);
    }, this);
};
cc.game.run();