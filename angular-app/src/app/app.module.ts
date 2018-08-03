import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

import { AuthInterceptor } from './services/httpinterceptor' // authorization interceptor
import { AppRoutingModule } from './app-routing.module';

import { DataService } from './services/data.service';
import { AuthService } from './services/auth.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';

import { ProsumerComponent } from './pages/Prosumer/Prosumer.component';
import { ConsumerComponent } from './pages/Consumer/Consumer.component';

import { TransactionComponent } from './pages/Transaction/Transaction.component';

import { DashboardComponent } from './pages/Dashboard/Dashboard.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,

    TransactionComponent,

    ProsumerComponent,
    ConsumerComponent,

    DashboardComponent,
		
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    DataService,
    AuthService,
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
