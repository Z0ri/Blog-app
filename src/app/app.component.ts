import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatDrawer, MatSidenavModule} from '@angular/material/sidenav';
import { MatButton } from '@angular/material/button';
import { NavigationEnd, RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { AuthService } from './services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { filter, firstValueFrom, skip } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { FormGroup, FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommentsService } from './services/comments.service';
import { Router } from '@angular/router';
import { Comment } from './models/comment';
import { CommentComponent } from "./components/comment/comment.component";
import { PostsService } from './services/posts.service';


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
    MatMenuModule,
    CommentComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  @ViewChild('commentsSection') commentsSection!: MatDrawer;
  commentForm!: FormGroup;
  comments: Comment[] = [];
  author: string = "";
  postId: string = "";
  IscommentsSectionOpen = false;

  title = 'blog-app';
  logged: boolean = false;
  username: string = '';

  constructor(
    private cookieService: CookieService,
    private authService: AuthService,
    private commentsService: CommentsService,
    private router: Router
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
    this.commentsService.openCommentsSection
    .pipe(skip(1))
    .subscribe({
      next: (postCredentials: string[]) => {
        this.postId = postCredentials[0]; //get comment's post id
        this.author = postCredentials[1]; //get comment's post's author id
        this.commentsSection.toggle(); // open comments section
        this.IscommentsSectionOpen = !this.IscommentsSectionOpen; //set comment section's status to 'open'
        this.comments = this.commentsService.comments; //get array of comments from comments service
      },
      error: (error) => console.error("Error opening comments section: " + error)
    });
    //subscribe to observable to close comments section when route changes
    this.router.events
    .pipe(
      filter(event=> event instanceof NavigationEnd)
    ).subscribe(()=>{
      if(this.IscommentsSectionOpen){
        this.commentsSection.toggle();
        this.IscommentsSectionOpen = false;
      }
    });
  }
  publish(form: NgForm){
    const commentValue = form.value; // Access the input value
    console.log('Comment:', commentValue);
    this.commentsService.publish(new Comment(this.postId, this.author, form.value.comment)); //publish comment 
    this.comments = this.commentsService.comments; //get array of comments from comments service
    form.reset();
  }
}
