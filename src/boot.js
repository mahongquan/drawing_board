window.myremote={
    fs:require('fs'),
    path:require("path"),
    electron:require('electron'),
};
require("babel-register");
require("babel-polyfill");
require("./index_local.js");