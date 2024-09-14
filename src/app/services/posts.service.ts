import { ComponentRef, inject, Injectable, ViewContainerRef } from '@angular/core';
import { Post } from '../models/post';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Console, count } from 'console';
import { PostComponent } from '../components/post/post.component';
import { BehaviorSubject, catchError, first, firstValueFrom, map, Observable, of, Subject, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  postAuthor: string = "";
  allPosts: any[] = [];
  dislikedPosts: string[] = [];
  likedPosts: string[] = [];
  removedLikes: string[] = [];
  postId: string = '';
  http: HttpClient = inject(HttpClient);

  likesSaved$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  dislikesSaved$:BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor(private authService: AuthService, private cookieService: CookieService) { }

  //fetch every posts in the DB
  getAllPosts(): any {
    this.authService.getUsers().subscribe({
      next: (response) => {
        let allUsers: any = response;
        for (let key of Object.keys(allUsers)) {
          if(allUsers[key].posts != undefined || allUsers[key].posts != null){
            for(let k of Object.keys(allUsers[key].posts)){
              this.allPosts.push(allUsers[key].posts[k]);
            }
          }
        }
      },
      error: (error) => {
        console.error("Error fetching users: " + error);
      }
    });
    return this.allPosts;
  }
  
  // get profile pic of the author of the post
  getPostProfilePic(authorId: string): Observable<any> {
    return this.authService.getUser(authorId);
  }

  //create a post element for each post fetched from the DB
  async createAllPostElements(container: ViewContainerRef){
    const componentRefs: ComponentRef<PostComponent>[] = []; //create array of post references
    for (let post of this.allPosts) {
      const componentRef = container.createComponent(PostComponent);
      componentRef.instance.title = post.title;
      componentRef.instance.description = post.description;
      componentRef.instance.url = post.url;
      componentRef.instance.author = post.author;
      componentRef.instance.authorId = post.authorId;
      componentRef.instance.postId = post.id;
      componentRefs.push(componentRef);
    }

    return componentRefs;
  }
  //save post data in DB
  async savePostInDB(url: string, title: string, description: string){
    this.postAuthor = await firstValueFrom(this.authService.getUsername());
    let today = new Date();
    let date: string = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

    //insert new post in DB
    let newPost = new Post('', this.postAuthor,this.cookieService.get('user'), date, title, url, description);
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

  //set correct id as attribute of the post
  setID(){
    this.http.patch(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}/posts/${this.postId}.json`,
    { id: this.postId })
    .subscribe();
  }

  addReaction(postId: string, reactionName: "like" | "dislike"){
    if(reactionName == "like"){
      this.likedPosts.push(postId);
      localStorage.setItem('likedPosts', JSON.stringify(this.likedPosts));
      console.log("added like ", this.likedPosts);
    }else{
      this.dislikedPosts.push(postId);
      localStorage.setItem('dislikedPosts', JSON.stringify(this.dislikedPosts));
      console.log("added dislike ", this.dislikedPosts);
    }
  }

  removeReaction(postId: string, reactionName: "like" | "dislike") {
    if(reactionName == "like"){
      this.likedPosts = this.likedPosts.filter(id=>id!=postId);
      localStorage.setItem('likedPosts', JSON.stringify(this.likedPosts));
      console.log("removed like ", this.likedPosts);
    }else{
      this.dislikedPosts = this.dislikedPosts.filter(id=>id!=postId);
      localStorage.setItem('dislikedPosts', JSON.stringify(this.dislikedPosts));
      console.log("removed dislike ", this.dislikedPosts);
    }
  }


  saveReactions(reactionName: "dislikedPosts" | "likedPosts"): Observable<any> {
    if(reactionName == "likedPosts"){
      return this.getLikedPosts()
      .pipe(
        switchMap((currentLikes: string[] | null | undefined) => {
          let updatedLikes = currentLikes ? [...currentLikes] : [];
  
          // Load the likedPosts array from localStorage
          const storedLikes = localStorage.getItem('likedPosts');
          const newLikes = storedLikes ? JSON.parse(storedLikes) : [];
  
          // Only add new post ids that aren't already in updatedLikes
          for (let like of newLikes) {
            if (!updatedLikes.includes(like)) {
              updatedLikes.push(like);
            }
          }

          // Notify posts 
          this.likesSaved$.next(updatedLikes);

          // Clear localStorage after saving
          localStorage.removeItem('likedPosts');

          // Payload to send to Firebase
          const payload = { likedPosts: updatedLikes };
          return this.http.patch(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}.json`, payload);
        })
      );
    } else {
      return this.getDislikedPosts()
      .pipe(
        switchMap((currentDislikes: string[] | null | undefined) => {
          
          let updatedDislikes = currentDislikes ? [...currentDislikes] : [];
  
          // Correctly load the dislikedPosts array from localStorage
          const storedDislikes = localStorage.getItem('dislikedPosts'); 
          const newDislikes = storedDislikes ? JSON.parse(storedDislikes) : [];
  
          // Only add new post ids that aren't already in updatedDislikes
          for (let dislike of newDislikes) {
            if (!updatedDislikes.includes(dislike)) {
              updatedDislikes.push(dislike);
            }
          }

          // Notify posts 
          this.dislikesSaved$.next(updatedDislikes);

          // Clear localStorage after saving
          localStorage.removeItem('dislikedPosts');  // Ensure it's the correct key here too

          // Payload to send to Firebase
          const payload = { dislikedPosts: updatedDislikes };
          return this.http.patch(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}.json`, payload);
        })
      );
    }
  }


  getLikedPosts(): Observable<any>{
    return this.http.get<string[]>(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}/likedPosts.json`);
  }
  getDislikedPosts(): Observable<any>{
    return this.http.get<string[]>(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}/dislikedPosts.json`);
  }

  // Function to save likes
  saveLikes(authorId: string, postId: string, likes: number) {
    if (likes && likes >= 0) {
      return this.http.patch(`${this.authService.getDatabaseURL()}/users/${authorId}/posts/${postId}.json`, { like: likes });
    }else{
      return of({});
    }
  }

  // Function to save dislikes
  saveDislikes(authorId: string, postId: string, dislikes: number) {
    if (dislikes && dislikes >= 0) {
      return this.http.patch(`${this.authService.getDatabaseURL()}/users/${authorId}/posts/${postId}.json`, { dislike: dislikes });
    }else{
      return of({})
    }
  }

  
  getLikes(authorId: string, postId: string){
    return this.http.get(`${this.authService.getDatabaseURL()}/users/${authorId}/posts/${postId}/like.json`);
  }
  getDislikes(authorId: string, postId: string): Observable<string>{
    return this.http.get<string>(`${this.authService.getDatabaseURL()}/users/${authorId}/posts/${postId}/dislike.json`);
  }

  
  //on comment click
  comment(){
    //add comment function
    //add style change when clicked
  }
}
