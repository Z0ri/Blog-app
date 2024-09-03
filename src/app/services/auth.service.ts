import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { catchError, Observable, of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http: HttpClient = inject(HttpClient);
  public logged: boolean = false;
  public username: string = '';
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
  getCurrentUser() {
    if (this.cookieService.get('user')) {
      return this.http.get(`https://blog-app-85fe3-default-rtdb.firebaseio.com/users/${this.cookieService.get('user')}.json`)
        .pipe(
          catchError((error) => {
            console.error('Error fetching user data:', error);
            return of(null); // Return an observable with null
          })
        );
    }
    return of(null); // Return an observable with null if no user cookie
  }
  getLogged(): boolean{
    return this.logged;
  }
  setLogged(bool: boolean): boolean{
    return this.logged;
  }
  getUsername(): Observable<object> {
    return this.http.get(`https://blog-app-85fe3-default-rtdb.firebaseio.com/users/${this.cookieService.get('user')}/username.json`);
  }
}