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
  likedPosts: string[] = [];
  postId: string = '';
  http: HttpClient = inject(HttpClient);

  likesSaved$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

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

  addLikedPost(postId: string){
    this.likedPosts.push(postId);
    localStorage.setItem('likedPosts', JSON.stringify(this.likedPosts));
    console.log("post id added");
  }

  addLikedPosts(): Observable<any> {
    return this.getLikedPosts()
      .pipe(
        switchMap((currentLikes: string[] | null | undefined) => {
          
          // If currentLikes is null, initialize it as an empty array
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
          // Patch the data to Firebase
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
    switchMap((likedPosts: string[]) => {
      // Remove the post ID from the liked posts array
      const updatedLikes = likedPosts.filter(id => id !== postId);

      // Prepare the data to send in the PATCH request
      const patchData = { likedPosts: updatedLikes };

      // Perform the PATCH request to update the user's likedPosts
      return this.http.patch(
        `${this.authService.getDatabaseURL()}/users/${this.cookieService.get('user')}.json`,
        patchData
      );
    })
  );
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
