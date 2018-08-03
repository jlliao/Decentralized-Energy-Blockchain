import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/catch';

import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private inj: Injector, private router: Router) { }

    private actionUrl = 'hyperledger-fabric.cfapps.sap.hana.ondemand.com'

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        let authService = this.inj.get(AuthService); // authservice is an authentication service  
        // Get the auth header from the service.
        const token = authService.getToken();

        // Ignore get-token request
        if (req.url.includes(this.actionUrl)) {
            // Clone the request to add the new header.
            req = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + token), withCredentials: true });
        }

        // Pass on the cloned request instead of the original request.
        return next.handle(req)
            .catch((error, caught) => {

                // return any error 
                return Observable.throw(error);

            }) as any;
    }
}