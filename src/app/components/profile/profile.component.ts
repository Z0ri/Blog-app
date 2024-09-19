import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, viewChild, ViewChild, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { PostComponent } from "../post/post.component";
import { AuthService } from '../../services/auth.service';
import { filter, firstValueFrom } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { FireStorageService } from '../../services/fire-storage.service';
import { PostsService } from '../../services/posts.service';
import { CookieService } from 'ngx-cookie-service';
import { NavigationEnd, Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { CommonModule } from '@angular/common';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, MatIcon, PostComponent, MatError],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy{
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('profilePosts', { read: ViewContainerRef, static: true }) posts!: ViewContainerRef;

  proPic: string | ArrayBuffer | null = "account_circle.png";
  uploadPic: File | null = null;
  userId: string = "";
  visitorId: string = "";
  profilePosts: any[] = [];
  canFollow: boolean = false;
  followers: string[] = [];
  newFollower: string = "";
  removeFollow: boolean = false;

  accountName: string = "";
  followText = "";
  postCounter: number = 0;
  followerCounter: number = 0;
  followingCounter: number = 0;

  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
    private fireStorageService: FireStorageService,
    private postsService: PostsService,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private profileService: ProfileService
  ){}
  ngOnDestroy(): void {
    this.userId = "";
    this.visitorId = "";
  }
  async ngOnInit() {
    this.userId = this.cookieService.get('user');
    //get user id from router if this is not current user's profile
    if(this.cookieService.get('ownerProfile') && this.cookieService.get('ownerProfile')!=this.cookieService.get('user')){
      //means the profile's visitor its owner
      this.userId = this.cookieService.get('ownerProfile');
      this.visitorId = this.cookieService.get('user');
    }
    //on route change
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(()=>{
      //delete cookies
      this.cookieService.delete('visitorId');
      this.cookieService.delete('ownerProfile');
    })
    //get username of the current user
    this.accountName = await firstValueFrom(this.authService.getUsername(this.userId));
    //set profile picture
    this.proPic = await firstValueFrom(this.authService.getProfilePic(this.userId));
    //load posts in the container
    this.postsService.getUserPosts(this.userId).subscribe({
      next: (response: any) => {
        if(response){
          this.profilePosts = [];
          for(let post of Object.keys(response)){
            this.profilePosts.push(response[post]);
          }
          //update post's counter
          this.postCounter = this.profilePosts.length;
          this.changeDetector.detectChanges(); //Ensure view updates
          //create all user's posts
          this.postsService.createUserPosts(this.posts, this.profilePosts);
        }
      },
      error: (error: any) => console.error("Error fetching profile's posts: " + error)
    });

    if(this.cookieService.get('removedFollower')){
      this.newFollower = this.cookieService.get('removedFollower');
      this.removeFollow = true;
    }else{
      this.newFollower = this.cookieService.get('newFollower')
      this.removeFollow = false;
    }

    this.profileService.saveFollowers(this.userId, this.newFollower, this.removeFollow)
    .subscribe({
      next: () => {
        this.profileService.getFollowers(this.userId)
          .subscribe({
            next: (response: string[]) => {
              if(response){
                this.followerCounter = response.length;
                this.changeDetector.detectChanges();
                this.followers = response; //copy of followers in DB
                //check if visitor is a follower
                if(this.followers.includes(this.visitorId)){
                  this.followText = "Unfollow";
                  this.changeDetector.detectChanges();
                }
              }
            },
            error: (error) => console.error("Error fetching follower count: " + error)
          });
      },
      error: (error) => {
        console.error("Error saving followers:", error.message);
        this.profileService.getFollowers(this.userId)
          .subscribe({
            next: (response: string[]) => {
              this.followerCounter = response.length;
              this.changeDetector.detectChanges();
            },
            error: (error) => console.error("Error fetching follower count: " + error)
          });
      }
    });
  
    this.newFollower = ""; //reset new follower
    this.followText = "Follow"; // *to change with DB*
    this.changeDetector.detectChanges();
    //delete cookie
    this.cookieService.delete('newFollower');
    this.cookieService.delete("removedFollower");
  }
  edit(){
    this.fileInput.nativeElement.click(); //simulate the actual click on the element #fileInput
  }
  onSelectedProfilePic(event: any){
    this.uploadPic = event.target.files[0];
    if(this.uploadPic){
      const reader = new FileReader();
      reader.onload = () => {
        this.proPic = reader.result;
      }
      reader.readAsDataURL(this.uploadPic);
      //upload in Firebase Storage
      this.uploadProfilePic();
    }
  }
  uploadProfilePic(){
    if(this.uploadPic){
      const picPath = `profilePictures/${this.uploadPic.name}`;
      this.fireStorageService.uploadFile(picPath, this.uploadPic)
      .then(url => {
        console.log('Profile pictures updated successfully! Download URL:', url);
        //update profile picture in DB
        this.authService.updateProfilePic(url, this.userId).subscribe();
      })
      .catch(error => {
        console.error('Error updating profile picture:', error);
      });
    }
  }
  
  //on follow button click
  follow(){
    if(this.userId != this.cookieService.get('user')){
      if(!this.followers.includes(this.visitorId)){
        this.followerCounter += 1;
        this.followText = "Unfollow";
        this.newFollower = this.visitorId;
        this.followers.push(this.visitorId);
        this.cookieService.set('newFollower', this.newFollower);
        this.cookieService.delete('removedFollower');
      }else{
        this.followerCounter -= 1;
        this.followers = this.followers.filter(id => id!==this.visitorId);
        this.followText = "Follow";
        this.newFollower = "";
        this.cookieService.set('newFollower', this.newFollower);
        this.cookieService.set('removedFollower', this.visitorId);
      }
    }else{
      // *display error*
      console.log("can't follow.");
      this.canFollow = true;
    }
    this.changeDetector.detectChanges(); //Ensure view updates
  }
}
