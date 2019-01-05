import { Component, NgZone } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { Device } from '@ionic-native/device';
import { Subscription } from 'rxjs';
 
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage  { 
  private onResumeSubscription: Subscription;
  // BackgroundGeolocation API
  bgGeo: any;

  // Background Geolocation State
  state: any;
  enabled: boolean;  
  isMoving: boolean;
  distanceFilter: number;
  stopTimeout: number;
  autoSync: boolean;
  stopOnTerminate: boolean;
  startOnBoot: boolean;
  debug: boolean;
  testing: any;
  //App variables
  deviceID: any; 
  dSpeed: number;
  dimension: number;
  task: any;
  afToken: any;

  constructor(
    private platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    private zone:NgZone,
    private device:Device,
    private afAuth: AngularFireAuth) {
    
    this.onResumeSubscription = this.platform.resume.subscribe(() => {
        if(this.enabled && this.bgGeo){
          this.bgGeo.getCurrentPosition(
            function(location) {
              let s = this.convertToKMh(location.coords.speed);
              this.dSpeed = isNaN(s) ? this.dSpeed : s;
            }, 
            function(errorCode) {
              switch (errorCode) {
                case 0:
                  //alert('Falha ao obter localização!');
                  break;
                case 1:
                  //alert('É necessário ativar o GPS para uso do app!');
                  break;
                case 2:
                  //alert('Erro de rede!');
                  break;
                case 408:
                  //alert('Tempo máximo para obter localização atingido!');
                  break;
              }
            }
          );
        }
        console.log('RESUMED');   
    });

    this.platform.ready().then(
      this.configureBackgroundGeolocation.bind(this)
    );

    this.state = {};
    // BackgroundGeolocation initial config.
    this.isMoving = false;
    this.enabled = false;
    this.autoSync = true;
    //this.distanceFilter = 10;
    this.stopTimeout = 3;
    this.stopOnTerminate = false;
    this.startOnBoot = true;

    this.dSpeed = 0;
    this.dimension = this.getGaugeDimension();

  }

  configureBackgroundGeolocation() {
    
    this.deviceID = this.device.uuid;
    this.bgGeo = (<any>window).BackgroundGeolocation;

    // Listen to events
    this.bgGeo.on('location', this.onLocation.bind(this));
    this.bgGeo.on('motionchange', this.onMotionChange.bind(this));
    this.bgGeo.on('http', this.onHttpSuccess.bind(this), this.onHttpFailure.bind(this));
    this.bgGeo.on('providerchange', this.onProviderChange.bind(this));
 
    this.bgGeo.getState((state) => {
      this.state = state;

      if (!this.isFirstBoot()) {
        // Set current plugin state upon our view.
        this.enabled         = state.enabled;
        this.isMoving        = state.isMoving;
        this.autoSync        = state.autoSync;
        //this.distanceFilter  = state.distanceFilter;
        //this.stopTimeout     = state.stopTimeout;
        this.stopOnTerminate = state.stopOnTerminate;
        this.startOnBoot     = state.startOnBoot;
        this.debug           = state.debug;
      }

      this.bgGeo.configure({
        // Geolocation config
        desiredAccuracy: 10,  // <-- highest possible accuracy
        //distanceFilter: this.distanceFilter,
        // ActivityRecognition config
        stopTimeout: this.stopTimeout,
        locationAuthorizationRequest : 'Always',
        // Application config
        foregroundService: true,
        stopOnTerminate: this.stopOnTerminate,
        locationUpdateInterval: 900,
        fastestLocationUpdateInterval: 5000,
        activityRecognitionInterval: 3000,
        heartbeatInterval: 30,
        preventSuspend: true,
        // HTTP / Persistence config
        method : 'POST',
        httpRootProperty : '.',
        autoSync: true,
        locationTemplate : '{"latitude" : <%= latitude %>, "longitude" : <%= longitude %>, "speed" : <%= speed %>, "timestamp" : "<%= timestamp %>"}',
        debug: !false,
        logLevel: this.bgGeo.LOG_LEVEL_VERBOSE
      }, (state) => {
        console.log('- Configure success: ', state);    
      });  
    });
    this.renewAuthenticationFirebase();
  }

  onToggleEnabled() {
    console.log('-> Enabled: ', this.enabled); 
    if (this.enabled) {
      //this.zone.run(() => {
        //this.testing = setInterval(() => {
          //this.dSpeed = 38;//this.dSpeed == 0 ? 12 : this.dSpeed + (Math.random() > 0.6 ? -1 : 1 ) * Math.floor(Math.random() * (Math.floor(5) - Math.ceil(1))) + Math.ceil(1);
        //  console.log(this.dSpeed); 
        //},1500);
      //});
      this.bgGeo.start((state) => { 
        console.log('-> Start success: ', state);        
      });
    } else {
      //clearInterval(this.testing);
      this.isMoving = false;
      this.bgGeo.stop((state) => {
        this.zone.run(() => {
          this.dSpeed = 0;
        });
        console.log('-> Stop success: ', state);        
      });
    }    
  }

  onClickChangePace() {
    if (!this.enabled) {
      console.log('You cannot changePace while plugin is stopped');
      return;
    }
    this.isMoving = !this.isMoving;

    this.bgGeo.changePace(this.isMoving, () => {
      console.log('-> ChangePace success');
    });
  }

  onLocation(location:any) {        
    this.zone.run(() => {
      let s = this.convertToKMh(location.coords.speed);
      this.dSpeed = isNaN(s) ? this.dSpeed : s;
    });
  }
  
  onMotionChange(isMoving, location) {
    console.log('[event] motionchange, isMoving: ', isMoving, location);   
    this.zone.run(() => {
      this.isMoving = isMoving;
    });
  }

  onProviderChange(provider){
    if(provider.status == this.bgGeo.AUTHORIZATION_STATUS_DENIED){
       alert("O GPS não está habilitado para uso pelo aplicativo!");
    }
  }

  onHttpSuccess(response) {    
    console.log('[event] http: ', response);
  }

  onHttpFailure(response) {
    console.log('[js] http failure: ', JSON.stringify(response));
    //if(response.status == 401)
    this.renewAuthenticationFirebase();
  }

  /**
  * Return true of this is the first time this app has booted.  We store the device.uuid into localStorage
  * as a flag that the app has booted before.
  * @return {Boolean}
  */
  private isFirstBoot() {
    let localStorage = (<any>window).localStorage;
    let isFirstBoot = true;
    if (localStorage.getItem('device.uuid')) {
      isFirstBoot = false;
    } else {
      localStorage.setItem('device.uuid', this.device.uuid);
    }
    return isFirstBoot;
  }

  private renewAuthenticationFirebase(){
    this.afAuth.auth.signInAnonymously().then((user) => {
       this.afAuth.auth.currentUser.getIdToken(true)
          .then((idToken) => {
            this.afToken = idToken;
            this.bgGeo.setConfig({
              url : 'https://cityspeedtest-debug.firebaseio.com/'+ this.device.uuid +'.json?auth=' + this.afToken         
            });
            //console.log('New token: ', idToken);
          })
     }).catch(function(error) {
        console.log(error);
    });
  }

  private convertToKMh(velocidade: any): number {    
    if(isNaN(velocidade) || velocidade < 0)
      return 0;
    else {
      let s = parseFloat(velocidade.toString()) * 3.6;
      return s;
    }
  }
  
  private getGaugeDimension(){
    var dim = this.platform.width() > this.platform.height() ? this.platform.height() : this.platform.width();
    var ratio = dim *  0.2;
    return dim < 400 ? Math.round(dim - ratio) : Math.round(400 - ratio);
  }
}