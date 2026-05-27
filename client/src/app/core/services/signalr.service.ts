import { inject, Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr'; // npm install @microsoft/signalr
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { ConversationDto } from '../../features/chat/models/conversation.dto';

// Định nghĩa payload nhận từ SignalR Backend
export interface ReceiveMessagePayload {
  senderId: string;
  senderName: string;
  content: string;
  conversationId: string;
  replyToId?: string;
  replyContent?: string;
  messageType: number;
  attachments?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection | undefined;

  authService = inject(AuthService)

  // bien bao hieu status ket noi (online/offline) cho toan app biet
  public connectionStatus$ = new BehaviorSubject<boolean>(false);

  constructor() { }

  // 1. khoi tao ketnoi
  // ham duoc goi ngay khi user login success
  public startConnection() {
    console.log('--- Bat dau khoi tao ket noi SignalR ---');

    // lay token user login hien tai
    const token = this.authService.getToken();

    // hubConnectionBuilder: cong cu xay dung cau hinh ket noi
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('/api/chatHub', {
        // bo qua buoc negotiation - thuong luong giao thuc,
        // mac dinh SignalR thu Long Polling truoc roi moi nang cap len WebSockets
        // ep dung Websockets luon cho nhan (yc server phai ho tro WS)
        skipNegotiation: true,
        // chi dinh ro s.d giao thuc WS(nhanh nhat, real-time nhat).
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => token || '' // gui token kem theo connection
      })
      .withAutomaticReconnect() // tu dong ketnoi lai neu rot mang (tang trai nghiem user)
      .build(); // ket thuc cau hinh

    console.log('-- finish config --', this.hubConnection);
    // bat dau thuc su ketnoi
    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR Connections started');
        // neu success -> emit true de bao cho app, component biet
        this.connectionStatus$.next(true);
      })
      .catch(err => {
        console.log('Error while starting connection: ', err);
        this.connectionStatus$.next(false);
      });
  }

  // 2. lang nghe event tu server (ex: co tin nhan moi)
  // Dki lang nghe su kien "ReceiveMessage" tu server
  // Update: Nhan them senderId
  public addReceiveMessageListener(
    callback: (payload: ReceiveMessagePayload) => void) {
    this.hubConnection?.on('ReceiveMessage', callback);
  }

  // listen event "AddedToGroup" tu server
  // khi duoc them vao 1 group chat -> server gui event AddedToGroup
  // callback: nhan conversationId
  addAddedToGroupListener(callback: (conversationId: string) => void) {
    this.hubConnection?.on('AddedToGroup', (conversationId: string) => {
      callback(conversationId);
    })
  }

  // 3. gui tin nhan len server (cach1: gui qua socket)
  // client goi: this.hubConnection?.invoke('SendMessage',...)
  // -> kich hoat ham SendMessage trong ChatHub o server
  // Note: thuong se dung API(/api/chat/send) de gui tin nhan -> luu db, check author,...
  // ham nay chi dung neu muon gui nhanh tin nhan qua Socket ma ko can qua Controller
  public sendMessage(user: string, message: string) {
    console.log('--- Gui tin nhan qua SignalR ---', user, message);
    this.hubConnection?.invoke('SendMessage', user, message)
      .catch(err => console.error(err));
  }

  //
  addMessageReadListener(callback: (conversationId: string, readByUserId: string) => void) {
    this.hubConnection?.on('MessagesRead', (conversationId: string, readByUserId: string) => {
      callback(conversationId, readByUserId);
    })
  }

  // === Friendship Events ===

  // lang nghe khi co loi moi ket ban moi
  // server gui event "FriendRequestReceived" khi ai do gui loi moi cho minh
  addFriendRequestReceivedListener(
    callback: (data: { friendshipId: string, requesterId: string; reuquesterName: string }) => void) {
    this.hubConnection?.on('FriendRequestReceived', (data) => {
      callback(data);
    });
  }

  // lang nghe khi loi moi ket ban duoc phan hoi (accept/reject)
  // server gui event "FriendRequestResponded" khi nguoi nhan respond
  addFriendRquestRespondedListener(
    callback: (data: { friendshipId: string; isAccepted: boolean; responderId: string }) => void) {
    this.hubConnection?.on('FriendRequestRespond', (data) => {
      callback(data);
    });
  }

  // ==== Typing indicator ===
  //
  sendTyping(conversationId: string, participantIds: string[]) {
    this.hubConnection?.invoke('SendTyping', conversationId, participantIds)
      .catch(err => console.error('-- SendTyping error:', err));
  }

  // Listener event "UserTyping" tu server (server -> client)
  addTypingListener(callback: (data: { conversationId: string; userId: string; userName: string }) => void) {
    this.hubConnection?.on('UserTyping', (data) => {
      callback(data);
    })
  }

  // === message reactions === 
  addReactionListener(callback: (data: {
    messageId: string;
    userId: string;
    userName: string;
    reactionType: number;
    action: string; // "added" / "removed"
  }) => void) {
    this.hubConnection?.on('MessageReaction', (data) => {
      callback(data);
    });
  }

}

/**
 * ===== Gui event len server (Client -> Server) =====
 * --- invoke vs on
 *  
 * - invoke("MethodName", args): Client gui len Server
 *  -> Server tim method co ten "MethodName" trong Hub -> chay
 *  -> Tuong tu goi API nhung qua WebSocket (real-time - nhanh hon HTTP)
 * 
 * - on("EventName", callback): Client lang nghe Server  (server -> client)
 *  -> Server gui event "EventName" -> callback duoc goi (nhan data)
 */