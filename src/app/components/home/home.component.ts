import {Component, OnDestroy, OnInit, viewChild, ViewChild, ViewContainerRef } from '@angular/core';
import { PostComponent } from "../post/post.component";
import { PostsService } from '../../services/posts.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    PostComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  allPosts: any[] = [];
  @ViewChild('posts', { read: ViewContainerRef, static: true }) posts!: ViewContainerRef;


  constructor(private postsService: PostsService, private cookieService: CookieService){}

  ngOnInit(): void {
    this.allPosts = this.postsService.getAllPosts(); //get all posts in the DB
    this.postsService.createAllPostElements(this.posts); //create a card for each post
    this.postsService.addLikedPosts().subscribe({
      next: (response) => console.log("Posts successfully saved: ", response),
      error: (error) => console.log("Error saving posts: ", error)
    });
  }

}
