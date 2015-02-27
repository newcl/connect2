var res = {
    // all_icons : "res/icons/allicons.plist",
    //all_icons_texture : "res/icons/allicons.pvr.ccz",
    all_icons_config : "res/icons/icons.plist",
    // background:"res/effects/background.plist",
    // motion:"res/1.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}
g_resources.push.apply(g_resources, all_icons);
