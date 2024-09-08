import {ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCard, MatCardModule} from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsService } from '../../services/posts.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCard,
    MatFormFieldModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent implements OnInit{
  //get parameters
  @Input() title: string = 'post title';
  @Input() url: string = '';
  @Input() description: string = 'post description';
  accountImg: string = 'account_circle.png';
  author: string = '';
  authorId: string = '';
  postId: string = '';
  today: Date = new Date();
  loadingDate: string = `${this.today.getDate()}/${this.today.getMonth() + 1}/${this.today.getFullYear()}`;
  
  likes: number = 0;
  dislikes: number = 0;

  liked: boolean = false;
  disliked: boolean = false;

  canLike: boolean = true;
  canDislike: boolean = true;
  canComment: boolean = true;
  
  logged: boolean = false;


  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private elementRef: ElementRef,
    private changeDetector: ChangeDetectorRef,
    private cookieService: CookieService
  ){}


  ngOnInit() {
    const element: HTMLElement = this.elementRef.nativeElement.querySelector('.account-img');
    // Fetch and set the account image 
    this.postsService.getPostProfilePic(this.authorId).subscribe((response: any) => {
      this.accountImg = response.profilePic;
      element.style.backgroundImage = `url(${this.accountImg})`;
    });
    this.logged = this.authService.checkLogged();
    if (this.logged) {
      // Generate the unique cookie key using the user and post ID
      const likeCookieKey = `like-${this.cookieService.get('user')}-${this.postId}`;
      
      // Check the cookie for like status
      const likeStatus = this.cookieService.get(likeCookieKey);
      this.liked = likeStatus === 'true'; // Set liked status based on cookie
      //add a like if 'like' cookie is set to true
      if(this.cookieService.get(`like-${this.cookieService.get('user')}-${this.postId}`) == 'true'){
        this.likes += 1;
      }
      //add a dislike if 'dislike' cookie is set to true
      if(this.cookieService.get(`dislike-${this.cookieService.get('user')}-${this.postId}`) == 'true'){
        this.dislikes += 1;
      }
    }
  }
  

  handleReaction(action: 'like' | 'dislike') {
    if (this.logged) {
      // Generate unique cookie keys based on action
      const cookieKey = `${action}-${this.cookieService.get('user')}-${this.postId}`;
      
      // Determine the current state and perform the action
      if (action === 'like') {
        if (!this.liked) {
          this.likes += 1;// Add like
          this.liked = true;
          this.disliked = false; // Ensure dislike is removed if the post is liked
          this.dislikes = Math.max(0, this.dislikes - 1); // Ensure dislikes don't go negative
          this.cookieService.set(cookieKey, 'true', 365); // Set like cookie
          this.cookieService.set(`dislike-${this.cookieService.get('user')}-${this.postId}`, 'false', 365); // Remove dislike cookie
        } else {
          // Remove like
          this.likes -= 1;
          this.liked = false;
          this.cookieService.set(cookieKey, 'false', 365); // Update like cookie
        }
      } else if (action === 'dislike') {
        if (!this.disliked) {
          // Add dislike
          this.dislikes += 1;
          this.disliked = true;
          this.liked = false; // Ensure like is removed if the post is disliked
          this.likes = Math.max(0, this.likes - 1); // Ensure likes don't go negative
          this.cookieService.set(cookieKey, 'true', 365); // Set dislike cookie
          this.cookieService.set(`like-${this.cookieService.get('user')}-${this.postId}`, 'false', 365); // Remove like cookie
        } else {
          // Remove dislike
          this.dislikes -= 1;
          this.disliked = false;
          this.cookieService.set(cookieKey, 'false', 365); // Update dislike cookie
        }
      }
    } else {
      // Display error message when user is not logged in
      if (action === 'like') {
        this.canLike = false;
      } else {
        this.canDislike = false;
      }
      setTimeout(() => {
        if (action === 'like') {
          this.canLike = true;
        } else {
          this.canDislike = true;
        }
        this.changeDetector.detectChanges(); // Force the view to update after the message is cleared
      }, 2000);
    }
  }
  
  //on comment click
  comment(){
    if (this.logged) {
      this.canComment = true;
      this.postsService.comment();
    } else {
      this.canComment = false;
      setTimeout(() => {
        this.canComment = true;
        this.changeDetector.detectChanges();
      }, 2000);
    }
  }
}
