import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';
import { AuthData } from './response'
import 'rxjs/add/operator/catch';


@Injectable()
export class AuthService {

    // this is only used for development; put credential information to ENV for production
    private authUrl = "https://sea.authentication.sap.hana.ondemand.com/oauth/token?grant_type=client_credentials";
    private clientId = ""; // type your client id for sap cloud platform hyperledger fabric service
    private clientSecret = ""; // type your client secret for sap cloud platform hyperledger fabric service
    private httpOptions = { headers: new HttpHeaders({ 'Authorization': "Basic " + btoa(this.clientId + ":" + this.clientSecret) }) };

    constructor( private http: HttpClient, private cookieService: CookieService ) { }

    authorize() {
        return this.http.get<AuthData>(this.authUrl, this.httpOptions)
    }

    getToken() {
        return this.cookieService.get('AccessToken')
    }

}