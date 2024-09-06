import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { PostComponent } from "../post/post.component";
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { FireStorageService } from '../../services/fire-storage.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatIcon, PostComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  proPic: string | ArrayBuffer | null = "account_circle.png";
  uploadPic: File | null = null;
  accountName: string = "";

  constructor(
    private authService: AuthService,
    private fireStorageService: FireStorageService
  ){}
  async ngOnInit() {
    //get username of the current user
    this.accountName = await firstValueFrom(this.authService.getUsername());
    //set profile picture
    this.proPic = await firstValueFrom(this.authService.getProfilePic());
    console.log(`propic: ${this.proPic}`)
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
        this.authService.updateProfilePic(url).subscribe();
      })
      .catch(error => {
        console.error('Error updating profile picture:', error);
      });
    }
  }
}
