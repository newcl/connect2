#!/bin/sh
cocos compile -p android -m release && adb install -r publish/android/connect-release-signed.apk 
