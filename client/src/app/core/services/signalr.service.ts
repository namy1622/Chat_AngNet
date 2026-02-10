import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr'; // npm install @microsoft/signalr
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection | undefined;

  // bien bao hieu status ket noi (online/offline)
  public connectionStatus$ = new BehaviorSubject<boolean>(false);

  constructor() { }

  // 1. khoi tao ketnoi
  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('/api/chatHub', {
        skipNegotiation: true, // bo qua buoc negotiation, luon dung WebSockets
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect() // tu dong ketnoi lai neu rot mang
      .build(); // ket thuc cau hinh

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR Connections started');
        this.connectionStatus$.next(true);
      })
      .catch(err => {
        console.log('Error while starting connection: ', err);
        this.connectionStatus$.next(false);
      });
  }

  // 2. lang nghe event tu server (ex: co tin nhan moi)
  public addReceiveMessageListener(callback: (user: string, message: string) => void) {
    this.hubConnection?.on('ReceiveMessage', (user, message) => {
      callback(user, message);
    });
  }

  // 3. gui tin nhan len server (cach1: gui qua socket)
  public sendMessage(user: string, message: string) {
    this.hubConnection?.invoke('SendMessage', user, message)
      .catch(err => console.error(err));
  }
}
