import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { PostComponent } from "../post/post.component";
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { FireStorageService } from '../../services/fire-storage.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PostsService } from '../../services/posts.service';
import {
  MatSnackBar,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { PostSavingComponent } from '../snackbar/post-saving/post-saving.component';
import { firstValueFrom } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-newpost',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
export class NewpostComponent implements OnInit,  AfterViewInit{
  private _snackBar = inject(MatSnackBar);
  http: HttpClient = inject(HttpClient)
  selectedImage: string | ArrayBuffer | null = null;
  file: File | null = null;
  newpostForm: FormGroup;
  accountName: string = '';
  accountImg: string = "account_circle.png";
  accountImg_element!: HTMLElement;
  title: string = '';
  description: string = '';
  char: number = 0;
  maxChar: number = 250;
  isMaxChar: boolean = false;
  date: Date = new Date();
  loadingDate: string = `${this.date.getDate()}/${this.date.getMonth() + 1}/${this.date.getFullYear()}`;
  
  
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  constructor(
    private authService: AuthService,
    private firestorageService: FireStorageService,
    private postsService: PostsService,
    private cookieService: CookieService,
    private elementRef: ElementRef,
    private changeDetector: ChangeDetectorRef,
    private router: Router
  ) {
    this.newpostForm = new FormGroup({
      description: new FormControl('', [Validators.required, Validators.maxLength(255)])
    });
  }

  ngAfterViewInit(): void {
    this.accountImg_element = this.elementRef.nativeElement.querySelector(".account-img");
  }

  async ngOnInit() {
    const username = await firstValueFrom(this.authService.getUsername(this.cookieService.get('user')));
    this.accountName = username || "";
    
    this.selectedImage = 'no-image.jpg';

    this.postsService.getPostProfilePic(this.cookieService.get('user'))
    .subscribe({
      next: (response: any) => {
        this.accountImg = response.profilePic;
        console.log(response.profilePic);
        this.accountImg_element.style.backgroundImage = `url(${this.accountImg})`;
        this.changeDetector.detectChanges();
      },
      error: error => console.error("Error fetching profile picture during post creation: "+error) 
    })
  }

  onSubmit(){
    if (this.selectedImage) {
      this.uploadFile(); //create actual post in the DB
    }
  }

  //Show image preview
  onFileSelected(event: any) {
    this.file = event.target.files[0];
    if (this.file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result;
      };
      reader.readAsDataURL(this.file);
    }
  }

  //Upload image in the Firebase Storage
  uploadFile(): void {
    if(this.file){
      const filePath = `images/${this.file.name}`;
      this.firestorageService.uploadFile(filePath, this.file)
        .then(url => {
          console.log('File uploaded successfully! Download URL:', url);
          //save uploaded image's url into realtime DB
          this.postsService.savePostInDB(url, this.title, this.description);
        })
        .catch(error => {
          console.error('Error uploading file:', error);
        });
      this.openSnackbar();
      this.router.navigate(['/']);
    }
  }
  updateCharCounter(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    const updatedValue = inputEl.value;

    this.char = updatedValue.length;
    this.isMaxChar = this.char >= this.maxChar;

    if (this.isMaxChar) {
      inputEl.value = updatedValue.slice(0, this.maxChar-1);
    }

    this.changeDetector.detectChanges();
  }



  openSnackbar(){
    let seconds = 3;
    this._snackBar.openFromComponent(PostSavingComponent, {
      duration: seconds * 1000,
    });
  }
}
