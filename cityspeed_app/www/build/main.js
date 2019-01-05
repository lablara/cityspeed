webpackJsonp([0],{

/***/ 112:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 112;

/***/ }),

/***/ 153:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 153;

/***/ }),

/***/ 196:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HomePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angularfire2_auth__ = __webpack_require__(197);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_device__ = __webpack_require__(202);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var HomePage = /** @class */ (function () {
    function HomePage(platform, navCtrl, navParams, zone, device, afAuth) {
        var _this = this;
        this.platform = platform;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.zone = zone;
        this.device = device;
        this.afAuth = afAuth;
        this.onResumeSubscription = this.platform.resume.subscribe(function () {
            if (_this.enabled && _this.bgGeo) {
                _this.bgGeo.getCurrentPosition(function (location) {
                    var s = this.convertToKMh(location.coords.speed);
                    this.dSpeed = isNaN(s) ? this.dSpeed : s;
                }, function (errorCode) {
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
                });
            }
            console.log('RESUMED');
        });
        this.platform.ready().then(this.configureBackgroundGeolocation.bind(this));
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
    HomePage.prototype.configureBackgroundGeolocation = function () {
        var _this = this;
        this.deviceID = this.device.uuid;
        this.bgGeo = window.BackgroundGeolocation;
        // Listen to events
        this.bgGeo.on('location', this.onLocation.bind(this));
        this.bgGeo.on('motionchange', this.onMotionChange.bind(this));
        this.bgGeo.on('http', this.onHttpSuccess.bind(this), this.onHttpFailure.bind(this));
        this.bgGeo.on('providerchange', this.onProviderChange.bind(this));
        this.bgGeo.getState(function (state) {
            _this.state = state;
            if (!_this.isFirstBoot()) {
                // Set current plugin state upon our view.
                _this.enabled = state.enabled;
                _this.isMoving = state.isMoving;
                _this.autoSync = state.autoSync;
                //this.distanceFilter  = state.distanceFilter;
                //this.stopTimeout     = state.stopTimeout;
                _this.stopOnTerminate = state.stopOnTerminate;
                _this.startOnBoot = state.startOnBoot;
                _this.debug = state.debug;
            }
            _this.bgGeo.configure({
                // Geolocation config
                desiredAccuracy: 10,
                //distanceFilter: this.distanceFilter,
                // ActivityRecognition config
                stopTimeout: _this.stopTimeout,
                locationAuthorizationRequest: 'Always',
                // Application config
                foregroundService: true,
                stopOnTerminate: _this.stopOnTerminate,
                locationUpdateInterval: 900,
                fastestLocationUpdateInterval: 5000,
                activityRecognitionInterval: 3000,
                heartbeatInterval: 30,
                preventSuspend: true,
                // HTTP / Persistence config
                method: 'POST',
                httpRootProperty: '.',
                autoSync: true,
                locationTemplate: '{"latitude" : <%= latitude %>, "longitude" : <%= longitude %>, "speed" : <%= speed %>, "timestamp" : "<%= timestamp %>"}',
                debug: !false,
                logLevel: _this.bgGeo.LOG_LEVEL_VERBOSE
            }, function (state) {
                console.log('- Configure success: ', state);
            });
        });
        this.renewAuthenticationFirebase();
    };
    HomePage.prototype.onToggleEnabled = function () {
        var _this = this;
        console.log('-> Enabled: ', this.enabled);
        if (this.enabled) {
            //this.zone.run(() => {
            //this.testing = setInterval(() => {
            //this.dSpeed = 38;//this.dSpeed == 0 ? 12 : this.dSpeed + (Math.random() > 0.6 ? -1 : 1 ) * Math.floor(Math.random() * (Math.floor(5) - Math.ceil(1))) + Math.ceil(1);
            //  console.log(this.dSpeed); 
            //},1500);
            //});
            this.bgGeo.start(function (state) {
                console.log('-> Start success: ', state);
            });
        }
        else {
            //clearInterval(this.testing);
            this.isMoving = false;
            this.bgGeo.stop(function (state) {
                _this.zone.run(function () {
                    _this.dSpeed = 0;
                });
                console.log('-> Stop success: ', state);
            });
        }
    };
    HomePage.prototype.onClickChangePace = function () {
        if (!this.enabled) {
            console.log('You cannot changePace while plugin is stopped');
            return;
        }
        this.isMoving = !this.isMoving;
        this.bgGeo.changePace(this.isMoving, function () {
            console.log('-> ChangePace success');
        });
    };
    HomePage.prototype.onLocation = function (location) {
        var _this = this;
        this.zone.run(function () {
            var s = _this.convertToKMh(location.coords.speed);
            _this.dSpeed = isNaN(s) ? _this.dSpeed : s;
        });
    };
    HomePage.prototype.onMotionChange = function (isMoving, location) {
        var _this = this;
        console.log('[event] motionchange, isMoving: ', isMoving, location);
        this.zone.run(function () {
            _this.isMoving = isMoving;
        });
    };
    HomePage.prototype.onProviderChange = function (provider) {
        if (provider.status == this.bgGeo.AUTHORIZATION_STATUS_DENIED) {
            alert("O GPS não está habilitado para uso pelo aplicativo!");
        }
    };
    HomePage.prototype.onHttpSuccess = function (response) {
        console.log('[event] http: ', response);
    };
    HomePage.prototype.onHttpFailure = function (response) {
        console.log('[js] http failure: ', JSON.stringify(response));
        //if(response.status == 401)
        this.renewAuthenticationFirebase();
    };
    /**
    * Return true of this is the first time this app has booted.  We store the device.uuid into localStorage
    * as a flag that the app has booted before.
    * @return {Boolean}
    */
    HomePage.prototype.isFirstBoot = function () {
        var localStorage = window.localStorage;
        var isFirstBoot = true;
        if (localStorage.getItem('device.uuid')) {
            isFirstBoot = false;
        }
        else {
            localStorage.setItem('device.uuid', this.device.uuid);
        }
        return isFirstBoot;
    };
    HomePage.prototype.renewAuthenticationFirebase = function () {
        var _this = this;
        this.afAuth.auth.signInAnonymously().then(function (user) {
            _this.afAuth.auth.currentUser.getIdToken(true)
                .then(function (idToken) {
                _this.afToken = idToken;
                _this.bgGeo.setConfig({
                    url: 'https://cityspeedtest-debug.firebaseio.com/' + _this.device.uuid + '.json?auth=' + _this.afToken
                });
                //console.log('New token: ', idToken);
            });
        }).catch(function (error) {
            console.log(error);
        });
    };
    HomePage.prototype.convertToKMh = function (velocidade) {
        if (isNaN(velocidade) || velocidade < 0)
            return 0;
        else {
            var s = parseFloat(velocidade.toString()) * 3.6;
            return s;
        }
    };
    HomePage.prototype.getGaugeDimension = function () {
        var dim = this.platform.width() > this.platform.height() ? this.platform.height() : this.platform.width();
        var ratio = dim * 0.2;
        return dim < 400 ? Math.round(dim - ratio) : Math.round(400 - ratio);
    };
    HomePage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'page-home',template:/*ion-inline-start:"/Users/adson/cityspeed/src/pages/home/home.html"*/'<ion-header no-padding>\n  <ion-toolbar no-padding>\n    <ion-title no-padding text-center>CitySpeed</ion-title>\n  </ion-toolbar>\n</ion-header>\n\n<ion-content scroll="false" color="dark">\n  <ion-grid no-padding style="height:100%">\n    <ion-row>\n      <ion-col>\n          <ion-item style="background-color: rgba(255,255,255,0.8)">\n          <ion-label style="color:#3a88ca; font-weight: 400; letter-spacing: 0px; margin-left: 16px">Monitorar</ion-label>\n          <ion-toggle color="secondary" [(ngModel)]="enabled" (ionChange)="onToggleEnabled()" style="display:block;"></ion-toggle>\n        </ion-item>\n      </ion-col>\n    </ion-row>\n    <ion-row style="height: 100%;">\n      <ion-col text-center align-self-center>\n              <radial-gauge\n                [attr.width]="dimension"\n                [attr.height]="dimension"\n                units="Km/h"\n                title="false"\n                [attr.value]="dSpeed"\n                min-value="0"\n                max-value="180"\n                major-ticks="0,20,40,60,80,100,120,140,160,180"\n                minor-ticks="2"\n                stroke-ticks="false"\n                highlights=\'[\n                            { "from": 0, "to": 140, "color": "rgba(0,0,0,.15)" },\n                            { "from": 140, "to": 145, "color": "rgba(169,11,11,0.1)" },\n                            { "from": 145, "to": 150, "color": "rgba(169,11,11,0.2)" },\n                            { "from": 150, "to": 155, "color": "rgba(169,11,11,0.3)" },\n                            { "from": 155, "to": 160, "color": "rgba(169,11,11,0.4)" },\n                            { "from": 160, "to": 165, "color": "rgba(169,11,11,0.5)" },\n                            { "from": 165, "to": 170, "color": "rgba(169,11,11,0.6)" },\n                            { "from": 170, "to": 175, "color": "rgba(169,11,11,0.6)" },\n                            { "from": 175, "to": 180, "color": "rgba(169,11,11,0.7)" }\n                            ]\'\n                color-plate="#222"\n                color-major-ticks="#f5f5f5"\n                color-minor-ticks="#ddd"\n                color-title="#fff"\n                color-units="#ccc"\n                color-numbers="#eee"\n                color-value-box-rect="rgba(255, 255, 255, 0)"\n                color-value-box-rect-end="rgba(255, 255, 255, 0)"\n                color-value-box-background="rgba(255, 255, 255, 0)"\n                color-value-text-shadow="false"\n                font-value-size="50"\n                color-value-text="#fff"\n                color-value-box-shadow="false"\n                color-needle-start="rgba(240, 128, 128, 1)"\n                color-needle-end="rgba(255, 160, 122, .9)"\n                border-shadow-width="0"\n                border-inner-width="0"\n                border-middle-width="0"\n                value-box="true"\n                value-int="1"\n                value-dec="0"\n                font-value-weight="400"\n                animated="false">\n              </radial-gauge>\n        </ion-col>\n      </ion-row>\n      <!--ion-row>\n        <ion-col>\n          <button ion-button solid (click)="onClickChangePace()" style="width:50px" color="{{isMoving ? \'danger\' : \'secondary\'}}">\n            <ion-icon name="{{isMoving ? \'pause\' : \'play\'}}"></ion-icon>\n          </button>\n        </ion-col>\n      </ion-row-->\n  </ion-grid>\n</ion-content>\n'/*ion-inline-end:"/Users/adson/cityspeed/src/pages/home/home.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* Platform */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* NavController */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* NavParams */],
            __WEBPACK_IMPORTED_MODULE_0__angular_core__["NgZone"],
            __WEBPACK_IMPORTED_MODULE_3__ionic_native_device__["a" /* Device */],
            __WEBPACK_IMPORTED_MODULE_2_angularfire2_auth__["a" /* AngularFireAuth */]])
    ], HomePage);
    return HomePage;
}());

//# sourceMappingURL=home.js.map

/***/ }),

/***/ 203:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SobrePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(41);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var SobrePage = /** @class */ (function () {
    function SobrePage(navCtrl, navParams) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
    }
    SobrePage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'page-sobre',template:/*ion-inline-start:"/Users/adson/cityspeed/src/pages/sobre/sobre.html"*/'<ion-header no-padding>\n  <ion-toolbar no-padding>\n    <ion-title no-padding text-center>CitySpeed</ion-title>\n  </ion-toolbar>\n</ion-header>\n<ion-content>\n	<ion-grid class="panel-sobre">\n	    <ion-row>\n	      <ion-col>\n	        	<p>Este aplicativo é parte do projeto de mestrado do programa de pós-graduação em computação aplicada da Universidade Estadual de Feira de Santana (UEFS).</p>\n\n				<p>A coleta da velocidade é realizada de modo que os dados não possuem identificação do usuário, obtendo a velocidade instantânea aproximada levando em consideração a variação da posição geográfica em determinado intervalo de tempo.</p>\n\n  				<p>Os dados coletados neste aplicativo são enviados para Internet para realização de análise das velocidades veiculares em áreas urbanas.</p>\n	      </ion-col>\n	    </ion-row>\n		<ion-row class="logos">\n			<ion-col><img src="assets/img/logoUEFS.png"/></ion-col>\n			<ion-col><img src="assets/img/logoPGCA.png"/></ion-col>\n			<ion-col><img class="maximize" src="assets/img/logoLARA.png"/></ion-col>\n		</ion-row>\n	</ion-grid>\n</ion-content>'/*ion-inline-end:"/Users/adson/cityspeed/src/pages/sobre/sobre.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* NavParams */]])
    ], SobrePage);
    return SobrePage;
}());

//# sourceMappingURL=sobre.js.map

/***/ }),

/***/ 205:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(206);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(228);


Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_1__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 228:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export debug */
/* unused harmony export firebaseConfig */
/* unused harmony export firebaseDebugConfig */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__ = __webpack_require__(193);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ionic_native_status_bar__ = __webpack_require__(195);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__app_component__ = __webpack_require__(279);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__pages_home_home__ = __webpack_require__(196);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__pages_sobre_sobre__ = __webpack_require__(203);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_angularfire2__ = __webpack_require__(301);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_angularfire2_auth__ = __webpack_require__(197);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10_ng_canvas_gauges_src__ = __webpack_require__(302);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10_ng_canvas_gauges_src___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10_ng_canvas_gauges_src__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__ionic_native_device__ = __webpack_require__(202);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};












var debug = !false;
var firebaseConfig = {
    apiKey: "AIzaSyAgjkDwUWlLOGHFXUQgMnSlajS5xiTnCkE",
    authDomain: "cityspeed-99279.firebaseapp.com",
    databaseURL: "https://cityspeed-99279.firebaseio.com",
    projectId: "cityspeed-99279",
    storageBucket: "cityspeed-99279.appspot.com",
    messagingSenderId: "853347406836"
};
var firebaseDebugConfig = {
    apiKey: "AIzaSyCfar8d9VIBpe9KZ2kDazD5KbSLsbkuCrk",
    authDomain: "cityspeedtest-debug.firebaseapp.com",
    databaseURL: "https://cityspeedtest-debug.firebaseio.com",
    projectId: "cityspeedtest-debug",
    storageBucket: "cityspeedtest-debug.appspot.com",
    messagingSenderId: "853347406836"
};
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["NgModule"])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_5__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_6__pages_home_home__["a" /* HomePage */],
                __WEBPACK_IMPORTED_MODULE_7__pages_sobre_sobre__["a" /* SobrePage */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["c" /* IonicModule */].forRoot(__WEBPACK_IMPORTED_MODULE_5__app_component__["a" /* MyApp */], {}, {
                    links: []
                }),
                __WEBPACK_IMPORTED_MODULE_8_angularfire2__["a" /* AngularFireModule */].initializeApp(debug ? firebaseDebugConfig : firebaseConfig),
                __WEBPACK_IMPORTED_MODULE_9_angularfire2_auth__["b" /* AngularFireAuthModule */],
                __WEBPACK_IMPORTED_MODULE_10_ng_canvas_gauges_src__["GaugesModule"]
            ],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["a" /* IonicApp */]],
            entryComponents: [
                __WEBPACK_IMPORTED_MODULE_5__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_6__pages_home_home__["a" /* HomePage */],
                __WEBPACK_IMPORTED_MODULE_7__pages_sobre_sobre__["a" /* SobrePage */]
            ],
            providers: [
                __WEBPACK_IMPORTED_MODULE_11__ionic_native_device__["a" /* Device */],
                __WEBPACK_IMPORTED_MODULE_4__ionic_native_status_bar__["a" /* StatusBar */],
                __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__["a" /* SplashScreen */],
                { provide: __WEBPACK_IMPORTED_MODULE_1__angular_core__["ErrorHandler"], useClass: __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["b" /* IonicErrorHandler */] }
            ]
        })
    ], AppModule);
    return AppModule;
}());

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 279:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MyApp; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__ = __webpack_require__(195);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__ = __webpack_require__(193);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_home_home__ = __webpack_require__(196);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__pages_sobre_sobre__ = __webpack_require__(203);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var MyApp = /** @class */ (function () {
    function MyApp(platform, statusBar, splashScreen) {
        this.rootPage = __WEBPACK_IMPORTED_MODULE_4__pages_home_home__["a" /* HomePage */];
        this.sobrePage = __WEBPACK_IMPORTED_MODULE_5__pages_sobre_sobre__["a" /* SobrePage */];
        platform.ready().then(function () {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleLightContent();
            //statusBar.backgroundColorByName('darkGray');
            //splashScreen.hide();
        });
    }
    MyApp = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({template:/*ion-inline-start:"/Users/adson/cityspeed/src/app/app.html"*/'<ion-tabs>\n   <ion-tab tabIcon="speedometer" tabTitle="Monitor" [root]="rootPage"></ion-tab>\n   <ion-tab tabIcon="information-circle" tabTitle="Sobre" [root]="sobrePage"></ion-tab>\n </ion-tabs>\n'/*ion-inline-end:"/Users/adson/cityspeed/src/app/app.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* Platform */], __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__["a" /* StatusBar */], __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__["a" /* SplashScreen */]])
    ], MyApp);
    return MyApp;
}());

//# sourceMappingURL=app.component.js.map

/***/ })

},[205]);
//# sourceMappingURL=main.js.map