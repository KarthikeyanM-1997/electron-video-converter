import { Component, ChangeDetectorRef, OnInit } from '@angular/core';

import { IpcRenderer } from 'electron';
import { AbstractExtendedWebDriver } from 'protractor/built/browser';


const electron = (<any>window).require('electron');


@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrls: ['./main-screen.component.css']
})
export class MainScreenComponent implements OnInit {
  title = 'angular-electron';

  private ipc: IpcRenderer;

  directoryPath = [];

  videoPath = [];

  fileArray = [];

  currentOpenProject = 0;

  currentProjectPath = "";

  currentlyProcessing = false;

  currentProgressPercent = 0;

  showError = false;

  errorMessage = "";

  constructor(private cdr: ChangeDetectorRef) {
    if ((<any>window).require) {
      try {
        this.ipc = electron.ipcRenderer;

        this.ipc.on("dirPath", (event, data) => {
          if (data === "" || data === undefined) {
            cdr.detectChanges();
            return;
          }
          this.addDirectory(data);
          cdr.detectChanges();
        });

        this.ipc.on("fileList", (event, data) => {
          data = data.substring(0, data.length - 1);
          this.fileArray.push(data.split(","));
          cdr.detectChanges();
          this.openProject(this.fileArray.length - 1);
        });

        this.ipc.on("updateFiles", (event, data) => {
          let dataObj = JSON.parse(data);
          let fileStr = dataObj['files'];
          fileStr = fileStr.substring(0, fileStr.length - 1);
          let index = dataObj["index"];
          this.fileArray[index] = fileStr.split(",");
          cdr.detectChanges();
          this.openProject(index);
        });

        this.ipc.on("videoPath", (event, data) => {
          if (data === "" || data === undefined) {
            cdr.detectChanges();
            return;
          }
          this.videoPath[this.currentOpenProject] = data;
          cdr.detectChanges();
          console.log("Convert & Save : " + this.videoPath[this.currentOpenProject] + " To : " + this.directoryPath[this.currentOpenProject] + "/output.m3u8");
          this.convertAndSave(this.videoPath[this.currentOpenProject], this.directoryPath[this.currentOpenProject] + "/output.m3u8");
        });

        this.ipc.on("ipc-message", (event, data) => {
          let msg = JSON.parse(data);
          console.log(msg);
          this.currentProgressPercent = msg['progress'];
          if (msg['progress'] === 0) {
            this.currentlyProcessing = true;
          }
          else if (msg['progress'] === -1) {
            this.showError = true;
            this.errorMessage = msg['error'];
            this.currentlyProcessing = false;
          }
          else if (msg['progress'] === 100) {
            this.updateFiles(this.currentOpenProject);
            this.currentlyProcessing = false;
          }
          else {
            this.currentlyProcessing = true;
            this.showError = false;
          }
          cdr.detectChanges();
        });
        
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }
  }
  ngOnInit(): void {

  }

  printValues() {
    this.ipc.send("sendMsg", "Apples Are Cool");
  }

  sendData() {
    console.log("Sending to Electron from Angular");
    this.ipc.send("tryComms", { "Fruit": "Apple" });
  }

  getDir() {
    console.log("Sending to Electron from Angular : Try to get Directory");
    this.ipc.send("getDir");
  }

  addDirectory(dirPath) {
    console.log("Sending to Electron from Angular : Getting files in Directory");
    this.directoryPath.push(dirPath);
    console.log(this.directoryPath);
    this.ipc.send("getFiles", this.directoryPath[this.directoryPath.length - 1]);
  }

  getVideoPath() {
    console.log("Sending to Electron from Angular : Getting video file to convert");
    this.ipc.send("getVideoPath");
  }

  convertAndSave(input, output) {
    this.ipc.send("convertAndSave", { input: input, output: output });
  }

  openProjectOld(i) {

    this.currentProjectPath = this.directoryPath[i];

    this.currentOpenProject = i;

    var div = (<HTMLDivElement>document.getElementById("filesListDiv"));

    div.innerHTML = "";

    var ul = document.createElement("ul");

    for (let v = 0; v < this.fileArray[i].length; v++) {
      let li = document.createElement("li");
      li.innerText = this.fileArray[i][v];
      ul.appendChild(li);
    }

    div.appendChild(ul);
    this.cdr.detectChanges();
  }

  openProject(i) {

    this.currentProjectPath = this.directoryPath[i];

    this.currentOpenProject = i;

    var div = (<HTMLDivElement>document.getElementById("filesListDiv"));

    div.innerHTML = "";

    if (this.fileArray[i].length === 1 && this.fileArray[i][0] !== "") {
      div.innerHTML = "<div class='text-truncate m-1 text-center' style='border : 1px solid black'>" + this.fileArray[i][0] + "</div>";
    }
    else if (this.fileArray[i].length === 1 && this.fileArray[i][0] === "") {
      div.innerHTML = "Empty Folder.";
    }
    else {
      var ul = <HTMLDivElement>document.createElement("div");

      ul.setAttribute("class", "row");

      for (let v = 0; v < this.fileArray[i].length; v++) {
        let li = document.createElement("div");
        li.setAttribute("class", "col-3 text-truncate m-1 text-center");
        li.setAttribute("style", "border : 1px solid black");
        li.innerText = this.fileArray[i][v];
        ul.appendChild(li);
      }

      div.appendChild(ul);
    }


    console.log(this.fileArray[i]);

    this.cdr.detectChanges();
  }

  updateFiles(i) {
    this.ipc.send("updateFiles", JSON.stringify({ path: this.directoryPath[i], index: i }));
  }

}

