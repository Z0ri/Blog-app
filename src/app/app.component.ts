import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MatButton } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { AuthService } from './services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatButton,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'blog-app';
  logged: boolean = false;
  username: string = '';
  constructor(
    private cookieService: CookieService,
    private router: Router,
    private authService: AuthService
  ){
    this.logged = authService.logged;
  }
  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(()=>{
      this.onRouteChange();
    });
    this.getUsername();
  }
  onRouteChange() {
    if(this.cookieService.get("user")){
      this.authService.logged = true;
    }else{
      this.authService.logged = false;
    }
  }
  // signOut(){
  //   this.authService.signOut();
  //   this.logged = this.authService.logged;
  //   console.log(this.logged);
  // }
  getUsername(): string {
    this.authService.getCurrentUser()
    .subscribe((response: any) => {
      if (response && response.username) {
        this.username = response.username;
      } else {
        console.log("getUsername(): ")
        console.log(response);
        console.error('Username not found in the response.');
      }
    });
    return '';
  }
  
}
