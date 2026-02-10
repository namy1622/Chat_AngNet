import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr'; // npm install @microsoft/signalr
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection | undefined;

  // bien bao hieu status ket noi (online/offline) cho toan app biet
  public connectionStatus$ = new BehaviorSubject<boolean>(false);

  constructor() { }

  // 1. khoi tao ketnoi
  // ham duoc goi ngay khi user login success
  public startConnection() {
    console.log('--- Bat dau khoi tao ket noi SignalR ---');
    // hubConnectionBuilder: cong cu xay dung cau hinh ket noi
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('/api/chatHub', {
        // bo qua buoc negotiation - thuong luong giao thuc,
        // mac dinh SignalR thu Long Polling truoc roi moi nang cap len WebSockets
        // ep dung Websockets luon cho nhan (yc server phai ho tro WS)
        skipNegotiation: true,
        // chi dinh ro s.d giao thuc WS(nhanh nhat, real-time nhat).
        transport: signalR.HttpTransportType.WebSockets
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
  // khi server goi: await Clients.All.SendAsync("ReceiveMessage", user, message)
  // -> ham addReceiveMessageListener se bat duoc event nay va truyen vao 1 cai callback
  public addReceiveMessageListener(callback: (user: string, message: string) => void) {
    this.hubConnection?.on('ReceiveMessage', (user, message) => {
      // goi callback de component xu ly (ex: hien len man hinh)
      callback(user, message);
    });
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
}
