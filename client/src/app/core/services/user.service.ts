import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from '../../features/chat/models/user.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = '/api/user'

  constructor() { }

  // goi api tim kien user (GET: /api/user/search?q=....)
  searchUsers(term: string): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.apiUrl}/search?q=${term}`);
  }
}
