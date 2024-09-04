import { ApplicationConfig } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

// Firebase imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage';


const firebaseConfig = {
  apiKey: "AIzaSyDrH51HlOA_t9KHwYFRmRuCTpyj6zoWi1M",
  authDomain: "blog-app-85fe3.firebaseapp.com",
  databaseURL: "https://blog-app-85fe3-default-rtdb.firebaseio.com",
  projectId: "blog-app-85fe3",
  storageBucket: "blog-app-85fe3.appspot.com",
  messagingSenderId: "1058435592489",
  appId: "1:1058435592489:web:41700991d4882047fc0738"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(),

    // Firebase configuration
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideStorage(() => getStorage())
  ]
};
