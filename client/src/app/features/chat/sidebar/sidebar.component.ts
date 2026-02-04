import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiButtonComponent } from "../../../shared/components/ui-button/ui-button.component";
import { UiIconComponent } from "../../../shared/components/ui-icon/ui-icon.component";
import { UiInputComponent } from "../../../shared/components/ui-input/ui-input.component";


interface Conversation {
  id: string;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  time: string;
  isOnline: boolean;
  unreadCount: number;
}
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, UiButtonComponent, UiIconComponent], // dung de tao link va highlight link dang active
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  // seed data - sau se lay tu api
  conversations: Conversation[] = [
    {
      id: 'conv-1',
      name: 'Nam Doan',
      avatarUrl: 'https://ui-avatars.com/api/?name=Alice+N&background=random',
      lastMessage: 'Hey! Are you still on for meeting?',
      time: '10:20 AM',
      isOnline: true,
      unreadCount: 2
    },
    {
      id: 'conv-2',
      name: 'Linh Nguyen',
      avatarUrl: 'https://ui-avatars.com/api/?name=Bob+S&background=random',
      lastMessage: 'See you at 3 PM',
      time: 'Yesterday',
      isOnline: false,
      unreadCount: 0
    },
    {
      id: 'conv-3',
      name: 'Minh Tran',
      avatarUrl: 'https://ui-avatars.com/api/?name=Charlie+B&background=random',
      lastMessage: 'Thanks for the help!',
      time: '2 days ago',
      isOnline: true,
      unreadCount: 0
    },
    {
      id: 'conv-4',
      name: 'An Pham',
      avatarUrl: 'https://ui-avatars.com/api/?name=Diana+C&background=random',
      lastMessage: "I'll send the report by noon",
      time: '3 days ago',
      isOnline: false,
      unreadCount: 3
    },
    {
      id: 'conv-5',
      name: 'Bao Nguyen',
      avatarUrl: 'https://ui-avatars.com/api/?name=Ethan+D&background=random',
      lastMessage: "Let's catch up tomorrow",
      time: '4 days ago',
      isOnline: true,
      unreadCount: 0
    },
    {
      id: 'conv-6',
      name: 'Hoa Le',
      avatarUrl: 'https://ui-avatars.com/api/?name=Fiona+E&background=random',
      lastMessage: "The meeting is rescheduled",
      time: '5 days ago',
      isOnline: false,
      unreadCount: 1
    },
    {
      id: 'conv-7',
      name: 'Duc Tran',
      avatarUrl: 'https://ui-avatars.com/api/?name=George+F&background=random',
      lastMessage: "Great idea!",
      time: '6 days ago',
      isOnline: true,
      unreadCount: 0
    },
    {
      id: 'conv-8',
      name: 'Thao Nguyen',
      avatarUrl: 'https://ui-avatars.com/api/?name=Hannah+G&background=random',
      lastMessage: "I'll get back to you soon",
      time: '1 week ago',
      isOnline: false,
      unreadCount: 2
    },
    {
      id: 'conv-9',
      name: 'Son Pham',
      avatarUrl: 'https://ui-avatars.com/api/?name=Ian+H&background=random',
      lastMessage: "Can we talk later?",
      time: '1 week ago',
      isOnline: true,
      unreadCount: 0
    },
    {
      id: 'conv-10',
      name: 'Linh Doan',
      avatarUrl: 'https://ui-avatars.com/api/?name=Julia+I&background=random',
      lastMessage: "Happy Birthday!",
      time: '2 weeks ago',
      isOnline: false,
      unreadCount: 0
    }
  ];
}


/*
==== Ly Thuyet ====
 
1. @for (item of items; track item.id):
    - cu phap moi cua Angular 17+ de lap (thay the *ngFor).
    - 'track': giup Anggular toi uu hieu suat khi danh sach thay doi

2. routerLink & routerLinkActive:
    - routerLink: tao link dieu huong ma ko reload trang (SPA)
    - routerLinkActive: tu dong them class CSS khi route khop => Highlight item.

3. Interface TypeScript:
    - dinh nghia 'hinh dang' du lieu -> giup IDE goi y code va bat loi som.

4. Tailwind Utility:
    - truncate: cat text dai + them '...'. Can min-w-0 o the cha de hoat dong
    - flex-shrink-0: ngan phan tu bi thu nho khi ko du cho
*/