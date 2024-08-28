import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../components/models/user';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http: HttpClient = inject(HttpClient);
  constructor() { }

  signUp(newUser: User): Observable<Object>{
    return this.http.post<{[key:string]:User}>("https://blog-app-85fe3-default-rtdb.firebaseio.com/users.json", newUser);
  }
  getUsers(){
    return this.http.get<{[key:string]:User}>("https://blog-app-85fe3-default-rtdb.firebaseio.com/users.json");
  }
}
