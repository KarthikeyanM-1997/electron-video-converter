import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { MainScreenComponent } from './main-screen/main-screen.component';


const routes: Routes = [
  {
    path: "", component: SplashScreenComponent
  },
  {
    path: "mainScreen", component: MainScreenComponent
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
