import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AuthData } from './participant'
import 'rxjs/add/operator/catch';


@Injectable()
export class AuthService {
    // allow public access token 

    public authUrl = "https://sea.authentication.sap.hana.ondemand.com/oauth/token?grant_type=client_credentials"; // set auth url
    private clientId = ""; // copy client id form sap cloud platform 
    private clientSecret = ""; // copy client secret from sap cloud platform
    private httpOptions = { headers: new HttpHeaders({ 'Authorization': "Basic " + btoa(this.clientId + ":" + this.clientSecret) }) };

    public accessToken: string;

    constructor(
        private http: HttpClient) { }

    public postCredentials() {
        console.log('Get Access Token')
        return this.http.get<AuthData>(this.authUrl, this.httpOptions)
                        .catch(this.handleError);
    }

    public authenticate(): void {
        this.postCredentials()
            .subscribe((data) => {this.accessToken = data.access_token});
    }

    public getAccessToken() {
        return this.accessToken
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', error.error.message);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
          console.error(
            `Backend returned code ${error.status}, ` +
            `body was: ${error.error}`);
        }

        let errMsg = (error.message) ? error.message :
          error.status ? `${error.status} - ${error.statusText}` : 'Server error';

        // return an observable with a user-facing error message
        return Observable.throw(errMsg);
    };

}