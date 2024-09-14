import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ChangeDetectorRef, OnDestroy, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { PostsService } from '../../services/posts.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CookieService } from 'ngx-cookie-service';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, of, switchMap, tap } from 'rxjs';

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
export class PostComponent implements OnInit, AfterViewInit {
  @Input() title: string = 'post title';
  @Input() url: string = '';
  @Input() description: string = 'post description';

  likeButton!: HTMLElement;
  dislikeButton!: HTMLElement;
  accountImg_element!: HTMLElement

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
  isAuthor: boolean = false;

  logged: boolean = false;

  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private elementRef: ElementRef,
    private changeDetector: ChangeDetectorRef,
    private cookieService: CookieService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    this.likeButton = this.elementRef.nativeElement.querySelector('.like-btn');
    this.dislikeButton = this.elementRef.nativeElement.querySelector('.dislike-btn');
  }

  async ngOnInit() {
    this.logged = this.authService.checkLogged(); //check if logged

    this.accountImg_element = this.elementRef.nativeElement.querySelector('.account-img'); //get account img element
    // Fetch and set the account image 
    this.postsService.getPostProfilePic(this.authorId).subscribe((response: any) => {
      this.accountImg = response.profilePic;
      this.accountImg_element.style.backgroundImage = `url(${this.accountImg})`;
      this.changeDetector.detectChanges(); // Ensure view updates
    });

    //get likes
    this.postsService.getLikes(this.authorId, this.postId).subscribe((response: any)=>{
      this.likes = Number(response);
      this.changeDetector.detectChanges();
    });
    //get dilikes
    this.postsService.getDislikes(this.authorId, this.postId).subscribe((response: any)=>{
      this.dislikes = Number(response);
      this.changeDetector.detectChanges();
    });

    this.postsService.likesSaved$
    .subscribe((response: string[])=>{
      const likesSaved = response;

      if(likesSaved.includes(this.postId)){
        if(this.likeButton){
          this.likeButton.style.color = "#FFABF3";
        }
        this.liked = true;
        this.changeDetector.detectChanges(); // Ensure view updates
      }
    });
    this.postsService.dislikesSaved$
    .subscribe((response: string[])=>{
      const dislikeSaved = response;
      if(dislikeSaved.includes(this.postId)){
        if(this.dislikeButton){
          this.dislikeButton.style.color = "#FFABF3";
        }
        this.disliked = true;
        this.changeDetector.detectChanges(); // Ensure view updates
      }
    });
    
    localStorage.removeItem(`like-${this.postId}`);
    localStorage.removeItem(`dislike-${this.postId}`);
    this.cookieService.delete(`like-${this.postId}`);
    this.cookieService.delete(`dislike-${this.postId}`);
  }

  handleReaction(action: 'like' | 'dislike') {
    if (this.logged && this.authorId != this.cookieService.get('user')) {
      //*ADD ANIMATION ON CLICK*
      if (action === 'like') {
        if (!this.liked) { //if 'like' status was false
            this.likes += 1; // add like
            this.postsService.addReaction(this.postId, 'like'); //add to liked array
            this.liked = true; //set liked state
            this.likeButton.style.color = "#FFABF3"; //change button style
            this.changeDetector.detectChanges();
            localStorage.setItem(`like-${this.postId}`, this.likes.toString());
            this.cookieService.set(`like-${this.postId}`, 'true'); //set cookie to keep track of status after refresh
            this.cookieService.set(`dislike-${this.postId}`, 'false');
            //if the post was in dislike status, remove dislike
            if(this.disliked == true){
              this.dislikes = Math.max(0, this.dislikes - 1);
              this.postsService.removeReaction(this.postId, 'dislike');
              localStorage.setItem(`dislike-${this.postId}`, this.dislikes.toString());
              this.cookieService.set(`like-${this.postId}`, 'false');
              this.dislikeButton.style.color = "#fff"; //change button style
              this.changeDetector.detectChanges();
            }
            this.disliked = false; // set dislike state to false
        } else { //if like status was true
          this.likes -= 1; //remove a like
          this.postsService.removeReaction(this.postId, 'like');
          localStorage.setItem(`like-${this.postId}`, this.likes.toString());
          this.cookieService.set(`like-${this.postId}`, 'false');

          this.liked = false; //set 'like' state to false
          //change style if unliked
          this.likeButton.style.color = "#fff";
        }
      } else if (action === 'dislike') {
        if (!this.disliked) {
            this.dislikes += 1;
            this.postsService.addReaction(this.postId, 'dislike');
            this.disliked = true;
            this.dislikeButton.style.color = "#FFABF3"; //change button style
            this.changeDetector.detectChanges();
            localStorage.setItem(`dislike-${this.postId}`, this.dislikes.toString());
            this.cookieService.set(`dislike-${this.postId}`, 'true');
            this.cookieService.set(`like-${this.postId}`, 'false');

            if(this.liked == true){
              this.likes = Math.max(0, this.likes - 1);
              this.postsService.removeReaction(this.postId, 'like');
              this.likeButton.style.color = "#fff"; //change button style
              this.changeDetector.detectChanges();
            }
            this.liked = false; //set like state to false
        } else {
          this.dislikes -= 1;
          this.postsService.removeReaction(this.postId, 'dislike');
          localStorage.setItem(`dislike-${this.postId}`, this.dislikes.toString());
          this.cookieService.set(`dislike-${this.postId}`, 'false');
          
          this.disliked = false;
          //change style if undisliked
          this.dislikeButton.style.color = "#fff";
        }
      }
    } else if(!this.logged){
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
    } else if(this.authorId == this.cookieService.get('user')){
      this.isAuthor = true;
      setTimeout(() => {
        this.isAuthor = false;
        this.changeDetector.detectChanges();
      }, 2000);
    }
  }

  comment() {
    console.log(`localstorage('likedPosts'): ${localStorage.getItem("likedPosts")}`);
    console.log(`localstorage('dislikedPosts'): ${localStorage.getItem("dislikedPosts")}`);
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