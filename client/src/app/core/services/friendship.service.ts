import { inject, Injectable } from '@angular/core';
// import { HttpClient } from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FriendDto, FriendRequestDto, FriendshipStatusDto } from '../../features/chat/models/friendship.dto';

@Injectable({
  providedIn: 'root' // service co mat toan app, ko can input o module
})
export class FriendshipService {
  // inject HttpClient de goi API (common/http)
  private http = inject(HttpClient);
  private apiUrl = '/api/friendship';

  constructor() { }

  // == commands ==

  // gui loi moi ket ban
  sendFriendRequest(addresseeId: string): Observable<{ friendshipId: string }> {
    return this.http.post<{ friendshipId: string }>(
      `${this.apiUrl}/request`,
      { addresseeId } // body gui len server
    );
  }

  // phan hoi loi moi ket ban
  responseFriendRequest(
    friendshipId: string,
    isAccepted: boolean
  ): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${this.apiUrl}/${friendshipId}/respond`,
      { isAccepted }
    )
  }

  // xoa ban
  removeFriend(friendshipId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/${friendshipId}`
    );
  }

  // == Queries ==

  // lay danh sach ban be 
  getFriendsList(): Observable<FriendDto[]> {
    return this.http.get<FriendDto[]>(`${this.apiUrl}/friends`);
  }

  // lay danh sach loi moi ket ban pending
  getPendingRequests(): Observable<FriendRequestDto[]> {
    return this.http.get<FriendRequestDto[]>(
      `${this.apiUrl}/pending`
    );
  }

  // kiem tra trang thai ket ban voi 1 user
  getFriendshipStatus(targetUserId: string): Observable<FriendshipStatusDto> {
    return this.http.get<FriendshipStatusDto>(
      `${this.apiUrl}/status/${targetUserId}`
    );
  }

}
