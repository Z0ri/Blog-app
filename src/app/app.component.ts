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
  }
  ngOnInit(): void {
    //set username variable to current user's username
    this.authService.getUsername().subscribe((response: any)=>this.username=response);
    if(this.cookieService.get('user')){
      this.logged = true;
    }else{
      this.logged=false;
    }
  }
  // signOut(){
  //   this.authService.signOut();
  //   this.logged = this.authService.logged;
  //   console.log(this.logged);
  // }
  
}
