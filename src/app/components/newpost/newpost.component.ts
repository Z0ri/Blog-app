import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; 
import { ImgurService } from '../../services/imgur.service';

@Component({
  selector: 'app-newpost',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './newpost.component.html',
  styleUrl: './newpost.component.css'
})
export class NewpostComponent {
  selectedFile: File | null = null;
  newpostForm: FormGroup;
  constructor(private imgurService: ImgurService) {
    this.newpostForm = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.minLength(5)]),
      description: new FormControl('', [Validators.required, Validators.maxLength(255)])
    });
  }


  onSubmit(){
    if(this.newpostForm.valid){
      console.log(this.newpostForm.value);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.uploadFile();
    }
  }

  uploadFile(): void {
    if (this.selectedFile) {
      this.imgurService.uploadImage(this.selectedFile);
    }
  }
}
