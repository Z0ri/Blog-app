import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http: HttpClient = inject(HttpClient);
  public logged: boolean = false;
  constructor(private cookieService: CookieService) { }

  signUp(newUser: User): Observable<Object>{
    return this.http.post<{[key:string]:User}>("https://blog-app-85fe3-default-rtdb.firebaseio.com/users.json", newUser);
  }
  signOut(){
    this.cookieService.delete('user');
    this.logged = false;
  }
  getUsers(): Observable<object>{
    return this.http.get<{[key:string]:User}>("https://blog-app-85fe3-default-rtdb.firebaseio.com/users.json");
  }
  getCurrentUser(): Observable<object>{
    return this.http.get(`https://blog-app-85fe3-default-rtdb.firebaseio.com/users/${this.cookieService.get('user')}.json`);
  }
  getLogged(): boolean{
    return this.logged;
  }
  setLogged(bool: boolean): boolean{
    return this.logged;
  }
}
