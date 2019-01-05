import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SobrePage } from '../pages/sobre/sobre';

import { AngularFireModule } from "angularfire2";
import { AngularFireAuthModule } from 'angularfire2/auth';
import { GaugesModule } from 'ng-canvas-gauges/src';
import { Device } from '@ionic-native/device';

export const debug = !false;

export const firebaseConfig = {
    apiKey: "API_KEY",
    authDomain: "database.firebaseapp.com",
    databaseURL: "https://database.firebaseio.com",
    projectId: "database",
    storageBucket: "database.appspot.com",
    messagingSenderId: "sender_id"
};


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SobrePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    GaugesModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SobrePage
  ],
  providers: [
    Device,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
