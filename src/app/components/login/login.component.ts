import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm!: FormGroup;
  constructor(private authService: AuthService, private router: Router, private cookieService: CookieService){
    this.loginForm = new FormGroup({
      usernameOrEmail: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }
  onSubmit(){
    if(this.loginForm.valid){
      this.login();
    }
  }
  login(){
    this.authService.getUsers()
    .subscribe((response: any)=>{
      for(let key of Object.keys(response)){
        if(this.loginForm.get('usernameOrEmail')?.value == response[key]['username'] || this.loginForm.get('usernameOrEmail')?.value == response[key]['email']){
          if(this.loginForm.get('password')?.value == response[key]['password']){
            //logged in code
            this.cookieService.set('user', key); //set a cookie for the user id
            this.authService.setLogged(true); //set logged variable to 'true'
            this.router.navigate(['/']); //navigate to home
          }
        }
      }
    });
  }
}
