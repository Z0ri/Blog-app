import {Component, OnInit, viewChild, ViewChild, ViewContainerRef } from '@angular/core';
import { PostComponent } from "../post/post.component";
import { PostsService } from '../../services/posts.service';

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


  constructor(private postsService: PostsService){}

  ngOnInit(): void {
    this.allPosts = this.postsService.getAllPosts(); //get all posts in the DB
    this.postsService.createAllPostElements(this.posts); //create a card for each post
  }

}
