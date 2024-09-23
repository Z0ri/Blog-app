import { ComponentRef, inject, Injectable, ViewContainerRef } from '@angular/core';
import { Post } from '../models/post';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { PostComponent } from '../components/post/post.component';
import { BehaviorSubject, catchError, first, firstValueFrom, map, Observable, of, Subject, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  postAuthor: string = "";

  allPosts: any[] = [];
  likes: any[] = [];
  dislikes: any[] = [];
  dislikedPosts: string[] = [];
  likedPosts: string[] = [];
  removedLikes: string[] = [];
  removedDisliked: string[] = [];

  postId: string = '';
  http: HttpClient = inject(HttpClient);

  likesSaved$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  dislikesSaved$:BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor(private authService: AuthService, private cookieService: CookieService) { }

  //fetch every posts in the DB
  getAllPosts(): any[] {
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

  //fetch every post of a user
  getUserPosts(authorId: string): Observable<any>{
    return this.http.get(`${this.authService.getDatabaseURL()}/users/${authorId}/posts.json`);
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
  //create a post element for each post saved in a user's posts section
  createUserPosts(container: ViewContainerRef, posts: any[]) {
    const postRefs: ComponentRef<PostComponent>[] = [];
  
    for (let post of posts) {
      const postRef = container.createComponent(PostComponent);
      postRef.instance.title = post.title;
      postRef.instance.description = post.description;
      postRef.instance.url = post.url;
      postRef.instance.author = post.author;
      postRef.instance.authorId = post.authorId;
      postRef.instance.postId = post.id;
  
      // Aggiungi una classe CSS al singolo post creato
      postRef.location.nativeElement.classList.add('profile-post');
  
      // Aggiungi il riferimento del post all'array
      postRefs.push(postRef);
    }
  
    return postRefs; // Ritorna l'array di riferimenti ai componenti
  }
  //save post data in DB
  async savePostInDB(url: string, title: string, description: string){
    this.postAuthor = await firstValueFrom(this.authService.getUsername(this.cookieService.get('user')));
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

  //add reaction to liked/disliked posts array
  addReaction(postId: string, reactionName: "like" | "dislike"){
    if(reactionName == "like"){
      this.likedPosts.push(postId);
      this.cookieService.set('likedPosts', JSON.stringify(this.likedPosts));
      console.log("added like ", this.cookieService.get('likedPosts'));
    }else{
      this.dislikedPosts.push(postId);
      this.cookieService.set('dislikedPosts', JSON.stringify(this.dislikedPosts));
      console.log("added dislike ", this.cookieService.get('dislikedPosts'));
    }
  }
  //substract reaction
  removeReaction(postId: string, reactionName: "like" | "dislike") {
    if(reactionName == "like"){
      this.likedPosts = this.likedPosts.filter(id=>id!=postId);
      this.cookieService.set('likedPosts', JSON.stringify(this.likedPosts));
      console.log("removed like ", this.likedPosts);
    }else{
      this.dislikedPosts = this.dislikedPosts.filter(id=>id!=postId);
      this.cookieService.set('dislikedPosts', JSON.stringify(this.dislikedPosts));
      console.log("removed dislike ", this.dislikedPosts);
    }
  }

  //save likes/dislikes in likedPosts/dislikePosts of user in DB
  saveReactions(reactionName: "dislikedPosts" | "likedPosts"): Observable<any> {
    if (reactionName === "likedPosts") {
      return this.getLikedPosts().pipe(
        switchMap((currentLikes: string[] | null | undefined) => {
          let updatedLikes = currentLikes ? [...currentLikes] : []; 
          const storedLikes = this.cookieService.get('likedPosts');
          const newLikes = storedLikes ? JSON.parse(storedLikes) : [];
  
          // Compare sorted arrays to check for changes
          const hasChanges = JSON.stringify(newLikes.sort()) !== JSON.stringify(updatedLikes.sort());
  
          if (hasChanges) {
            updatedLikes = Array.from(new Set([...updatedLikes, ...newLikes]));  // Merge newLikes into updatedLikes
  
            this.likesSaved$.next(updatedLikes);
  
            this.cookieService.delete('likedPosts');
  
            const payload = { likedPosts: updatedLikes };
            return this.http.patch(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}.json`, payload);
          } else {
            this.likesSaved$.next(updatedLikes);
            return of("No changes");
          }
        })
      );
    } else {
      return this.getDislikedPosts().pipe(
        switchMap((currentDislikes: string[] | null | undefined) => {
          let updatedDislikes = currentDislikes ? [...currentDislikes] : [];
  
          const storedDislikes = this.cookieService.get('dislikedPosts'); 
          const newDislikes = storedDislikes ? JSON.parse(storedDislikes) : [];
  
          const hasChanges = JSON.stringify(newDislikes.sort()) !== JSON.stringify(updatedDislikes.sort());
  
          if (hasChanges) {
            updatedDislikes = Array.from(new Set([...updatedDislikes, ...newDislikes]));  // Merge newDislikes into updatedDislikes
  
            this.dislikesSaved$.next(updatedDislikes);
  
            this.cookieService.delete('dislikedPosts');
  
            const payload = { dislikedPosts: updatedDislikes };
            return this.http.patch(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}.json`, payload);
          } else {
            this.dislikesSaved$.next(updatedDislikes);
            return of("No changes");
          }
        })
      );
    }
  }
  // save post likes
  saveLikes(authorId: string, postId: string, likes: number) {
    if (likes && likes >= 0) {
      return this.http.patch(`${this.authService.getDatabaseURL()}/users/${authorId}/posts/${postId}.json`, { like: likes });
    }else{
      return of({});
    }
  }
  // save post dislikes
  saveDislikes(authorId: string, postId: string, dislikes: number) {
    if (dislikes && dislikes >= 0) {
      return this.http.patch(`${this.authService.getDatabaseURL()}/users/${authorId}/posts/${postId}.json`, { dislike: dislikes });
    }else{
      return of({})
    }
  }
  //check if current user is the post's author
  checkAuthor(authorId: string): boolean{
    if(authorId == this.cookieService.get('user')){
      return true;
    }else{
      return false;
    }
  }

  getPostAuthor(postId: string): string{
    for(let id of this.allPosts){
      if(id == postId){
        return id;
      }
    }
    return "";
  }

  getLikedPosts(): Observable<any>{
    return this.http.get<string[]>(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}/likedPosts.json`);
  }
  getDislikedPosts(): Observable<any>{
    return this.http.get<string[]>(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}/dislikedPosts.json`);
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
