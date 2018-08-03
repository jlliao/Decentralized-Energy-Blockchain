import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './services/auth.service';
import { AuthData } from './services/response';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor( private cookieService: CookieService, private authService: AuthService ) { }

  // get access token when initialized and set a cookie
  ngOnInit(): void {
    this.authService.authorize()
      .subscribe((data: AuthData) => this.cookieService.set( 'AccessToken', data.access_token ));
  }
}

