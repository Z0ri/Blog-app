import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
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
  @ViewChild('comments', { read: ViewContainerRef }) commentsContainer!: ViewContainerRef;
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
          // If comments section is opened & the comment button clicked is of the same post (close)
          if (this.CommentPostId === newPostId) {
            this.commentsSection.toggle();
            this.IscommentsSectionOpen = false;
            this.comments = [];
            this.commentsContainer.clear(); // Delete comments from UI
          } else { // Open
            this.CommentPostId = newPostId;
            this.PostAuthorId = newPostAuthorId;
            this.commentsContainer.clear(); // Delete comments from UI
            this.commentsService.createAllComments(this.commentsContainer, this.CommentPostId, this.PostAuthorId);
          }
        } else {
          // Open
          this.commentsSection.toggle();
          this.IscommentsSectionOpen = true;
          this.CommentPostId = newPostId;
          this.PostAuthorId = newPostAuthorId;
          this.commentsService.createAllComments(this.commentsContainer, this.CommentPostId, this.PostAuthorId);
        }

      // Fetch and update comments
      this.commentsService.getComments(this.CommentPostId, this.PostAuthorId).subscribe({
        next: (comments: Comment[]) => {
          this.comments = comments || [];
          // Optionally update UI with new comments here if needed
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


  publishComment(form: NgForm){
    if(form.value.comment){
      
      const commentContent = form.value.comment;
      const authorId = this.cookieService.get('user');
      const newComment = new Comment(this.CommentPostId, authorId, '', this.username, commentContent);
  
      this.commentsService.publish(newComment, this.PostAuthorId, this.commentsContainer)
      .subscribe({
        next: () => {
          this.commentsService.updateComments$.next(this.CommentPostId);
        },
        error: error => console.error("Error adding comment: " + error)
      })
      form.reset();
    }
  }


  
}