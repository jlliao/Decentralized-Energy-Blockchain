import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';
import { AuthData } from './response'
import 'rxjs/add/operator/catch';


@Injectable()
export class AuthService {

    // this is only used for development; put credential information to ENV for production
    private authUrl = "https://sea.authentication.sap.hana.ondemand.com/oauth/token?grant_type=client_credentials";
    private clientId = "sb-3461d4a5-b51f-4f6b-b22d-d70257e1f485!b2477|na-54bc25f3-f937-40b7-8b33-ffe240899cf0!b342";
    private clientSecret = "CCQEaNRt3BVel2JCvNq+m3w/XMg=";
    private httpOptions = { headers: new HttpHeaders({ 'Authorization': "Basic " + btoa(this.clientId + ":" + this.clientSecret) }) };

    constructor( private http: HttpClient, private cookieService: CookieService ) { }

    authorize() {
        return this.http.get<AuthData>(this.authUrl, this.httpOptions)
    }

    getToken() {
        return this.cookieService.get('AccessToken')
    }

}