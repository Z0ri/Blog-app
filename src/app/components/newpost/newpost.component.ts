import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; 
import { ImgurService } from '../../services/imgur.service';
import { CommonModule } from '@angular/common';
import { PostComponent } from "../post/post.component";
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-newpost',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    PostComponent,
    MatCardModule,
    MatCardModule,
    MatIconModule,
    MatCard
],
  templateUrl: './newpost.component.html',
  styleUrl: './newpost.component.css'
})
export class NewpostComponent implements OnInit{
  selectedImage: string | ArrayBuffer | null = null;
  newpostForm: FormGroup;
  accountName: string = '';
  description: string = '';
  
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  constructor(private imgurService: ImgurService, private authService: AuthService) {
    this.newpostForm = new FormGroup({
      description: new FormControl('', [Validators.required, Validators.maxLength(255)])
    });
  }
  
  ngOnInit(): void {
    this.authService.getUsername().subscribe((response: any)=>this.accountName=response);
  }


  onSubmit(){
    if (this.selectedImage) {
      const imageData = this.selectedImage.toString().split(',')[1];
      this.uploadFile();
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result;
      };
      reader.readAsDataURL(file);
      this.uploadFile();
    }
  }

  uploadFile(): void {
    if (this.selectedImage) {
      this.imgurService.uploadImage(this.selectedImage);
    }
  }
}
