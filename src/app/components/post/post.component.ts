import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCard, MatCardModule} from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

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
export class PostComponent {
  accountImg: string = 'account_circle.png';
  today: Date = new Date();
  loadingDate: string = `${this.today.getDay()}/${this.today.getMonth()}/${this.today.getFullYear()}`;
  accountName: string = 'account name';
  description: string = 'post description';
  imageSrc: string = '';
  title: string = '';

  like(){

  }
  dislike(){
    
  }
}
