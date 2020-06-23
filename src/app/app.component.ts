import { Component, ChangeDetectorRef } from '@angular/core';

import { IpcRenderer } from 'electron';
import { AbstractExtendedWebDriver } from 'protractor/built/browser';


const electron = (<any>window).require('electron');


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-electron';

  private ipc: IpcRenderer;

  directoryPath = "Default";

  videoPath = "Default";

  fileArray = [];

  constructor(private cdr: ChangeDetectorRef) {

  }

}
