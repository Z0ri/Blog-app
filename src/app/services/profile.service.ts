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
  //save followers in DB
  saveFollowers(userId: string, newFollower: string, remove: boolean): Observable<any> {
    return this.getFollowers(userId).pipe(
      switchMap((response: string[]) => {
        let followers = response ? [...response] : [];
  
        if (remove) {
          followers = followers.filter(follower => follower !== newFollower);
        } else if (newFollower && !followers.includes(newFollower)) {
          followers.push(newFollower);
        }
  
        if (followers.length !== response?.length) {
          return this.http.patch(`${this.authService.getDatabaseURL()}/users/${userId}.json`, { followers: followers });
        } else {
          return of("No followers updates.");
        }
      })
    );
  }
  
}
