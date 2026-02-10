import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiButtonComponent } from "../../../shared/components/ui-button/ui-button.component";
import { UiIconComponent } from "../../../shared/components/ui-icon/ui-icon.component";
import { UiInputComponent } from "../../../shared/components/ui-input/ui-input.component";
import { UiAvatarComponent } from "../../../shared/components/ui-avatar/ui-avatar.component";
import { SidebarService } from '../../../core/services/sidebar.service';
import { AuthService } from '../../../core/services/auth.service';


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
  imports: [CommonModule, RouterLink, RouterLinkActive, UiButtonComponent, UiIconComponent, UiAvatarComponent], // dung de tao link va highlight link dang active
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  // Danh sách conversation có flex-1 overflow-y-auto,
  // nhưng để flex-1 hoạt động, thẻ cha phải là flex container với chiều cao xác định.
  host: {
    class: 'flex flex-col h-full overflow-hidden'
  }

})
export class SidebarComponent {
  sidebarService = inject(SidebarService);
  authService = inject(AuthService);
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
    },
    {
      id: 'conv-11',
      name: 'Duc Tran',
      avatarUrl: 'https://ui-avatars.com/api/?name=George+F&background=random',
      lastMessage: "Great idea!",
      time: '6 days ago',
      isOnline: true,
      unreadCount: 0
    },
    {
      id: 'conv-12',
      name: 'Thao Nguyen',
      avatarUrl: 'https://ui-avatars.com/api/?name=Hannah+G&background=random',
      lastMessage: "I'll get back to you soon",
      time: '1 week ago',
      isOnline: false,
      unreadCount: 2
    },
    {
      id: 'conv-13',
      name: 'Son Pham',
      avatarUrl: 'https://ui-avatars.com/api/?name=Ian+H&background=random',
      lastMessage: "Can we talk later?",
      time: '1 week ago',
      isOnline: true,
      unreadCount: 0
    },
    {
      id: 'conv-14',
      name: 'Linh Doan',
      avatarUrl: 'https://ui-avatars.com/api/?name=Julia+I&background=random',
      lastMessage: "Happy Birthday!",
      time: '2 weeks ago',
      isOnline: false,
      unreadCount: 0
    }
  ];

  // singal luu tu khoa search 
  searchQuery = signal('');

  // tao computed signal de tu dong loc d.s
  // logic: khi searchQuery thay doi -> ham auto chay -> update giao dien
  filteredConversations = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();

    // neu ko ro thi tra ve tat ca
    if (!query) return this.conversations;

    // loc theo ten || tin nhan cuoi (lastMessage)
    return this.conversations.filter(chat => {
      return chat.name.toLowerCase().trim().includes(query) ||
        chat.lastMessage.toLowerCase().trim().includes(query)
    });
  });

  // nhan trang thai collapsed tu component cha
  isCollapsed = input<boolean>(false);

  // bao cha toggle sidebar
  toggleSidebar = output<void>();
  // output event khi click conersation
  conersationSelected = output<void>();

  // bao cha toggle sidebar
  onToggle() {
    this.toggleSidebar.emit();
  }

  onConversationClick() {
    this.conersationSelected.emit();
  }

  onConversationSelected() {
    if (window.innerWidth < 767) {
      this.sidebarService.close();
    }
  }

  // ham event khi go phim
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value); // cap nhat signal 
  }

  // ham logout
  onLogout() {
    const isConfirm = confirm('Are you sure you want to log out?');
    if (isConfirm) {
      this.authService.logout();
    }
  }
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