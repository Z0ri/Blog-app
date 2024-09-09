import { ComponentRef, inject, Injectable, ViewContainerRef } from '@angular/core';
import { Post } from '../models/post';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Console, count } from 'console';
import { PostComponent } from '../components/post/post.component';
import { first, firstValueFrom, Observable, of, switchMap } from 'rxjs';

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

  //save likes in DB
  saveLikes(authorId: string, postId: string, like: boolean): Observable<Object> {
    if (like) {
      return this.getLikes(authorId, postId).pipe(
        switchMap((response) => {
          let likes = Number(response) + 1; // Increment the like count
          return this.http.patch(
            `${this.authService.getDatabaseURL()}/users/${authorId}/posts/${postId}.json`, 
            { like: likes }
          );
        })
      );
    } else {
      // Return an observable that emits an empty result or a default value if `like` is false
      return of({}); // Or you can return `of(null)` or `of(undefined)`
    }
  }
  
  // async saveLikes(authorId: string, postId: string, like: boolean): Promise<void> {
  //   console.log("saveLikes(): " + postId);
  //   if(like){
  //     try {
  //       let likes = await firstValueFrom(this.getLikes(authorId, postId));
  //       console.log("likes "+likes);
  //       if (likes) {
  //         likes += 1;
  //         await firstValueFrom(this.http.patch(`${this.authService.getDatabaseURL()}/users/${authorId}/posts/${postId}.json`, { likes: likes }));
  //         console.log("like saved.");
  //       }
  //     } catch (error) {
  //       console.error('Error saving likes:', error);
  //     }
  //   }else{
  //     console.log("ERROR: unsufficient like amount.");
  //   }
  // }
  
  async saveDislikes(authorId: string, postId: string, liked: boolean): Promise<void> {
    if(liked){
      try {
        const dislikes = await firstValueFrom(this.getDislikes(authorId, postId));
        if (dislikes) {
          await firstValueFrom(this.http.patch(`${this.authService.getDatabaseURL()}/users/${authorId}/posts/${postId}.json`, { dislikes }));
        }
      } catch (error) {
        console.error('Error saving dislikes:', error);
      }
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
