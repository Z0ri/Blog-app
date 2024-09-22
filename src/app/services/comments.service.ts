import { ComponentRef, Inject, Injectable, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, catchError, Observable, Subject, switchMap, tap, throwError } from 'rxjs';
import { Comment } from '../models/comment';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { error } from 'console';
import { CommentComponent } from '../components/comment/comment.component';
import { PostComponent } from '../components/post/post.component';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  http: HttpClient = inject(HttpClient);
  comments: Comment[] = [];
  openCommentsSection$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  updateComments$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  commentRefs: ComponentRef<CommentComponent>[] = [];

  constructor(
    private authService: AuthService,
    private cookieService: CookieService
  ) { }

  seeProfile(){
    //see profile from comment
  }

  getComments(postId: string, authorId: string): Observable<any> {
    return this.http.get<Comment[]>(`${this.authService.getDatabaseURL()}/users/${authorId}/posts/${postId}/comments.json`);
  }

  createAllComments(container: ViewContainerRef, postId: string, authorId: string){
    console.log(postId);
    console.log(authorId);
     //create array of comments references
    this.getComments(postId, authorId)
    .subscribe({
      next: (comments: Comment[])=>{
        this.comments = comments || [];
        for (let comment of this.comments) {
          const commentRef = container.createComponent(CommentComponent);
          commentRef.instance.authorId = comment.authorId;
          commentRef.instance.content = comment.content;
          commentRef.instance.username = comment.username;
                              
          this.commentRefs.push(commentRef);
        }
      }
    })

    return this.commentRefs;
  }



  publish(newComment: Comment, postAuthorId: string, container: ViewContainerRef): Observable<any> {
    return this.getComments(newComment.postId, postAuthorId).pipe(
      switchMap((comments: Comment[]) => {
        (Array.isArray(comments) ? comments : comments = []).push(newComment);  
        return this.http.patch(`${this.authService.getDatabaseURL()}/users/${postAuthorId}/posts/${newComment.postId}.json`, { comments }).pipe(
          tap(response => {
            console.log('Response from patch:', response);
            const commentRef = container.createComponent(CommentComponent);
            commentRef.instance.authorId = newComment.authorId;
            commentRef.instance.username = newComment.username;
            commentRef.instance.content = newComment.content;
            this.commentRefs.push(commentRef);
          }),
          catchError((error) => {
            console.error('Error updating comments:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }
  
  
  

}