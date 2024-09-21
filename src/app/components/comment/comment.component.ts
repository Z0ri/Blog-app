import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommentsService } from '../../services/comments.service';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent implements AfterViewInit{
  @ViewChild('profilePicture') profilePictureEl!: ElementRef;
  @Input() authorId: string = "";
  @Input() username: string = "";
  @Input() content: string = "";
  @Input() profilePic: string = "";



  constructor(
    private commentsService: CommentsService,
    private changeDetector: ChangeDetectorRef
  ){}


  ngAfterViewInit(): void {
    this.profilePictureEl.nativeElement.style.backgroundImage = `url(${this.profilePic})`;
    this.changeDetector.detectChanges();
  }



  seeProfile(){
    //see profile
    console.log(`Viewing profile for: ${this.username}`);
  }
}