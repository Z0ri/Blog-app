import {ChangeDetectionStrategy, Component, ElementRef, Input, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCard, MatCardModule} from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsService } from '../../services/posts.service';
import { MatFormFieldModule } from '@angular/material/form-field';

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
  canLike: boolean = true;
  canDislike: boolean = true;

  logged: boolean = false;


  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private elementRef: ElementRef,
    private changeDetector: ChangeDetectorRef
  ){}


  ngOnInit() {
    const element: HTMLElement = this.elementRef.nativeElement.querySelector('.account-img');
    // Fetch and set the account image 
    this.postsService.getPostProfilePic(this.authorId).subscribe((response: any) => {
      this.accountImg = response.profilePic;
      element.style.backgroundImage = `url(${this.accountImg})`;
    });
    this.logged = this.authService.checkLogged();
  }
  

  //on like click
  like() {
    if (this.logged) {
      this.likes += 1;
      this.canLike = true;
      this.postsService.like(this.likes);
    } else {
      this.canLike = false;
      setTimeout(() => {
        this.canLike = true;
        this.changeDetector.detectChanges(); // force the view update
      }, 2000);
    }
  }
  //on dislike click
  dislike(){
    if (this.logged) {
      this.dislikes += 1;
      this.canDislike = true;
      this.postsService.dislike(this.dislikes);
    } else {
      this.canDislike = false;
      setTimeout(() => {
        this.canDislike = true;
        this.changeDetector.detectChanges();
      }, 2000);
    }
  }
  //on comment click
  comment(){
    this.postsService.comment();
  }
}
