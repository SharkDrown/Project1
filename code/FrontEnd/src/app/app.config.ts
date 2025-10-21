import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FormsModule } from '@angular/forms';   
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(FormsModule),
    provideClientHydration(withEventReplay()), // Cho SSR/SSG hydration

    // ✅ Đăng ký HttpClient + Interceptor
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          const token = localStorage.getItem('access_token');
          if (token) {
            const authReq = req.clone({
              setHeaders: { Authorization: `Bearer ${token}` }
            });
            return next(authReq);
          }
          return next(req);
        }
      ])
    )
  ]
};
