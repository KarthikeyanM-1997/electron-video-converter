const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');

var ffmpeg = require('fluent-ffmpeg');

const url = require('url');
const path = require('path');

const fs = require('fs');

let win;

function createWindow() {
    // Create the browser window.
    var iconPath = path.resolve(__dirname, 'angular_build/favicon.jpg');
    win = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        webPreferences: {
            nodeIntegration: true
        },
        icon: iconPath,
        title: "Electron MP4 to HLS Converter",
        menuBarVisible : false
    })

    Menu.setApplicationMenu(null);

    var indexPath = path.resolve(__dirname, 'angular_build/index.html');


    /*
    win.loadURL(url.format({
        pathname: "dist/angular-electron/index.html", // important
        protocol: 'file:',
        slashes: true,
        // baseUrl: 'dist'
    }));
    */

    win.loadURL(indexPath);

    //// uncomment below to open the DevTools.
    // win.webContents.openDevTools()

    // Event when the window is closed.
    win.on('closed', function () {
        win = null
    })

    //tryConversion();
}

ipcMain.on('getFiles', (event, arg) => {
    var fileOutput = "";
    fs.readdir(arg, (err, files) => {
        files.forEach(file => {
            fileOutput = fileOutput + file + ",";
        });
        win.webContents.send("fileList", fileOutput);
    });
});


ipcMain.on('updateFiles', (event, arg) => {
    var fileOutput = "";
    args = JSON.parse(arg);
    fs.readdir(args['path'], (err, files) => {
        files.forEach(file => {
            fileOutput = fileOutput + file + ",";
        });
        win.webContents.send("updateFiles", JSON.stringify({ files: fileOutput, index: args['index'] }));
    });
});

ipcMain.on('tryComms', (event, arg) => {
    console.log("Received data in Electron from Angular");
    console.log(arg);
});

ipcMain.on('getDir', (event, arg) => {
    console.log("Trying to get Directory");
    dialog.showOpenDialog(win, {
        properties: ['openDirectory']
    }).then((result) => {
        win.webContents.send("dirPath", result.filePaths[0]);
    }).catch((err) => {
        console.log(err);
    });
});

ipcMain.on('convertAndSave', (event, data) => {
    tryConversion(data['input'], data['output']);
});

ipcMain.on('getVideoPath', (event, arg) => {
    let options = {
        // See place holder 1 in above image
        title: "Convert to HLS",

        // See place holder 3 in above image
        buttonLabel: "Select .MP4",

        // See place holder 4 in above image
        filters: [
            { name: 'Videos', extensions: ['mp4'] }
        ],
        properties: ['openFile']
    };
    console.log("getting video path");
    dialog.showOpenDialog(win, options).then((filePaths) => {
        win.webContents.send("videoPath", filePaths['filePaths'][0]);
    }).catch((error) => {
        console.log(error);
    });
});

ipcMain.on("sendMsg", (event, arg) => {
    win.webContents.send("ipc-message", arg);
})

function tryConversion(input, output) {

    //'C:/Users/karth/Desktop/Karthikeyan M/Videos/test.mp4'
    //'C:/Users/karth/Desktop/Karthikeyan M/Videos/output.m3u8'
    console.log("starting Conversion");
    win.webContents.send("ipc-message", JSON.stringify({ "progress": 0 }));
    ffmpeg(input)
        .outputOptions('-hls_time 60')
        .on('error', function (err) {
            console.log('An error occurred: ' + err.message);
            win.webContents.send("ipc-message", JSON.stringify({ "progress": -1 }));
        })
        .on('progress', function (progress) {
            console.log(progress.percent);
            win.webContents.send("ipc-message", JSON.stringify({ "progress": Math.round(progress.percent) }));
        })
        .on('end', function () {
            console.log('Processing finished !');
            win.webContents.send("ipc-message", JSON.stringify({ "progress": 100 }));
        })
        .save(output);

}




// Create window on electron intialization
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {

    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // macOS specific close process
    if (win === null) {
        createWindow()
    }
})