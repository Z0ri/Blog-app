import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-log-out',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ],
  templateUrl: './log-out.component.html',
  styleUrl: './log-out.component.css'
})
export class LogOutComponent {
  constructor(private cookieService: CookieService){}
  logOut(){
    this.cookieService.delete('user');
    window.location.reload();
  }
}
