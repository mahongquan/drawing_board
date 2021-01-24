import React from 'react';
import ReactDOM from 'react-dom';
const fs = require('fs');
const path = require('path');
function fileExist(p) {
  if (fs.existsSync(p)) {
    return true;
  }
  return false;
}
function link(where, module_name) {
  // body...
  var thelink = document.createElement('link');
  thelink.setAttribute('rel', 'stylesheet');
  var file1 = path.join(where, module_name);
  thelink.setAttribute('href', file1);
  document.head.appendChild(thelink);
}
function getWhere() {
  let where = window.require('electron').ipcRenderer.sendSync('getpath');
  return where;
}
let where = getWhere();
// link(where, 'node_modules/bootstrap/dist/css/bootstrap.min.css');
// link(where, 'node_modules/bootstrap/dist/css/bootstrap-theme.min.css');
link('./', 'animate.min.css');
link('./', 'css/index.css');
let App = require('./Editor_mui').default;
ReactDOM.render(<App />, document.getElementById('root'));
