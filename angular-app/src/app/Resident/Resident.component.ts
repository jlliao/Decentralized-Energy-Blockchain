import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import 'rxjs/add/operator/toPromise';
import { Resident } from '../participant';

//provide associated components
@Component({
  selector: 'app-Resident',
  templateUrl: './Resident.component.html',
  styleUrls: ['./Resident.component.css'],
})

//ResidentComponent class
export class ResidentComponent implements OnInit {

  //define variables
  myForm: FormGroup;

  private resident: Resident;
  private residentID = "ID100";
  private errorMessage;
  private successMessage;

  //initialize form variables
  name = new FormControl("", Validators.required);
  coinsValue = new FormControl("", Validators.required);
  tokenValue = new FormControl("", Validators.required);

  constructor(private dataService: DataService, private auth: AuthService, fb: FormBuilder) {
    //intialize form
    this.myForm = fb.group({
      name: this.name,
      coinsValue: this.coinsValue,
      tokenValue: this.tokenValue
    });
  };

  ngOnInit(): void {
    this.auth.authenticate();
  }

  //add Resident participant
  add(): void {
    //create resident participant json
    this.resident = {
      "id": this.residentID,
      "name": this.name.value,
      "coins": this.coinsValue.value,
      "token": this.tokenValue.value
    };

    let httpOptions = {
      headers: new HttpHeaders ({
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${this.auth.accessToken}`
      }),
      withCredentials: true
    };

    this.dataService.addResident(this.resident, httpOptions)
      .subscribe(() => this.successMessage = "Prosumer added", 
                 (error) => this.errorMessage = error);
  }

  delete(): void {
    let httpOptions = {
      headers: new HttpHeaders ({
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${this.auth.accessToken}`
      }),
      withCredentials: true
    };

    this.dataService.deleteResident(this.residentID, httpOptions)
    .subscribe(() => {
      this.successMessage = "Prosumer Deleted";
    }, (error) => this.errorMessage = error);
  }

}
