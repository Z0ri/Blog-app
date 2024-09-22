import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommentsService } from '../../services/comments.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent implements AfterViewInit{
  @ViewChild('profilePicture') profilePictureEl!: ElementRef;
  authorId: string = "";
  username: string = "";
  content: string = "";
  profilePicture: string = "";



  constructor(
    private commentsService: CommentsService,
    private changeDetector: ChangeDetectorRef,
    private authService: AuthService,
    private cookieService: CookieService,
    private router: Router
  ){}


  ngAfterViewInit(): void {
    this.authService.getProfilePic(this.authorId)
    .subscribe({
      next: (profilePic: string)=>{
        this.profilePicture = profilePic;
        this.profilePictureEl.nativeElement.style.backgroundImage = `url('${this.profilePicture}')`;
        this.changeDetector.detectChanges();
      },
      error: error => console.error("Error fetching the profile picture: " + error)
    });
  }



  seeProfile(){
    //see profile
    this.cookieService.set('ownerProfile', this.authorId);
    this.router.navigate(['/profile']);
  }
}