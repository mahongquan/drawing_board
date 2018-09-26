const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

//-----------------------------------------------------------------

const {Menu, MenuItem, dialog, ipcMain }=electron;


//是否可以安全退出

let safeExit = false;

//-----------------------------------------------------------------

// var config = require('./config');
// var configData = config.getSync();
// console.log("config:"+configData);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
// ipcMain.on('getconfig', (event, arg) => {
//   event.returnValue = configData;
// })
// ipcMain.on('saveconfig', (event, arg) => {
//   console.log(arg)
//   config.save(arg);
//   mainWindow.webContents.send("config_saved");
// })
ipcMain.on('getpath', (event, arg) => {
  // console.log("getpath")
  // console.log(__dirname);
  event.returnValue = __dirname;
})
ipcMain.on('print', (event, arg) => {
  mainWindow.webContents.print();
})
ipcMain.on('close', (event, arg) => {
  // console.log("ipcMain on close");
  safeExit=true;
  mainWindow.close();
})
const devMode = (process.argv || []).indexOf('--local') !== -1;
let indexUrl;
if(devMode){
   indexUrl=`file://${__dirname}/src/index.html`;
}
else{
   indexUrl=`file://${__dirname}/build/index.html`; 
}
const createWindow = () => {
  // console.log("createWindow");

  // Create the browser window.

  mainWindow = new BrowserWindow({

    width: 800,

    height: 600,

  });
  //menu
  const template=
    [{
      label: '文件',
      submenu: [
       {
          label: '新建',
          accelerator: 'Ctrl+N',
          click: (item, win) =>{
            win.webContents.send("new");
          },
       },
       {
          label: '打开',
          accelerator: 'Ctrl+O',
          click: (item, win) =>{
            win.webContents.send("open");
          },
       },
       {
          label: '保存',
          accelerator: 'Ctrl+S',
          click: (item, win) =>{
            win.webContents.send("save");
          },
        },
        {
          label: '打印',
          accelerator: 'Ctrl+P',
          click: (item, win) =>{
            console.log(win);
            win.webContents.print();
            // win.webContents.send("print");
          },
        },
        {
          label: '新窗口',
          accelerator: 'Ctrl+N',
          click: () =>{createWindow()},
        },
        {
          label: '重启',
          accelerator: 'Ctrl+H',
          click: (item, win) =>{win.loadURL(indexUrl);},
        },
         {
          label: 'DevTools',
          accelerator: 'Ctrl+D',
          click: (item, win) =>{
            win.openDevTools();
          },
        },
        {
          label: '退出',
          accelerator: 'Ctrl+E',
          click: (item, win) =>{
             // console.log(win);
             // console.log(mainWindow);
             win.close();
          },
        }
        ]
    },{
      label: '帮助',
      submenu: [
        {
          label: '关于',
          accelerator: 'Ctrl+A',
          click: (item, win) =>{
            win.webContents.send("about");
          },
        }
        ]
    }];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  //
  if (devMode) {
      mainWindow.openDevTools();
  }
  // and load the index.html of the app.

  mainWindow.loadURL(indexUrl);

  // Open the DevTools.

  // /mainWindow.webContents.openDevTools();
  mainWindow.on('close', (e) => {
    // console.log("close");
    // console.log(e);

    if(!safeExit){

      e.preventDefault();

      mainWindow.webContents.send('request_close');

    }

  });

  //-----------------------------------------------------------------



  // Emitted when the window is closed.

  mainWindow.on('closed', () => {

    // Dereference the window object, usually you would store windows

    // in an array if your app supports multi windows, this is the time

    // when you should delete the corresponding element.

    mainWindow = null;

  });

};



// This method will be called when Electron has finished

// initialization and is ready to create browser windows.

// Some APIs can only be used after this event occurs.

app.on('ready', createWindow);



// Quit when all windows are closed.

app.on('window-all-closed', () => {

  // On OS X it is common for applications and their menu bar

  // to stay active until the user quits explicitly with Cmd + Q

  if (process.platform !== 'darwin') {

    app.quit();

  }

});



app.on('activate', () => {

  // On OS X it's common to re-create a window in the app when the

  // dock icon is clicked and there are no other windows open.

  if (mainWindow === null) {

    createWindow();

  }

});


