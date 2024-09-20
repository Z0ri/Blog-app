import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Comment } from '../models/comment';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  comments: Comment[] = [];
  openCommentsSection: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  
  constructor() { }
  seeProfile(){
    //see profile from comment
  }
  publish(newComment: Comment){
    this.comments.push(newComment);
  }
}
