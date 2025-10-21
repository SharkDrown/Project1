import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import AOS from 'aos';

// import { provideRouter } from '@angular/router'; //
// import { routes } from './app/app.routes'; //

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    AOS.init();
  })
  .catch((err) => console.error(err));
