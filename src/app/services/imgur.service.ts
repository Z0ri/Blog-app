import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImgurService {
  private IMGUR_UPLOAD_URL = 'https://api.imgur.com/3/image/';
  private CLIENT_ID = 'eaf481dc314f3fc';

  constructor(private http: HttpClient) {}

  formData: FormData = new FormData();
  
  uploadImage(imageFile: any) {
    console.log("called img");
    this.formData.append('image', imageFile);
    fetch('https://api.imgur.com/3/image/', {
      method: 'post',
      headers: {
        Authorization: `Client-ID ${this.CLIENT_ID}`
      },
      body: this.formData
    }).then(data=>data.json()).then(data=>console.log(data));
  }
}
