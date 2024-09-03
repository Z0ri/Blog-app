import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImgurService {
  private IMGUR_UPLOAD_URL = 'https://api.imgur.com/3/image/';
  private CLIENT_ID = 'eaf481dc314f3fc';

  constructor(private http: HttpClient) {}

  uploadImage(imageFile: any): Observable<any> {
    const formData = new FormData();  // Creare FormData qui per ogni richiesta
    formData.append('image', imageFile);

    const headers = new HttpHeaders({
      Authorization: `Client-ID ${this.CLIENT_ID}`
    });

    return this.http.post(this.IMGUR_UPLOAD_URL, formData, { headers })
      .pipe(
        catchError(error => {
          console.error('Error uploading image to Imgur:', error);
          return throwError(error);
        })
      );
  }
}
