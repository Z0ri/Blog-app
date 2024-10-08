import {AfterViewInit, Component, OnDestroy, OnInit, viewChild, ViewChild, ViewContainerRef } from '@angular/core';
import { PostComponent } from "../post/post.component";
import { PostsService } from '../../services/posts.service';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    PostComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit{
  allPosts: any[] = [];
  @ViewChild('homePosts', { read: ViewContainerRef }) posts!: ViewContainerRef;
  @ViewChild('provaDiv', { read: ViewContainerRef }) provaDiv!: ViewContainerRef;

  constructor(
    private postsService: PostsService,
    private router: Router){}
    
  ngAfterViewInit(): void {
    this.allPosts = this.postsService.getAllPosts(); //get all posts in the DB
    this.postsService.createAllPostElements(this.posts); //create a card for each post
  }

  ngOnInit(): void {
    //Save likes/dislikes on init
    this.postsService.saveReactions('likedPosts').subscribe();
    this.postsService.saveReactions('dislikedPosts').subscribe();

    //Save likes/dislikes when route changes
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.postsService.saveReactions('likedPosts').subscribe();
      this.postsService.saveReactions('dislikedPosts').subscribe();
    });
  }

}
