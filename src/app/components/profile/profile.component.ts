import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { PostComponent } from "../post/post.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, PostComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  accountName: string = "account_circle.png";
}
