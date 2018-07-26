import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { DataService } from './data.service';
import { AuthService } from './auth.service';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';

import { ResidentComponent } from './Resident/Resident.component';
import { ResidentCarComponent } from './ResidentCar/ResidentCar.component';

import { TransactionRRComponent } from './TransactionRR/TransactionRR.component';

import { DashboardComponent } from './Dashboard/Dashboard.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,

    TransactionRRComponent,

    ResidentComponent,
    ResidentCarComponent,

    DashboardComponent,
		
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    HttpModule
  ],
  providers: [
    DataService,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
