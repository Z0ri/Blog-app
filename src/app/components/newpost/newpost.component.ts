import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; 
import { ImgurService } from '../../services/imgur.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-newpost',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './newpost.component.html',
  styleUrl: './newpost.component.css'
})
export class NewpostComponent {
  selectedImage: string | ArrayBuffer | null = null;
  newpostForm: FormGroup;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  constructor(private imgurService: ImgurService) {
    this.newpostForm = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.minLength(5)]),
      description: new FormControl('', [Validators.required, Validators.maxLength(255)])
    });
  }


  onSubmit(){
    if (this.selectedImage) {
      const imageData = this.selectedImage.toString().split(',')[1];

      // this.imgurService.uploadImage(imageData).subscribe(
      //   (response) => {
      //     console.log('Image uploaded successfully:', response);
      //   },
      //   (error) => {
      //     console.error('Error uploading image:', error);
      //   }
      // );
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
