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
  CommentPostId: string = "";
  PostAuthorId: string = "";
  IscommentsSectionOpen = false;

  title = 'blog-app';
  logged: boolean = false;
  username: string = '';

  constructor(
    private cookieService: CookieService,
    private authService: AuthService,
    private commentsService: CommentsService,
    private postsService: PostsService,
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
    this.commentsService.openCommentsSection$
    .pipe(skip(1))
    .subscribe({
      next: (postInfo: string[]) => {
        const newPostId = postInfo[0];
        const newPostAuthorId = postInfo[1];
    
        if (this.IscommentsSectionOpen) {
          if (this.CommentPostId === newPostId) {
            this.commentsSection.toggle();
            this.IscommentsSectionOpen = false;
            this.comments = [];
          } else {
            this.CommentPostId = newPostId;
            this.PostAuthorId = newPostAuthorId;
          }
        } else {
          this.commentsSection.toggle();
          this.IscommentsSectionOpen = true;
          this.CommentPostId = newPostId;
          this.PostAuthorId = newPostAuthorId;
        }
    
        this.commentsService.getComments(this.CommentPostId, this.PostAuthorId).subscribe({
          next: (comments: Comment[]) => {
            this.comments = comments || [];
          },
          error: (error) => console.error("Error fetching comments: " + error)
        });
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




  publishComment(form: NgForm) {
    const commentContent = form.value.comment;
    const authorId = this.cookieService.get('user');
  
    // Retrieve the profile picture using the authorId
    this.authService.getProfilePic(authorId).subscribe({
      next: (profilePic: string) => {
        // Create a new Comment instance with the profile picture
        const newComment = new Comment(this.CommentPostId, authorId, profilePic, this.username, commentContent);
        
        this.commentsService.publish(newComment, this.PostAuthorId)
        .subscribe({
          next: (response: any) => {
            console.log(`Comment successfully published: ${response}`);
            this.comments = this.commentsService.comments; // Get array of comments from comments service
            this.commentsService.updateComments$.next(this.CommentPostId); // Update comments UI
          },
          error: (error: any) => {
            console.error(`Error publishing comment: ${error.value}`);
          }
        });
      },
      error: (error: any) => {
        console.error(`Error retrieving profile picture: ${error}`);
      }
    });
  
    form.reset();
  }
  
}