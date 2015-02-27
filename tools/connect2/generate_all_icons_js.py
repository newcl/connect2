# -*- coding: utf-8 -*-
import sys
import os
reload(sys)  # Reload does the trick!
sys.setdefaultencoding('UTF8')

__author__ = 'chenliang'

prefix = '../../'

# var all_icons = [
#   "res/icons/1.png",
#   "res/icons/2.png"
# ];
#


with open("../../src/all_icons.js", "w") as icon_js:
    icon_js.write("var all_icons = [\n");
    all_icons = []
    for path, dirlist, filelist in os.walk(prefix + "res/icons"):
            for file in filelist:
                if file != ".DS_Store":
                    full_path = os.path.join(path , file)

                    all_icons.append(full_path[len(prefix):])

    while len(all_icons) > 0:
        path = all_icons.pop()
        icon_js.write('"{0}"'.format(path))
        if len(all_icons) > 0:
            icon_js.write(',')
        icon_js.write("\n")


    icon_js.write("];\n")
