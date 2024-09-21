import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { Comment } from '../models/comment';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { error } from 'console';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  http: HttpClient = inject(HttpClient);
  comments: Comment[] = [];
  openCommentsSection: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  
  constructor(
    private authService: AuthService,
    private cookieService: CookieService
  ) { }

  seeProfile(){
    //see profile from comment
  }

  getComments(postId: string, authorId: string): Observable<any> {
    return this.http.get<string[]>(`${this.authService.getDatabaseURL()}/users/${authorId}/posts/${postId}/comments.json`);
  }

  publish(newComment: Comment, postAuthorId: string): Observable<any> {
    return this.getComments(newComment.postId, postAuthorId)
      .pipe(
        switchMap((comments: Comment[] = []) => { //add a default value to the array in case it is null or undefined
          // Check if it's an array
          if (!Array.isArray(comments)) {
            comments = [];
          }
  
          // Add the new comment to the existing comments array
          comments.push(newComment);
          // Add the new comment to the property comments array to allow UI update
          this.comments.push(newComment);

          // Update comments in DB
          return this.http.patch(`${this.authService.getDatabaseURL()}/users/${postAuthorId}/posts/${newComment.postId}.json`, { comments });
        })
      );
  }
  

}
