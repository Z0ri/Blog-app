import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatDrawer, MatSidenavModule} from '@angular/material/sidenav';
import { MatButton } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { AuthService } from './services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { FormGroup, FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommentsService } from './services/comments.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatButton,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  @ViewChild('commentsSection') commentsSection!: MatDrawer;
  title = 'blog-app';
  logged: boolean = false;
  username: string = '';
  commentForm!: FormGroup;
  constructor(
    private cookieService: CookieService,
    private authService: AuthService,
    private commentsService: CommentsService
  ){
  }
  async ngOnInit(){
    //set username variable to current user's username
    this.username = await firstValueFrom(this.authService.getUsername(this.cookieService.get('user')));
    if(this.cookieService.get('user')){
      this.logged = true;
    }else{
      this.logged=false;
    }
    //subscribe to observable to open comments section
    this.commentsService.openCommentsSection.subscribe({
      next: (postId: string) => {
        console.log(postId)
        this.commentsSection.toggle();
      },
      error: (error) => console.error("Error opening comments section: " + error)
    });
  }
  showFiller = false;
  comment(form: NgForm){
    
  }
}
