import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { CsrfInterceptor } from './app/services/csrf-interceptor';
import { withInterceptors } from '@angular/common/http';
import { refreshTokenInterceptor } from './app/services/refresh-token.interceptor';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      // Tu interceptor de headers y CSRF
      (req, next) => {
        const jwtToken = localStorage.getItem('token');

        const getCsrfToken = (): string | null => {
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
              return decodeURIComponent(value);
            }
          }
          return null;
        };

        const csrfToken = getCsrfToken();
        const headers: Record<string, string> = {};

        if (jwtToken) headers['Authorization'] = `Bearer ${jwtToken}`;
        if (csrfToken && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
          headers['X-CSRFToken'] = csrfToken;
        }

        req = req.clone({
          withCredentials: true,
          setHeaders: headers
        });

        return next(req);
      },

      // El nuevo interceptor de refresh token
      refreshTokenInterceptor
    ])),
  ],
});