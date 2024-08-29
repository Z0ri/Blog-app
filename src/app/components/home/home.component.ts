import {Component, OnInit} from '@angular/core';
import { PostComponent } from "../post/post.component";

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
  ngOnInit(): void {
    
  }
}
