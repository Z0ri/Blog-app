import { ComponentRef, inject, Injectable, ViewContainerRef } from '@angular/core';
import { Post } from '../models/post';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Console, count } from 'console';
import { PostComponent } from '../components/post/post.component';
import { first, firstValueFrom, map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  postAuthor: string = "";
  allPosts: any[] = [];
  postId: string = '';
  http: HttpClient = inject(HttpClient);
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

  addLikedPost(postId: string): Observable<any> {
    return this.getLikedPosts()
      .pipe(
        map(response => {
          // Ensure response is an array, default to an empty array if not
          return Array.isArray(response) ? response : [];
        }),
        switchMap((currentLikes: string[]) => {
          let updatedLikes = currentLikes;
  
          // Append new postId to the existing list if it's not already present
          if (!currentLikes.includes(postId)) {
            updatedLikes = [...currentLikes, postId];
          }
  
          // Ensure the payload is properly formatted
          const payload = { likedPosts: updatedLikes };
  
          // Send updated list back to the server
          return this.http.patch(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}.json`, payload);
        })
      );
  }
  addDislikedPost(postId: string): Observable<any> {
    return this.getDislikedPosts()
      .pipe(
        map(response => {
          // Ensure response is an array, default to an empty array if not
          return Array.isArray(response) ? response : [];
        }),
        switchMap((currentDislikes: string[]) => {
          let updatedDislikes = currentDislikes;
  
          // Append postId to the existing list if it's not already present
          if (!currentDislikes.includes(postId)) {
            updatedDislikes = [...currentDislikes, postId];
          }
  
          // Ensure the payload is properly formatted
          const payload = { dislikedPosts: updatedDislikes };
  
          // Send updated list back to the server
          return this.http.patch(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}.json`, payload);
        })
      )
  }

  getLikedPosts(): Observable<any>{
    return this.http.get<string[]>(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}/likedPosts.json`);
  }
  getDislikedPosts(): Observable<any>{
    return this.http.get<string[]>(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}/dislikedPosts.json`);
  }

  removeLikedPost(postId: string): Observable<any> {
    return this.getLikedPosts().pipe(
      switchMap((likedPosts: string[])=>{
        let updatedLikes: string[] = likedPosts.filter(id=>id!==postId) //remove post id
        return this.http.patch(`${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}/posts/${postId}.json`,
        {likes: updatedLikes});
        })
      )
  }
  // removeDislikedPost(postId: string): Observable<any>{

  // }
  




  // async checkLikedPost(postId: string): Promise<boolean> {
  //   try {
  //     const likedPosts = await firstValueFrom(this.getLikedPosts());
  
  //     // Ensure likedPosts is an array
  //     if (Array.isArray(likedPosts)) {
  //       return likedPosts.includes(postId);
  //     } else {
  //       console.warn('Liked posts is not an array:', likedPosts);
  //       return false;
  //     }
  //   } catch (error) {
  //     console.error('Error checking liked post:', error);
  //     return false;
  //   }
  // }

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
