import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCard, MatCardModule} from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCard
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent{
  //get parameters
  @Input() title: string = 'post title';
  @Input() url: string = '';
  @Input() description: string = 'post description';
  accountImg: string = 'account_circle.png';
  author: string = '';
  today: Date = new Date();
  loadingDate: string = `${this.today.getDate()}/${this.today.getMonth() + 1}/${this.today.getFullYear()}`;
  
  constructor(private authService: AuthService){}

  
  //on like click
  like(){
    //when route changes or when page is refreshed send a request to the server to update likes
  }
  //on dislike click
  dislike(){
    //when route changes or when page is refreshed send a request to the server to update dislike
  }
  //on comment click
  comment(){
    //add comment function
  }
}
