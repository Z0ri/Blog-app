import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { PostsService } from '../../services/posts.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CookieService } from 'ngx-cookie-service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']  // Corrected from styleUrl to styleUrls
})
export class PostComponent implements OnInit {
  @Input() title: string = 'post title';
  @Input() url: string = '';
  @Input() description: string = 'post description';
  accountImg: string = 'account_circle.png';
  author: string = '';
  authorId: string = '';
  postId: string = '';
  today: Date = new Date();
  loadingDate: string = `${this.today.getDate()}/${this.today.getMonth() + 1}/${this.today.getFullYear()}`;
  
  likes: number = 0; //likes counter
  dislikes: number = 0; //dislikes counter

  liked: boolean = false; //keep track of the like button status
  disliked: boolean = false; //keep track of the dislike button status
  
  // Variables to display errors if not logged
  canLike: boolean = true; 
  canDislike: boolean = true;
  canComment: boolean = true;
  
  logged: boolean = false;

  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private elementRef: ElementRef,
    private changeDetector: ChangeDetectorRef,
    private cookieService: CookieService,
    private router: Router
  ) {}

  ngOnInit() {
    const element: HTMLElement = this.elementRef.nativeElement.querySelector('.account-img');
    
    // Fetch and set the account image 
    this.postsService.getPostProfilePic(this.authorId).subscribe((response: any) => {
      this.accountImg = response.profilePic;
      element.style.backgroundImage = `url(${this.accountImg})`;
      this.changeDetector.detectChanges(); // Ensure view updates
    });

    this.logged = this.authService.checkLogged(); //check if logged
    
    //Save like/dislikes when route changes
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.saveLikes();
      this.saveDislikes();
    });


    // Handle likes
    this.saveLikes();

    // Handle dislikes
    this.saveDislikes();

  }

  saveLikes(){
    this.postsService.getLikes(this.authorId, this.postId)
    .subscribe((response: any) => {
      this.likes = Number(response);
      this.changeDetector.detectChanges();
      if (this.cookieService.get(`like-${this.authorId}-${this.postId}`) === 'true') {
        this.likes+=1;
        this.changeDetector.detectChanges();
        this.postsService.saveLikeDislike(this.authorId, this.postId, this.likes, this.dislikes);
        this.cookieService.set(`like-${this.authorId}-${this.postId}`, 'false');
      }else{
        this.cookieService.set(`like-${this.authorId}-${this.postId}`, 'false');
      }
    });
  }
  saveDislikes(){
    this.postsService.getDislikes(this.authorId, this.postId)
      .subscribe((response: any) => {
        this.dislikes = Number(response);
        this.changeDetector.detectChanges();
        if (this.cookieService.get(`dislike-${this.authorId}-${this.postId}`) === 'true') {
          this.dislikes+=1;
          this.changeDetector.detectChanges();
          this.postsService.saveLikeDislike(this.authorId, this.postId, this.likes, this.dislikes);
          this.cookieService.set(`dislike-${this.authorId}-${this.postId}`, 'false');
        }else{
          this.cookieService.set(`dislike-${this.authorId}-${this.postId}`, 'false');
        }
      });
  }

  handleReaction(action: 'like' | 'dislike') {
    if (this.logged) {
      const cookieKey = `${action}-${this.authorId}-${this.postId}`;

      if (action === 'like') {
        if (!this.liked) {
          this.likes += 1;
          this.liked = true;
          if(this.disliked == true){
            this.dislikes = Math.max(0, this.dislikes - 1);
            this.disliked = false;
          }
          this.cookieService.set(cookieKey, 'true', 365);
          this.cookieService.set(`dislike-${this.authorId}-${this.postId}`, 'false', 365);
        } else {
          this.likes -= 1;
          this.liked = false;
          this.cookieService.set(cookieKey, 'false', 365);
        }
      } else if (action === 'dislike') {
        if (!this.disliked) {
          this.dislikes += 1;
          this.disliked = true;
          if(this.liked == true){
            this.likes = Math.max(0, this.likes - 1);
            this.liked = false;
          }
          this.cookieService.set(cookieKey, 'true', 365);
          this.cookieService.set(`like-${this.authorId}-${this.postId}`, 'false', 365);
        } else {
          this.dislikes -= 1;
          this.disliked = false;
          this.cookieService.set(cookieKey, 'false', 365);
        }
      }
    } else {
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
        this.changeDetector.detectChanges();
      }, 2000);
    }
  }

  comment() {
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