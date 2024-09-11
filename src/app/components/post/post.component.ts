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
export class PostComponent implements OnInit, AfterViewInit {
  @Input() title: string = 'post title';
  @Input() url: string = '';
  @Input() description: string = 'post description';

  likeButton!: HTMLElement;
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

    //get dislikes
    this.postsService.getDislikes(this.authorId, this.postId).subscribe((response: any)=>{
      this.dislikes = Number(response);
      this.changeDetector.detectChanges();
    });
    
    //Save likes/dislikes when route changes
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.saveLikes();
      this.saveDislikes();
    });

    try{
      this.liked = await this.postsService.checkLikedPost(this.postId); //set 'like' status
      if(this.liked){
        this.likeButton.style.color = "#FFABF3";
      }
    }catch(error){
      console.error("Error checking if post was liked: " + error);
      this.liked = false;
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
          this.liked = true; //set liked status
          localStorage.setItem(`like-${this.postId}`, this.likes.toString());

          //if the post was in dislike status, remove dislike
          if(this.disliked == true){
            this.dislikes = Math.max(0, this.dislikes - 1);
            localStorage.setItem(`dislike-${this.postId}`, this.dislikes.toString());
            this.disliked = false;
          }
        } else { //if like status was true
          this.likes -= 1; //remove a like
          localStorage.setItem(`like-${this.postId}`, this.likes.toString());
          this.liked = false; //set 'like' status to false
          //*CAMBIA STILE*
          this.likeButton.style.color = "#fff";
        }
      } else if (action === 'dislike') {
        if (!this.disliked) {
          this.dislikes += 1;
          localStorage.setItem(`dislike-${this.postId}`, this.dislikes.toString());
          this.disliked = true;
          if(this.liked == true){
            this.likes = Math.max(0, this.likes - 1);
            this.liked = false;
          }
        } else {
          this.dislikes -= 1;
          localStorage.setItem(`dislike-${this.postId}`, this.dislikes.toString());
          this.disliked = false;
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