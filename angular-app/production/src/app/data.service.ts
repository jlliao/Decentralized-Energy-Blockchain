import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';

import { Resident, UpdateResident, Transaction } from './participant';


@Injectable()
export class DataService {
    private serverUrl = "https://hyperledger-fabric.cfapps.sap.hana.ondemand.com/api/v1"; // set your cloud url
    private chaincodeId = ""; // set your chaincode id
    private actionUrl = this.serverUrl + "/chaincodes/" + this.chaincodeId + "/latest";
    private myjsonUrl = "https://api.myjson.com/bins/"; // store data from Raspberry Pi, set your myjson url
    private remoteUrl = "https://api.myjson.com/bins/"; // store latest data from Raspberry Pi to prevent duplicate posting


    constructor(private http: HttpClient, private httpOld: Http) { }

    public getResident(id: string, options?) {
        console.log('Read ' + id);

        return this.http.get<Resident>(this.actionUrl + '/' + id, options)
                        .catch(this.handleError);
    }

    public addResident(account: Resident, options?) {
        console.log('Entered DataService create');
        console.log('account', JSON.stringify(account));

        return this.http.post(this.actionUrl + '/' + "create", account, options)
                        .catch(this.handleError);
    }

    public updateResident(id: string, itemToUpdate: UpdateResident, options?) {
        console.log('Update ');
        console.log('what is the account id?', id);
        console.log('what is the updated item?', JSON.stringify(itemToUpdate));

        return this.http.post(`${this.actionUrl}/${id}/update`, itemToUpdate, options)
                        .catch(this.handleError);
    }

    public deleteResident(id: string, options?) {
        console.log('Delete ' + id);

        return this.http.delete(this.actionUrl + '/' + id, options)
                        .catch(this.handleError);
    }

    public transact(transaction: Transaction[], options?) {
        console.log('Transact ');

        return this.http.post(this.actionUrl + '/transact', transaction, options)
                        .catch(this.handleError);
    }

    public getPi(): Observable<Object[]> {
        console.log('Get Data from Raspberry Pi')

        return this.httpOld.get(this.myjsonUrl)
            .map(this.extractData)
            .catch(this.handleError);
    }

    public getRemote(): Observable<Object[]> {
        console.log('Get Data from Remote')

        return this.httpOld.get(this.remoteUrl)
            .map(this.extractData)
            .catch(this.handleError);
    }

    public putRemote(itemToPut: any) {
        console.log('Put Data to Remote')
        console.log(JSON.stringify(itemToPut))

        return this.httpOld.put(this.remoteUrl, itemToPut)
            .map(this.extractData)
            .catch(this.handleError);
    }

    public getHistory(id: string, options): Observable<Object[]> {
        console.log('History ', id);

        return this.httpOld.get(`${this.actionUrl}/${id}/history`, options)
            .map(this.extractData)
            .catch(this.handleErrorOld);
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

    private handleErrorOld(error: any): Observable<string> {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message :
          error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }

    private extractData(res: Response): any {
        return res.json();
    }

}
