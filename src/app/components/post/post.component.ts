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
import { filter, map, switchMap } from 'rxjs';

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

    //Save previous likes/dislikes when page refreshes
    this.saveLikes();// Save likes 
    this.saveDislikes();// Save dislikes
    
    //Save likes/dislikes when route changes
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.saveLikes();
      this.saveDislikes();
      this.checkReaction();
    });

    //check if post was liked by the user before
    this.postsService.getLikedPosts()
    .subscribe((response: string[]) => {
      if (response && response.includes(this.postId)) {
        this.likeButton.style.color = "#FFABF3";
        this.liked = true;
        this.changeDetector.detectChanges(); // Ensure view updates
        //if(cookieService.get('liked') == 'true'){}
      }
    })

    /*check if post is post liked or disliked section*/
    //check if post was disliked by the user before
    this.postsService.getDislikedPosts()
    .subscribe((response: string[])=>{
      if(response){
        if(response.includes(this.postId)){
          this.dislikeButton.style.color = "#FFABF3";
          this.disliked = true;
          this.changeDetector.detectChanges(); //Ensure view updates
        }
      }
    })
    
    this.checkReaction();
    
    localStorage.removeItem(`like-${this.postId}`);
    localStorage.removeItem(`dislike-${this.postId}`);
  }

  //Check reaction when updating the page for the first time, meaning that post has still not been added to liked or disliked post section
  checkReaction() {
    if (localStorage.getItem(`like-${this.postId}`)) {
      this.postsService.addLikedPost(this.postId)
        .pipe(
          switchMap(() => this.postsService.getLikedPosts())
        )
        .subscribe({
          next: (response: string[]) => {
            if (response && response.includes(this.postId)) {
              this.likeButton.style.color = "#FFABF3";
              this.liked = true;
              this.changeDetector.detectChanges(); // Ensure view updates
            }
          },
          error: (error) => {
            // Handle error if necessary
            console.error('Error checking reactions', error);
          }
        });
    }
    if (localStorage.getItem(`dislike-${this.postId}`)) {
      this.postsService.addDislikedPost(this.postId)
        .pipe(
          switchMap(() => this.postsService.getDislikedPosts())
        )
        .subscribe({
          next: (response: string[]) => {
            if (response && response.includes(this.postId)) {
              this.dislikeButton.style.color = "#FFABF3";
              this.disliked = true;
              this.changeDetector.detectChanges(); // Ensure view updates
            }
          },
          error: (error) => {
            // Handle error if necessary
            console.error('Error checking reactions', error);
          }
        });
    }
  }
  

  //save likes in DB
  saveLikes() {
    const savedLikes = localStorage.getItem(`like-${this.postId}`);

    this.postsService.saveLikes(this.authorId, this.postId, parseInt(savedLikes || "0", 10))
    .subscribe(()=>{
      //get likes
      this.postsService.getLikes(this.authorId, this.postId).subscribe((response: any)=>{
        this.likes = Number(response);
        this.changeDetector.detectChanges();
      });
    })
  }
  
  //save dislikes in DB
  saveDislikes(){
    const savedDislikes = localStorage.getItem(`dislike-${this.postId}`);
    
    this.postsService.saveDislikes(this.authorId, this.postId, parseInt(savedDislikes || "0", 10))
    .subscribe(()=>{
      //get dilikes
      this.postsService.getDislikes(this.authorId, this.postId).subscribe((response: any)=>{
        this.dislikes = Number(response);
        this.changeDetector.detectChanges();
      });
    })
  }

  handleReaction(action: 'like' | 'dislike') {
    if (this.logged && this.authorId != this.cookieService.get('user')) {
      //*ADD ANIMATION ON CLICK*
      if (action === 'like') {
        if (!this.liked) { //if 'like' status was false
            this.likes += 1; // add like
            this.liked = true; //set liked state
            this.likeButton.style.color = "#FFABF3"; //change button style
            this.changeDetector.detectChanges();
            localStorage.setItem(`like-${this.postId}`, this.likes.toString());
            
            //if the post was in dislike status, remove dislike
            if(this.disliked == true){
              this.dislikes = Math.max(0, this.dislikes - 1);
              localStorage.setItem(`dislike-${this.postId}`, this.dislikes.toString());
              this.dislikeButton.style.color = "#fff"; //change button style
              this.changeDetector.detectChanges();
            }
            this.disliked = false; // set dislike state to false
        } else { //if like status was true
          this.likes -= 1; //remove a like
          localStorage.setItem(`like-${this.postId}`, this.likes.toString());
          this.liked = false; //set 'like' state to false
          //change style if unliked
          this.likeButton.style.color = "#fff";
        }
      } else if (action === 'dislike') {
        if (!this.disliked) {
            this.dislikes += 1;
            this.disliked = true;
            this.dislikeButton.style.color = "#FFABF3"; //change button style
            this.changeDetector.detectChanges();
            localStorage.setItem(`dislike-${this.postId}`, this.dislikes.toString());

            if(this.liked == true){
              this.likes = Math.max(0, this.likes - 1);
              this.likeButton.style.color = "#fff"; //change button style
              this.changeDetector.detectChanges();
            }
            this.liked = false; //set like state to false
        } else {
          this.dislikes -= 1;
          localStorage.setItem(`dislike-${this.postId}`, this.dislikes.toString());
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