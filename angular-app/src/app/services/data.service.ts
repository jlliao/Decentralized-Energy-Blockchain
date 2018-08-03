import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { Account, UpdateAccount, Transaction } from './response';


@Injectable()
export class DataService {
    private serverUrl = "https://hyperledger-fabric.cfapps.sap.hana.ondemand.com/api/v1";
    private chaincodeId = ""; // type your own chaincode id
    private actionUrl = this.serverUrl + "/chaincodes/" + this.chaincodeId + "/latest";
    private myjsonUrl = "https://api.myjson.com/bins/1g3idq"; // store data from Raspberry Pi


    constructor(private http: HttpClient) { }

    public getAccount(id: string) {
        console.log('Read Account ID: ' + id);

        return this.http.get<Account>(this.actionUrl + "/" + id)
            .catch(this.handleError);
    }

    public addAccount(account: Account) {
        console.log('Create Account Object: ', JSON.stringify(account));

        return this.http.post(this.actionUrl + "/create", account)
            .catch(this.handleError);
    }

    public updateAccount(id: string, accountToUpdate: UpdateAccount) {
        console.log('Update Account ID: ', id);
        console.log('Update Account Object: ', JSON.stringify(accountToUpdate));

        return this.http.post(`${this.actionUrl}/${id}/update`, accountToUpdate)
            .catch(this.handleError);
    }

    public deleteAccount(id: string) {
        console.log('Delete Account ID: ' + id);

        return this.http.delete(this.actionUrl + '/' + id)
            .catch(this.handleError);
    }

    public transact(transaction: Transaction[]) {
        console.log('Transact Object: ', JSON.stringify(transaction));

        return this.http.post(this.actionUrl + '/transact', transaction)
            .catch(this.handleError);
    }

    public getPi() {

        return this.http.get<Transaction[]>(this.myjsonUrl)
            .catch(this.handleError)
    }

    public getHistory(id: string) {
        console.log('History ', id);

        return this.http.get<Object[]>(`${this.actionUrl}/${id}/history`)
            .catch(this.handleError);
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
