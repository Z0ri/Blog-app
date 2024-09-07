import {ChangeDetectionStrategy, Component, ElementRef, Input, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCard, MatCardModule} from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PostsService } from '../../services/posts.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCard
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
  accountImg: string = '';
  author: string = '';
  authorId: string = '';
  postId: string = '';
  today: Date = new Date();
  loadingDate: string = `${this.today.getDate()}/${this.today.getMonth() + 1}/${this.today.getFullYear()}`;
  
  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private elementRef: ElementRef
  ){}


  ngOnInit() {
    const element: HTMLElement = this.elementRef.nativeElement.querySelector('.account-img');
    // Fetch and set the account image 
    this.postsService.getPostProfilePic(this.authorId).subscribe((response: any) => {
      this.accountImg = response.profilePic;
      element.style.backgroundImage = `url(${this.accountImg})`;
    });
  }
  

  //on like click
  like(){
    //when route changes or when page is refreshed send a request to the server to update likes
    //add style change when clicked
  }
  //on dislike click
  dislike(){
    //when route changes or when page is refreshed send a request to the server to update dislike
    //add style change when clicked
  }
  //on comment click
  comment(){
    //add comment function
    //add style change when clicked
  }
}
