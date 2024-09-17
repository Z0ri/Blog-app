import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  http: HttpClient = inject(HttpClient);
  constructor(
    private authService: AuthService
  ) { }

  //get followers
  getFollowers(userId: string): Observable<any>{
    return this.http.get<string[]>(`${this.authService.getDatabaseURL()}/users/${userId}/followers.json`);
  }
  saveFollowers(userId: string, newFollower: string): Observable<any> {
    return this.getFollowers(userId).pipe(
      switchMap((response: string[]) => {
        if (response) {
          if(!response.includes(newFollower)){
            if (newFollower !== "") {
              let followers = [...response];
              followers.push(newFollower);
              return this.http.patch(`${this.authService.getDatabaseURL()}/users/${userId}.json`, { followers: followers });
            } else {
              return of("No new follower.");
            }
          } else {
            return of("Already followed.");
          }
        }else{
          let followers = newFollower ? [newFollower] : [];
          return this.http.patch(`${this.authService.getDatabaseURL()}/users/${userId}.json`, { followers: followers });
        }
      })
    );
  }
}
