import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConversationDto } from '../models/conversation.dto';
import { MessageDto } from '../models/message.dto';
import { GroupMemberDto } from '../models/group-member.dto';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private baseUrl = '/api/chat';

  constructor() { }

  sendMessage(conversationId: string, content: string) {
    return this.http.post<any>(`${this.baseUrl}/send`, {
      conversationId: conversationId,
      content: content
    });
  }

  // lay danh sach conversation 
  getConversations(): Observable<ConversationDto[]> {
    return this.http.get<ConversationDto[]>(`${this.baseUrl}/conversations`);
  }

  // get info 1 conversation theo Id
  getConversationById(conversationId: string): Observable<ConversationDto> {
    return this.http.get<ConversationDto>(`${this.baseUrl}/conversations/${conversationId}`);
  }

  // lay lich su tin nhan cua conversation
  getMessages(conversationId: string): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(`${this.baseUrl}/${conversationId}/messages`);
  }

  // tao hoi thoai moi voi 1 user (POST: /api/chat/create)
  createConversation(targetUserId: string): Observable<string> {
    // tra ve guid: conversationId
    return this.http.post<string>(`${this.baseUrl}/create`, { targetUserId });
  }

  // === Group Chat Method ===
  // =========================

  // tao nhom chat (post: /api/chat/create-group)
  // out: conversationid (string/guid)
  createGroup(name: string, memberIds: string[]): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/create-group`, { name, memberIds });
  }

  // them member vao group chat (post: /api/chat/{conversationId}/members)
  addMembers(conversationId: string, memberIds: string[]): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.baseUrl}/${conversationId}/members`,
      { memberIds }
    );
  }

  // leave group chat (delete: /api/chat/conversationId/leave)
  leaveGroup(conversationId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${conversationId}/leave`);
  }

  // lay list member in group
  getGroupMembers(conversationId: string): Observable<GroupMemberDto[]> {
    return this.http.get<GroupMemberDto[]>(`${this.baseUrl}/${conversationId}/members`);
  }

  // === Message Read State ===
  // danh dau da doc all tin nhan trong conversation
  // goi khi user Open Conversation
  markAsRead(conversationId: string): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/${conversationId}/read`, {});
  }

}
