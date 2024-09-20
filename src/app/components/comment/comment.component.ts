import { Component, Input } from '@angular/core';
import { CommentsService } from '../../services/comments.service';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent {
  @Input() username: string = "";
  @Input() content: string = "";

  postId: string = "";



  constructor(
    private commentsService: CommentsService
  ){}



  seeProfile(){
    //see profile
    console.log(`Viewing profile for: ${this.username}`);
  }
}
