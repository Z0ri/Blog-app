import { ComponentRef, inject, Injectable, ViewContainerRef } from '@angular/core';
import { Post } from '../models/post';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Console, count } from 'console';
import { PostComponent } from '../components/post/post.component';
import { first, firstValueFrom } from 'rxjs';

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
  //create a post element for each post fetched from the DB
  async createAllPostElements(container: ViewContainerRef){
    const componentRefs: ComponentRef<PostComponent>[] = []; //create array of post references

    for (let post of this.allPosts) {
      const componentRef = container.createComponent(PostComponent);
      componentRef.instance.title = post.title;
      componentRef.instance.description = post.description;
      componentRef.instance.url = post.url;
      componentRef.instance.author = post.author;
      componentRefs.push(componentRef);
    }

    return componentRefs;
  }
  //save post data in DB
  async savePostInDB(url: string, title: string, description: string){
    this.postAuthor = await firstValueFrom(this.authService.getUsername());
    let today = new Date();
    let date: string = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    let profilePic = "";
    if(await firstValueFrom(this.authService.getProfilePic())){
      profilePic = await firstValueFrom(this.authService.getProfilePic());
    }

    let newPost = new Post('', this.postAuthor, date, title, url, description, profilePic);
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
}
