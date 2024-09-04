import { inject, Injectable } from '@angular/core';
import { Post } from '../models/post';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  postId: string = '';
  http: HttpClient = inject(HttpClient);
  constructor(private authService: AuthService, private cookieService: CookieService) { }

  saveInDB(url: string, title: string, description: string){
    let newPost = new Post('', title, url, description);
    this.http.post<{name: string}>(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}/posts.json`, JSON.parse(JSON.stringify(newPost)))
    .subscribe({
      next: response => {
        console.log("Successfully saved post.", response);
        this.postId = response.name;
        this.setID();
      },
      error: error => console.error("Error saving post.", error),
      complete: () => console.log("Post save operation completed.")
    });
  }
  setID(){
    this.http.patch(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}/posts/${this.postId}.json`,
    { id: this.postId })
    .subscribe(response=>console.log(response));
  }
}
